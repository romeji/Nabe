import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { genererNumeroCommande } from '@/lib/utils';
import Stripe from 'stripe';

type ArticleMeta = { id: string; q: number; taille: string };

/**
 * Décrémente le stock (global + par taille si applicable), incrémente le
 * compteur de ventes et journalise le mouvement pour chaque article vendu.
 * Utilisé après la création d'une commande, quelle que soit la source
 * (ancien flow Checkout Session ou nouveau flow PaymentIntent intégré).
 */
async function decrementerStockEtJournaliser(articlesMeta: ArticleMeta[], numeroCommande: string) {
  const produitsDb = await prisma.produit.findMany({
    where: { id: { in: articlesMeta.map((a) => a.id) } },
    include: { stockTailles: true },
  });

  for (const a of articlesMeta) {
    const produit = produitsDb.find((p) => p.id === a.id);
    if (!produit) continue;

    await prisma.produit.update({
      where: { id: produit.id },
      data: { stock: { decrement: a.q }, nombreVentes: { increment: a.q } },
    });

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
        motif: `Commande ${numeroCommande}`,
      },
    });
  }

  return produitsDb;
}

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

  try {
    // ── Nouveau flow : checkout intégré avec Stripe Payment Element ──
    if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object as Stripe.PaymentIntent;

      const commandeExistante = await prisma.commande.findUnique({
        where: { stripePaymentIntentId: intent.id },
      });
      if (commandeExistante) {
        return NextResponse.json({ received: true });
      }

      const meta = intent.metadata || {};
      const articlesMeta: ArticleMeta[] = JSON.parse(meta.articles || '[]');
      if (articlesMeta.length === 0) {
        // Ce PaymentIntent ne vient pas du checkout boutique (ex: SetupIntent d'une autre
        // fonctionnalité) — on ignore silencieusement plutôt que de créer une commande vide.
        return NextResponse.json({ received: true });
      }

      const sousTotal = parseFloat(meta.sousTotal || '0');
      const montantReduction = parseFloat(meta.montantReduction || '0');
      const fraisLivraison = parseFloat(meta.fraisLivraison || '0');
      const total = intent.amount / 100;

      const produitsDb = await prisma.produit.findMany({
        where: { id: { in: articlesMeta.map((a) => a.id) } },
      });

      const commande = await prisma.commande.create({
        data: {
          numero: genererNumeroCommande(),
          statut: 'PAYEE',
          clientId: meta.clientId || undefined,
          clientNom: `${meta.prenom || ''} ${meta.nom || ''}`.trim() || 'Client',
          clientEmail: meta.email || '',
          clientTelephone: meta.telephone || undefined,
          adresseLivraison: meta.adresse || undefined,
          ville: meta.ville || undefined,
          codePostal: meta.codePostal || undefined,
          pays: meta.pays || 'France',
          codeReductionId: meta.codeReductionId || undefined,
          montantReduction,
          sousTotal,
          fraisLivraison,
          total,
          stripePaymentIntentId: intent.id,
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

      await decrementerStockEtJournaliser(articlesMeta, commande.numero);
    }

    // ── Ancien flow (Stripe Checkout Session hébergée) — conservé par sécurité
    // pour toute session déjà initiée avant la bascule vers le checkout intégré.
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      const commandeExistante = await prisma.commande.findUnique({
        where: { stripeSessionId: session.id },
      });
      if (commandeExistante) {
        return NextResponse.json({ received: true });
      }

      const articlesMeta: ArticleMeta[] = JSON.parse(session.metadata?.articles || '[]');
      const clientId = session.metadata?.clientId || undefined;
      const codeReductionId = session.metadata?.codeReductionId || undefined;

      const produitsDb = await prisma.produit.findMany({
        where: { id: { in: articlesMeta.map((a) => a.id) } },
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

      await decrementerStockEtJournaliser(articlesMeta, commande.numero);
    }
  } catch (error) {
    console.error('Erreur traitement webhook:', error);
    return NextResponse.json({ error: 'Erreur traitement' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
