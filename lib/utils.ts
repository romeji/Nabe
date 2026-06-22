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

export const LABELS_PIERRE: Record<string, string> = {
  DIAMANT: 'Diamant',
  PERLE: 'Perle',
  PIERRE_DE_LUNE: 'Pierre de lune',
  QUARTZ: 'Quartz',
  TOPAZE: 'Topaze',
  SAPHIR: 'Saphir',
  EMERAUDE: 'Émeraude',
  AUCUNE: '—',
};

export const LABELS_DISPONIBILITE: Record<string, string> = {
  EN_STOCK: 'En stock',
  FABRICATION_SUR_COMMANDE: 'Fabrication sur commande',
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
