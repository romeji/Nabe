import { verifierSessionAdmin } from '@/lib/auth-helpers';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Remplit rétroactivement l'image des anciennes lignes de commande créées
 * avant l'ajout du champ imageUrl (snapshot pris désormais automatiquement
 * à chaque nouvelle vente). Ne touche QUE les lignes sans image ET dont le
 * produit existe toujours au catalogue : si le bijou a été supprimé entre
 * temps, il n'y a plus rien à récupérer, la commande garde son nom/prix
 * figés et affiche le visuel générique — c'est le comportement normal et
 * attendu, pas une erreur.
 *
 * Sans effet de bord si on la relance plusieurs fois (ne touche jamais une
 * ligne qui a déjà une image) : peut rester en place et être rappelée à
 * tout moment, par exemple après un import en masse de commandes.
 */
export async function POST() {
  const session = await verifierSessionAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const lignesSansImage = await prisma.ligneCommande.findMany({
    where: { imageUrl: null, produitId: { not: null } },
    include: { produit: { include: { images: { orderBy: { ordre: 'asc' }, take: 1 } } } },
  });

  let misesAJour = 0;
  let sansImageDisponible = 0;

  for (const ligne of lignesSansImage) {
    const url = ligne.produit?.images?.[0]?.url;
    if (url) {
      await prisma.ligneCommande.update({
        where: { id: ligne.id },
        data: { imageUrl: url },
      });
      misesAJour++;
    } else {
      // Le produit existe toujours mais n'a lui-même aucune image (rare) —
      // rien à faire, le placeholder générique reste affiché.
      sansImageDisponible++;
    }
  }

  const produitSupprime = await prisma.ligneCommande.count({
    where: { imageUrl: null, produitId: null },
  });

  return NextResponse.json({
    lignesTraitees: lignesSansImage.length,
    misesAJour,
    sansImageDisponible,
    produitSupprimeDefinitivementSansImage: produitSupprime,
  });
}
