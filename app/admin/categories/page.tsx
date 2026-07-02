import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import FormulaireCategorieClient from '@/components/admin/FormulaireCategorieClient';
import LigneCategorie from '@/components/admin/LigneCategorie';
import './categories.css';

export default async function PageAdminCategories() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');

  const categories = await prisma.categorie.findMany({
    orderBy: { ordre: 'asc' },
    include: { _count: { select: { produits: true } } },
  });

  return (
    <div className="admin-categories">
      <div className="admin-entete">
        <h1>Catégories ({categories.length})</h1>
      </div>

      <div className="admin-categories__grille">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Slug</th>
              <th>Bijoux associés</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <LigneCategorie key={c.id} categorie={c} />
            ))}
          </tbody>
        </table>

        <FormulaireCategorieClient />
      </div>
    </div>
  );
}
