import { verifierSessionAdmin } from '@/lib/auth-helpers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import FormulaireCollectionClient from '@/components/admin/FormulaireCollectionClient';
import LigneCollection from '@/components/admin/LigneCollection';
import '../categories/categories.css';

export default async function PageAdminCollections() {
  const session = await verifierSessionAdmin();
  if (!session) redirect('/admin/login');

  const collections = await prisma.collection.findMany({
    orderBy: { ordre: 'asc' },
    include: { _count: { select: { produits: true } } },
  });

  return (
    <div className="admin-categories">
      <div className="admin-entete">
        <h1>Collections ({collections.length})</h1>
      </div>

      <div className="admin-categories__grille">
        <div className="admin-table-scroll"><table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Nom</th>
              <th>Slug</th>
              <th>Bijoux associés</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {collections.map((c: any) => (
              <LigneCollection key={c.id} collection={c} />
            ))}
          </tbody>
        </table></div>

        <FormulaireCollectionClient />
      </div>

      {collections.length === 0 && (
        <p style={{ color: 'var(--texte-secondaire)', fontStyle: 'italic', marginTop: '1rem' }}>
          Aucune collection pour le moment. Une collection est facultative pour un bijou — créez-en
          une si vous voulez regrouper des pièces (ex : "Été 2026").
        </p>
      )}
    </div>
  );
}
