import DOMPurify from 'isomorphic-dompurify';

/**
 * Nettoie un HTML avant de l'injecter avec dangerouslySetInnerHTML ou de
 * l'envoyer dans un e-mail.
 *
 * Tout le contenu concerné vient de champs de texte enrichi édités en
 * administration (descriptions produit, pages FAQ/CGV/politiques, contenu
 * des popups d'info, newsletters) — donc a priori de confiance. Mais ce
 * nettoyage reste une protection en profondeur utile : si un compte admin
 * était un jour compromis (mot de passe piraté, etc.), il ne suffirait pas
 * d'injecter un <script> dans un champ de texte pour l'exécuter chez tous
 * les visiteurs du site ou dans la boîte mail de tous les abonnés.
 *
 * On autorise le balisage de mise en forme habituel d'un éditeur de texte
 * riche (titres, paragraphes, listes, liens, gras/italique, images) et on
 * bloque tout le reste (scripts, gestionnaires d'événements, iframes, etc.).
 */
export function nettoyerHtml(html: string): string {
  if (!html) return '';
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'span', 'div',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote',
      'a', 'img',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'title', 'class', 'style'],
  });
}
