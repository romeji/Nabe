import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifierSessionAdmin } from '@/lib/auth-helpers';

export async function PATCH(req: NextRequest, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = await paramsPromise;
  const session = await verifierSessionAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { statut, notesAdmin } = await req.json();

    const demande = await prisma.demandeSurMesure.update({
      where: { id: params.id },
      data: { statut, notesAdmin },
    });

    return NextResponse.json(demande);
  } catch (error: any) {
    console.error('Erreur modification demande sur-mesure:', error);
    return NextResponse.json({ error: error.message || 'Erreur' }, { status: 400 });
  }
}
