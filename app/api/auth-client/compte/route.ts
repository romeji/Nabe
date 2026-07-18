import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authClientOptions } from '@/lib/auth-client';
import { prisma } from '@/lib/prisma';
import { resend, EMAIL_EXPEDITEUR, genererHtmlSuppressionCompte } from '@/lib/resend';
import { getContenuPage } from '@/lib/contenu';

/**
 * Suppression de compte à la demande du client.
 *
 * Si le client n'a jamais passé commande : suppression complète et
 * définitive du compte (favoris, adresses, connexions Google en cascade).
 *
 * Si le client a déjà passé au moins une commande : le compte est anonymisé
 * plutôt que supprimé — la loi française impose de conserver les documents
 * comptables/factures pendant 10 ans (Code de commerce, art. L123-22), donc
 * on ne peut pas supprimer la ligne qui rattache les commandes historiques.
 * On supprime en revanche toutes les données personnelles non nécessaires à
 * cette obligation légale (nom, e-mail, téléphone, favoris, adresses,
 * connexions OAuth), conformément au droit à l'effacement du RGPD (article
 * 17), qui prévoit justement cette exception pour obligation légale
 * (article 17.3.b).
 */
export async function DELETE() {
  const session = await getServerSession(authClientOptions);
  const clientId = (session?.user as any)?.id as string | undefined;

  if (!clientId) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  }

  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) {
    return NextResponse.json({ error: 'Compte introuvable.' }, { status: 404 });
  }

  const nombreCommandes = await prisma.commande.count({ where: { clientId } });

  // On envoie l'e-mail de confirmation AVANT d'effacer l'adresse e-mail du client.
  if (client.email) {
    try {
      const emailsContenu = await getContenuPage('emails');
      await resend.emails.send({
        from: EMAIL_EXPEDITEUR,
        to: client.email,
        subject: emailsContenu.suppression_sujet || 'Confirmation de suppression de votre compte Nabe',
        html: genererHtmlSuppressionCompte(client.nom?.split(' ')[0] || 'vous', emailsContenu.suppression_message),
      });
    } catch (err) {
      console.error('Erreur envoi email de suppression de compte (suppression effectuée quand même) :', err);
    }
  }

  if (nombreCommandes === 0) {
    // Aucune commande : suppression complète, tout est en cascade (favoris,
    // adresses, connexions OAuth).
    await prisma.client.delete({ where: { id: clientId } });
  } else {
    // Historique de commandes existant : anonymisation plutôt que suppression.
    await prisma.favori.deleteMany({ where: { clientId } });
    await prisma.adressePostale.deleteMany({ where: { clientId } });
    await prisma.compteOAuth.deleteMany({ where: { clientId } });

    await prisma.client.update({
      where: { id: clientId },
      data: {
        nom: 'Compte supprimé',
        email: `compte-supprime-${clientId}@nabe.invalid`,
        password: null,
        image: null,
        telephone: null,
        stripeCustomerId: null,
        emailVerifie: null,
      },
    });
  }

  return NextResponse.json({ success: true });
}
