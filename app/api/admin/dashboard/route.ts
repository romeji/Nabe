import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifierSessionAdmin } from '@/lib/auth-helpers';

export async function GET(req: NextRequest) {
  const session = await verifierSessionAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const il30Jours = new Date();
  il30Jours.setDate(il30Jours.getDate() - 30);

  const [
    nombreProduits,
    produitsStockBas,
    commandesRecentes,
    chiffreAffaires30j,
    demandesSurMesureNouvelles,
    messagesNouveaux,
    totalCommandes,
  ] = await Promise.all([
    prisma.produit.count({ where: { actif: true } }),
    prisma.produit.findMany({
      where: { actif: true, stock: { lte: 3 }, disponibilite: { not: 'FABRICATION_SUR_COMMANDE' } },
      select: { id: true, nom: true, stock: true },
      take: 10,
    }),
    prisma.commande.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { lignes: true },
    }),
    prisma.commande.aggregate({
      where: { createdAt: { gte: il30Jours }, statut: { not: 'ANNULEE' } },
      _sum: { total: true },
    }),
    prisma.demandeSurMesure.count({ where: { statut: 'NOUVELLE' } }),
    prisma.messageContact.count({ where: { statut: 'NOUVEAU' } }),
    prisma.commande.count(),
  ]);

  return NextResponse.json({
    nombreProduits,
    produitsStockBas,
    commandesRecentes,
    chiffreAffaires30j: chiffreAffaires30j._sum.total || 0,
    demandesSurMesureNouvelles,
    messagesNouveaux,
    totalCommandes,
  });
}
