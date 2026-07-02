import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authClientOptions } from '@/lib/auth-client';
import { prisma } from '@/lib/prisma';
import BoutonDeconnexionClient from '@/components/site/BoutonDeconnexionClient';
import './mon-compte.css';

export const metadata = { title: 'Mon compte' };

export default async function PageMonCompte() {
  const session = await getServerSession(authClientOptions);
  if (!session?.user) redirect('/connexion?redirect=/mon-compte');

  const clientId = (session.user as any).id as string;

  const [client, nombreFavoris, nombreCommandes, nombreAdresses] = await Promise.all([
    prisma.client.findUnique({ where: { id: clientId } }),
    prisma.favori.count({ where: { clientId } }),
    prisma.commande.count({ where: { clientId } }),
    prisma.adressePostale.count({ where: { clientId } }),
  ]);

  return (
    <div className="page-mon-compte conteneur">
      <div className="mon-compte__entete">
        <h1>Bonjour {client?.nom || ''} 👋</h1>
        <p>{client?.email}</p>
      </div>

      <div className="mon-compte__grille">
        <Link href="/mon-compte/commandes" className="mon-compte__carte">
          <span className="mon-compte__icone">📦</span>
          <h3>Mes commandes</h3>
          <p>{nombreCommandes} commande{nombreCommandes !== 1 ? 's' : ''}</p>
        </Link>
        <Link href="/mon-compte/favoris" className="mon-compte__carte">
          <span className="mon-compte__icone">♡</span>
          <h3>Mes favoris</h3>
          <p>{nombreFavoris} bijou{nombreFavoris !== 1 ? 'x' : ''}</p>
        </Link>
        <Link href="/mon-compte/adresses" className="mon-compte__carte">
          <span className="mon-compte__icone">📍</span>
          <h3>Mes adresses</h3>
          <p>{nombreAdresses} adresse{nombreAdresses !== 1 ? 's' : ''}</p>
        </Link>
        <Link href="/mon-compte/paiement" className="mon-compte__carte">
          <span className="mon-compte__icone">💳</span>
          <h3>Mes moyens de paiement</h3>
          <p>Gérer mes cartes</p>
        </Link>
        <Link href="/mon-compte/profil" className="mon-compte__carte">
          <span className="mon-compte__icone">⚙️</span>
          <h3>Mon profil</h3>
          <p>Informations personnelles</p>
        </Link>
      </div>

      <BoutonDeconnexionClient />
    </div>
  );
}
