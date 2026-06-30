import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { genererNumeroCommande } from '@/lib/utils';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Signature manquante' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error: any) {
    console.error('Erreur de signature webhook:', error.message);
    return NextResponse.json({ error: 'Signature invalide' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      // Évite de créer la commande deux fois si Stripe renvoie l'événement
      const commandeExistante = await prisma.commande.findUnique({
        where: { stripeSessionId: session.id },
      });
      if (commandeExistante) {
        return NextResponse.json({ received: true });
      }

      const articlesMeta: { id: string; q: number; taille: string }[] = JSON.parse(
        session.metadata?.articles || '[]'
      );
      const clientId = session.metadata?.clientId || undefined;
      const codeReductionId = session.metadata?.codeReductionId || undefined;

      const produitsDb = await prisma.produit.findMany({
        where: { id: { in: articlesMeta.map((a) => a.id) } },
        include: { stockTailles: true },
      });

      const sousTotal = (session.amount_subtotal || 0) / 100;
      const total = (session.amount_total || 0) / 100;
      const montantReduction = Math.max(0, sousTotal - total);

      const commande = await prisma.commande.create({
        data: {
          numero: genererNumeroCommande(),
          statut: 'PAYEE',
          clientId,
          clientNom: session.customer_details?.name || 'Client',
          clientEmail: session.customer_details?.email || '',
          adresseLivraison: session.shipping_details?.address?.line1 || undefined,
          ville: session.shipping_details?.address?.city || undefined,
          codePostal: session.shipping_details?.address?.postal_code || undefined,
          pays: session.shipping_details?.address?.country || 'France',
          codeReductionId,
          montantReduction,
          sousTotal,
          fraisLivraison: 0,
          total,
          stripeSessionId: session.id,
          stripePaymentIntentId:
            typeof session.payment_intent === 'string' ? session.payment_intent : undefined,
          lignes: {
            create: articlesMeta.map((a) => {
              const produit = produitsDb.find((p) => p.id === a.id);
              return {
                produitId: produit?.id,
                nomProduit: produit?.nom || 'Produit',
                taille: a.taille || undefined,
                prixUnitaire: produit?.prix || 0,
                quantite: a.q,
              };
            }),
          },
        },
      });

      // Décrémente le stock, incrémente le compteur de ventes et enregistre le mouvement
      for (const a of articlesMeta) {
        const produit = produitsDb.find((p) => p.id === a.id);
        if (produit) {
          await prisma.produit.update({
            where: { id: produit.id },
            data: { stock: { decrement: a.q }, nombreVentes: { increment: a.q } },
          });

          // Si le produit a un stock détaillé par taille, on décrémente la ligne correspondante
          if (produit.stockTailles.length > 0 && a.taille) {
            const ligne = produit.stockTailles.find((s) => s.taille === a.taille);
            if (ligne) {
              await prisma.stockTaille.update({
                where: { id: ligne.id },
                data: { quantite: { decrement: a.q } },
              });
            }
          }

          await prisma.mouvementStock.create({
            data: {
              produitId: produit.id,
              type: 'VENTE',
              quantite: -a.q,
              motif: `Commande ${commande.numero}`,
            },
          });
        }
      }

      // Le compteur d'utilisation du code de réduction est dérivé en comptant
      // les commandes liées (relation Commande -> CodeReduction), pas besoin
      // d'incrément manuel séparé ici.
    } catch (error) {
      console.error('Erreur traitement webhook:', error);
      return NextResponse.json({ error: 'Erreur traitement' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
