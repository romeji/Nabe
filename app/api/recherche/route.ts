import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ produits: [] });
  }

  const produits = await prisma.produit.findMany({
    where: {
      actif: true,
      OR: [
        { nom: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { matiere: { nom: { contains: q, mode: 'insensitive' } } },
        { collection: { nom: { contains: q, mode: 'insensitive' } } },
        { couleurPierre: { nom: { contains: q, mode: 'insensitive' } } },
        // La recherche sur l'enum Pierre se fait via une correspondance simple côté code juste après
      ],
    },
    include: { images: { orderBy: { ordre: 'asc' }, take: 1 }, matiere: true, collection: true, couleurPierre: true },
    take: 12,
  });

  // Recherche additionnelle par libellé de pierre (l'enum n'est pas cherchable en "contains" côté Prisma)
  const LABELS_PIERRE_RECHERCHE: Record<string, string> = {
    DIAMANT: 'diamant',
    PERLE: 'perle',
    PIERRE_DE_LUNE: 'pierre de lune',
    QUARTZ: 'quartz',
    TOPAZE: 'topaze',
    SAPHIR: 'saphir',
    EMERAUDE: 'émeraude',
  };
  const qMinuscule = q.toLowerCase();
  const pierreCorrespondante = Object.entries(LABELS_PIERRE_RECHERCHE).find(([, label]) =>
    label.includes(qMinuscule)
  );

  let produitsParPierre: typeof produits = [];
  if (pierreCorrespondante) {
    produitsParPierre = await prisma.produit.findMany({
      where: { actif: true, pierre: pierreCorrespondante[0] as any },
      include: { images: { orderBy: { ordre: 'asc' }, take: 1 }, matiere: true, collection: true, couleurPierre: true },
      take: 12,
    });
  }

  // Fusionne sans doublons
  const tousLesIds = new Set<string>();
  const resultatFusionne = [...produits, ...produitsParPierre].filter((p) => {
    if (tousLesIds.has(p.id)) return false;
    tousLesIds.add(p.id);
    return true;
  });

  const resultat = resultatFusionne.slice(0, 12).map((p) => ({
    id: p.id,
    nom: p.nom,
    slug: p.slug,
    prix: p.prix.toString(),
    image: p.images[0]?.url || null,
    matiere: p.matiere?.nom || null,
    collection: p.collection?.nom || null,
  }));

  return NextResponse.json({ produits: resultat });
}
