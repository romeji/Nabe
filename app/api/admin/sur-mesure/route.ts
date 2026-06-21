import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifierSessionAdmin } from '@/lib/auth-helpers';

export async function GET(req: NextRequest) {
  const session = await verifierSessionAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const demandes = await prisma.demandeSurMesure.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(demandes);
}
