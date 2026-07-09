import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getConfigSite } from '@/lib/config-site';
import { calculerModesLivraison, calculerPoidsPanier } from '@/lib/livraison';

type ArticlePanier = { id: string; quantite: number };

export async function POST(req: NextRequest) {
  try {
    const { articles } = (await req.json()) as { articles: ArticlePanier[] };

    if (!Array.isArray(articles) || articles.length === 0) {
      return NextResponse.json({ error: 'Panier vide' }, { status: 400 });
    }

    const produits = await prisma.produit.findMany({
      where: { id: { in: articles.map((a) => a.id) } },
      select: { id: true, poidsGrammes: true },
    });

    const articlesAvecPoids = articles.map((a) => {
      const produit = produits.find((p) => p.id === a.id);
      return { poidsGrammes: produit?.poidsGrammes ?? 50, quantite: a.quantite };
    });

    const poidsTotal = calculerPoidsPanier(articlesAvecPoids);
    const config = await getConfigSite();
    const modes = calculerModesLivraison(poidsTotal, config);

    return NextResponse.json({ poidsTotalGrammes: poidsTotal, modes });
  } catch (error: any) {
    console.error('Erreur calcul tarifs livraison:', error);
    return NextResponse.json({ error: error.message || 'Erreur' }, { status: 400 });
  }
}
