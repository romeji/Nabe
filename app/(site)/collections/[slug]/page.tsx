import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { getConfigSite, configEstActive } from '@/lib/config-site';
import { authClientOptions } from '@/lib/auth-client';
import ProduitDetailClient from '@/components/site/ProduitDetailClient';
import './produit.css';

export const revalidate = 60;

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props) {
  const produit = await prisma.produit.findUnique({ where: { slug: params.slug } });
  return { title: produit?.nom || 'Bijou' };
}

export default async function PageProduit({ params }: Props) {
  const produit = await prisma.produit.findUnique({
    where: { slug: params.slug },
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
    pierres: produit.pierres.map((pp) => ({
      ...pp.pierre,
      couleurs: pp.pierre.couleurs.map((pc) => ({ nom: pc.couleurPierre.nom, codeHex: pc.couleurPierre.codeHex })),
    })),
  };
  const suggestionsSerialisees = suggestions.map((s) => ({ ...s, prix: s.prix.toString() }));
  const composables = produit.composerAvecActif
    ? produit.composeAvec.map((c) => ({
        id: c.produitSuggere.id,
        nom: c.produitSuggere.nom,
        slug: c.produitSuggere.slug,
        prix: c.produitSuggere.prix.toString(),
        image: c.produitSuggere.images[0]?.url || null,
      }))
    : [];

  return (
    <ProduitDetailClient
      produit={produitSerialise as any}
      suggestions={suggestionsSerialisees as any}
      suggestionsActives={suggestionsActives}
      estFavori={estFavori}
      composables={composables}
      galeriePosition={galeriePosition}
      popupOuvertureActive={configEstActive(config, 'popup_panier_ouverture_actif')}
    />
  );
}
