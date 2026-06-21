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
    const { nom, description, image, ordre } = await req.json();

    const categorie = await prisma.categorie.create({
      data: { nom, slug: slugify(nom), description, image, ordre: ordre ?? 0 },
    });

    return NextResponse.json(categorie, { status: 201 });
  } catch (error: any) {
    console.error('Erreur création catégorie:', error);
    return NextResponse.json({ error: error.message || 'Erreur' }, { status: 400 });
  }
}
