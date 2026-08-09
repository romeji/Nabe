import sanitizeHtml from 'sanitize-html';

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
 * IMPORTANT — pourquoi sanitize-html et pas DOMPurify ici :
 * `isomorphic-dompurify` s'appuie sur `jsdom` pour fonctionner côté serveur.
 * Une dépendance de jsdom (`html-encoding-sniffer`) provoque une erreur
 * ERR_REQUIRE_ESM au runtime sur Vercel (incompatibilité CommonJS/ESM dans
 * son propre graphe de dépendances), ce qui faisait planter le site entier
 * (erreur 500 sur l'accueil). `sanitize-html` fait le même travail sans
 * jsdom : plus léger, pas de souci de compatibilité serverless, et — à la
 * différence d'un filtre "maison" à base de regex — il analyse le HTML avec
 * un vrai parseur (htmlparser2) au lieu de faire confiance à des motifs de
 * texte, ce qui le rend beaucoup plus fiable.
 *
 * On autorise le balisage de mise en forme habituel d'un éditeur de texte
 * riche (titres, paragraphes, listes, liens, gras/italique, images) et on
 * bloque tout le reste (scripts, gestionnaires d'événements, iframes, etc.).
 */
export function nettoyerHtml(html: string): string {
  if (!html) return '';
  return sanitizeHtml(html, {
    allowedTags: [
      'p', 'br', 'strong', 'em', 'u', 's', 'span', 'div',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote',
      'a', 'img',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
    ],
    allowedAttributes: {
      a: ['href', 'target', 'rel', 'title', 'class', 'style'],
      img: ['src', 'alt', 'title', 'class', 'style'],
      '*': ['class', 'style'],
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedSchemesByTag: {
      img: ['http', 'https', 'data'],
    },
    // Toujours ajouter rel="noopener noreferrer" sur les liens ouverts dans un
    // nouvel onglet, pour éviter qu'une page liée puisse manipuler l'onglet
    // d'origine via window.opener.
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }, true),
    },
  });
}
