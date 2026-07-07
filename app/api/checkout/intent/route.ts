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

type AdresseCheckout = {
  email: string;
  prenom: string;
  nom: string;
  adresse: string;
  complement?: string;
  ville: string;
  codePostal: string;
  pays: string;
  telephone?: string;
};

const MODES_LIVRAISON: Record<string, { label: string; prix: number }> = {
  standard: { label: 'Livraison à domicile avec suivi', prix: 0 },
  express: { label: 'Livraison rapide', prix: 9.9 },
};

function normaliserPaysStripe(pays?: string) {
  const valeur = (pays || 'FR').trim().toUpperCase();
  if (valeur === 'FRANCE') return 'FR';
  return valeur.length === 2 ? valeur : 'FR';
}

export async function POST(req: NextRequest) {
  try {
    const {
      articles,
      codeReduction,
      adresse,
      modeLivraison,
    }: {
      articles: ArticlePanier[];
      codeReduction?: string;
      adresse: AdresseCheckout;
      modeLivraison?: { id: string };
    } = await req.json();

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe n’est pas configuré côté serveur.' }, { status: 500 });
    }

    if (!articles || articles.length === 0) {
      return NextResponse.json({ error: 'Le panier est vide.' }, { status: 400 });
    }

    if (!adresse?.email || !adresse?.prenom || !adresse?.nom || !adresse?.adresse || !adresse?.ville || !adresse?.codePostal) {
      return NextResponse.json({ error: 'Merci de compléter toutes les informations de livraison.' }, { status: 400 });
    }

    const modeChoisi = MODES_LIVRAISON[modeLivraison?.id || 'standard'] || MODES_LIVRAISON.standard;
    const fraisLivraison = modeChoisi.prix;

    const session = await getServerSession(authClientOptions);
    const clientId = (session?.user as any)?.id as string | undefined;

    const idsProduits = articles.map((a) => a.produitId);
    const produitsDb = await prisma.produit.findMany({
      where: { id: { in: idsProduits }, actif: true },
      include: { stockTailles: true },
    });

    let sousTotal = 0;
    const lignesValidees: { produitId: string; nom: string; taille?: string; prixUnitaire: number; quantite: number; image: string }[] = [];

    for (const article of articles) {
      if (!Number.isInteger(article.quantite) || article.quantite <= 0) {
        return NextResponse.json({ error: 'Quantité invalide dans le panier.' }, { status: 400 });
      }

      const produitDb = produitsDb.find((p) => p.id === article.produitId);
      if (!produitDb) {
        return NextResponse.json({ error: `Produit introuvable : ${article.nom}` }, { status: 400 });
      }

      if (produitDb.disponibilite === 'EPUISE') {
        return NextResponse.json({ error: `${produitDb.nom} n’est plus disponible.` }, { status: 400 });
      }

      const stockDisponible =
        produitDb.stockTailles.length > 0
          ? produitDb.stockTailles.find((s) => s.taille === article.taille)?.quantite ?? 0
          : produitDb.stock;

      if (article.quantite > stockDisponible) {
        return NextResponse.json(
          {
            error:
              stockDisponible <= 0
                ? `${produitDb.nom}${article.taille ? ` (taille ${article.taille})` : ''} n’est plus en stock.`
                : `Il ne reste que ${stockDisponible} exemplaire(s) de ${produitDb.nom}${article.taille ? ` (taille ${article.taille})` : ''}.`,
          },
          { status: 400 }
        );
      }

      const maintenant = new Date();
      const promoActive =
        produitDb.promoActive &&
        produitDb.prixPromo != null &&
        (!produitDb.promoDebut || produitDb.promoDebut <= maintenant) &&
        (!produitDb.promoFin || produitDb.promoFin >= maintenant);

      const prixUnitaire = promoActive ? Number(produitDb.prixPromo) : Number(produitDb.prix);
      sousTotal += prixUnitaire * article.quantite;

      lignesValidees.push({
        produitId: produitDb.id,
        nom: produitDb.nom,
        taille: article.taille,
        prixUnitaire,
        quantite: article.quantite,
        image: article.image,
      });
    }

    let codeReductionId: string | undefined;
    let montantReduction = 0;

    if (codeReduction?.trim()) {
      const code = await prisma.codeReduction.findUnique({ where: { code: codeReduction.trim().toUpperCase() } });

      if (!code || !code.actif) {
        return NextResponse.json({ error: 'Code de réduction invalide.' }, { status: 400 });
      }
      if (code.dateExpiration && code.dateExpiration < new Date()) {
        return NextResponse.json({ error: 'Ce code de réduction a expiré.' }, { status: 400 });
      }
      if (code.montantMinimum && sousTotal < Number(code.montantMinimum)) {
        return NextResponse.json(
          { error: `Ce code nécessite un panier minimum de ${code.montantMinimum} €.` },
          { status: 400 }
        );
      }
      if (code.utilisationMax) {
        const utilisations = await prisma.commande.count({ where: { codeReductionId: code.id } });
        if (utilisations >= code.utilisationMax) {
          return NextResponse.json({ error: "Ce code de réduction n'est plus disponible." }, { status: 400 });
        }
      }

      codeReductionId = code.id;
      montantReduction =
        code.type === 'POURCENTAGE'
          ? sousTotal * (Number(code.valeur) / 100)
          : Math.min(Number(code.valeur), sousTotal);
    }

    const total = Math.max(0, sousTotal - montantReduction + fraisLivraison);
    if (total <= 0) {
      return NextResponse.json({ error: 'Le montant total doit être positif.' }, { status: 400 });
    }

    const paysStripe = normaliserPaysStripe(adresse.pays);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100),
      currency: 'eur',
      automatic_payment_methods: { enabled: true },
      receipt_email: adresse.email,
      shipping: {
        name: `${adresse.prenom} ${adresse.nom}`,
        phone: adresse.telephone || undefined,
        address: {
          line1: adresse.adresse,
          line2: adresse.complement || undefined,
          city: adresse.ville,
          postal_code: adresse.codePostal,
          country: paysStripe,
        },
      },
      metadata: {
        articles: JSON.stringify(
          lignesValidees.map((l) => ({
            id: l.produitId,
            q: l.quantite,
            taille: l.taille || '',
            pu: l.prixUnitaire,
          }))
        ),
        clientId: clientId || '',
        codeReductionId: codeReductionId || '',
        email: adresse.email,
        prenom: adresse.prenom,
        nom: adresse.nom,
        adresse: adresse.adresse,
        ville: adresse.ville,
        codePostal: adresse.codePostal,
        pays: paysStripe,
        telephone: adresse.telephone || '',
        sousTotal: sousTotal.toFixed(2),
        montantReduction: montantReduction.toFixed(2),
        fraisLivraison: fraisLivraison.toFixed(2),
        modeLivraisonLabel: modeChoisi.label,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      resume: {
        sousTotal: sousTotal.toFixed(2),
        montantReduction: montantReduction.toFixed(2),
        fraisLivraison: fraisLivraison.toFixed(2),
        total: total.toFixed(2),
      },
    });
  } catch (error: any) {
    console.error('Erreur création PaymentIntent:', error);
    return NextResponse.json({ error: error.message || 'Erreur lors de la préparation du paiement.' }, { status: 500 });
  }
}
