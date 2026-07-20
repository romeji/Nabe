import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifierSessionAdmin } from '@/lib/auth-helpers';
import { slugify } from '@/lib/utils';

export async function GET(req: NextRequest) {
  const session = await verifierSessionAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const matieres = await prisma.matiere.findMany({
    orderBy: { ordre: 'asc' },
    include: { _count: { select: { produits: true } } },
  });

  return NextResponse.json(matieres);
}

export async function POST(req: NextRequest) {
  const session = await verifierSessionAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { nom, ordre } = await req.json();

    if (!nom || !nom.trim()) {
      return NextResponse.json({ error: 'Le nom est requis' }, { status: 400 });
    }

    const matiere = await prisma.matiere.create({
      data: { nom: nom.trim(), slug: slugify(nom), ordre: ordre ?? 0 },
    });

    return NextResponse.json(matiere, { status: 201 });
  } catch (error: any) {
    console.error('Erreur création matière:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Cette matière existe déjà' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Erreur' }, { status: 400 });
  }
}
