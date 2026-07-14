import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifierLimiteTaux, obtenirIp } from '@/lib/rate-limit';
import { resend, EMAIL_EXPEDITEUR } from '@/lib/resend';

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

    // Si la requête vient d'un formulaire HTML classique, on redirige
    if (!contentType.includes('application/json')) {
      return NextResponse.redirect(new URL('/?inscription=ok', req.url));
    }

    // Email de bienvenue
    try {
      await resend.emails.send({
        from: EMAIL_EXPEDITEUR,
        to: email,
        subject: 'Bienvenue dans l\'univers Nabe ✨',
        html: `
          <!DOCTYPE html>
          <html lang="fr">
            <body style="margin:0; padding:0; background-color:#f7f1e8; font-family: Georgia, serif;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f1e8; padding: 32px 0;">
                <tr><td align="center">
                  <table width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:6px; overflow:hidden;">
                    <tr><td style="background-color:#8b4a32; padding: 28px; text-align:center;">
                      <span style="font-family: Georgia, serif; font-size: 32px; color:#f7f1e8;">Nabe</span>
                    </td></tr>
                    <tr><td style="padding: 32px; text-align:center;">
                      <h1 style="font-size: 20px; color:#3d2e1f; margin-bottom: 16px;">Bienvenue dans l'univers Nabe</h1>
                      <p style="color:#5c4632; line-height:1.8;">Merci de nous rejoindre. Vous serez parmi les premiers informés de nos nouvelles créations, de nos collections exclusives et de nos événements.</p>
                      <p style="color:#7a6a55; font-size:13px; margin-top:24px;">Avec élégance,<br/>L'équipe Nabe</p>
                    </td></tr>
                    <tr><td style="padding: 16px 32px; background-color:#ede3d3; text-align:center; font-size: 12px; color:#7a6a55;">
                      L'éclat de chaque histoire.
                    </td></tr>
                  </table>
                </td></tr>
              </table>
            </body>
          </html>`,
      });
    } catch (err) {
      console.error('Erreur envoi email bienvenue newsletter :', err);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur newsletter:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
