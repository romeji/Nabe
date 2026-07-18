import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifierSessionAdmin } from '@/lib/auth-helpers';

export async function GET(req: NextRequest) {
  const session = await verifierSessionAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const mouvements = await prisma.mouvementStock.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  return NextResponse.json(mouvements);
}

export async function POST(req: NextRequest) {
  const session = await verifierSessionAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { produitId, type, quantite, motif } = await req.json();

    if (!produitId || !type || typeof quantite !== 'number') {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
    }

    const produit = await prisma.produit.findUnique({ where: { id: produitId }, select: { nom: true } });
    if (!produit) {
      return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 });
    }

    const quantiteSignee = type === 'SORTIE' ? -Math.abs(quantite) : Math.abs(quantite);

    const [mouvement] = await prisma.$transaction([
      prisma.mouvementStock.create({
        data: { produitId, produitNom: produit.nom, type, quantite: quantiteSignee, motif },
      }),
      prisma.produit.update({
        where: { id: produitId },
        data: { stock: { increment: quantiteSignee } },
      }),
    ]);

    return NextResponse.json(mouvement, { status: 201 });
  } catch (error: any) {
    console.error('Erreur mouvement stock:', error);
    return NextResponse.json({ error: error.message || 'Erreur' }, { status: 400 });
  }
}
