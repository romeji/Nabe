import { prisma } from '@/lib/prisma';

// Registre des clés de configuration avec leur valeur par défaut.
// Toute nouvelle option togglable depuis l'admin doit être ajoutée ici.
export const DEFAUTS_CONFIG: Record<string, string> = {
  carrousel_selection_actif: 'true', // carrousel "articles sélectionnés" sur l'accueil (remplace la grille statique)
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
  categories_accueil_actif: 'false',
  categories_accueil_ids: '', // jusqu'à 4 ids de Categorie séparés par des virgules
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
