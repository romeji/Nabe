import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formaterPrix } from '@/lib/utils';
import StatutCommandeSelect from '@/components/admin/StatutCommandeSelect';
import './commandes.css';

export default async function PageAdminCommandes() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');

  const commandes = await prisma.commande.findMany({
    include: { lignes: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="admin-commandes">
      <div className="admin-entete">
        <h1>Ventes ({commandes.length})</h1>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Numéro</th>
            <th>Date</th>
            <th>Client</th>
            <th>Articles</th>
            <th>Total</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody>
          {commandes.map((c) => (
            <tr key={c.id}>
              <td>{c.numero}</td>
              <td>{new Date(c.createdAt).toLocaleDateString('fr-FR')}</td>
              <td>
                {c.clientNom}
                <br />
                <span className="admin-commandes__email">{c.clientEmail}</span>
              </td>
              <td>{c.lignes.length}</td>
              <td>{formaterPrix(c.total.toString())}</td>
              <td>
                <StatutCommandeSelect commandeId={c.id} statutInitial={c.statut} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {commandes.length === 0 && (
        <p className="admin-commandes__vide">Aucune vente pour le moment.</p>
      )}
    </div>
  );
}
