import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import './newsletters.css';

export default async function PageAdminNewsletters() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');

  const [newsletters, nombreAbonnes] = await Promise.all([
    prisma.newsletter.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.abonneNewsletter.count(),
  ]);

  return (
    <div className="admin-newsletters">
      <div className="admin-entete">
        <h1>Newsletters</h1>
        <Link href="/admin/newsletters/nouvelle" className="btn btn-primaire">
          + Rédiger une newsletter
        </Link>
      </div>

      <div className="admin-newsletters__bandeau">
        <span>📬</span>
        <p>
          <strong>{nombreAbonnes}</strong> {nombreAbonnes === 1 ? 'personne est inscrite' : 'personnes sont inscrites'} à
          la newsletter (via le formulaire en bas de la page d'accueil).
        </p>
      </div>

      {newsletters.length === 0 ? (
        <p className="admin-newsletters__vide">
          Aucune newsletter pour le moment. Cliquez sur « Rédiger une newsletter » pour créer votre
          première campagne.
        </p>
      ) : (
        <div className="admin-table-scroll"><table className="admin-table">
          <thead>
            <tr>
              <th>Sujet</th>
              <th>Statut</th>
              <th>Destinataires</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {newsletters.map((n) => (
              <tr key={n.id}>
                <td>{n.sujet}</td>
                <td>
                  <span className={`admin-badge ${n.statut === 'ENVOYEE' ? 'admin-badge--succes' : 'admin-badge--neutre'}`}>
                    {n.statut === 'ENVOYEE' ? 'Envoyée' : 'Brouillon'}
                  </span>
                </td>
                <td>{n.statut === 'ENVOYEE' ? n.nombreDestinataires : '—'}</td>
                <td>
                  {n.statut === 'ENVOYEE' && n.envoyeeLe
                    ? new Date(n.envoyeeLe).toLocaleDateString('fr-FR')
                    : new Date(n.createdAt).toLocaleDateString('fr-FR')}
                </td>
                <td>
                  <Link href={`/admin/newsletters/${n.id}`} className="admin-btn-icone">
                    {n.statut === 'ENVOYEE' ? 'Consulter' : 'Modifier'}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table></div>
      )}
    </div>
  );
}
