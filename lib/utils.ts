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

export function genererNumeroCommande(): string {
  const annee = new Date().getFullYear();
  const aleatoire = Math.floor(1000 + Math.random() * 9000);
  return `NABE-${annee}-${aleatoire}`;
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
