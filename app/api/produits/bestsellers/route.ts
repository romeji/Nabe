import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limite = parseInt(searchParams.get('limite') || '4');

  const produits = await prisma.produit.findMany({
    where: { actif: true },
    orderBy: { nombreVentes: 'desc' },
    take: limite,
    include: { images: { orderBy: { ordre: 'asc' }, take: 1 } },
  });

  const resultat = produits.map((p: any) => ({
    id: p.id,
    nom: p.nom,
    slug: p.slug,
    prix: p.prix.toString(),
    image: p.images[0]?.url || null,
  }));

  return NextResponse.json({ produits: resultat });
}
