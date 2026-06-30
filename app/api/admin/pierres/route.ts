import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifierSessionAdmin } from '@/lib/auth-helpers';
import { slugify } from '@/lib/utils';

export async function GET(req: NextRequest) {
  const session = await verifierSessionAdmin();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const pierres = await prisma.pierre.findMany({
    orderBy: { ordre: 'asc' },
    include: {
      couleurs: { include: { couleurPierre: true } },
      _count: { select: { produits: true } },
    },
  });

  return NextResponse.json(pierres);
}

export async function POST(req: NextRequest) {
  const session = await verifierSessionAdmin();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  try {
    const { nom, description, couleursIds = [], ordre } = await req.json();

    if (!nom?.trim()) return NextResponse.json({ error: 'Le nom est requis' }, { status: 400 });

    const pierre = await prisma.pierre.create({
      data: {
        nom: nom.trim(),
        slug: slugify(nom),
        description: description || undefined,
        ordre: ordre ?? 0,
        couleurs: couleursIds.length > 0
          ? { create: couleursIds.map((couleurPierreId: string) => ({ couleurPierreId })) }
          : undefined,
      },
      include: { couleurs: { include: { couleurPierre: true } } },
    });

    return NextResponse.json(pierre, { status: 201 });
  } catch (error: any) {
    console.error('Erreur création pierre:', error);
    if (error.code === 'P2002') return NextResponse.json({ error: 'Cette pierre existe déjà' }, { status: 400 });
    return NextResponse.json({ error: error.message || 'Erreur' }, { status: 400 });
  }
}
