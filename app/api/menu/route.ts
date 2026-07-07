import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getConfigSite, configEstActive } from '@/lib/config-site';

// Évite la mise en cache statique par Next.js (sinon les changements faits depuis
// l'admin — catégories, collections, options — n'apparaissent jamais côté site public).
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const [categories, collections, config] = await Promise.all([
    prisma.categorie.findMany({ orderBy: { ordre: 'asc' }, select: { id: true, nom: true, slug: true } }),
    prisma.collection.findMany({
      where: { actif: true },
      orderBy: { ordre: 'asc' },
      select: { id: true, nom: true, slug: true },
    }),
    getConfigSite(),
  ]);

  return NextResponse.json({
    categories,
    collections,
    journalActif: configEstActive(config, 'journal_actif'),
    menu: {
      categoriesActif: configEstActive(config, 'menu_categories_actif'),
      collectionsActif: configEstActive(config, 'menu_collections_actif'),
      pagesActif: configEstActive(config, 'menu_pages_actif'),
      aideActif: configEstActive(config, 'menu_aide_actif'),
    },
  });
}
