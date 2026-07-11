import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { getConfigSite, configEstActive } from '@/lib/config-site';
import { authClientOptions } from '@/lib/auth-client';
import ProduitDetailClient from '@/components/site/ProduitDetailClient';
import './produit.css';

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const produit = await prisma.produit.findUnique({
    where: { slug },
    include: { images: { orderBy: { ordre: 'asc' }, take: 1 } },
  });
  if (!produit) return { title: 'Bijou introuvable' };

  const description = (produit.description || '').replace(/<[^>]+>/g, '').slice(0, 155);
  const image = produit.images[0]?.url;

  return {
    title: produit.nom,
    description: description || `${produit.nom} — bijou artisanal Nabe.`,
    alternates: { canonical: `/collections/${produit.slug}` },
    openGraph: {
      title: produit.nom,
      description: description || `${produit.nom} — bijou artisanal Nabe.`,
      images: image ? [{ url: image }] : undefined,
      type: 'website',
    },
  };
}

export default async function PageProduit({ params }: Props) {
  const { slug } = await params;
  const produit = await prisma.produit.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { ordre: 'asc' } },
      categorie: true,
      matiere: true,
      pierres: { include: { pierre: { include: { couleurs: { include: { couleurPierre: true } } } } } },
      collection: true,
      stockTailles: true,
      composeAvec: {
        orderBy: { ordre: 'asc' },
        include: { produitSuggere: { include: { images: { orderBy: { ordre: 'asc' }, take: 1 } } } },
      },
    },
  });

  if (!produit || !produit.actif) {
    notFound();
  }

  const config = await getConfigSite();
  const suggestionsActives = configEstActive(config, 'suggestions_produit_actif');
  const critere = config.suggestions_produit_critere || 'meme_type';
  const galeriePosition = (config.galerie_produit_position as 'gauche' | 'bas') || 'bas';

  const session = await getServerSession(authClientOptions);
  const clientId = (session?.user as any)?.id as string | undefined;

  let suggestions: any[] = [];
  if (suggestionsActives) {
    if (critere === 'nouvelle_collection' && produit.collectionId) {
      suggestions = await prisma.produit.findMany({
        where: { actif: true, id: { not: produit.id }, collectionId: produit.collectionId },
        include: { images: { orderBy: { ordre: 'asc' }, take: 1 } },
        take: 4,
      });
    } else if (critere === 'moins_bonnes_ventes') {
      suggestions = await prisma.produit.findMany({
        where: { actif: true, id: { not: produit.id } },
        include: { images: { orderBy: { ordre: 'asc' }, take: 1 } },
        orderBy: { nombreVentes: 'asc' },
        take: 4,
      });
    }

    // Filet de sécurité : si le critère choisi ne renvoie rien (ex: pas de collection),
    // on retombe sur "même type de bijou" pour ne jamais afficher un bloc vide.
    if (suggestions.length === 0) {
      suggestions = await prisma.produit.findMany({
        where: { actif: true, id: { not: produit.id }, type: produit.type },
        include: { images: { orderBy: { ordre: 'asc' }, take: 1 } },
        take: 4,
      });
    }
  }

  const estFavori = clientId
    ? !!(await prisma.favori.findUnique({
        where: { clientId_produitId: { clientId, produitId: produit.id } },
      }))
    : false;

  // On sérialise les champs Decimal (non transmissibles tels quels du serveur au client)
  // et on met les pierres / produits composables à plat pour le composant client.
  const produitSerialise = {
    ...produit,
    prix: produit.prix.toString(),
    prixPromo: produit.prixPromo ? produit.prixPromo.toString() : null,
    promoDebut: produit.promoDebut ? produit.promoDebut.toISOString() : null,
    promoFin: produit.promoFin ? produit.promoFin.toISOString() : null,
    pierres: produit.pierres.map((pp: any) => ({
      ...pp.pierre,
      couleurs: pp.pierre.couleurs.map((pc: any) => ({ nom: pc.couleurPierre.nom, codeHex: pc.couleurPierre.codeHex })),
    })),
  };
  const suggestionsSerialisees = suggestions.map((s: any) => ({
    ...s,
    prix: s.prix.toString(),
    prixPromo: s.prixPromo ? s.prixPromo.toString() : null,
    promoActive: s.promoActive,
    promoDebut: s.promoDebut ? s.promoDebut.toISOString() : null,
    promoFin: s.promoFin ? s.promoFin.toISOString() : null,
  }));
  const composables = produit.composerAvecActif
    ? produit.composeAvec.map((c: any) => ({
        id: c.produitSuggere.id,
        nom: c.produitSuggere.nom,
        slug: c.produitSuggere.slug,
        prix: c.produitSuggere.prix.toString(),
        image: c.produitSuggere.images[0]?.url || null,
        prixPromo: c.produitSuggere.prixPromo ? c.produitSuggere.prixPromo.toString() : null,
        promoActive: c.produitSuggere.promoActive,
        promoDebut: c.produitSuggere.promoDebut ? c.produitSuggere.promoDebut.toISOString() : null,
        promoFin: c.produitSuggere.promoFin ? c.produitSuggere.promoFin.toISOString() : null,
      }))
    : [];

  const prixFinal = produit.promoActive && produit.prixPromo ? produit.prixPromo : produit.prix;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: produit.nom,
    description: (produit.description || '').replace(/<[^>]+>/g, '').slice(0, 500),
    image: produit.images.map((img: any) => img.url),
    sku: produit.reference,
    brand: { '@type': 'Brand', name: 'Nabe' },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'EUR',
      price: prixFinal.toString(),
      availability:
        produit.disponibilite === 'EN_STOCK' || produit.disponibilite === 'PIECE_UNIQUE_DISPO'
          ? 'https://schema.org/InStock'
          : produit.disponibilite === 'EPUISE'
          ? 'https://schema.org/OutOfStock'
          : 'https://schema.org/PreOrder',
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://nabe-bijoux.fr'}/collections/${produit.slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <ProduitDetailClient
        produit={produitSerialise as any}
        suggestions={suggestionsSerialisees as any}
        suggestionsActives={suggestionsActives}
        estFavori={estFavori}
        composables={composables}
        galeriePosition={galeriePosition}
        popupOuvertureActive={configEstActive(config, 'popup_panier_ouverture_actif')}
      />
    </>
  );
}
