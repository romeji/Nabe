import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifierSessionAdmin } from '@/lib/auth-helpers';
import { slugify } from '@/lib/utils';
import { z } from 'zod';

const schemaProduit = z.object({
  nom: z.string().min(1),
  description: z.string().min(1),
  prix: z.number().positive(),
  type: z.enum(['BAGUE', 'COLLIER', 'BOUCLES_OREILLES', 'BRACELET', 'PIECE_UNIQUE', 'COFFRET_CADEAU']),
  matiereId: z.string().optional().nullable(),
  pierresIds: z.array(z.string()).optional(),
  delaiFabrication: z.string().optional().nullable(),
  fabriqueEnFrance: z.boolean().optional(),
  tailleSurMesure: z.boolean().optional(),
  taillesDisponibles: z.array(z.string()).optional(),
  disponibilite: z
    .enum(['EN_STOCK', 'FABRICATION_SUR_COMMANDE', 'CREATION_SUR_MESURE', 'PIECE_UNIQUE_DISPO', 'EPUISE'])
    .optional(),
  stock: z.number().int().min(0).optional(),
  categorieId: z.string().optional().nullable(),
  collectionId: z.string().optional().nullable(),
  actif: z.boolean().optional(),
  enAvant: z.boolean().optional(),
  composerAvecActif: z.boolean().optional(),
  composeAvecIds: z.array(z.string()).max(2).optional(),
  images: z
    .array(z.object({ url: z.string(), publicId: z.string().optional(), alt: z.string().optional() }))
    .optional(),
});

export async function GET(req: NextRequest) {
  const session = await verifierSessionAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const produits = await prisma.produit.findMany({
    include: {
      images: { orderBy: { ordre: 'asc' } },
      categorie: true,
      matiere: true,
      pierres: { include: { pierre: { include: { couleurPierre: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(produits);
}

export async function POST(req: NextRequest) {
  const session = await verifierSessionAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const donnees = schemaProduit.parse(body);

    let slug = slugify(donnees.nom);
    const existant = await prisma.produit.findUnique({ where: { slug } });
    if (existant) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const produit = await prisma.produit.create({
      data: {
        nom: donnees.nom,
        slug,
        description: donnees.description,
        prix: donnees.prix,
        type: donnees.type,
        matiereId: donnees.matiereId || undefined,
        delaiFabrication: donnees.delaiFabrication || undefined,
        fabriqueEnFrance: donnees.fabriqueEnFrance ?? true,
        tailleSurMesure: donnees.tailleSurMesure ?? false,
        taillesDisponibles: donnees.taillesDisponibles || [],
        disponibilite: donnees.disponibilite || 'EN_STOCK',
        stock: donnees.stock ?? 0,
        categorieId: donnees.categorieId || undefined,
        collectionId: donnees.collectionId || undefined,
        actif: donnees.actif ?? true,
        enAvant: donnees.enAvant ?? false,
        composerAvecActif: donnees.composerAvecActif ?? true,
        images: donnees.images
          ? {
              create: donnees.images.map((img, i) => ({
                url: img.url,
                publicId: img.publicId,
                alt: img.alt || donnees.nom,
                ordre: i,
              })),
            }
          : undefined,
        pierres: donnees.pierresIds
          ? {
              create: donnees.pierresIds.map((pierreId) => ({ pierreId })),
            }
          : undefined,
        composeAvec: donnees.composeAvecIds
          ? {
              create: donnees.composeAvecIds.map((produitSuggereId, i) => ({ produitSuggereId, ordre: i })),
            }
          : undefined,
      },
      include: { images: true, pierres: true },
    });

    if (donnees.stock && donnees.stock > 0) {
      await prisma.mouvementStock.create({
        data: {
          produitId: produit.id,
          type: 'ENTREE',
          quantite: donnees.stock,
          motif: 'Stock initial à la création',
        },
      });
    }

    return NextResponse.json(produit, { status: 201 });
  } catch (error: any) {
    console.error('Erreur création produit:', error);
    return NextResponse.json({ error: error.message || 'Données invalides' }, { status: 400 });
  }
}
