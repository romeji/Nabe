import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifierSessionAdmin } from '@/lib/auth-helpers';

export async function GET(req: NextRequest) {
  const session = await verifierSessionAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const [abonnes, total] = await Promise.all([
    prisma.abonneNewsletter.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.abonneNewsletter.count(),
  ]);

  return NextResponse.json({ abonnes, total });
}
