import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authClientOptions } from '@/lib/auth-client';
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
    const { articles, codeReduction }: { articles: ArticlePanier[]; codeReduction?: string } =
      await req.json();

    if (!articles || articles.length === 0) {
      return NextResponse.json({ error: 'Le panier est vide' }, { status: 400 });
    }

    // Client connecté (optionnel) : permet de lier la commande à son historique
    const session = await getServerSession(authClientOptions);
    const clientId = (session?.user as any)?.id as string | undefined;

    // On revérifie les prix et le stock en base pour éviter toute manipulation côté client
    const idsProduits = articles.map((a) => a.produitId);
    const produitsDb = await prisma.produit.findMany({
      where: { id: { in: idsProduits } },
    });

    const lineItems = [];
    let sousTotal = 0;
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

      const prix = parseFloat(produitDb.prix.toString());
      sousTotal += prix * article.quantite;

      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: article.taille ? `${produitDb.nom} (Taille ${article.taille})` : produitDb.nom,
            images: article.image ? [article.image] : undefined,
          },
          unit_amount: Math.round(prix * 100),
        },
        quantity: article.quantite,
      });
    }

    // Validation et application d'un éventuel code de réduction
    let codeReductionId: string | undefined;
    let coupon: { id: string } | undefined;

    if (codeReduction && codeReduction.trim()) {
      const code = await prisma.codeReduction.findUnique({
        where: { code: codeReduction.trim().toUpperCase() },
      });

      if (!code || !code.actif) {
        return NextResponse.json({ error: 'Code de réduction invalide.' }, { status: 400 });
      }
      if (code.dateExpiration && code.dateExpiration < new Date()) {
        return NextResponse.json({ error: 'Ce code de réduction a expiré.' }, { status: 400 });
      }
      if (code.montantMinimum && sousTotal < parseFloat(code.montantMinimum.toString())) {
        return NextResponse.json(
          { error: `Ce code nécessite un panier minimum de ${code.montantMinimum}€.` },
          { status: 400 }
        );
      }
      if (code.utilisationMax) {
        const utilisations = await prisma.commande.count({ where: { codeReductionId: code.id } });
        if (utilisations >= code.utilisationMax) {
          return NextResponse.json(
            { error: "Ce code de réduction n'est plus disponible." },
            { status: 400 }
          );
        }
      }

      codeReductionId = code.id;

      // Création d'un coupon Stripe à usage unique pour cette session
      const stripeCoupon = await stripe.coupons.create(
        code.type === 'POURCENTAGE'
          ? { percent_off: parseFloat(code.valeur.toString()), duration: 'once' }
          : { amount_off: Math.round(parseFloat(code.valeur.toString()) * 100), currency: 'eur', duration: 'once' }
      );
      coupon = { id: stripeCoupon.id };
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const session_ = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      discounts: coupon ? [{ coupon: coupon.id }] : undefined,
      success_url: `${siteUrl}/checkout/succes`,
      cancel_url: `${siteUrl}/panier`,
      shipping_address_collection: { allowed_countries: ['FR', 'BE', 'CH', 'LU', 'MC'] },
      customer_email: session?.user?.email || undefined,
      metadata: {
        articles: JSON.stringify(
          articles.map((a) => ({ id: a.produitId, q: a.quantite, taille: a.taille || '' }))
        ),
        clientId: clientId || '',
        codeReductionId: codeReductionId || '',
      },
    });

    return NextResponse.json({ url: session_.url });
  } catch (error: any) {
    console.error('Erreur checkout Stripe:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création du paiement' },
      { status: 500 }
    );
  }
}
