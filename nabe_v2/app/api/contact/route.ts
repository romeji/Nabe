import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { verifierLimiteTaux, obtenirIp } from '@/lib/rate-limit';
import { EMAIL_CONTACT, EMAIL_EXPEDITEUR, genererHtmlNotificationContact, resend } from '@/lib/resend';
import { getConfigSite } from '@/lib/config-site';

const schema = z.object({
  nom: z.string().min(1),
  email: z.string().email(),
  telephone: z.string().optional(),
  sujet: z.string().min(1),
  message: z.string().min(1),
  estProbleme: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const { autorise } = await verifierLimiteTaux('contact', obtenirIp(req), 5, 60);
    if (!autorise) {
      return NextResponse.json({ error: 'Trop de messages envoyés. Réessayez plus tard.' }, { status: 429 });
    }

    const body = await req.json();
    const donnees = schema.parse(body);

    await prisma.messageContact.create({
      data: donnees,
    });

    try {
      // Un signalement de problème (bouton "Signaler un problème" sur une
      // commande) part vers l'adresse dédiée configurée dans Réglages,
      // distincte de l'adresse de contact générale — pour ne jamais la
      // noyer parmi les demandes commerciales/collaborations classiques.
      const destinataire = donnees.estProbleme
        ? (await getConfigSite()).email_signalement_probleme || EMAIL_CONTACT
        : EMAIL_CONTACT;

      await resend.emails.send({
        from: EMAIL_EXPEDITEUR,
        to: destinataire,
        replyTo: donnees.email,
        subject: donnees.estProbleme
          ? `⚠️ Signalement de problème — ${donnees.sujet}`
          : `Nouveau message contact - ${donnees.sujet}`,
        html: genererHtmlNotificationContact(donnees),
      });
    } catch (err) {
      console.error('Erreur envoi notification contact (message conserve) :', err);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur contact:', error);
    return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
  }
}
