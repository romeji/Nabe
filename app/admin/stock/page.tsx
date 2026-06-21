import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import GestionStockClient from '@/components/admin/GestionStockClient';
import './stock.css';

export default async function PageAdminStock() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');

  const [produits, mouvements] = await Promise.all([
    prisma.produit.findMany({
      where: { actif: true },
      select: { id: true, nom: true, stock: true },
      orderBy: { nom: 'asc' },
    }),
    prisma.mouvementStock.findMany({
      include: { produit: { select: { nom: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
  ]);

  return (
    <div className="admin-stock">
      <div className="admin-entete">
        <h1>Gestion du stock</h1>
      </div>
      <GestionStockClient
        produits={produits}
        mouvements={mouvements.map((m) => ({
          id: m.id,
          produitNom: m.produit.nom,
          type: m.type,
          quantite: m.quantite,
          motif: m.motif,
          createdAt: m.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
