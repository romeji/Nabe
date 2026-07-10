import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  console.warn('⚠️  RESEND_API_KEY non définie — l\'envoi de newsletters ne fonctionnera pas.');
}

export const resend = new Resend(process.env.RESEND_API_KEY || '');

/** Adresse d'expédition par défaut. Doit être un domaine vérifié sur resend.com en production. */
export const EMAIL_EXPEDITEUR = process.env.RESEND_FROM_EMAIL || 'Nabe <onboarding@resend.dev>';

/**
 * Génère un email HTML élégant à partir d'un sujet et d'un contenu déjà au
 * format HTML (produit par l'éditeur de texte riche du backoffice).
 */
export function genererHtmlNewsletter(sujet: string, contenuHtml: string, email: string, tokenDesabonnement: string): string {
  const urlBase = process.env.NEXT_PUBLIC_SITE_URL || 'https://nabe-bijoux.fr';
  const urlDesabonnement = `${urlBase}/newsletter/desabonnement?email=${encodeURIComponent(email)}&token=${tokenDesabonnement}`;
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
                <td style="padding: 32px; color:#5c4632; line-height:1.6;">
                  <h1 style="font-size: 20px; color:#3d2e1f; margin: 0 0 20px;">${sujet}</h1>
                  ${contenuHtml}
                </td>
              </tr>
              <tr>
                <td style="padding: 20px 32px; background-color:#ede3d3; text-align:center; font-size: 12px; color:#7a6a55;">
                  Vous recevez cet e-mail car vous êtes inscrit(e) à la newsletter Nabe.
                  <br />
                  <a href="${urlDesabonnement}" style="color:#7a6a55;">Se désabonner</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>`;
}

/** Email envoyé après la création d'un compte client (distinct de l'email code promo du popup d'accueil). */
export function genererHtmlBienvenueCompte(prenom: string): string {
  return enveloppeEmail(
    `Bienvenue chez Nabe, ${prenom} !`,
    `
    <p>Votre compte a bien été créé. Vous pouvez désormais suivre vos commandes, gérer vos favoris et vos informations depuis votre espace client.</p>
    <p>À très vite,<br/>L'équipe Nabe</p>`
  );
}

/** Email envoyé lorsqu'un client supprime son compte. */
export function genererHtmlSuppressionCompte(prenom: string): string {
  return enveloppeEmail(
    `Votre compte Nabe a été supprimé`,
    `
    <p>Bonjour ${prenom},</p>
    <p>Nous confirmons la suppression de votre compte Nabe, comme vous l'avez demandé.</p>
    <p>Vos informations personnelles (nom, adresses, favoris) ont été supprimées de nos systèmes. Si vous aviez déjà passé commande, nous conservons uniquement les informations de facturation nécessaires à nos obligations légales et comptables, sans qu'elles restent associées à un compte actif.</p>
    <p>Vous pouvez recréer un compte à tout moment si vous changez d'avis.</p>`
  );
}

type LigneEmail = { nomProduit: string; taille?: string | null; quantite: number; prixUnitaire: number };

function enveloppeEmail(titre: string, corpsHtml: string): string {
  return `
  <!DOCTYPE html>
  <html lang="fr">
    <body style="margin:0; padding:0; background-color:#f7f1e8; font-family: Georgia, serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f1e8; padding: 32px 0;">
        <tr><td align="center">
          <table width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:6px; overflow:hidden;">
            <tr><td style="background-color:#8b4a32; padding: 28px; text-align:center;">
              <span style="font-family: Georgia, serif; font-size: 32px; color:#f7f1e8;">Nabe</span>
            </td></tr>
            <tr><td style="padding: 32px; color:#5c4632; line-height:1.6;">
              <h1 style="font-size: 20px; color:#3d2e1f; margin: 0 0 20px;">${titre}</h1>
              ${corpsHtml}
            </td></tr>
            <tr><td style="padding: 20px 32px; background-color:#ede3d3; text-align:center; font-size: 12px; color:#7a6a55;">
              L'équipe Nabe — L'éclat de chaque histoire.
            </td></tr>
          </table>
        </td></tr>
      </table>
    </body>
  </html>`;
}

function tableauLignes(lignes: LigneEmail[]): string {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 16px 0; border-collapse: collapse;">
      ${lignes
        .map(
          (l) => `
        <tr style="border-bottom: 1px solid #ede3d3;">
          <td style="padding: 10px 0; font-size: 14px;">${l.nomProduit}${l.taille ? ` — taille ${l.taille}` : ''} × ${l.quantite}</td>
          <td style="padding: 10px 0; font-size: 14px; text-align:right; white-space:nowrap;">${(l.prixUnitaire * l.quantite).toFixed(2)} €</td>
        </tr>`
        )
        .join('')}
    </table>`;
}

/** Email envoyé au client juste après un paiement réussi (webhook Stripe). */
export function genererHtmlConfirmationCommande(params: {
  prenom: string;
  numero: string;
  lignes: LigneEmail[];
  sousTotal: number;
  montantReduction: number;
  fraisLivraison: number;
  total: number;
  adresseLivraison?: string;
  ville?: string;
  codePostal?: string;
}): string {
  const { prenom, numero, lignes, sousTotal, montantReduction, fraisLivraison, total, adresseLivraison, ville, codePostal } = params;
  return enveloppeEmail(
    `Merci pour votre commande, ${prenom} !`,
    `
    <p>Votre commande <strong>${numero}</strong> est confirmée et va être préparée avec soin.</p>
    ${tableauLignes(lignes)}
    <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 14px; margin-top: 8px;">
      <tr><td>Sous-total</td><td style="text-align:right;">${sousTotal.toFixed(2)} €</td></tr>
      ${montantReduction > 0 ? `<tr><td>Réduction</td><td style="text-align:right;">−${montantReduction.toFixed(2)} €</td></tr>` : ''}
      <tr><td>Livraison</td><td style="text-align:right;">${fraisLivraison > 0 ? `${fraisLivraison.toFixed(2)} €` : 'Offerte'}</td></tr>
      <tr style="font-weight:bold; font-size:16px;"><td style="padding-top:8px;">Total</td><td style="text-align:right; padding-top:8px;">${total.toFixed(2)} €</td></tr>
    </table>
    ${
      adresseLivraison
        ? `<p style="margin-top:20px; font-size:13px; color:#7a6a55;">Livraison à : ${adresseLivraison}, ${codePostal || ''} ${ville || ''}</p>`
        : ''
    }
    <p style="margin-top:20px;">Vous recevrez un e-mail dès que votre colis sera expédié.</p>`
  );
}

/** Email envoyé au client quand sa commande passe au statut "Expédiée". */
export function genererHtmlExpeditionCommande(params: {
  prenom: string;
  numero: string;
  numeroSuivi?: string | null;
  urlSuivi?: string | null;
}): string {
  const { prenom, numero, numeroSuivi, urlSuivi } = params;
  return enveloppeEmail(
    `Votre commande ${numero} est en route !`,
    `
    <p>Bonjour ${prenom},</p>
    <p>Votre commande vient d'être expédiée et est en chemin vers vous.</p>
    ${
      numeroSuivi
        ? `<p>Numéro de suivi : <strong>${numeroSuivi}</strong>${
            urlSuivi ? ` — <a href="${urlSuivi}">suivre mon colis</a>` : ''
          }</p>`
        : ''
    }
    <p>Vous pouvez à tout moment consulter le statut de votre commande sur notre page de suivi.</p>`
  );
}

/** Email envoyé au client lorsqu'une commande est annulée ou remboursée depuis l'admin. */
export function genererHtmlAnnulationCommande(params: {
  prenom: string;
  numero: string;
  total: number;
  rembourse: boolean;
}): string {
  const { prenom, numero, total, rembourse } = params;
  return enveloppeEmail(
    `Votre commande ${numero} a été ${rembourse ? 'remboursée' : 'annulée'}`,
    `
    <p>Bonjour ${prenom},</p>
    <p>Nous vous informons que votre commande <strong>${numero}</strong> d'un montant de ${total.toFixed(2)} € a été ${
      rembourse ? 'annulée et remboursée' : 'annulée'
    }.</p>
    ${
      rembourse
        ? `<p>Le remboursement sera visible sur votre moyen de paiement d'origine sous quelques jours ouvrés.</p>`
        : ''
    }
    <p>Pour toute question, n'hésitez pas à nous contacter en répondant à cet e-mail.</p>`
  );
}
