import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifierSessionAdmin } from '@/lib/auth-helpers';

export async function GET(req: NextRequest) {
  const session = await verifierSessionAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const codes = await prisma.codeReduction.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { commandes: true } }, commandes: { select: { total: true } } },
  });

  // On calcule pour chaque code : nombre d'utilisations + chiffre d'affaires généré
  // (utile pour le futur calcul de commission collaborateur)
  const codesAvecStats = codes.map((c) => ({
    ...c,
    nombreUtilisations: c._count.commandes,
    chiffreAffairesGenere: c.commandes.reduce((acc, cmd) => acc + parseFloat(cmd.total.toString()), 0),
  }));

  return NextResponse.json(codesAvecStats);
}

export async function POST(req: NextRequest) {
  const session = await verifierSessionAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const {
      code,
      type,
      valeur,
      nomCollaborateur,
      commissionPourcentage,
      dateExpiration,
      utilisationMax,
      montantMinimum,
    } = await req.json();

    if (!code || !code.trim() || !valeur) {
      return NextResponse.json({ error: 'Le code et la valeur sont requis' }, { status: 400 });
    }

    const codeReduction = await prisma.codeReduction.create({
      data: {
        code: code.trim().toUpperCase(),
        type: type || 'POURCENTAGE',
        valeur: parseFloat(valeur),
        nomCollaborateur: nomCollaborateur || undefined,
        commissionPourcentage: commissionPourcentage ? parseFloat(commissionPourcentage) : undefined,
        dateExpiration: dateExpiration ? new Date(dateExpiration) : undefined,
        utilisationMax: utilisationMax ? parseInt(utilisationMax) : undefined,
        montantMinimum: montantMinimum ? parseFloat(montantMinimum) : undefined,
      },
    });

    return NextResponse.json(codeReduction, { status: 201 });
  } catch (error: any) {
    console.error('Erreur création code promo:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Ce code existe déjà' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Erreur' }, { status: 400 });
  }
}
