import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getServerSession } from 'next-auth';
import { authClientOptions } from '@/lib/auth-client';
import { prisma } from '@/lib/prisma';
import { formaterPrix } from '@/lib/utils';
import BoutonFavori from '@/components/site/BoutonFavori';
import '../mon-compte.css';
import './favoris.css';

export const metadata = { title: 'Mes favoris' };

export default async function PageFavoris() {
  const session = await getServerSession(authClientOptions);
  if (!session?.user) redirect('/connexion?redirect=/mon-compte/favoris');

  const clientId = (session.user as any).id as string;

  const favoris = await prisma.favori.findMany({
    where: { clientId },
    include: {
      produit: { include: { images: { orderBy: { ordre: 'asc' }, take: 1 } } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="page-mon-compte conteneur">
      <div className="mon-compte__entete">
        <h1>Mes favoris</h1>
        <p>Retrouvez ici les bijoux que vous avez aimés.</p>
      </div>

      {favoris.length === 0 ? (
        <p className="favoris-vide">
          Vous n'avez pas encore de favoris. Parcourez nos <Link href="/collections">collections</Link> et
          cliquez sur le cœur pour les retrouver ici.
        </p>
      ) : (
        <div className="favoris-grille">
          {favoris.map((f: any) => (
            <div key={f.id} className="favoris-carte">
              <Link href={`/collections/${f.produit.slug}`} className="favoris-carte__image">
                {f.produit.images[0] ? (
                  <Image src={f.produit.images[0].url} alt={f.produit.nom} width={280} height={280} />
                ) : (
                  <div className="favoris-carte__placeholder" />
                )}
              </Link>
              <BoutonFavori produitId={f.produitId} initialementFavori className="favoris-carte__coeur" />
              <Link href={`/collections/${f.produit.slug}`}>
                <h3>{f.produit.nom}</h3>
                <span>{formaterPrix(f.produit.prix.toString())}</span>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
