import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import FormulaireMatiereClient from '@/components/admin/FormulaireMatiereClient';
import LigneMatiere from '@/components/admin/LigneMatiere';
import '../categories/categories.css';

export default async function PageAdminMatieres() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');

  const matieres = await prisma.matiere.findMany({
    orderBy: { ordre: 'asc' },
    include: { _count: { select: { produits: true } } },
  });

  return (
    <div className="admin-categories">
      <div className="admin-entete">
        <h1>Matières ({matieres.length})</h1>
      </div>

      <div className="admin-categories__grille">
        <div className="admin-table-scroll"><table className="admin-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Slug</th>
              <th>Bijoux associés</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {matieres.map((m) => (
              <LigneMatiere key={m.id} matiere={m} />
            ))}
          </tbody>
        </table></div>

        <FormulaireMatiereClient />
      </div>

      {matieres.length === 0 && (
        <p style={{ color: 'var(--texte-secondaire)', fontStyle: 'italic', marginTop: '1rem' }}>
          Aucune matière pour le moment. Ajoutez votre première matière (ex : Or jaune 18 carats,
          Argent 925...).
        </p>
      )}
    </div>
  );
}
