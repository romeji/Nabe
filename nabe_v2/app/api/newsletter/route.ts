import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifierLimiteTaux, obtenirIp } from '@/lib/rate-limit';
import { resend, EMAIL_EXPEDITEUR, genererHtmlBienvenueNewsletter } from '@/lib/resend';
import { getContenuPage } from '@/lib/contenu';

export async function POST(req: NextRequest) {
  try {
    const { autorise } = await verifierLimiteTaux('newsletter', obtenirIp(req), 5, 60);
    if (!autorise) {
      return NextResponse.json({ error: 'Trop de tentatives. Réessayez plus tard.' }, { status: 429 });
    }

    const contentType = req.headers.get('content-type') || '';
    let email: string;

    if (contentType.includes('application/json')) {
      const body = await req.json();
      email = body.email;
    } else {
      const formData = await req.formData();
      email = formData.get('email') as string;
    }

    email = email?.trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
    }

    // update: { actif: true } est nécessaire pour réactiver quelqu'un qui
    // s'était désabonné et qui se réinscrit (sinon il reste "inactif" en base).
    await prisma.abonneNewsletter.upsert({
      where: { email },
      update: { actif: true },
      create: { email },
    });

    // Email de bienvenue — envoyé dans tous les cas (formulaire HTML classique
    // ou appel JSON), donc placé avant le redirect qui court-circuiterait
    // sinon le reste de la fonction pour les formulaires HTML.
    try {
      const emailsContenu = await getContenuPage('emails');
      await resend.emails.send({
        from: EMAIL_EXPEDITEUR,
        to: email,
        subject: emailsContenu.newsletter_sujet || 'Bienvenue dans l\'univers Nabe ✨',
        html: genererHtmlBienvenueNewsletter(emailsContenu.newsletter_message),
      });
    } catch (err) {
      console.error('Erreur envoi email bienvenue newsletter :', err);
    }

    // Si la requête vient d'un formulaire HTML classique, on redirige
    if (!contentType.includes('application/json')) {
      return NextResponse.redirect(new URL('/?inscription=ok', req.url));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur newsletter:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
