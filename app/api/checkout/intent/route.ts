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

// Source de vérité des tarifs de livraison — jamais confiance au prix envoyé par le client,
// seul l'identifiant choisi est utilisé pour retrouver le tarif réel ici.
const MODES_LIVRAISON: Record<string, { label: string; prix: number }> = {
  standard: { label: 'Livraison à domicile avec suivi', prix: 0 },
  express: { label: 'Livraison rapide (moins de 48h ouvrées)', prix: 9.9 },
};

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

    if (!articles || articles.length === 0) {
      return NextResponse.json({ error: 'Le panier est vide' }, { status: 400 });
    }
    if (!adresse?.email || !adresse?.prenom || !adresse?.nom || !adresse?.adresse || !adresse?.ville || !adresse?.codePostal) {
      return NextResponse.json({ error: 'Merci de compléter toutes les informations de livraison.' }, { status: 400 });
    }

    // Le prix du mode de livraison vient toujours de notre table serveur, jamais du client
    const modeChoisi = MODES_LIVRAISON[modeLivraison?.id || 'standard'] || MODES_LIVRAISON.standard;
    const fraisLivraison = modeChoisi.prix;

    const session = await getServerSession(authClientOptions);
    const clientId = (session?.user as any)?.id as string | undefined;

    // On revalide systématiquement prix/stock côté serveur — jamais confiance au panier client
    const idsProduits = articles.map((a) => a.produitId);
    const produitsDb = await prisma.produit.findMany({
      where: { id: { in: idsProduits } },
      include: { stockTailles: true },
    });

    let sousTotal = 0;
    const lignesValidees: { produitId: string; nom: string; taille?: string; prixUnitaire: number; quantite: number; image: string }[] = [];

    for (const article of articles) {
      const produitDb = produitsDb.find((p) => p.id === article.produitId);
      if (!produitDb) {
        return NextResponse.json({ error: `Produit introuvable : ${article.nom}` }, { status: 400 });
      }
      if (produitDb.disponibilite === 'EPUISE') {
        return NextResponse.json({ error: `${produitDb.nom} n'est plus disponible.` }, { status: 400 });
      }

      let stockDisponible: number;
      if (produitDb.stockTailles.length > 0) {
        const ligne = produitDb.stockTailles.find((s) => s.taille === article.taille);
        stockDisponible = ligne?.quantite ?? 0;
      } else {
        stockDisponible = produitDb.stock;
      }
      if (article.quantite > stockDisponible) {
        return NextResponse.json(
          {
            error:
              stockDisponible <= 0
                ? `${produitDb.nom}${article.taille ? ` (taille ${article.taille})` : ''} n'est plus en stock.`
                : `Il ne reste que ${stockDisponible} exemplaire(s) de ${produitDb.nom}${article.taille ? ` (taille ${article.taille})` : ''}.`,
          },
          { status: 400 }
        );
      }

      // Le prix retenu est TOUJOURS celui recalculé côté serveur (avec promo active si applicable),
      // jamais celui envoyé par le client — évite toute manipulation du prix.
      const promoActive =
        produitDb.promoActive &&
        produitDb.prixPromo != null &&
        (!produitDb.promoDebut || produitDb.promoDebut <= new Date()) &&
        (!produitDb.promoFin || produitDb.promoFin >= new Date());
      const prixUnitaire = promoActive ? parseFloat(produitDb.prixPromo!.toString()) : parseFloat(produitDb.prix.toString());

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

    // Code de réduction (facultatif)
    let codeReductionId: string | undefined;
    let montantReduction = 0;

    if (codeReduction && codeReduction.trim()) {
      const code = await prisma.codeReduction.findUnique({ where: { code: codeReduction.trim().toUpperCase() } });

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
          return NextResponse.json({ error: "Ce code de réduction n'est plus disponible." }, { status: 400 });
        }
      }

      codeReductionId = code.id;
      montantReduction =
        code.type === 'POURCENTAGE'
          ? sousTotal * (parseFloat(code.valeur.toString()) / 100)
          : Math.min(parseFloat(code.valeur.toString()), sousTotal);
    }

    const total = Math.max(0, sousTotal - montantReduction + fraisLivraison);

    if (total <= 0) {
      return NextResponse.json({ error: 'Le montant total doit être positif.' }, { status: 400 });
    }

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
          country: adresse.pays || 'FR',
        },
      },
      metadata: {
        articles: JSON.stringify(lignesValidees.map((l) => ({ id: l.produitId, q: l.quantite, taille: l.taille || '' }))),
        clientId: clientId || '',
        codeReductionId: codeReductionId || '',
        email: adresse.email,
        prenom: adresse.prenom,
        nom: adresse.nom,
        adresse: adresse.adresse,
        ville: adresse.ville,
        codePostal: adresse.codePostal,
        pays: adresse.pays || 'France',
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
    return NextResponse.json({ error: error.message || 'Erreur lors de la préparation du paiement' }, { status: 500 });
  }
}
