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
    const { nom, description, couleurPierreId, ordre } = await req.json();

    const donnees: any = {};
    if (nom !== undefined) {
      donnees.nom = nom;
      donnees.slug = slugify(nom);
    }
    if (description !== undefined) donnees.description = description;
    if (couleurPierreId !== undefined) donnees.couleurPierreId = couleurPierreId || null;
    if (ordre !== undefined) donnees.ordre = ordre;

    const pierre = await prisma.pierre.update({
      where: { id: params.id },
      data: donnees,
      include: { couleurPierre: true },
    });

    return NextResponse.json(pierre);
  } catch (error: any) {
    console.error('Erreur modification pierre:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Cette pierre existe déjà' }, { status: 400 });
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
    await prisma.pierre.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erreur suppression pierre:', error);
    return NextResponse.json({ error: error.message || 'Erreur' }, { status: 400 });
  }
}
