import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifierSessionAdmin } from '@/lib/auth-helpers';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await verifierSessionAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { auteur, texte, note, ordre, actif } = await req.json();

    const donnees: any = {};
    if (auteur !== undefined) donnees.auteur = auteur;
    if (texte !== undefined) donnees.texte = texte;
    if (note !== undefined) donnees.note = Math.min(5, Math.max(1, Number(note) || 5));
    if (ordre !== undefined) donnees.ordre = ordre;
    if (actif !== undefined) donnees.actif = actif;

    const temoignage = await prisma.temoignage.update({
      where: { id: params.id },
      data: donnees,
    });

    return NextResponse.json(temoignage);
  } catch (error: any) {
    console.error('Erreur modification témoignage:', error);
    return NextResponse.json({ error: error.message || 'Erreur' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await verifierSessionAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    await prisma.temoignage.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erreur suppression témoignage:', error);
    return NextResponse.json({ error: error.message || 'Erreur' }, { status: 400 });
  }
}
