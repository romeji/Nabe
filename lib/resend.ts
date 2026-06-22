import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  console.warn('⚠️  RESEND_API_KEY non définie — l\'envoi de newsletters ne fonctionnera pas.');
}

export const resend = new Resend(process.env.RESEND_API_KEY || '');

/** Adresse d'expédition par défaut. Doit être un domaine vérifié sur resend.com en production. */
export const EMAIL_EXPEDITEUR = process.env.RESEND_FROM_EMAIL || 'Nabe <onboarding@resend.dev>';

/**
 * Génère un email HTML simple et élégant à partir d'un sujet et d'un contenu texte.
 * Le contenu est découpé en paragraphes sur les doubles retours à la ligne.
 */
export function genererHtmlNewsletter(sujet: string, contenu: string): string {
  const paragraphes = contenu
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p style="margin: 0 0 16px; color: #5c4632; line-height: 1.6;">${p.replace(/\n/g, '<br/>')}</p>`)
    .join('');

  return `
  <!DOCTYPE html>
  <html lang="fr">
    <body style="margin:0; padding:0; background-color:#f7f1e8; font-family: Georgia, serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f1e8; padding: 32px 0;">
        <tr>
          <td align="center">
            <table width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:6px; overflow:hidden;">
              <tr>
                <td style="background-color:#8b4a32; padding: 28px; text-align:center;">
                  <span style="font-family: Georgia, serif; font-size: 32px; color:#f7f1e8;">Nabe</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 32px;">
                  <h1 style="font-size: 20px; color:#3d2e1f; margin: 0 0 20px;">${sujet}</h1>
                  ${paragraphes}
                </td>
              </tr>
              <tr>
                <td style="padding: 20px 32px; background-color:#ede3d3; text-align:center; font-size: 12px; color:#7a6a55;">
                  Vous recevez cet e-mail car vous êtes inscrit(e) à la newsletter Nabe.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>`;
}
