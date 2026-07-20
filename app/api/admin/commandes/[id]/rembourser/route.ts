import { NextResponse } from 'next/server';
import { verifierSessionAdmin } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { resend, EMAIL_EXPEDITEUR, genererHtmlAnnulationCommande } from '@/lib/resend';
import { getContenuPage } from '@/lib/contenu';

/**
 * Déclenche un remboursement Stripe intégral pour une commande, met à jour
 * son statut, et prévient le client par e-mail. Le remboursement passe
 * directement par l'API Stripe (pas de saisie manuelle de montant) pour
 * éviter toute erreur de frappe sur une somme d'argent réelle.
 */
export async function POST(_req: Request, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const session = await verifierSessionAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const params = await paramsPromise;
  const commande = await prisma.commande.findUnique({ where: { id: params.id } });
  if (!commande) {
    return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });
  }
  if (!commande.stripePaymentIntentId) {
    return NextResponse.json(
      { error: "Cette commande n'a pas de paiement Stripe associé (impossible de rembourser automatiquement)." },
      { status: 400 }
    );
  }
  if (commande.statut === 'REMBOURSEE') {
    return NextResponse.json({ error: 'Cette commande a déjà été remboursée.' }, { status: 400 });
  }

  try {
    await stripe.refunds.create({ payment_intent: commande.stripePaymentIntentId });
  } catch (err: any) {
    console.error('Erreur remboursement Stripe :', err);
    return NextResponse.json({ error: err.message || 'Le remboursement Stripe a échoué.' }, { status: 500 });
  }

  const commandeMaj = await prisma.commande.update({
    where: { id: commande.id },
    data: { statut: 'REMBOURSEE' },
  });

  if (commandeMaj.clientEmail) {
    try {
      const emailsContenu = await getContenuPage('emails');
      const sujetDefaut = 'Commande {numero} remboursée — Nabe';
      await resend.emails.send({
        from: EMAIL_EXPEDITEUR,
        to: commandeMaj.clientEmail,
        subject: (emailsContenu.commande_annulee_sujet || sujetDefaut).replace('{numero}', commandeMaj.numero),
        html: genererHtmlAnnulationCommande({
          prenom: commandeMaj.clientNom.split(' ')[0] || 'vous',
          numero: commandeMaj.numero,
          total: Number(commandeMaj.total),
          rembourse: true,
          messagePersonnalise: emailsContenu.commande_annulee_message,
        }),
      });
    } catch (err) {
      console.error("Erreur envoi email de remboursement (remboursement effectué quand même) :", err);
    }
  }

  return NextResponse.json({ success: true });
}
