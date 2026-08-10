import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  console.warn('⚠️  RESEND_API_KEY non définie — l\'envoi de newsletters ne fonctionnera pas.');
}

export const resend = new Resend(process.env.RESEND_API_KEY || '');

/** Adresse d'expédition par défaut. Doit être un domaine vérifié sur resend.com en production. */
export const EMAIL_EXPEDITEUR = process.env.RESEND_FROM_EMAIL || 'Nabe <onboarding@resend.dev>';
export const EMAIL_CONTACT = process.env.RESEND_CONTACT_EMAIL || EMAIL_EXPEDITEUR;

function echapperHtml(valeur: string | null | undefined): string {
  return String(valeur || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Génère un email HTML élégant à partir d'un sujet et d'un contenu déjà au
 * format HTML (produit par l'éditeur de texte riche du backoffice).
 */
/** Email de bienvenue envoyé lors de l'inscription à la newsletter. */
export function genererHtmlBienvenueNewsletter(messagePersonnalise?: string): string {
  return enveloppeEmail(
    `Bienvenue dans l'univers Nabe`,
    messagePersonnalise ||
    `
    <p>Merci de nous rejoindre. Vous serez parmi les premiers informés de nos nouvelles créations, de nos collections exclusives et de nos événements.</p>
    <p>Avec élégance,<br/>L'équipe Nabe</p>`
  );
}

/** Email contenant le code de réduction de bienvenue (popup d'inscription). */
export function genererHtmlSurprisePopup(params: {
  prenom: string;
  pourcentage: number;
  code: string;
  messagePersonnalise?: string;
}): string {
  const { prenom, pourcentage, code, messagePersonnalise } = params;
  return enveloppeEmail(
    `Bonjour ${prenom},`,
    `
    ${
      messagePersonnalise ||
      `<p>Merci de rejoindre l'univers Nabe. Voici votre code de réduction de <strong>${pourcentage}%</strong>, valable sur votre prochaine commande :</p>`
    }
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 24px 0;">
      <tr><td style="border: 1.5px dashed #c9a15c; border-radius: 8px; background-color: #fbf3e4; padding: 20px; text-align:center;">
        <span style="display:block; font-size:10.5px; letter-spacing:0.14em; text-transform:uppercase; color:#a3937f; margin-bottom:8px;">Votre code</span>
        <span style="font-family: Georgia, serif; font-size: 26px; letter-spacing: 3px; color:#7c4027; font-weight:bold;">${code}</span>
      </td></tr>
    </table>`
  );
}

export function genererHtmlNewsletter(sujet: string, contenuHtml: string, email: string, tokenDesabonnement: string): string {
  const urlBase = process.env.NEXT_PUBLIC_SITE_URL || 'https://nabe-bijoux.fr';
  const urlDesabonnement = `${urlBase}/newsletter/desabonnement?email=${encodeURIComponent(email)}&token=${tokenDesabonnement}`;
  return enveloppeEmail(
    sujet,
    contenuHtml,
    `Vous recevez cet e-mail car vous êtes inscrit(e) à la newsletter Nabe.
     <br />
     <a href="${urlDesabonnement}" style="color:#a3937f;">Se désabonner</a>`
  );
}

/** Email envoyé après la création d'un compte client (distinct de l'email code promo du popup d'accueil). */
export function genererHtmlBienvenueCompte(prenom: string, messagePersonnalise?: string): string {
  return enveloppeEmail(
    `Bienvenue chez Nabe, ${prenom} !`,
    messagePersonnalise ||
    `
    <p>Votre compte a bien été créé. Vous pouvez désormais suivre vos commandes, gérer vos favoris et vos informations depuis votre espace client.</p>
    <p>À très vite,<br/>L'équipe Nabe</p>`
  );
}

/** Email envoyé lorsqu'un client supprime son compte. */
export function genererHtmlSuppressionCompte(prenom: string, messagePersonnalise?: string): string {
  return enveloppeEmail(
    `Votre compte Nabe a été supprimé`,
    messagePersonnalise ||
    `
    <p>Bonjour ${prenom},</p>
    <p>Nous confirmons la suppression de votre compte Nabe, comme vous l'avez demandé.</p>
    <p>Vos informations personnelles (nom, adresses, favoris) ont été supprimées de nos systèmes. Si vous aviez déjà passé commande, nous conservons uniquement les informations de facturation nécessaires à nos obligations légales et comptables, sans qu'elles restent associées à un compte actif.</p>
    <p>Vous pouvez recréer un compte à tout moment si vous changez d'avis.</p>`
  );
}

/** Email de securite envoye apres changement de mot de passe. */
export function genererHtmlMotDePasseModifie(prenom: string, messagePersonnalise?: string): string {
  return enveloppeEmail(
    `Votre mot de passe Nabe a ete modifie`,
    messagePersonnalise ||
    `
    <p>Bonjour ${prenom},</p>
    <p>Nous confirmons que le mot de passe de votre compte Nabe vient d'etre modifie.</p>
    <p>Si vous n'etes pas a l'origine de cette action, contactez-nous immediatement en repondant a cet e-mail.</p>`
  );
}

/** Email de demande de reinitialisation de mot de passe. */
export function genererHtmlReinitialisationMotDePasse(prenom: string, lien: string, messagePersonnalise?: string): string {
  return enveloppeEmail(
    `Reinitialiser votre mot de passe Nabe`,
    `
    <p>Bonjour ${prenom},</p>
    ${messagePersonnalise || `<p>Vous avez demande a reinitialiser le mot de passe de votre compte Nabe.</p>`}
    ${boutonEmail('Choisir un nouveau mot de passe', lien)}
    <p style="font-size:13px; color:#a3937f;">Ce lien est valable 1 heure. Si vous n'etes pas a l'origine de cette demande, vous pouvez ignorer cet e-mail.</p>`
  );
}

/** Notification interne lorsqu'un formulaire de contact est depose. */
export function genererHtmlNotificationContact(params: {
  nom: string;
  email: string;
  telephone?: string;
  sujet: string;
  message: string;
  estProbleme?: boolean;
  messagePersonnalise?: string;
}): string {
  return enveloppeEmail(
    params.estProbleme ? `⚠️ Signalement de problème` : `Nouveau message de contact`,
    `
    ${params.estProbleme ? `<p style="color:#a8412a; font-weight:bold;">${params.messagePersonnalise || `Ce message a été envoyé via le bouton "Signaler un problème" depuis une commande.`}</p>` : ''}
    <p><strong>Nom :</strong> ${echapperHtml(params.nom)}</p>
    <p><strong>E-mail :</strong> ${echapperHtml(params.email)}</p>
    ${params.telephone ? `<p><strong>Téléphone :</strong> ${echapperHtml(params.telephone)}</p>` : ''}
    <p><strong>Sujet :</strong> ${echapperHtml(params.sujet)}</p>
    <p style="white-space:pre-wrap;">${echapperHtml(params.message)}</p>`
  );
}

/** Notification interne lorsqu'une demande sur-mesure est deposee. */
export function genererHtmlNotificationSurMesure(params: {
  nom: string;
  email: string;
  telephone?: string | null;
  modeleSelectionne?: string | null;
  tailleSouhaitee?: string | null;
  matiere?: string | null;
  pierre?: string | null;
  gravure?: string | null;
  message: string;
}): string {
  const details = [
    ['Modele', params.modeleSelectionne],
    ['Taille', params.tailleSouhaitee],
    ['Matiere', params.matiere],
    ['Pierre', params.pierre],
    ['Gravure', params.gravure],
    ['Telephone', params.telephone],
  ]
    .filter(([, valeur]) => valeur)
    .map(([label, valeur]) => `<p><strong>${label} :</strong> ${echapperHtml(valeur)}</p>`)
    .join('');

  return enveloppeEmail(
    `Nouvelle demande sur-mesure`,
    `
    <p><strong>Nom :</strong> ${echapperHtml(params.nom)}</p>
    <p><strong>E-mail :</strong> ${echapperHtml(params.email)}</p>
    ${details}
    <p style="white-space:pre-wrap;">${echapperHtml(params.message)}</p>`
  );
}

type LigneEmail = { nomProduit: string; taille?: string | null; quantite: number; prixUnitaire: number };

/**
 * Enveloppe commune à tous les e-mails envoyés par Nabe (confirmation de
 * commande, newsletter, réinitialisation de mot de passe, etc.) — pour que
 * chaque e-mail reçu porte la même identité que le site : le même dégradé
 * de couleurs (brun profond, doré, terracotta, crème), le même esprit
 * artisanal, sobre et chaleureux.
 *
 * Un e-mail HTML ne peut pas charger les polices ni le CSS du site : tout
 * est fait ici en styles inline et polices "web-safe" (Georgia), avec une
 * mise en page en tableaux pour rester fiable dans tous les clients mail
 * (Gmail, Outlook, Apple Mail...).
 */
function enveloppeEmail(titre: string, corpsHtml: string, piedHtml?: string): string {
  return `
  <!DOCTYPE html>
  <html lang="fr">
    <body style="margin:0; padding:0; background-color:#efe6d8; font-family: Georgia, 'Times New Roman', serif;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#efe6d8; padding: 44px 16px;">
        <tr>
          <td align="center">
            <table role="presentation" width="580" cellpadding="0" cellspacing="0" style="max-width:580px; width:100%; background-color:#fffdfa; border-radius:8px; overflow:hidden; box-shadow:0 10px 32px rgba(69,41,30,0.10);">
              <tr>
                <td style="background-color:#3d2417; padding: 38px 32px; text-align:center;">
                  <span style="font-family: Georgia, serif; font-size: 34px; letter-spacing:0.05em; color:#d9b273;">Nabe</span>
                  <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 16px auto 0;">
                    <tr><td style="width:44px; height:1px; background-color:#d9b273; opacity:0.55; font-size:0; line-height:0;">&nbsp;</td></tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding: 42px 36px 16px; color:#4a382c; line-height:1.68; font-size:15px;">
                  <h1 style="font-size:21px; font-weight:normal; color:#3d2417; margin:0 0 22px; letter-spacing:0.01em;">${titre}</h1>
                  ${corpsHtml}
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 36px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="border-top:1px solid #ecdfc6; font-size:0; line-height:0;">&nbsp;</td></tr></table>
                </td>
              </tr>
              <tr>
                <td style="padding: 22px 36px 34px; text-align:center; font-size:11.5px; color:#a3937f; letter-spacing:0.02em;">
                  ${piedHtml || `Nabe — L'éclat de chaque histoire.`}
                </td>
              </tr>
            </table>
            <p style="font-size:11px; color:#a3937f; margin: 22px 0 0; letter-spacing:0.03em;">Nabe · Bijouterie artisanale</p>
          </td>
        </tr>
      </table>
    </body>
  </html>`;
}

/** Bouton d'action principal (lien de réinitialisation, etc.), stylé comme les boutons du site. */
function boutonEmail(texte: string, lien: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin: 22px 0;"><tr><td style="background-color:#45291e; border-radius:999px;">
    <a href="${lien}" style="display:inline-block; padding:13px 28px; font-family: Georgia, serif; font-size:14px; color:#fffdfa; text-decoration:none; letter-spacing:0.02em;">${texte}</a>
  </td></tr></table>`;
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
  messagePersonnalise?: string;
}): string {
  const { prenom, numero, lignes, sousTotal, montantReduction, fraisLivraison, total, adresseLivraison, ville, codePostal } = params;
  return enveloppeEmail(
    `Merci pour votre commande, ${prenom} !`,
    `
    ${params.messagePersonnalise || `<p>Votre commande <strong>${numero}</strong> est confirmée et va être préparée avec soin.</p>`}
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
  messagePersonnalise?: string;
}): string {
  const { prenom, numero, numeroSuivi, urlSuivi, messagePersonnalise } = params;
  return enveloppeEmail(
    `Votre commande ${numero} est en route !`,
    `
    <p>Bonjour ${prenom},</p>
    ${messagePersonnalise || `<p>Votre commande vient d'être expédiée et est en chemin vers vous.</p>`}
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
  messagePersonnalise?: string;
}): string {
  const { prenom, numero, total, rembourse, messagePersonnalise } = params;
  return enveloppeEmail(
    `Votre commande ${numero} a été ${rembourse ? 'remboursée' : 'annulée'}`,
    `
    <p>Bonjour ${prenom},</p>
    ${messagePersonnalise || `<p>Nous vous informons que votre commande <strong>${numero}</strong> d'un montant de ${total.toFixed(2)} € a été ${
      rembourse ? 'annulée et remboursée' : 'annulée'
    }.</p>`}
    ${
      rembourse
        ? `<p>Le remboursement sera visible sur votre moyen de paiement d'origine sous quelques jours ouvrés.</p>`
        : ''
    }
    <p>Pour toute question, n'hésitez pas à nous contacter en répondant à cet e-mail.</p>`
  );
}
