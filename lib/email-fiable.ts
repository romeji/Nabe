import { resend, EMAIL_EXPEDITEUR } from '@/lib/resend';
import { prisma } from '@/lib/prisma';

/**
 * Envoie un e-mail transactionnel critique (confirmation de commande,
 * notification de vente...) avec garantie de non-perte : si l'envoi échoue
 * (Resend en panne, erreur réseau...), l'e-mail est enregistré dans la file
 * d'attente EmailEnAttente au lieu d'être perdu silencieusement. Une tâche
 * planifiée (voir app/api/cron/relancer-emails) retente ensuite
 * automatiquement toutes les 5 minutes, jusqu'à 5 tentatives.
 *
 * À utiliser pour tout e-mail dont la perte serait gênante pour le client ou
 * le marchand (confirmation de commande, notification de vente). Pour les
 * e-mails secondaires (bienvenue newsletter, etc), un simple try/catch avec
 * log suffit — pas besoin de cette garantie de fiabilité renforcée.
 */
export async function envoyerEmailFiable(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  try {
    await resend.emails.send({
      from: EMAIL_EXPEDITEUR,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });
  } catch (err) {
    console.error(`Échec envoi e-mail "${params.subject}" à ${params.to}, mise en file d'attente :`, err);
    try {
      await prisma.emailEnAttente.create({
        data: {
          destinataire: params.to,
          sujet: params.subject,
          html: params.html,
          derniereErreur: err instanceof Error ? err.message : String(err),
        },
      });
    } catch (errDb) {
      // Cas extrême : même l'enregistrement en base échoue. On log un
      // maximum de détails pour permettre un rattrapage manuel via les logs.
      console.error(
        `ÉCHEC CRITIQUE : impossible d'envoyer NI de mettre en file d'attente l'e-mail "${params.subject}" à ${params.to}.`,
        errDb
      );
    }
  }
}
