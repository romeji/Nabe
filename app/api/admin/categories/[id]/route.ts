import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifierSessionAdmin } from '@/lib/auth-helpers';
import { slugify } from '@/lib/utils';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await verifierSessionAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { nom, description, image, imageAccueilFond, logoAccueil, ordre } = await req.json();

    const donnees: any = {};
    if (nom !== undefined) {
      donnees.nom = nom;
      donnees.slug = slugify(nom);
    }
    if (description !== undefined) donnees.description = description;
    if (image !== undefined) donnees.image = image;
    if (imageAccueilFond !== undefined) donnees.imageAccueilFond = imageAccueilFond;
    if (logoAccueil !== undefined) donnees.logoAccueil = logoAccueil;
    if (ordre !== undefined) donnees.ordre = ordre;

    const categorie = await prisma.categorie.update({
      where: { id: params.id },
      data: donnees,
    });

    return NextResponse.json(categorie);
  } catch (error: any) {
    console.error('Erreur modification catégorie:', error);
    return NextResponse.json({ error: error.message || 'Erreur' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await verifierSessionAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    // On détache simplement les produits de cette catégorie plutôt que de les bloquer/supprimer
    await prisma.produit.updateMany({
      where: { categorieId: params.id },
      data: { categorieId: null },
    });

    await prisma.categorie.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erreur suppression catégorie:', error);
    return NextResponse.json({ error: error.message || 'Erreur' }, { status: 400 });
  }
}
