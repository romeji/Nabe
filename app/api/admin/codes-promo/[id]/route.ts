import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifierSessionAdmin } from '@/lib/auth-helpers';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await verifierSessionAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const donnees: any = {};

    if (body.actif !== undefined) donnees.actif = body.actif;
    if (body.nomCollaborateur !== undefined) donnees.nomCollaborateur = body.nomCollaborateur;
    if (body.commissionPourcentage !== undefined) {
      donnees.commissionPourcentage = body.commissionPourcentage ? parseFloat(body.commissionPourcentage) : null;
    }
    if (body.dateExpiration !== undefined) {
      donnees.dateExpiration = body.dateExpiration ? new Date(body.dateExpiration) : null;
    }
    if (body.utilisationMax !== undefined) {
      donnees.utilisationMax = body.utilisationMax ? parseInt(body.utilisationMax) : null;
    }

    const codeReduction = await prisma.codeReduction.update({
      where: { id: params.id },
      data: donnees,
    });

    return NextResponse.json(codeReduction);
  } catch (error: any) {
    console.error('Erreur modification code promo:', error);
    return NextResponse.json({ error: error.message || 'Erreur' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await verifierSessionAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const utilisations = await prisma.commande.count({ where: { codeReductionId: params.id } });
    if (utilisations > 0) {
      return NextResponse.json(
        { error: 'Ce code a déjà été utilisé dans des commandes, il ne peut pas être supprimé. Vous pouvez le désactiver à la place.' },
        { status: 400 }
      );
    }

    await prisma.codeReduction.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erreur suppression code promo:', error);
    return NextResponse.json({ error: error.message || 'Erreur' }, { status: 400 });
  }
}
