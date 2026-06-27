import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifierSessionAdmin } from '@/lib/auth-helpers';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await verifierSessionAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { nom, codeHex, ordre } = await req.json();

    const donnees: any = {};
    if (nom !== undefined) donnees.nom = nom;
    if (codeHex !== undefined) donnees.codeHex = codeHex;
    if (ordre !== undefined) donnees.ordre = ordre;

    const couleur = await prisma.couleurPierre.update({
      where: { id: params.id },
      data: donnees,
    });

    return NextResponse.json(couleur);
  } catch (error: any) {
    console.error('Erreur modification couleur de pierre:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Cette couleur existe déjà' }, { status: 400 });
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
    await prisma.pierre.updateMany({
      where: { couleurPierreId: params.id },
      data: { couleurPierreId: null },
    });

    await prisma.couleurPierre.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erreur suppression couleur de pierre:', error);
    return NextResponse.json({ error: error.message || 'Erreur' }, { status: 400 });
  }
}
