import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authClientOptions } from '@/lib/auth-client';
import { prisma } from '@/lib/prisma';
import FormulaireProfilClient from '@/components/site/FormulaireProfilClient';
import '../mon-compte.css';

export const metadata = { title: 'Mon profil' };

export default async function PageProfil() {
  const session = await getServerSession(authClientOptions);
  if (!session?.user) redirect('/connexion?redirect=/mon-compte/profil');

  const clientId = (session.user as any).id as string;
  const client = await prisma.client.findUnique({ where: { id: clientId } });

  if (!client) redirect('/connexion');

  return (
    <div className="page-mon-compte conteneur">
      <div className="mon-compte__entete">
        <h1>Mon profil</h1>
      </div>
      <FormulaireProfilClient
        nom={client.nom || ''}
        email={client.email}
        telephone={client.telephone || ''}
        aUnMotDePasse={!!client.password}
      />
    </div>
  );
}
