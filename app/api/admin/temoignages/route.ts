import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifierSessionAdmin } from '@/lib/auth-helpers';

export async function GET(req: NextRequest) {
  const session = await verifierSessionAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const temoignages = await prisma.temoignage.findMany({ orderBy: { ordre: 'asc' } });
  return NextResponse.json(temoignages);
}

export async function POST(req: NextRequest) {
  const session = await verifierSessionAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { auteur, texte, note, ordre, actif } = await req.json();

    if (!auteur || !auteur.trim() || !texte || !texte.trim()) {
      return NextResponse.json({ error: "L'auteur et le texte sont requis" }, { status: 400 });
    }

    const dernier = await prisma.temoignage.findFirst({ orderBy: { ordre: 'desc' } });

    const temoignage = await prisma.temoignage.create({
      data: {
        auteur: auteur.trim(),
        texte: texte.trim(),
        note: Math.min(5, Math.max(1, Number(note) || 5)),
        ordre: ordre ?? (dernier ? dernier.ordre + 1 : 0),
        actif: actif ?? true,
      },
    });

    return NextResponse.json(temoignage, { status: 201 });
  } catch (error: any) {
    console.error('Erreur création témoignage:', error);
    return NextResponse.json({ error: error.message || 'Erreur' }, { status: 400 });
  }
}
