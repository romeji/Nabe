import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifierSessionAdmin } from '@/lib/auth-helpers';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await verifierSessionAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const commande = await prisma.commande.findUnique({
    where: { id: params.id },
    include: { lignes: { include: { produit: true } } },
  });

  if (!commande) {
    return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });
  }

  return NextResponse.json(commande);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await verifierSessionAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { statut } = await req.json();

    const commande = await prisma.commande.update({
      where: { id: params.id },
      data: { statut },
    });

    return NextResponse.json(commande);
  } catch (error: any) {
    console.error('Erreur modification commande:', error);
    return NextResponse.json({ error: error.message || 'Erreur' }, { status: 400 });
  }
}
