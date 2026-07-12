import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formaterPrix } from '@/lib/utils';
import StatutCommandeSelect from '@/components/admin/StatutCommandeSelect';
import './commandes.css';

const PAR_PAGE = 50;

export default async function PageAdminCommandes({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');

  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam || '1', 10) || 1);

  const [commandes, total] = await Promise.all([
    prisma.commande.findMany({
      include: { lignes: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAR_PAGE,
      take: PAR_PAGE,
    }),
    prisma.commande.count(),
  ]);

  const nombrePages = Math.max(1, Math.ceil(total / PAR_PAGE));

  return (
    <div className="admin-commandes">
      <div className="admin-entete">
        <h1>Ventes ({total})</h1>
      </div>

      <div className="admin-table-scroll"><table className="admin-table">
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
          {commandes.map((c: any) => (
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
      </table></div>

      {commandes.length === 0 && (
        <p className="admin-commandes__vide">Aucune vente pour le moment.</p>
      )}

      {nombrePages > 1 && (
        <div className="admin-pagination">
          {page > 1 && <Link href={`/admin/commandes?page=${page - 1}`}>← Précédent</Link>}
          <span>Page {page} / {nombrePages}</span>
          {page < nombrePages && <Link href={`/admin/commandes?page=${page + 1}`}>Suivant →</Link>}
        </div>
      )}
    </div>
  );
}
