import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifierSessionAdmin } from '@/lib/auth-helpers';

export async function GET(req: NextRequest) {
  const session = await verifierSessionAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = searchParams.get('page');

  const contenu = await prisma.contenuPage.findMany({
    where: page ? { page } : undefined,
    orderBy: { page: 'asc' },
  });

  return NextResponse.json(contenu);
}

export async function POST(req: NextRequest) {
  const session = await verifierSessionAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { page, cle, valeur, type } = await req.json();

    const item = await prisma.contenuPage.upsert({
      where: { page_cle: { page, cle } },
      update: { valeur, type: type || 'texte' },
      create: { page, cle, valeur, type: type || 'texte' },
    });

    return NextResponse.json(item);
  } catch (error: any) {
    console.error('Erreur sauvegarde contenu:', error);
    return NextResponse.json({ error: error.message || 'Erreur' }, { status: 400 });
  }
}
