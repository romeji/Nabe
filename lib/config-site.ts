import { prisma } from '@/lib/prisma';

// Registre des clés de configuration avec leur valeur par défaut.
// Toute nouvelle option togglable depuis l'admin doit être ajoutée ici.
export const DEFAUTS_CONFIG: Record<string, string> = {
  collections_selection_actif: 'true',
  collections_selection_ids: '', // jusqu'à 3 ids de Collection séparés par des virgules
  carrousel_selection_actif: 'false', // ancien réglage conservé pour compatibilité
  carrousel_bestseller_actif: 'false',
  carrousel_nouvelle_collection_actif: 'false',
  carrousel_nouvelle_collection_id: '', // id de la Collection à afficher dans ce carrousel
  suggestions_produit_actif: 'false',
  suggestions_produit_critere: 'meme_type', // 'meme_type' | 'nouvelle_collection' | 'moins_bonnes_ventes'
  popup_bienvenue_actif: 'false',
  popup_bienvenue_titre: 'Une surprise vous attend',
  popup_bienvenue_texte: 'Inscrivez-vous et recevez un code de réduction immédiatement par e-mail.',
  popup_bienvenue_pourcentage: '10',
  popup_panier_vide_actif: 'true',
  galerie_produit_position: 'bas', // 'gauche' (vignettes à gauche, classique) ou 'bas' (vignettes sous l'image, plus aéré)
  categories_accueil_actif: 'false',
  categories_accueil_ids: '', // jusqu'à 4 ids de Categorie séparés par des virgules
  boite_cadeau_actif: 'false',
  boite_cadeau_produit_id: '', // id du Produit (catégorie "Coffret cadeau" typiquement) utilisé comme boîte cadeau
  popup_panier_ouverture_actif: 'true', // ouvre la popup panier automatiquement après un ajout au panier
  // Popup panier
  popup_panier_seuil_livraison: '60',
  popup_panier_seuil_livraison_actif: 'true',
  popup_panier_seuil_surprise: '100',
  popup_panier_surprise_actif: 'false',
  popup_panier_article_bonus_actif: 'false',
  popup_panier_article_bonus_id: '',
  journal_actif: 'false', // affiche ou non l'onglet "Journal" dans le menu de navigation
  menu_categories_actif: 'true',
  menu_collections_actif: 'true',
  menu_pages_actif: 'true',
  menu_aide_actif: 'true',
  temoignages_actif: 'true', // affiche ou non la section "Ils nous font confiance" sur l'accueil

  // ── Livraison — tarifs calculés en temps réel à partir du poids réel du panier ──
  // Colissimo n'expose pas d'API publique de tarification en temps réel aux marchands
  // sans contrat Business/Pro : le calcul se fait donc ici à partir de votre grille
  // tarifaire contractuelle (par tranche de poids), appliquée instantanément au poids
  // réel du panier — c'est le fonctionnement standard utilisé par la quasi-totalité
  // des sites e-commerce français pour "le tarif en temps réel".
  livraison_colissimo_domicile_actif: 'true',
  livraison_colissimo_domicile_grille: '500:4.95,1000:6.90,2000:8.50,5000:11.90,30000:16.90', // "poidsMaxGrammes:prixEuros" séparés par des virgules
  livraison_mondial_relay_actif: 'true',
  livraison_mondial_relay_grille: '500:3.65,1000:5.40,2000:6.90,5000:9.90,30000:13.90',
  // Identifiants Mondial Relay (fournis par Mondial Relay à la signature du contrat pro),
  // nécessaires pour la recherche réelle de points relais et le calcul officiel des frais.
  mondial_relay_enseigne: '',
  mondial_relay_cle_privee: '',
  // Numéro de compte Colissimo Business (contrat Pro La Poste), pour une intégration
  // API complète (étiquettes, tracking) ultérieure.
  colissimo_numero_compte: '',
};

/** Récupère toutes les valeurs de config, fusionnées avec les défauts. */
export async function getConfigSite(): Promise<Record<string, string>> {
  const enregistres = await prisma.configSite.findMany();
  const valeurs = { ...DEFAUTS_CONFIG };
  enregistres.forEach((item) => {
    valeurs[item.cle] = item.valeur;
  });
  return valeurs;
}

/** Récupère une seule clé de config (avec son défaut si non enregistrée). */
export async function getConfigCle(cle: string): Promise<string> {
  const item = await prisma.configSite.findUnique({ where: { cle } });
  return item?.valeur ?? DEFAUTS_CONFIG[cle] ?? '';
}

export function configEstActive(valeurs: Record<string, string>, cle: string): boolean {
  return valeurs[cle] === 'true';
}
