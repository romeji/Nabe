import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authClientOptions } from '@/lib/auth-client';
import GestionPaiementClient from '@/components/site/GestionPaiementClient';
import '../mon-compte.css';

export const metadata = { title: 'Mes moyens de paiement' };

export default async function PagePaiement() {
  const session = await getServerSession(authClientOptions);
  if (!session?.user) redirect('/connexion?redirect=/mon-compte/paiement');

  return (
    <div className="page-mon-compte conteneur">
      <div className="mon-compte__entete">
        <h1>Mes moyens de paiement</h1>
        <p>
          Vos cartes sont stockées de façon sécurisée par Stripe. Nous ne conservons jamais vos
          numéros de carte sur nos serveurs.
        </p>
      </div>
      <GestionPaiementClient />
    </div>
  );
}
