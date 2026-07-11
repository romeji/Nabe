import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authClientOptions } from '@/lib/auth-client';
import { prisma } from '@/lib/prisma';
import { formaterPrix, LABELS_STATUT_COMMANDE } from '@/lib/utils';
import '../mon-compte.css';
import './commandes.css';

export const metadata = { title: 'Mes commandes' };

export default async function PageCommandesClient() {
  const session = await getServerSession(authClientOptions);
  if (!session?.user) redirect('/connexion?redirect=/mon-compte/commandes');

  const clientId = (session.user as any).id as string;

  const commandes = await prisma.commande.findMany({
    where: { clientId },
    include: { lignes: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="page-mon-compte conteneur">
      <div className="mon-compte__entete">
        <h1>Mes commandes</h1>
      </div>

      {commandes.length === 0 ? (
        <p className="commandes-client-vide">
          Vous n'avez pas encore passé de commande. Découvrez nos{' '}
          <Link href="/collections">collections</Link>.
        </p>
      ) : (
        <div className="commandes-client-liste">
          {commandes.map((c: any) => (
            <Link key={c.id} href={`/mon-compte/commandes/${c.id}`} className="commandes-client-carte">
              <div className="commandes-client-carte__entete">
                <div>
                  <strong>{c.numero}</strong>
                  <span>{new Date(c.createdAt).toLocaleDateString('fr-FR')}</span>
                </div>
                <span className="admin-badge admin-badge--neutre">{LABELS_STATUT_COMMANDE[c.statut]}</span>
              </div>
              <ul>
                {c.lignes.map((l: any) => (
                  <li key={l.id}>
                    {l.quantite} × {l.nomProduit}
                    {l.taille ? ` (taille ${l.taille})` : ''}
                  </li>
                ))}
              </ul>
              <div className="commandes-client-carte__total">
                Total : {formaterPrix(c.total.toString())}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
