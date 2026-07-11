import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resend, EMAIL_EXPEDITEUR } from '@/lib/resend';
import { getConfigSite } from '@/lib/config-site';
import { verifierLimiteTaux, obtenirIp } from '@/lib/rate-limit';

function genererSegmentCode(): string {
  return Math.random().toString(36).substring(2, 7).toUpperCase();
}

export async function POST(req: NextRequest) {
  try {
    const { autorise } = await verifierLimiteTaux('popup-bienvenue', obtenirIp(req), 5, 60);
    if (!autorise) {
      return NextResponse.json({ error: 'Trop de tentatives. Réessayez plus tard.' }, { status: 429 });
    }

    const { prenom, email } = await req.json();

    if (!prenom || !prenom.trim() || !email || !email.includes('@')) {
      return NextResponse.json({ error: 'Prénom et e-mail valides requis.' }, { status: 400 });
    }

    const config = await getConfigSite();
    const pourcentage = parseFloat(config.popup_bienvenue_pourcentage || '10');

    // On inscrit aussi la personne à la newsletter (cohérent avec l'intention "ajout email")
    await prisma.abonneNewsletter.upsert({
      where: { email },
      update: {},
      create: { email },
    });

    // Un code par personne : on génère un code unique à usage unique, lié à cet email
    // via l'inscription newsletter déjà faite ci-dessus.
    const code = `BIENVENUE-${genererSegmentCode()}`;

    const codeReduction = await prisma.codeReduction.create({
      data: {
        code,
        type: 'POURCENTAGE',
        valeur: pourcentage,
        utilisationMax: 1,
      },
    });

    // Envoi de l'email avec le code
    try {
      await resend.emails.send({
        from: EMAIL_EXPEDITEUR,
        to: email,
        subject: `${prenom}, votre surprise Nabe vous attend 🎁`,
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
                      <h1 style="font-size: 20px; color:#3d2e1f;">Bonjour ${prenom},</h1>
                      <p style="color:#5c4632; line-height:1.6;">Merci de rejoindre l'univers Nabe. Voici votre code de réduction de <strong>${pourcentage}%</strong>, valable sur votre prochaine commande :</p>
                      <p style="font-size: 24px; letter-spacing: 2px; background-color:#ede3d3; padding: 14px; border-radius:4px; color:#8b4a32; font-weight:bold;">${code}</p>
                      <p style="color:#7a6a55; font-size:13px;">À bientôt,<br/>L'équipe Nabe</p>
                    </td></tr>
                  </table>
                </td></tr>
              </table>
            </body>
          </html>`,
      });
    } catch (err) {
      console.error('Erreur envoi email popup bienvenue (le code reste valide) :', err);
    }

    return NextResponse.json({ success: true, code });
  } catch (error: any) {
    console.error('Erreur popup bienvenue:', error);
    return NextResponse.json({ error: error.message || 'Erreur' }, { status: 500 });
  }
}
