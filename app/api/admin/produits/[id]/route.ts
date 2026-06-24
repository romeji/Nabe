import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifierSessionAdmin } from '@/lib/auth-helpers';
import { deleteImageCloudinary } from '@/lib/cloudinary';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await verifierSessionAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const produit = await prisma.produit.findUnique({
    where: { id: params.id },
    include: { images: { orderBy: { ordre: 'asc' } }, categorie: true, matiere: true, couleurPierre: true, collection: true, mouvementsStock: { orderBy: { createdAt: 'desc' } } },
  });

  if (!produit) {
    return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 });
  }

  return NextResponse.json(produit);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await verifierSessionAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const body = await req.json();

    const { images, stock, id, ...autresDonnees } = body;

    const produitActuel = await prisma.produit.findUnique({ where: { id: params.id } });
    if (!produitActuel) {
      return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 });
    }

    // Si le stock est modifié manuellement, on enregistre l'ajustement
    if (typeof stock === 'number' && stock !== produitActuel.stock) {
      const difference = stock - produitActuel.stock;
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
        stock: typeof stock === 'number' ? stock : undefined,
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
      },
      include: { images: true },
    });

    return NextResponse.json(produit);
  } catch (error: any) {
    console.error('Erreur modification produit:', error);
    return NextResponse.json({ error: error.message || 'Erreur' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
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
    return NextResponse.json({ error: error.message || 'Erreur' }, { status: 400 });
  }
}
