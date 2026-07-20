import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifierSessionAdmin } from '@/lib/auth-helpers';
import { slugify } from '@/lib/utils';
import { genererReference } from '@/lib/reference-produit';
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
  stockParTaille: z.record(z.string(), z.number().int().min(0)).optional(), // ex: { "52": 3, "54": 0 }
  disponibilite: z
    .enum(['EN_STOCK', 'FABRICATION_SUR_COMMANDE', 'CREATION_SUR_MESURE', 'PIECE_UNIQUE_DISPO', 'EPUISE'])
    .optional(),
  stock: z.number().int().min(0).optional(),
  poidsGrammes: z.number().int().min(1).optional(),
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
      pierres: { include: { pierre: { include: { couleurs: { include: { couleurPierre: true } } } } } },
      stockTailles: true,
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

    // Générer la référence automatiquement
    const reference = await genererReference(donnees.type as any);

    // Si un stock par taille est fourni, le stock global = somme des quantités par taille
    const stockTotalCalcule =
      donnees.stockParTaille && Object.keys(donnees.stockParTaille).length > 0
        ? Object.values(donnees.stockParTaille).reduce((a: any, b: any) => a + b, 0)
        : donnees.stock ?? 0;

    const produit = await prisma.produit.create({
      data: {
        reference,
        nom: donnees.nom,
        slug,
        description: donnees.description,
        prix: donnees.prix,
        type: donnees.type as any,
        matiereId: donnees.matiereId || undefined,
        delaiFabrication: donnees.delaiFabrication || undefined,
        fabriqueEnFrance: donnees.fabriqueEnFrance ?? true,
        tailleSurMesure: donnees.tailleSurMesure ?? false,
        taillesDisponibles: donnees.taillesDisponibles || [],
        disponibilite: donnees.disponibilite || 'EN_STOCK',
        stock: stockTotalCalcule,
        poidsGrammes: donnees.poidsGrammes ?? 50,
        categorieId: donnees.categorieId || undefined,
        collectionId: donnees.collectionId || undefined,
        actif: donnees.actif ?? true,
        enAvant: donnees.enAvant ?? false,
        composerAvecActif: donnees.composerAvecActif ?? true,
        images: donnees.images
          ? {
              create: donnees.images.map((img: any, i: number) => ({
                url: img.url,
                publicId: img.publicId,
                alt: img.alt || donnees.nom,
                ordre: i,
              })),
            }
          : undefined,
        pierres: donnees.pierresIds
          ? {
              create: donnees.pierresIds.map((pierreId: any) => ({ pierreId })),
            }
          : undefined,
        composeAvec: donnees.composeAvecIds
          ? {
              create: donnees.composeAvecIds.map((produitSuggereId: any, i: number) => ({ produitSuggereId, ordre: i })),
            }
          : undefined,
        stockTailles: donnees.stockParTaille && Object.keys(donnees.stockParTaille).length > 0
          ? {
              create: Object.entries(donnees.stockParTaille).map(([taille, quantite]) => ({ taille, quantite })),
            }
          : undefined,
      },
      include: { images: true, pierres: true, stockTailles: true },
    });

    if (stockTotalCalcule > 0) {
      await prisma.mouvementStock.create({
        data: {
          produitId: produit.id,
          produitNom: produit.nom,
          type: 'ENTREE',
          quantite: stockTotalCalcule,
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
