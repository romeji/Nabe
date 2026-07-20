import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifierSessionAdmin } from '@/lib/auth-helpers';
import { resend, EMAIL_EXPEDITEUR, genererHtmlAnnulationCommande, genererHtmlExpeditionCommande } from '@/lib/resend';
import { getContenuPage } from '@/lib/contenu';

export async function GET(req: NextRequest, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = await paramsPromise;
  const session = await verifierSessionAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const commande = await prisma.commande.findUnique({
    where: { id: params.id },
    include: { lignes: { include: { produit: true } } },
  });

  if (!commande) {
    return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });
  }

  return NextResponse.json(commande);
}

export async function PATCH(req: NextRequest, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = await paramsPromise;
  const session = await verifierSessionAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { statut, numeroSuivi, urlSuivi } = await req.json();

    const donnees: Record<string, any> = {};
    if (statut !== undefined) donnees.statut = statut;
    if (numeroSuivi !== undefined) donnees.numeroSuivi = numeroSuivi;
    if (urlSuivi !== undefined) donnees.urlSuivi = urlSuivi;

    const commande = await prisma.commande.update({
      where: { id: params.id },
      data: donnees,
    });

    if ((statut === 'ANNULEE' || statut === 'REMBOURSEE') && commande.clientEmail) {
      try {
        const emailsContenu = await getContenuPage('emails');
        const sujetDefaut = `Commande {numero} ${statut === 'REMBOURSEE' ? 'remboursée' : 'annulée'} — Nabe`;
        await resend.emails.send({
          from: EMAIL_EXPEDITEUR,
          to: commande.clientEmail,
          subject: (emailsContenu.commande_annulee_sujet || sujetDefaut).replace('{numero}', commande.numero),
          html: genererHtmlAnnulationCommande({
            prenom: commande.clientNom.split(' ')[0] || 'vous',
            numero: commande.numero,
            total: Number(commande.total),
            rembourse: statut === 'REMBOURSEE',
            messagePersonnalise: emailsContenu.commande_annulee_message,
          }),
        });
      } catch (err) {
        console.error("Erreur envoi email d'annulation (statut mis à jour quand même) :", err);
      }
    }

    if (statut === 'EXPEDIEE' && commande.clientEmail) {
      try {
        const emailsContenu = await getContenuPage('emails');
        await resend.emails.send({
          from: EMAIL_EXPEDITEUR,
          to: commande.clientEmail,
          subject: (emailsContenu.commande_expediee_sujet || 'Commande {numero} expédiée — Nabe').replace('{numero}', commande.numero),
          html: genererHtmlExpeditionCommande({
            prenom: commande.clientNom.split(' ')[0] || 'vous',
            numero: commande.numero,
            numeroSuivi: commande.numeroSuivi,
            urlSuivi: commande.urlSuivi,
            messagePersonnalise: emailsContenu.commande_expediee_message,
          }),
        });
      } catch (err) {
        console.error("Erreur envoi email d'expédition (statut mis à jour quand même) :", err);
      }
    }

    return NextResponse.json(commande);
  } catch (error: any) {
    console.error('Erreur modification commande:', error);
    return NextResponse.json({ error: error.message || 'Erreur' }, { status: 400 });
  }
}
