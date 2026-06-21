import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { formaterPrix, LABELS_STATUT_COMMANDE } from '@/lib/utils';
import './dashboard.css';

export default async function PageDashboardAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');

  const il30Jours = new Date();
  il30Jours.setDate(il30Jours.getDate() - 30);

  const [
    nombreProduits,
    produitsStockBas,
    commandesRecentes,
    chiffreAffaires30j,
    demandesSurMesureNouvelles,
    messagesNouveaux,
  ] = await Promise.all([
    prisma.produit.count({ where: { actif: true } }),
    prisma.produit.findMany({
      where: { actif: true, stock: { lte: 3 } },
      select: { id: true, nom: true, stock: true },
      take: 6,
    }),
    prisma.commande.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
    prisma.commande.aggregate({
      where: { createdAt: { gte: il30Jours }, statut: { not: 'ANNULEE' } },
      _sum: { total: true },
    }),
    prisma.demandeSurMesure.count({ where: { statut: 'NOUVELLE' } }),
    prisma.messageContact.count({ where: { statut: 'NOUVEAU' } }),
  ]);

  return (
    <div className="admin-dashboard">
      <div className="admin-entete">
        <h1>Tableau de bord</h1>
      </div>

      <div className="admin-stat-grille">
        <div className="admin-stat">
          <div className="admin-stat__label">Chiffre d'affaires (30j)</div>
          <div className="admin-stat__valeur">{formaterPrix(chiffreAffaires30j._sum.total?.toNumber() ?? 0)}</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat__label">Bijoux actifs</div>
          <div className="admin-stat__valeur">{nombreProduits}</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat__label">Demandes sur-mesure</div>
          <div className="admin-stat__valeur">{demandesSurMesureNouvelles}</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat__label">Messages non lus</div>
          <div className="admin-stat__valeur">{messagesNouveaux}</div>
        </div>
      </div>

      <div className="admin-dashboard__grille">
        <div className="admin-carte">
          <h2>Dernières commandes</h2>
          {commandesRecentes.length === 0 ? (
            <p className="admin-dashboard__vide">Aucune commande pour le moment.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Numéro</th>
                  <th>Client</th>
                  <th>Statut</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {commandesRecentes.map((c) => (
                  <tr key={c.id}>
                    <td>{c.numero}</td>
                    <td>{c.clientNom}</td>
                    <td>{LABELS_STATUT_COMMANDE[c.statut]}</td>
                    <td>{formaterPrix(c.total.toString())}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <Link href="/admin/commandes" className="admin-dashboard__lien">
            Voir toutes les ventes →
          </Link>
        </div>

        <div className="admin-carte">
          <h2>Stock bas (≤ 3)</h2>
          {produitsStockBas.length === 0 ? (
            <p className="admin-dashboard__vide">Tous les stocks sont au bon niveau.</p>
          ) : (
            <ul className="admin-dashboard__liste-stock">
              {produitsStockBas.map((p) => (
                <li key={p.id}>
                  <Link href={`/admin/produits/${p.id}`}>{p.nom}</Link>
                  <span className="admin-badge admin-badge--danger">{p.stock} restant(s)</span>
                </li>
              ))}
            </ul>
          )}
          <Link href="/admin/stock" className="admin-dashboard__lien">
            Gérer le stock →
          </Link>
        </div>
      </div>
    </div>
  );
}
