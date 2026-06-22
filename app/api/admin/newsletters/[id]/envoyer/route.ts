import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifierSessionAdmin } from '@/lib/auth-helpers';
import { resend, EMAIL_EXPEDITEUR, genererHtmlNewsletter } from '@/lib/resend';

// Resend limite à 100 destinataires par appel API sur le plan gratuit.
// On découpe donc l'envoi en lots de 100.
const TAILLE_LOT = 100;

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await verifierSessionAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const newsletter = await prisma.newsletter.findUnique({ where: { id: params.id } });
    if (!newsletter) {
      return NextResponse.json({ error: 'Newsletter introuvable' }, { status: 404 });
    }
    if (newsletter.statut === 'ENVOYEE') {
      return NextResponse.json({ error: 'Cette newsletter a déjà été envoyée' }, { status: 400 });
    }

    const abonnes = await prisma.abonneNewsletter.findMany({ select: { email: true } });

    if (abonnes.length === 0) {
      return NextResponse.json(
        { error: 'Aucun abonné à la newsletter pour le moment. Personne ne recevra cet email.' },
        { status: 400 }
      );
    }

    const html = genererHtmlNewsletter(newsletter.sujet, newsletter.contenu);
    const emails = abonnes.map((a) => a.email);

    // Envoi par lots de TAILLE_LOT pour respecter les limites de l'API Resend
    const erreurs: string[] = [];
    for (let i = 0; i < emails.length; i += TAILLE_LOT) {
      const lot = emails.slice(i, i + TAILLE_LOT);
      try {
        await resend.emails.send({
          from: EMAIL_EXPEDITEUR,
          to: EMAIL_EXPEDITEUR, // destinataire technique requis par certains comptes ; les vrais destinataires sont en bcc
          bcc: lot,
          subject: newsletter.sujet,
          html,
        });
      } catch (err: any) {
        console.error('Erreur envoi lot newsletter:', err);
        erreurs.push(`Lot ${i / TAILLE_LOT + 1} : ${err.message || 'erreur inconnue'}`);
      }
    }

    if (erreurs.length > 0 && erreurs.length === Math.ceil(emails.length / TAILLE_LOT)) {
      // Tous les lots ont échoué : on ne marque pas comme envoyée
      return NextResponse.json(
        { error: `Échec de l'envoi : ${erreurs.join(' ; ')}` },
        { status: 500 }
      );
    }

    const miseAJour = await prisma.newsletter.update({
      where: { id: params.id },
      data: {
        statut: 'ENVOYEE',
        nombreDestinataires: emails.length,
        envoyeeLe: new Date(),
      },
    });

    return NextResponse.json({
      ...miseAJour,
      avertissement: erreurs.length > 0 ? `Certains lots ont échoué : ${erreurs.join(' ; ')}` : undefined,
    });
  } catch (error: any) {
    console.error('Erreur envoi newsletter:', error);
    return NextResponse.json({ error: error.message || "Erreur lors de l'envoi" }, { status: 500 });
  }
}
