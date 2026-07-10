import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifierSessionAdmin } from '@/lib/auth-helpers';
import { deleteImageCloudinary } from '@/lib/cloudinary';

export async function GET(req: NextRequest, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = await paramsPromise;
  const session = await verifierSessionAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const produit = await prisma.produit.findUnique({
    where: { id: params.id },
    include: {
      images: { orderBy: { ordre: 'asc' } },
      categorie: true,
      matiere: true,
      pierres: { include: { pierre: { include: { couleurs: { include: { couleurPierre: true } } } } } },
      collection: true,
      mouvementsStock: { orderBy: { createdAt: 'desc' } },
      stockTailles: true,
    },
  });

  if (!produit) {
    return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 });
  }

  return NextResponse.json(produit);
}

export async function PATCH(req: NextRequest, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = await paramsPromise;
  const session = await verifierSessionAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const body = await req.json();

    const { images, stock, id, pierresIds, composeAvecIds, stockParTaille, ...autresDonnees } = body;

    const produitActuel = await prisma.produit.findUnique({ where: { id: params.id } });
    if (!produitActuel) {
      return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 });
    }

    // Si un stock par taille est fourni, le stock global = somme des quantités par taille
    const aStockParTaille = stockParTaille && Object.keys(stockParTaille).length > 0;
    const stockFinal = aStockParTaille
      ? Object.values(stockParTaille as Record<string, number>).reduce((a, b) => a + b, 0)
      : typeof stock === 'number'
      ? stock
      : undefined;

    // Si le stock est modifié manuellement, on enregistre l'ajustement
    if (typeof stockFinal === 'number' && stockFinal !== produitActuel.stock) {
      const difference = stockFinal - produitActuel.stock;
      await prisma.mouvementStock.create({
        data: {
          produitId: params.id,
          type: 'AJUSTEMENT',
          quantite: difference,
          motif: 'Ajustement manuel depuis le backoffice',
        },
      });
    }

    const produit = await prisma.produit.update({
      where: { id: params.id },
      data: {
        ...autresDonnees,
        stock: typeof stockFinal === 'number' ? stockFinal : undefined,
        images: images
          ? {
              deleteMany: {},
              create: images.map((img: any, i: number) => ({
                url: img.url,
                publicId: img.publicId,
                alt: img.alt,
                ordre: i,
              })),
            }
          : undefined,
        pierres: Array.isArray(pierresIds)
          ? {
              deleteMany: {},
              create: pierresIds.map((pierreId: string) => ({ pierreId })),
            }
          : undefined,
        composeAvec: Array.isArray(composeAvecIds)
          ? {
              deleteMany: {},
              create: composeAvecIds
                .slice(0, 2)
                .map((produitSuggereId: string, i: number) => ({ produitSuggereId, ordre: i })),
            }
          : undefined,
        stockTailles: aStockParTaille
          ? {
              deleteMany: {},
              create: Object.entries(stockParTaille as Record<string, number>).map(([taille, quantite]) => ({
                taille,
                quantite,
              })),
            }
          : undefined,
      },
      include: { images: true, pierres: true, stockTailles: true },
    });

    return NextResponse.json(produit);
  } catch (error: any) {
    console.error('Erreur modification produit:', error);
    return NextResponse.json({ error: error.message || 'Erreur' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = await paramsPromise;
  const session = await verifierSessionAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const produit = await prisma.produit.findUnique({
      where: { id: params.id },
      include: { images: true },
    });

    if (!produit) {
      return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 });
    }

    // Supprime les images Cloudinary associées
    for (const img of produit.images) {
      if (img.publicId) {
        try {
          await deleteImageCloudinary(img.publicId);
        } catch (e) {
          console.warn('Image Cloudinary déjà supprimée ou introuvable:', img.publicId);
        }
      }
    }

    await prisma.produit.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erreur suppression produit:', error);

    // Contrainte de clé étrangère : ce produit apparaît dans au moins une
    // commande passée (LigneCommande.produitId), et n'est donc volontairement
    // pas supprimable — pour ne jamais perdre l'historique de vente/facturation.
    if (error.code === 'P2003') {
      return NextResponse.json(
        {
          error:
            'Impossible de supprimer ce produit : il apparaît dans au moins une commande déjà passée (on ne supprime jamais l’historique des ventes). Désactivez-le plutôt (bouton "Actif") pour le masquer du site tout en gardant l’historique intact.',
        },
        { status: 409 }
      );
    }

    return NextResponse.json({ error: error.message || 'Erreur' }, { status: 400 });
  }
}
