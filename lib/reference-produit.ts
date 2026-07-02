import { prisma } from './prisma';
import { TypeBijou } from '@prisma/client';

// Préfixe court par type de bijou
const PREFIXES: Record<TypeBijou, string> = {
  BAGUE:    'BAG',
  COLLIER:  'COL',
  BOUCLES_OREILLES: 'BOE',
  BRACELET: 'BRA',
  PIECE_UNIQUE: 'PUN',
  COFFRET_CADEAU: 'CFT',
};

/**
 * Génère une référence unique pour un nouveau produit.
 * Format : NABE-{TYPE}-{ANNEE}-{NUMERO 4 chiffres}
 * Exemple : NABE-BAG-2026-0001
 */
export async function genererReference(type: TypeBijou): Promise<string> {
  const annee = new Date().getFullYear();
  const prefixe = PREFIXES[type] ?? 'BIJ';
  const pattern = `NABE-${prefixe}-${annee}-`;

  // Compte combien de produits ont déjà ce préfixe cette année
  const count = await prisma.produit.count({
    where: { reference: { startsWith: pattern } },
  });

  const numero = String(count + 1).padStart(4, '0');
  return `${pattern}${numero}`;
}
