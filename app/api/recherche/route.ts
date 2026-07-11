import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ produits: [] });
  }

  const produits = await prisma.produit.findMany({
    where: {
      actif: true,
      OR: [
        { nom: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { matiere: { nom: { contains: q, mode: 'insensitive' } } },
        { collection: { nom: { contains: q, mode: 'insensitive' } } },
        { pierres: { some: { pierre: { nom: { contains: q, mode: 'insensitive' } } } } },
        { pierres: { some: { pierre: { couleurs: { some: { couleurPierre: { nom: { contains: q, mode: 'insensitive' } } } } } } } },
      ],
    },
    include: {
      images: { orderBy: { ordre: 'asc' }, take: 1 },
      matiere: true,
      collection: true,
    },
    take: 12,
  });

  const resultat = produits.map((p: any) => ({
    id: p.id,
    nom: p.nom,
    slug: p.slug,
    prix: p.prix.toString(),
    image: p.images[0]?.url || null,
    matiere: p.matiere?.nom || null,
    collection: p.collection?.nom || null,
  }));

  return NextResponse.json({ produits: resultat });
}
