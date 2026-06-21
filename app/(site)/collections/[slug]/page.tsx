import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
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
    },
  });

  if (!produit || !produit.actif) {
    notFound();
  }

  const suggestions = await prisma.produit.findMany({
    where: {
      actif: true,
      id: { not: produit.id },
      type: produit.type,
    },
    include: { images: { orderBy: { ordre: 'asc' }, take: 1 } },
    take: 4,
  });

  // On sérialise les champs Decimal (non transmissibles tels quels du serveur au client)
  const produitSerialise = {
    ...produit,
    prix: produit.prix.toString(),
  };
  const suggestionsSerialisees = suggestions.map((s) => ({ ...s, prix: s.prix.toString() }));

  return <ProduitDetailClient produit={produitSerialise as any} suggestions={suggestionsSerialisees as any} />;
}
