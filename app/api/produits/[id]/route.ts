import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_req: NextRequest, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = await paramsPromise;
  const produit = await prisma.produit.findUnique({
    where: { id: params.id },
    include: { images: { orderBy: { ordre: 'asc' }, take: 1 } },
  });
  if (!produit) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });
  return NextResponse.json({ ...produit, prix: produit.prix.toString() });
}
