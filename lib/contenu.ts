import { prisma } from '@/lib/prisma';
import { getDefautsPage } from '@/lib/registre-contenu';

/**
 * Récupère le contenu éditable d'une page : part des valeurs par défaut
 * définies dans le registre, puis les écrase avec ce qui est enregistré
 * en base de données (Admin > Contenu).
 *
 * Utilisation dans une page serveur :
 *   const c = await getContenuPage('accueil');
 *   <h1>{c.hero_logo}</h1>
 */
export async function getContenuPage(slug: string): Promise<Record<string, string>> {
  const defauts = getDefautsPage(slug);

  const enregistres = await prisma.contenuPage.findMany({ where: { page: slug } });
  const valeurs = { ...defauts };
  enregistres.forEach((item) => {
    if (item.valeur && item.valeur.trim() !== '') {
      valeurs[item.cle] = item.valeur;
    }
  });

  return valeurs;
}
