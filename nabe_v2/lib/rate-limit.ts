import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

/**
 * Limitation de fréquence générique, basée en base de données (et non en
 * mémoire), pour rester fiable sur un déploiement serverless (Vercel) où
 * chaque requête peut être traitée par une instance différente sans état
 * partagé — un compteur en mémoire simple ne fonctionnerait pas de façon
 * fiable dans ce contexte.
 *
 * Utilisation : verifierLimiteTaux('newsletter', ip, 5, 60) → autorise 5
 * requêtes par IP pour la clé "newsletter" toutes les 60 minutes.
 */
export async function verifierLimiteTaux(
  cle: string,
  identifiant: string,
  maxTentatives: number,
  fenetreMinutes: number
): Promise<{ autorise: boolean; restant: number }> {
  const cleComplete = `${cle}:${identifiant}`;
  const maintenant = new Date();

  const existant = await prisma.limiteTaux.findUnique({ where: { cle: cleComplete } });

  if (!existant || existant.expireA < maintenant) {
    await prisma.limiteTaux.upsert({
      where: { cle: cleComplete },
      create: { cle: cleComplete, compteur: 1, expireA: new Date(maintenant.getTime() + fenetreMinutes * 60 * 1000) },
      update: { compteur: 1, expireA: new Date(maintenant.getTime() + fenetreMinutes * 60 * 1000) },
    });
    return { autorise: true, restant: maxTentatives - 1 };
  }

  if (existant.compteur >= maxTentatives) {
    return { autorise: false, restant: 0 };
  }

  await prisma.limiteTaux.update({ where: { cle: cleComplete }, data: { compteur: { increment: 1 } } });
  return { autorise: true, restant: maxTentatives - existant.compteur - 1 };
}

/** Récupère une IP exploitable depuis la requête (Vercel transmet x-forwarded-for). */
export function obtenirIp(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'inconnue';
}
