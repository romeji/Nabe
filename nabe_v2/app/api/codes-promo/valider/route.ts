import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { code, sousTotal } = await req.json();

    if (!code || !code.trim()) {
      return NextResponse.json({ error: 'Veuillez entrer un code.' }, { status: 400 });
    }

    const codeReduction = await prisma.codeReduction.findUnique({
      where: { code: code.trim().toUpperCase() },
    });

    if (!codeReduction || !codeReduction.actif) {
      return NextResponse.json({ error: 'Code de réduction invalide.' }, { status: 400 });
    }
    if (codeReduction.dateExpiration && codeReduction.dateExpiration < new Date()) {
      return NextResponse.json({ error: 'Ce code de réduction a expiré.' }, { status: 400 });
    }
    if (codeReduction.montantMinimum && sousTotal < parseFloat(codeReduction.montantMinimum.toString())) {
      return NextResponse.json(
        { error: `Ce code nécessite un panier minimum de ${codeReduction.montantMinimum}€.` },
        { status: 400 }
      );
    }
    if (codeReduction.utilisationMax) {
      const utilisations = await prisma.commande.count({ where: { codeReductionId: codeReduction.id } });
      if (utilisations >= codeReduction.utilisationMax) {
        return NextResponse.json({ error: "Ce code de réduction n'est plus disponible." }, { status: 400 });
      }
    }

    const reduction =
      codeReduction.type === 'POURCENTAGE'
        ? (sousTotal * parseFloat(codeReduction.valeur.toString())) / 100
        : Math.min(parseFloat(codeReduction.valeur.toString()), sousTotal);

    return NextResponse.json({
      valide: true,
      code: codeReduction.code,
      type: codeReduction.type,
      valeur: parseFloat(codeReduction.valeur.toString()),
      reduction,
    });
  } catch (error: any) {
    console.error('Erreur validation code promo:', error);
    return NextResponse.json({ error: 'Erreur lors de la validation du code.' }, { status: 500 });
  }
}
