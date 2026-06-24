import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifierSessionAdmin } from '@/lib/auth-helpers';

export async function GET(req: NextRequest) {
  const session = await verifierSessionAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const couleurs = await prisma.couleurPierre.findMany({
    orderBy: { ordre: 'asc' },
    include: { _count: { select: { produits: true } } },
  });

  return NextResponse.json(couleurs);
}

export async function POST(req: NextRequest) {
  const session = await verifierSessionAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { nom, codeHex, ordre } = await req.json();

    if (!nom || !nom.trim() || !codeHex) {
      return NextResponse.json({ error: 'Le nom et la couleur sont requis' }, { status: 400 });
    }

    const couleur = await prisma.couleurPierre.create({
      data: { nom: nom.trim(), codeHex, ordre: ordre ?? 0 },
    });

    return NextResponse.json(couleur, { status: 201 });
  } catch (error: any) {
    console.error('Erreur création couleur de pierre:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Cette couleur existe déjà' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Erreur' }, { status: 400 });
  }
}
