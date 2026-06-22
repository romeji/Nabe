import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifierSessionAdmin } from '@/lib/auth-helpers';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await verifierSessionAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const newsletter = await prisma.newsletter.findUnique({ where: { id: params.id } });
  if (!newsletter) {
    return NextResponse.json({ error: 'Introuvable' }, { status: 404 });
  }

  return NextResponse.json(newsletter);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await verifierSessionAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const newsletter = await prisma.newsletter.findUnique({ where: { id: params.id } });
    if (!newsletter) {
      return NextResponse.json({ error: 'Introuvable' }, { status: 404 });
    }
    if (newsletter.statut === 'ENVOYEE') {
      return NextResponse.json({ error: 'Une newsletter déjà envoyée ne peut plus être modifiée' }, { status: 400 });
    }

    const { sujet, contenu } = await req.json();

    const miseAJour = await prisma.newsletter.update({
      where: { id: params.id },
      data: {
        sujet: sujet !== undefined ? sujet.trim() : undefined,
        contenu: contenu !== undefined ? contenu.trim() : undefined,
      },
    });

    return NextResponse.json(miseAJour);
  } catch (error: any) {
    console.error('Erreur modification newsletter:', error);
    return NextResponse.json({ error: error.message || 'Erreur' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await verifierSessionAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const newsletter = await prisma.newsletter.findUnique({ where: { id: params.id } });
    if (!newsletter) {
      return NextResponse.json({ error: 'Introuvable' }, { status: 404 });
    }
    if (newsletter.statut === 'ENVOYEE') {
      return NextResponse.json({ error: 'Une newsletter déjà envoyée ne peut pas être supprimée (historique)' }, { status: 400 });
    }

    await prisma.newsletter.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erreur suppression newsletter:', error);
    return NextResponse.json({ error: error.message || 'Erreur' }, { status: 400 });
  }
}
