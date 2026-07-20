import { NextRequest, NextResponse } from 'next/server';
import { resend, EMAIL_EXPEDITEUR } from '@/lib/resend';
import { prisma } from '@/lib/prisma';

const MAX_TENTATIVES = 5;

/**
 * Tâche planifiée (voir vercel.json -> crons) qui retente l'envoi de tout
 * e-mail resté en échec dans la file d'attente EmailEnAttente. Après 5
 * tentatives infructueuses, on abandonne le retry automatique et on alerte
 * le marchand par e-mail direct pour qu'il puisse contacter le client
 * manuellement — un e-mail de commande ne doit jamais disparaître sans que
 * personne ne s'en aperçoive.
 */
export async function GET(req: NextRequest) {
  // Protection : seul Vercel Cron (avec le bon secret) peut déclencher cette route.
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const enAttente = await prisma.emailEnAttente.findMany({
    where: { envoye: false, tentatives: { lt: MAX_TENTATIVES } },
    take: 20,
  });

  let reussis = 0;
  let echecsDefinitifs = 0;

  for (const email of enAttente) {
    try {
      await resend.emails.send({
        from: EMAIL_EXPEDITEUR,
        to: email.destinataire,
        subject: email.sujet,
        html: email.html,
      });
      await prisma.emailEnAttente.update({
        where: { id: email.id },
        data: { envoye: true, derniereTentativeA: new Date() },
      });
      reussis++;
    } catch (err) {
      const nouvellesTentatives = email.tentatives + 1;
      await prisma.emailEnAttente.update({
        where: { id: email.id },
        data: {
          tentatives: nouvellesTentatives,
          derniereErreur: err instanceof Error ? err.message : String(err),
          derniereTentativeA: new Date(),
        },
      });

      if (nouvellesTentatives >= MAX_TENTATIVES) {
        echecsDefinitifs++;
        // Dernier recours : alerte directe au marchand, sans passer par la
        // file d'attente (pour ne pas créer une boucle d'échecs infinie).
        try {
          await resend.emails.send({
            from: EMAIL_EXPEDITEUR,
            to: EMAIL_EXPEDITEUR,
            subject: `⚠️ E-mail définitivement perdu après 5 tentatives`,
            html: `<p>Impossible d'envoyer cet e-mail après ${MAX_TENTATIVES} tentatives :</p>
                   <ul>
                     <li><strong>Destinataire :</strong> ${email.destinataire}</li>
                     <li><strong>Sujet :</strong> ${email.sujet}</li>
                     <li><strong>Dernière erreur :</strong> ${email.derniereErreur || 'inconnue'}</li>
                   </ul>
                   <p>Un contact manuel avec ce client est recommandé.</p>`,
          });
        } catch {
          console.error(`Alerte d'échec définitif elle-même non envoyée pour ${email.destinataire}`);
        }
      }
    }
  }

  return NextResponse.json({ traites: enAttente.length, reussis, echecsDefinitifs });
}
