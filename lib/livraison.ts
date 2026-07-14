/**
 * Calcul des tarifs de livraison "en temps réel", c'est-à-dire calculés
 * instantanément à partir du poids réel du panier plutôt que d'un tarif
 * fixe unique — au lieu de "standard / express" à prix figé.
 *
 * Important (transparence technique) : ni Colissimo ni Mondial Relay
 * n'exposent d'API publique qui renvoie un "prix du marché" en temps réel
 * pour un envoi donné — leurs tarifs sont contractuels (grille par tranche
 * de poids, négociée avec La Poste / Mondial Relay). Le calcul "temps réel"
 * ici applique donc VOTRE grille tarifaire (éditable dans Admin > Réglages)
 * au poids exact du panier au moment du checkout, ce qui est le
 * fonctionnement standard des sites e-commerce français. Pour une
 * intégration API complète (étiquettes, tracking automatique), un compte
 * Colissimo Business (Pro) et un contrat Mondial Relay sont nécessaires.
 */

export type TrancheTarif = { poidsMaxGrammes: number; prix: number };

export type ModeLivraisonCalcule = {
  id: 'mondial_relay';
  label: string;
  prix: number;
  delai: string;
  necessitePointRelais: boolean;
};

/** Parse une grille au format "poidsMax:prix,poidsMax:prix,..." */
export function parserGrilleTarifs(grille: string): TrancheTarif[] {
  return grille
    .split(',')
    .map((paire: any) => {
      const [poidsMax, prix] = paire.split(':').map((v: any) => parseFloat(v.trim()));
      return { poidsMaxGrammes: poidsMax, prix };
    })
    .filter((t: any) => !isNaN(t.poidsMaxGrammes) && !isNaN(t.prix))
    .sort((a, b) => a.poidsMaxGrammes - b.poidsMaxGrammes);
}

/** Trouve le prix applicable pour un poids donné dans une grille (tranche la plus proche au-dessus). */
export function calculerPrixPourPoids(poidsGrammes: number, grille: TrancheTarif[]): number | null {
  const tranche = grille.find((t: any) => poidsGrammes <= t.poidsMaxGrammes);
  // Si le poids dépasse la plus grosse tranche définie, on applique quand même
  // la plus haute plutôt que de bloquer la vente (mieux vaut sous-facturer
  // légèrement un cas rare que casser le checkout).
  return tranche ? tranche.prix : grille[grille.length - 1]?.prix ?? null;
}

/**
 * Calcule les modes de livraison disponibles et leur prix réel pour un
 * poids total de panier donné, à partir de la config admin.
 */
export function calculerModesLivraison(
  poidsTotalGrammes: number,
  config: Record<string, string>
): ModeLivraisonCalcule[] {
  const modes: ModeLivraisonCalcule[] = [];
  const livraisonIncluse = config.livraison_incluse_dans_prix === 'true';

  if (config.livraison_mondial_relay_actif === 'true') {
    const grille = parserGrilleTarifs(config.livraison_mondial_relay_grille || '');
    const prix = livraisonIncluse ? 0 : calculerPrixPourPoids(poidsTotalGrammes, grille);
    if (prix !== null) {
      modes.push({
        id: 'mondial_relay',
        label: livraisonIncluse ? 'Point relais (Mondial Relay) — inclus' : 'Point relais (Mondial Relay)',
        prix,
        delai: '3 à 5 jours ouvrés',
        necessitePointRelais: true,
      });
    }
  }

  return modes;
}

/** Poids total du panier en grammes, à partir des lignes {poidsGrammes, quantite}. */
export function calculerPoidsPanier(articles: { poidsGrammes: number; quantite: number }[]): number {
  const EMBALLAGE_GRAMMES = 60; // pochette + boîte + carton, ajouté forfaitairement
  return EMBALLAGE_GRAMMES + articles.reduce((total: any, a: any) => total + a.poidsGrammes * a.quantite, 0);
}
