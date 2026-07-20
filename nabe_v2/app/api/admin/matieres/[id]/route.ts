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
    const { nom, ordre } = await req.json();

    const donnees: any = {};
    if (nom !== undefined) {
      donnees.nom = nom;
      donnees.slug = slugify(nom);
    }
    if (ordre !== undefined) donnees.ordre = ordre;

    const matiere = await prisma.matiere.update({
      where: { id: params.id },
      data: donnees,
    });

    return NextResponse.json(matiere);
  } catch (error: any) {
    console.error('Erreur modification matière:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Cette matière existe déjà' }, { status: 400 });
    }
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
    // On détache simplement les produits de cette matière plutôt que de les bloquer/supprimer
    await prisma.produit.updateMany({
      where: { matiereId: params.id },
      data: { matiereId: null },
    });

    await prisma.matiere.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erreur suppression matière:', error);
    return NextResponse.json({ error: error.message || 'Erreur' }, { status: 400 });
  }
}
