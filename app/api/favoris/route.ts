import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authClientOptions } from '@/lib/auth-client';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authClientOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Connexion requise' }, { status: 401 });
  }
  const clientId = (session.user as any).id as string;

  try {
    const { produitId } = await req.json();
    if (!produitId) {
      return NextResponse.json({ error: 'produitId manquant' }, { status: 400 });
    }

    const favori = await prisma.favori.upsert({
      where: { clientId_produitId: { clientId, produitId } },
      update: {},
      create: { clientId, produitId },
    });

    return NextResponse.json(favori, { status: 201 });
  } catch (error: any) {
    console.error('Erreur ajout favori:', error);
    return NextResponse.json({ error: error.message || 'Erreur' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authClientOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Connexion requise' }, { status: 401 });
  }
  const clientId = (session.user as any).id as string;

  try {
    const { produitId } = await req.json();
    if (!produitId) {
      return NextResponse.json({ error: 'produitId manquant' }, { status: 400 });
    }

    await prisma.favori.deleteMany({ where: { clientId, produitId } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erreur retrait favori:', error);
    return NextResponse.json({ error: error.message || 'Erreur' }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authClientOptions);
  if (!session?.user) {
    return NextResponse.json({ favoris: [] });
  }
  const clientId = (session.user as any).id as string;

  const favoris = await prisma.favori.findMany({ where: { clientId }, select: { produitId: true } });
  return NextResponse.json({ favoris: favoris.map((f) => f.produitId) });
}
