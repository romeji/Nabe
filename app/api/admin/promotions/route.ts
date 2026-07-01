import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifierSessionAdmin } from '@/lib/auth-helpers';

export async function GET() {
  const session = await verifierSessionAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const produits = await prisma.produit.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      images: { orderBy: { ordre: 'asc' }, take: 1 },
      categorie: true,
    },
  });

  const resultat = produits.map((p) => ({
    id: p.id,
    reference: p.reference,
    nom: p.nom,
    image: p.images[0]?.url || null,
    categorie: p.categorie?.nom || null,
    prix: p.prix.toString(),
    prixPromo: p.prixPromo ? p.prixPromo.toString() : null,
    promoActive: p.promoActive,
    promoDebut: p.promoDebut,
    promoFin: p.promoFin,
    actif: p.actif,
  }));

  return NextResponse.json(resultat);
}
