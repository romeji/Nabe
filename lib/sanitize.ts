/**
 * Nettoie le HTML provenant des champs de texte enrichi avant son rendu.
 * Cette implémentation sans dépendance supprime les éléments exécutables, les
 * gestionnaires d'événements et les schémas d'URL dangereux.
 */
export function nettoyerHtml(html: string): string {
  if (!html) return '';

  return html
    .replace(/<(script|style|iframe|object|embed|link|meta|base|form|input|button|textarea|select|option)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, '')
    .replace(/<(script|style|iframe|object|embed|link|meta|base|form|input|button|textarea|select|option)\b[^>]*\/?\s*>/gi, '')
    .replace(/\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/\s(?:href|src|action)\s*=\s*(?:"\s*(?:javascript|vbscript):[^"]*"|'\s*(?:javascript|vbscript):[^']*'|(?:javascript|vbscript):[^\s>]+)/gi, '')
    .replace(/\s(?:href|src|action)\s*=\s*(?:"\s*data:(?!image\/(?:png|jpe?g|gif|webp);)[^"]*"|'\s*data:(?!image\/(?:png|jpe?g|gif|webp);)[^']*'|data:(?!image\/(?:png|jpe?g|gif|webp);)[^\s>]+)/gi, '');
}
