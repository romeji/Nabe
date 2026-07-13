import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifierSessionAdmin } from '@/lib/auth-helpers';

export async function DELETE(req: NextRequest, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const session = await verifierSessionAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  const params = await paramsPromise;

  try {
    const idConnecte = (session.user as any).id as string;

    if (params.id === idConnecte) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas supprimer votre propre compte administrateur pendant que vous êtes connecté avec.' },
        { status: 400 }
      );
    }

    const total = await prisma.admin.count();
    if (total <= 1) {
      return NextResponse.json(
        { error: 'Impossible de supprimer le dernier compte administrateur restant.' },
        { status: 400 }
      );
    }

    await prisma.admin.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erreur suppression administrateur:', error);
    return NextResponse.json({ error: error.message || 'Erreur' }, { status: 400 });
  }
}
