import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

type ArticlePanier = {
  produitId: string;
  nom: string;
  prix: number;
  image: string;
  taille?: string;
  quantite: number;
};

export async function POST(req: NextRequest) {
  try {
    const { articles }: { articles: ArticlePanier[] } = await req.json();

    if (!articles || articles.length === 0) {
      return NextResponse.json({ error: 'Le panier est vide' }, { status: 400 });
    }

    // On revérifie les prix et le stock en base pour éviter toute manipulation côté client
    const idsProduits = articles.map((a) => a.produitId);
    const produitsDb = await prisma.produit.findMany({
      where: { id: { in: idsProduits } },
    });

    const lineItems = [];
    for (const article of articles) {
      const produitDb = produitsDb.find((p) => p.id === article.produitId);
      if (!produitDb) {
        return NextResponse.json(
          { error: `Produit introuvable : ${article.nom}` },
          { status: 400 }
        );
      }
      if (produitDb.disponibilite === 'EPUISE') {
        return NextResponse.json(
          { error: `${produitDb.nom} n'est plus disponible.` },
          { status: 400 }
        );
      }

      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: article.taille ? `${produitDb.nom} (Taille ${article.taille})` : produitDb.nom,
            images: article.image ? [article.image] : undefined,
          },
          unit_amount: Math.round(parseFloat(produitDb.prix.toString()) * 100),
        },
        quantity: article.quantite,
      });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      success_url: `${siteUrl}/checkout/succes`,
      cancel_url: `${siteUrl}/panier`,
      shipping_address_collection: { allowed_countries: ['FR', 'BE', 'CH', 'LU', 'MC'] },
      metadata: {
        articles: JSON.stringify(
          articles.map((a) => ({ id: a.produitId, q: a.quantite, taille: a.taille || '' }))
        ),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Erreur checkout Stripe:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création du paiement' },
      { status: 500 }
    );
  }
}
