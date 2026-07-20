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
      where: { id: { in: articles.map((a: any) => a.id) } },
      select: { id: true, poidsGrammes: true },
    });

    const articlesAvecPoids = articles.map((a: any) => {
      const produit = produits.find((p: any) => p.id === a.id);
      return { poidsGrammes: produit?.poidsGrammes ?? 50, quantite: a.quantite };
    });

    const poidsTotal = calculerPoidsPanier(articlesAvecPoids);
    const config = await getConfigSite();
    const modes = calculerModesLivraison(poidsTotal, config);

    const livraisonIncluse = config.livraison_incluse_dans_prix === 'true';
    const tvaApplicable = config.tva_applicable === 'true';
    const tvaTaux = parseFloat(config.tva_taux) || 20;
    return NextResponse.json({ poidsTotalGrammes: poidsTotal, modes, livraisonIncluse, tvaApplicable, tvaTaux });
  } catch (error: any) {
    console.error('Erreur calcul tarifs livraison:', error);
    return NextResponse.json({ error: error.message || 'Erreur' }, { status: 400 });
  }
}
