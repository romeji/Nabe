import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifierSessionAdmin } from '@/lib/auth-helpers';
import { resend, EMAIL_EXPEDITEUR, genererHtmlNewsletter } from '@/lib/resend';
import { genererTokenDesabonnement } from '@/lib/newsletter-token';

// Resend limite l'API batch à 100 emails par appel. On découpe donc l'envoi
// en lots de 100, chaque email étant individuellement adressé (nécessaire
// pour que chaque destinataire ait SON propre lien de désabonnement valide
// — impossible à faire correctement avec un envoi groupé en BCC).
const TAILLE_LOT = 100;

export async function POST(req: NextRequest, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = await paramsPromise;
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

    const abonnes = await prisma.abonneNewsletter.findMany({ where: { actif: true }, select: { email: true } });

    if (abonnes.length === 0) {
      return NextResponse.json(
        { error: 'Aucun abonné à la newsletter pour le moment. Personne ne recevra cet email.' },
        { status: 400 }
      );
    }

    // Envoi par lots de TAILLE_LOT, un email personnalisé par destinataire.
    // Important : le SDK Resend ne lève pas d'exception pour les erreurs de
    // l'API — il renvoie { data, error }. On vérifie donc explicitement.
    // Autre point : l'API batch est atomique (si un seul email du lot est
    // invalide, tout le lot échoue) — d'où l'intérêt de garder des lots
    // raisonnables et de bien valider les adresses à l'inscription.
    const erreurs: string[] = [];
    for (let i = 0; i < abonnes.length; i += TAILLE_LOT) {
      const lot = abonnes.slice(i, i + TAILLE_LOT);
      try {
        const { error } = await resend.batch.send(
          lot.map((abonne) => ({
            from: EMAIL_EXPEDITEUR,
            to: abonne.email,
            subject: newsletter.sujet,
            html: genererHtmlNewsletter(newsletter.sujet, newsletter.contenu, abonne.email, genererTokenDesabonnement(abonne.email)),
          }))
        );
        if (error) {
          console.error('Erreur envoi lot newsletter:', error);
          erreurs.push(`Lot ${i / TAILLE_LOT + 1} : ${error.message || 'erreur inconnue'}`);
        }
      } catch (err: any) {
        console.error('Erreur envoi lot newsletter:', err);
        erreurs.push(`Lot ${i / TAILLE_LOT + 1} : ${err.message || 'erreur inconnue'}`);
      }
    }

    if (erreurs.length > 0 && erreurs.length === Math.ceil(abonnes.length / TAILLE_LOT)) {
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
        nombreDestinataires: abonnes.length,
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
