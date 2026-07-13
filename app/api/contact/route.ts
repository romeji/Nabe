import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { verifierLimiteTaux, obtenirIp } from '@/lib/rate-limit';
import { EMAIL_CONTACT, EMAIL_EXPEDITEUR, genererHtmlNotificationContact, resend } from '@/lib/resend';

const schema = z.object({
  nom: z.string().min(1),
  email: z.string().email(),
  sujet: z.string().min(1),
  message: z.string().min(1),
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
      await resend.emails.send({
        from: EMAIL_EXPEDITEUR,
        to: EMAIL_CONTACT,
        replyTo: donnees.email,
        subject: `Nouveau message contact - ${donnees.sujet}`,
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
