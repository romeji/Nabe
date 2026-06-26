import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import FormulairePierre from '@/components/admin/FormulairePierre';
import LignePierre from '@/components/admin/LignePierre';
import '../categories/categories.css';

export default async function PageAdminPierres() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');

  const [pierres, couleurs] = await Promise.all([
    prisma.pierre.findMany({
      orderBy: { ordre: 'asc' },
      include: { couleurPierre: true, _count: { select: { produits: true } } },
    }),
    prisma.couleurPierre.findMany({ orderBy: { ordre: 'asc' } }),
  ]);

  return (
    <div className="admin-categories">
      <div className="admin-entete">
        <h1>Pierres ({pierres.length})</h1>
      </div>

      <div className="admin-categories__grille">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Description</th>
              <th>Couleur</th>
              <th>Bijoux associés</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pierres.map((p) => (
              <LignePierre key={p.id} pierre={p} couleurs={couleurs} />
            ))}
          </tbody>
        </table>

        <FormulairePierre couleurs={couleurs} />
      </div>

      {pierres.length === 0 && (
        <p style={{ color: 'var(--texte-secondaire)', fontStyle: 'italic', marginTop: '1rem' }}>
          Aucune pierre pour le moment. Créez vos premières pierres (Diamant, Émeraude, Onyx...).
        </p>
      )}
    </div>
  );
}
