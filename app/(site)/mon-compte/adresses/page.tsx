import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authClientOptions } from '@/lib/auth-client';
import GestionAdressesClient from '@/components/site/GestionAdressesClient';
import '../mon-compte.css';

export const metadata = { title: 'Mes adresses' };

export default async function PageAdresses() {
  const session = await getServerSession(authClientOptions);
  if (!session?.user) redirect('/connexion?redirect=/mon-compte/adresses');

  return (
    <div className="page-mon-compte conteneur">
      <div className="mon-compte__entete">
        <h1>Mes adresses</h1>
        <p>Gérez vos adresses de livraison.</p>
      </div>
      <GestionAdressesClient />
    </div>
  );
}
