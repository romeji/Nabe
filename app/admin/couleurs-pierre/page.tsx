import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import FormulaireCouleurPierre from '@/components/admin/FormulaireCouleurPierre';
import LigneCouleurPierre from '@/components/admin/LigneCouleurPierre';
import '../categories/categories.css';

export default async function PageAdminCouleursPierre() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');

  const couleurs = await prisma.couleurPierre.findMany({
    orderBy: { ordre: 'asc' },
    include: { _count: { select: { pierres: true } } },
  });

  return (
    <div className="admin-categories">
      <div className="admin-entete">
        <h1>Couleurs de pierre ({couleurs.length})</h1>
      </div>

      <div className="admin-categories__grille">
        <div className="admin-table-scroll"><table className="admin-table">
          <thead>
            <tr>
              <th></th>
              <th>Nom</th>
              <th>Pierres associées</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {couleurs.map((c) => (
              <LigneCouleurPierre key={c.id} couleur={c} />
            ))}
          </tbody>
        </table></div>

        <FormulaireCouleurPierre />
      </div>

      {couleurs.length === 0 && (
        <p style={{ color: 'var(--texte-secondaire)', fontStyle: 'italic', marginTop: '1rem' }}>
          Aucune couleur de pierre pour le moment. Ces couleurs alimentent le filtre "Couleur" sur
          la page Collections.
        </p>
      )}
    </div>
  );
}
