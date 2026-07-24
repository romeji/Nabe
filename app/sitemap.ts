import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nabe-bijoux.fr';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [produits, categories, collections] = await Promise.all([
    prisma.produit.findMany({ where: { actif: true }, select: { slug: true, updatedAt: true } }),
    prisma.categorie.findMany({ select: { slug: true, updatedAt: true } }),
    prisma.collection.findMany({ where: { actif: true }, select: { slug: true, updatedAt: true } }),
  ]);

  const pagesStatiques: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/collections`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/la-maison`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/sur-mesure`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/contact`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/faq`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE_URL}/guide-des-tailles`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE_URL}/livraison-retours`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE_URL}/paiement-securise`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/cgv`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/confidentialite`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/mentions-legales`, changeFrequency: 'yearly', priority: 0.2 },
  ];

  const pagesProduits: MetadataRoute.Sitemap = produits.map((p: any) => ({
    url: `${SITE_URL}/collections/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const pagesCategories: MetadataRoute.Sitemap = categories.map((c: any) => ({
    url: `${SITE_URL}/collections?categorie=${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  const pagesCollections: MetadataRoute.Sitemap = collections.map((c: any) => ({
    url: `${SITE_URL}/collections?collection=${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [...pagesStatiques, ...pagesProduits, ...pagesCategories, ...pagesCollections];
}
