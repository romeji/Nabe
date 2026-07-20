import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formaterPrix, LABELS_TYPE_BIJOU, LABELS_DISPONIBILITE } from '@/lib/utils';
import './produits.css';

export default async function PageAdminProduits() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');

  const produits = await prisma.produit.findMany({
    include: { images: { orderBy: { ordre: 'asc' }, take: 1 }, categorie: true, matiere: true, pierres: { include: { pierre: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="admin-produits">
      <div className="admin-entete">
        <h1>Bijoux ({produits.length})</h1>
        <Link href="/admin/produits/nouveau" className="btn btn-primaire">
          + Ajouter un bijou
        </Link>
      </div>

      <div className="admin-table-scroll"><table className="admin-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Référence</th>
            <th>Nom</th>
            <th>Type</th>
            <th>Catégorie</th>
            <th>Matière</th>
            <th>Prix</th>
            <th>Stock</th>
            <th>Disponibilité</th>
            <th>Statut</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {produits.map((p: any) => (
            <tr key={p.id}>
              <td>
                {p.images[0] ? (
                  <img src={p.images[0].url} alt={p.nom} className="admin-produits__miniature" />
                ) : (
                  <div className="admin-produits__miniature-vide" />
                )}
              </td>
              <td>
                <span style={{ fontSize: '0.78rem', color: 'var(--texte-secondaire)' }}>{p.reference}</span>
              </td>
              <td>{p.nom}</td>
              <td>{LABELS_TYPE_BIJOU[p.type]}</td>
              <td>{p.categorie?.nom || '—'}</td>
              <td>{p.matiere?.nom || '—'}</td>
              <td>{formaterPrix(p.prix.toString())}</td>
              <td>
                <span className={`admin-badge ${p.stock <= 3 ? 'admin-badge--danger' : 'admin-badge--succes'}`}>
                  {p.stock}
                </span>
              </td>
              <td>{LABELS_DISPONIBILITE[p.disponibilite]}</td>
              <td>
                <span className={`admin-badge ${p.actif ? 'admin-badge--succes' : 'admin-badge--neutre'}`}>
                  {p.actif ? 'En ligne' : 'Masqué'}
                </span>
              </td>
              <td>
                <Link href={`/admin/produits/${p.id}`} className="admin-btn-icone">
                  Modifier
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table></div>

      {produits.length === 0 && (
        <p className="admin-produits__vide">Aucun bijou pour le moment. Ajoutez votre première création !</p>
      )}
    </div>
  );
}
