import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { verifierLimiteTaux, obtenirIp } from '@/lib/rate-limit';
import { EMAIL_CONTACT, EMAIL_EXPEDITEUR, genererHtmlNotificationSurMesure, resend } from '@/lib/resend';

const schema = z.object({
  modeleSelectionne: z.string().optional().nullable(),
  tailleSouhaitee: z.string().optional().nullable(),
  matiere: z.string().optional().nullable(),
  pierre: z.string().optional().nullable(),
  gravure: z.string().optional().nullable(),
  message: z.string().min(1),
  nom: z.string().min(1),
  email: z.string().email(),
  telephone: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    const { autorise } = await verifierLimiteTaux('sur-mesure', obtenirIp(req), 5, 60);
    if (!autorise) {
      return NextResponse.json({ error: 'Trop de demandes envoyées. Réessayez plus tard.' }, { status: 429 });
    }

    const body = await req.json();
    const donnees = schema.parse(body);

    await prisma.demandeSurMesure.create({
      data: {
        modeleSelectionne: donnees.modeleSelectionne || undefined,
        tailleSouhaitee: donnees.tailleSouhaitee || undefined,
        matiere: donnees.matiere || undefined,
        pierre: donnees.pierre || undefined,
        gravure: donnees.gravure || undefined,
        message: donnees.message,
        nom: donnees.nom,
        email: donnees.email,
        telephone: donnees.telephone || undefined,
      },
    });

    try {
      await resend.emails.send({
        from: EMAIL_EXPEDITEUR,
        to: EMAIL_CONTACT,
        replyTo: donnees.email,
        subject: `Nouvelle demande sur-mesure - ${donnees.nom}`,
        html: genererHtmlNotificationSurMesure(donnees),
      });
    } catch (err) {
      console.error('Erreur envoi notification sur-mesure (demande conservee) :', err);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur sur-mesure:', error);
    return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
  }
}
