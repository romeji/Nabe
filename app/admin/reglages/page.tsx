import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getConfigSite } from '@/lib/config-site';
import ReglagesClient from '@/components/admin/ReglagesClient';
import './reglages.css';

export default async function PageAdminReglages() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');

  const [config, collections, categories, produits] = await Promise.all([
    getConfigSite(),
    prisma.collection.findMany({ where: { actif: true }, orderBy: { ordre: 'asc' } }),
    prisma.categorie.findMany({ orderBy: { ordre: 'asc' } }),
    prisma.produit.findMany({ orderBy: { nom: 'asc' }, select: { id: true, nom: true, prix: true } }),
  ]);

  return (
    <div className="admin-reglages">
      <div className="admin-entete">
        <h1>Réglages du site</h1>
      </div>
      <ReglagesClient
        configInitiale={config}
        collections={collections.map((c) => ({ id: c.id, nom: c.nom }))}
        categories={categories.map((c) => ({ id: c.id, nom: c.nom }))}
        produits={produits.map((p) => ({ id: p.id, nom: p.nom, prix: p.prix.toString() }))}
      />
    </div>
  );
}
