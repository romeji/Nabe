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
  accueil_module_video_actif: 'false',
  accueil_module_video_titre: "Dans les coulisses de l'atelier",
  accueil_module_video_texte: 'Un geste, une matière, une pièce qui prend forme lentement.',
  accueil_module_video_url: '',
  accueil_module_video_poster: '',
  accueil_module_sur_mesure_actif: 'false',
  accueil_module_sur_mesure_titre: 'Une pièce pensée pour vous',
  accueil_module_sur_mesure_texte: "Croquis, photo d'inspiration ou envie précise : envoyez votre idée, nous revenons vers vous avec un devis personnalisé.",
  notifications_app_actif: 'false',
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

  // ── Livraison — lancement sans API transporteur ──
  // Tant que l'activité n'a pas de SIRET/contrat transporteur, le checkout
  // propose une livraison suivie manuelle : le marchand expédie lui-même et
  // renseigne le numéro de suivi dans l'admin une fois le colis parti.
  livraison_manuelle_actif: 'true',
  livraison_manuelle_grille: '500:4.95,1000:6.90,2000:8.50,5000:11.90,30000:16.90',
  livraison_manuelle_delai: '3 à 7 jours ouvrés après expédition',
  // Mondial Relay est prêt dans le code, mais désactivé par défaut tant que
  // les identifiants professionnels ne sont pas disponibles.
  livraison_mondial_relay_actif: 'false',
  livraison_mondial_relay_grille: '500:3.65,1000:5.40,2000:6.90,5000:9.90,30000:13.90',
  // Identifiants Mondial Relay (fournis par Mondial Relay à la signature du contrat pro),
  // nécessaires pour la recherche réelle de points relais et le calcul officiel des frais.
  mondial_relay_enseigne: '',
  mondial_relay_cle_privee: '',
  // Si activé : la livraison n'est jamais facturée séparément au checkout
  // (elle est réputée déjà incluse dans le prix des produits, à vous de le
  // répercuter vous-même sur vos prix). Si désactivé (défaut) : le calcul
  // au poids réel s'applique normalement (voir lib/livraison.ts).
  livraison_incluse_dans_prix: 'false',
  // TVA activée sur demande explicite (société en cours de lancement).
  tva_applicable: 'true',
  tva_taux: '20', // en pourcentage — à ajuster dans Réglages selon le régime réel une fois la société créée
  // Identité de facturation — affichée sur les factures téléchargeables.
  // Le SIRET peut rester vide tant que la société n'est pas immatriculée ;
  // dans ce cas la facture indique "Auto-entrepreneur en cours d'immatriculation"
  // plutôt qu'un numéro invalide.
  facturation_nom: 'Nabe',
  facturation_adresse: '',
  facturation_siret: '',
  // Adresse recevant les signalements de problème (bouton "Signaler un
  // problème" sur une commande). Valeur provisoire en attendant que le
  // marchand la configure lui-même dans Réglages.
  email_signalement_probleme: 'nabe.bijoux@outlook.fr',
  // Google Analytics (GA4) — ne se charge jamais sans consentement explicite (RGPD)
  google_analytics_actif: 'false',
  google_analytics_id: '', // ex: G-XXXXXXXXXX
};

/** Récupère toutes les valeurs de config, fusionnées avec les défauts. */
export async function getConfigSite(): Promise<Record<string, string>> {
  const enregistres = await prisma.configSite.findMany();
  const valeurs = { ...DEFAUTS_CONFIG };
  enregistres.forEach((item: any) => {
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
