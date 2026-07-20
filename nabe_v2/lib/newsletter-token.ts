import crypto from 'crypto';

/**
 * Génère et vérifie un jeton de désabonnement signé (HMAC), pour que le lien
 * "se désabonner" dans les e-mails ne puisse pas être utilisé pour
 * désabonner l'adresse de quelqu'un d'autre (il faut connaître le jeton,
 * qu'on ne peut obtenir qu'en recevant l'e-mail).
 */
function cleSecrete(): string {
  return process.env.NEXTAUTH_SECRET || 'nabe-newsletter-fallback-secret';
}

export function genererTokenDesabonnement(email: string): string {
  return crypto.createHmac('sha256', cleSecrete()).update(email.toLowerCase().trim()).digest('hex');
}

export function verifierTokenDesabonnement(email: string, token: string): boolean {
  const attendu = genererTokenDesabonnement(email);
  // Comparaison à temps constant pour éviter les attaques par timing.
  const a = Buffer.from(attendu);
  const b = Buffer.from(token || '');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
