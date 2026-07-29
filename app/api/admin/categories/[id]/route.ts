import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifierSessionAdmin } from '@/lib/auth-helpers';
import { slugify } from '@/lib/utils';

export async function PATCH(req: NextRequest, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = await paramsPromise;
  const session = await verifierSessionAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { nom, description, image, imageAccueilFond, logoAccueil, ordre } = await req.json();

    const donnees: any = {};
    if (nom !== undefined) {
      if (!nom.trim()) {
        return NextResponse.json({ error: 'Le nom est requis' }, { status: 400 });
      }
      donnees.nom = nom.trim();
      donnees.slug = slugify(nom);
    }
    if (description !== undefined) donnees.description = description?.trim() || null;
    if (image !== undefined) donnees.image = image || null;
    if (imageAccueilFond !== undefined) donnees.imageAccueilFond = imageAccueilFond || null;
    if (logoAccueil !== undefined) donnees.logoAccueil = logoAccueil || null;
    if (ordre !== undefined) donnees.ordre = ordre;

    const categorie = await prisma.categorie.update({
      where: { id: params.id },
      data: donnees,
    });

    return NextResponse.json(categorie);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Cette catégorie existe déjà' }, { status: 400 });
    }
    console.error('Erreur modification catégorie:', error);
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
