import { prisma } from './prisma';

export function formaterPrix(prix: number | string): string {
  const valeur = typeof prix === 'string' ? parseFloat(prix) : prix;
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: valeur % 1 === 0 ? 0 : 2,
  }).format(valeur);
}

export function slugify(texte: string): string {
  return texte
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Génère un numéro de commande unique (ex: NABE-2026-0001).
 *
 * BUG CORRIGÉ : l'ancienne version tirait un nombre aléatoire à 4 chiffres
 * (1000-9999, donc seulement 9000 valeurs possibles par an) SANS jamais
 * vérifier son unicité en base — alors que la colonne `numero` a une
 * contrainte @unique. Au-delà d'une centaine de commandes dans la même
 * année, une collision devenait statistiquement probable (paradoxe des
 * anniversaires). Comme cette fonction est appelée depuis le webhook Stripe
 * APRÈS que le client a payé, une collision provoquait un échec silencieux
 * de la création de la commande : le paiement était capturé mais aucune
 * commande ni e-mail de confirmation n'étaient jamais générés.
 *
 * Désormais : vérification d'unicité en base avec nouvelle tentative en cas
 * de collision (comme pour `genererReference` côté produits).
 */
export async function genererNumeroCommande(): Promise<string> {
  const annee = new Date().getFullYear();

  for (let tentative = 0; tentative < 10; tentative++) {
    const aleatoire = Math.floor(1000 + Math.random() * 9000);
    const numero = `NABE-${annee}-${aleatoire}`;

    const existant = await prisma.commande.findUnique({ where: { numero }, select: { id: true } });
    if (!existant) return numero;
  }

  // Repli extrêmement improbable (10 collisions de suite) : on garantit
  // l'unicité avec un suffixe temporel au lieu de faire échouer la commande.
  return `NABE-${annee}-${Date.now().toString().slice(-6)}`;
}

export const LABELS_TYPE_BIJOU: Record<string, string> = {
  BAGUE: 'Bague',
  COLLIER: 'Collier',
  BOUCLES_OREILLES: "Boucles d'oreilles",
  BRACELET: 'Bracelet',
  PIECE_UNIQUE: 'Pièce unique',
  COFFRET_CADEAU: 'Coffret cadeau',
};

export const LABELS_DISPONIBILITE: Record<string, string> = {
  EN_STOCK: 'En stock',
  FABRICATION_SUR_COMMANDE: 'Fabrication sur commande',
  CREATION_SUR_MESURE: 'Création sur mesure',
  PIECE_UNIQUE_DISPO: 'Pièce unique disponible',
  EPUISE: 'Épuisé',
};

export const LABELS_STATUT_COMMANDE: Record<string, string> = {
  EN_ATTENTE: 'En attente de paiement',
  PAYEE: 'Payée',
  EN_PREPARATION: 'En préparation',
  EXPEDIEE: 'Expédiée',
  LIVREE: 'Livrée',
  ANNULEE: 'Annulée',
  REMBOURSEE: 'Remboursée',
};

/**
 * Détermine si la promotion d'un produit est actuellement effective,
 * en tenant compte du toggle et des dates optionnelles de début/fin.
 */
export function promoEstActive(produit: {
  promoActive: boolean;
  prixPromo: string | number | null;
  promoDebut?: string | Date | null;
  promoFin?: string | Date | null;
}): boolean {
  if (!produit.promoActive || produit.prixPromo == null) return false;
  const maintenant = new Date();
  if (produit.promoDebut && new Date(produit.promoDebut) > maintenant) return false;
  if (produit.promoFin && new Date(produit.promoFin) < maintenant) return false;
  return true;
}

/**
 * Retourne le prix effectif à facturer (promo si active, sinon prix normal).
 */
export function prixEffectif(produit: {
  prix: string | number;
  promoActive: boolean;
  prixPromo: string | number | null;
  promoDebut?: string | Date | null;
  promoFin?: string | Date | null;
}): number {
  if (promoEstActive(produit)) return parseFloat(produit.prixPromo as string);
  return parseFloat(produit.prix as string);
}

/**
 * Calcule le pourcentage de réduction arrondi (ex: -20%).
 */
export function pourcentageReduction(prix: string | number, prixPromo: string | number): number {
  const p = parseFloat(prix as string);
  const pp = parseFloat(prixPromo as string);
  if (!p || p <= 0 || pp >= p) return 0;
  return Math.round(((p - pp) / p) * 100);
}
