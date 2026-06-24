import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const [categories, collections] = await Promise.all([
    prisma.categorie.findMany({ orderBy: { ordre: 'asc' }, select: { id: true, nom: true, slug: true } }),
    prisma.collection.findMany({
      where: { actif: true },
      orderBy: { ordre: 'asc' },
      select: { id: true, nom: true, slug: true },
    }),
  ]);

  return NextResponse.json({ categories, collections });
}
