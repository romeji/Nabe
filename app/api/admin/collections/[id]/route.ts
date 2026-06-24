import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifierSessionAdmin } from '@/lib/auth-helpers';
import { deleteImageCloudinary } from '@/lib/cloudinary';
import { slugify } from '@/lib/utils';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await verifierSessionAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { nom, description, image, ordre, actif } = await req.json();

    const donnees: any = {};
    if (nom !== undefined) {
      donnees.nom = nom;
      donnees.slug = slugify(nom);
    }
    if (description !== undefined) donnees.description = description;
    if (image !== undefined) donnees.image = image;
    if (ordre !== undefined) donnees.ordre = ordre;
    if (actif !== undefined) donnees.actif = actif;

    const collection = await prisma.collection.update({
      where: { id: params.id },
      data: donnees,
    });

    return NextResponse.json(collection);
  } catch (error: any) {
    console.error('Erreur modification collection:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Cette collection existe déjà' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Erreur' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await verifierSessionAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    // On détache simplement les produits de cette collection plutôt que de les bloquer/supprimer
    await prisma.produit.updateMany({
      where: { collectionId: params.id },
      data: { collectionId: null },
    });

    await prisma.collection.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erreur suppression collection:', error);
    return NextResponse.json({ error: error.message || 'Erreur' }, { status: 400 });
  }
}
