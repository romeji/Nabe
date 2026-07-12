import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { genererNumeroCommande } from '@/lib/utils';
import { resend, EMAIL_EXPEDITEUR, genererHtmlConfirmationCommande } from '@/lib/resend';
import Stripe from 'stripe';

type ArticleMeta = { id: string; q: number; taille: string; pu?: number };

/**
 * Décrémente le stock (global + par taille si applicable), incrémente le
 * compteur de ventes et journalise le mouvement pour chaque article vendu.
 * Utilisé après la création d'une commande, quelle que soit la source
 * (ancien flow Checkout Session ou nouveau flow PaymentIntent intégré).
 *
 * IMPORTANT (course critique / race condition) : le stock est vérifié une
 * première fois à la création du paiement (avant que le client paie), mais
 * comme le paiement Stripe est asynchrone, deux clients pourraient en théorie
 * payer le(s) dernier(s) exemplaire(s) d'un même produit avant que l'un des
 * deux webhooks n'ait décrémenté le stock — particulièrement critique pour
 * une "pièce unique". La décrémentation ici est donc faite de façon atomique
 * et conditionnelle au niveau de la base (UPDATE ... WHERE stock >= quantité)
 * plutôt qu'un simple decrement aveugle : si le stock est insuffisant au
 * moment précis de la décrémentation, la commande est quand même créée
 * (le paiement a déjà été capturé, impossible de l'annuler silencieusement)
 * mais un e-mail d'alerte est envoyé pour un traitement manuel (contact
 * client, remboursement partiel, réapprovisionnement...).
 */
async function decrementerStockEtJournaliser(articlesMeta: ArticleMeta[], numeroCommande: string) {
  const produitsDb = await prisma.produit.findMany({
    where: { id: { in: articlesMeta.map((a: any) => a.id) } },
    include: { stockTailles: true },
  });

  const alertesSurvente: string[] = [];

  for (const a of articlesMeta) {
    const produit = produitsDb.find((p: any) => p.id === a.id);
    if (!produit) continue;

    // Décrémentation conditionnelle atomique : ne réussit que si le stock
    // encore disponible au moment exact de l'exécution est suffisant.
    const resultatStock = await prisma.produit.updateMany({
      where: { id: produit.id, stock: { gte: a.q } },
      data: { stock: { decrement: a.q }, nombreVentes: { increment: a.q } },
    });

    if (resultatStock.count === 0) {
      // Stock insuffisant au moment de la vente : on décrémente quand même
      // (le stock peut aller à 0 ou en négatif pour rester traçable), mais
      // on remonte l'alerte pour un traitement manuel.
      await prisma.produit.update({
        where: { id: produit.id },
        data: { stock: { decrement: a.q }, nombreVentes: { increment: a.q } },
      });
      alertesSurvente.push(`${produit.nom} (commande ${numeroCommande}, quantité ${a.q})`);
    }

    if (produit.stockTailles.length > 0 && a.taille) {
      const ligne = produit.stockTailles.find((s: any) => s.taille === a.taille);
      if (ligne) {
        const resultatTaille = await prisma.stockTaille.updateMany({
          where: { id: ligne.id, quantite: { gte: a.q } },
          data: { quantite: { decrement: a.q } },
        });
        if (resultatTaille.count === 0) {
          await prisma.stockTaille.update({ where: { id: ligne.id }, data: { quantite: { decrement: a.q } } });
          alertesSurvente.push(`${produit.nom} taille ${a.taille} (commande ${numeroCommande})`);
        }
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

  if (alertesSurvente.length > 0) {
    console.error('⚠️ SURVENTE détectée :', alertesSurvente.join(' | '));
    try {
      await resend.emails.send({
        from: EMAIL_EXPEDITEUR,
        to: EMAIL_EXPEDITEUR,
        subject: `⚠️ Survente détectée — commande ${numeroCommande}`,
        html: `<p>Stock insuffisant au moment de la vente pour :</p><ul>${alertesSurvente
          .map((a) => `<li>${a}</li>`)
          .join('')}</ul><p>Une action manuelle est nécessaire (contact client, remboursement partiel, ou réapprovisionnement).</p>`,
      });
    } catch (err) {
      console.error("Erreur envoi email d'alerte survente :", err);
    }
  }

  return produitsDb;
}

/**
 * Envoie l'e-mail de confirmation de commande au client. Ne bloque jamais la
 * création de la commande : une erreur d'envoi est journalisée mais ignorée.
 */
async function envoyerEmailConfirmation(commandeId: string) {
  try {
    const commande = await prisma.commande.findUnique({
      where: { id: commandeId },
      include: { lignes: true },
    });
    if (!commande || !commande.clientEmail) return;

    const prenom = commande.clientNom.split(' ')[0] || 'vous';
    await resend.emails.send({
      from: EMAIL_EXPEDITEUR,
      to: commande.clientEmail,
      subject: `Commande ${commande.numero} confirmée — Nabe`,
      html: genererHtmlConfirmationCommande({
        prenom,
        numero: commande.numero,
        lignes: commande.lignes.map((l: any) => ({
          nomProduit: l.nomProduit,
          taille: l.taille,
          quantite: l.quantite,
          prixUnitaire: Number(l.prixUnitaire),
        })),
        sousTotal: Number(commande.sousTotal),
        montantReduction: Number(commande.montantReduction),
        fraisLivraison: Number(commande.fraisLivraison),
        total: Number(commande.total),
        adresseLivraison: commande.adresseLivraison || undefined,
        ville: commande.ville || undefined,
        codePostal: commande.codePostal || undefined,
      }),
    });
  } catch (err) {
    console.error('Erreur envoi email de confirmation de commande (commande conservée) :', err);
  }
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
        where: { id: { in: articlesMeta.map((a: any) => a.id) } },
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
          modeLivraison: meta.modeLivraison || undefined,
          pointRelaisNumero: meta.pointRelaisNumero || undefined,
          pointRelaisNom: meta.pointRelaisNom || undefined,
          pointRelaisAdresse: meta.pointRelaisAdresse || undefined,
          total,
          stripePaymentIntentId: intent.id,
          lignes: {
            create: articlesMeta.map((a: any) => {
              const produit = produitsDb.find((p: any) => p.id === a.id);
              return {
                produitId: produit?.id,
                nomProduit: produit?.nom || 'Produit',
                taille: a.taille || undefined,
                prixUnitaire: a.pu ?? produit?.prix ?? 0,
                quantite: a.q,
              };
            }),
          },
        },
      });

      await decrementerStockEtJournaliser(articlesMeta, commande.numero);
      await envoyerEmailConfirmation(commande.id);
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
        where: { id: { in: articlesMeta.map((a: any) => a.id) } },
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
            create: articlesMeta.map((a: any) => {
              const produit = produitsDb.find((p: any) => p.id === a.id);
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
      await envoyerEmailConfirmation(commande.id);
    }
  } catch (error) {
    console.error('Erreur traitement webhook:', error);
    return NextResponse.json({ error: 'Erreur traitement' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
