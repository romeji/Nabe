import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifierSessionAdmin } from '@/lib/auth-helpers';

export async function GET(req: NextRequest) {
  const session = await verifierSessionAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const newsletters = await prisma.newsletter.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(newsletters);
}

export async function POST(req: NextRequest) {
  const session = await verifierSessionAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { sujet, contenu } = await req.json();

    if (!sujet || !sujet.trim() || !contenu || !contenu.trim()) {
      return NextResponse.json({ error: 'Le sujet et le contenu sont requis' }, { status: 400 });
    }

    const newsletter = await prisma.newsletter.create({
      data: { sujet: sujet.trim(), contenu: contenu.trim() },
    });

    return NextResponse.json(newsletter, { status: 201 });
  } catch (error: any) {
    console.error('Erreur création newsletter:', error);
    return NextResponse.json({ error: error.message || 'Erreur' }, { status: 400 });
  }
}
