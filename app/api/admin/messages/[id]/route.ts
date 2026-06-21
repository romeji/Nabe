import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifierSessionAdmin } from '@/lib/auth-helpers';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await verifierSessionAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { statut } = await req.json();

    const message = await prisma.messageContact.update({
      where: { id: params.id },
      data: { statut },
    });

    return NextResponse.json(message);
  } catch (error: any) {
    console.error('Erreur modification message:', error);
    return NextResponse.json({ error: error.message || 'Erreur' }, { status: 400 });
  }
}
