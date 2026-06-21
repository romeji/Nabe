import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import DemandeSurMesureCarte from '@/components/admin/DemandeSurMesureCarte';
import './sur-mesure.css';

export default async function PageAdminSurMesure() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');

  const demandes = await prisma.demandeSurMesure.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="admin-sur-mesure">
      <div className="admin-entete">
        <h1>Demandes sur-mesure ({demandes.length})</h1>
      </div>

      <div className="admin-sur-mesure__liste">
        {demandes.map((d) => (
          <DemandeSurMesureCarte
            key={d.id}
            demande={{
              id: d.id,
              modeleSelectionne: d.modeleSelectionne,
              tailleSouhaitee: d.tailleSouhaitee,
              matiere: d.matiere,
              pierre: d.pierre,
              gravure: d.gravure,
              message: d.message,
              nom: d.nom,
              email: d.email,
              telephone: d.telephone,
              statut: d.statut,
              notesAdmin: d.notesAdmin,
              createdAt: d.createdAt.toISOString(),
            }}
          />
        ))}
      </div>

      {demandes.length === 0 && (
        <p className="admin-sur-mesure__vide">Aucune demande sur-mesure pour le moment.</p>
      )}
    </div>
  );
}
