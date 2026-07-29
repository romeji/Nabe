import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifierSessionAdmin } from '@/lib/auth-helpers';
import { slugify } from '@/lib/utils';

export async function GET(req: NextRequest) {
  const session = await verifierSessionAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const categories = await prisma.categorie.findMany({
    orderBy: { ordre: 'asc' },
    include: { _count: { select: { produits: true } } },
  });

  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  const session = await verifierSessionAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { nom, description, image, imageAccueilFond, logoAccueil, ordre } = await req.json();

    if (!nom || !nom.trim()) {
      return NextResponse.json({ error: 'Le nom est requis' }, { status: 400 });
    }

    const categorie = await prisma.categorie.create({
      data: {
        nom: nom.trim(),
        slug: slugify(nom),
        description: description?.trim() || null,
        image: image || null,
        imageAccueilFond: imageAccueilFond || null,
        logoAccueil: logoAccueil || null,
        ordre: ordre ?? 0,
      } as any,
    });

    return NextResponse.json(categorie, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Cette catégorie existe déjà' }, { status: 400 });
    }
    console.error('Erreur création catégorie:', error);
    return NextResponse.json({ error: error.message || 'Erreur' }, { status: 400 });
  }
}
