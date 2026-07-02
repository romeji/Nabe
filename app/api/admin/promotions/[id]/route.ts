import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifierSessionAdmin } from '@/lib/auth-helpers';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await verifierSessionAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { prixPromo, promoActive, promoDebut, promoFin } = await req.json();

    // Validation simple : si une promo est activée, le prix promo doit être positif
    if (promoActive && (prixPromo === null || prixPromo === undefined || Number(prixPromo) <= 0)) {
      return NextResponse.json(
        { error: 'Un prix promotionnel valide est requis pour activer la promotion.' },
        { status: 400 }
      );
    }

    const produit = await prisma.produit.update({
      where: { id: params.id },
      data: {
        prixPromo: prixPromo === null || prixPromo === '' ? null : Number(prixPromo),
        promoActive: !!promoActive,
        promoDebut: promoDebut ? new Date(promoDebut) : null,
        promoFin: promoFin ? new Date(promoFin) : null,
      },
    });

    return NextResponse.json({
      id: produit.id,
      prixPromo: produit.prixPromo ? produit.prixPromo.toString() : null,
      promoActive: produit.promoActive,
      promoDebut: produit.promoDebut,
      promoFin: produit.promoFin,
    });
  } catch (error: any) {
    console.error('Erreur modification promotion:', error);
    return NextResponse.json({ error: error.message || 'Erreur' }, { status: 400 });
  }
}
