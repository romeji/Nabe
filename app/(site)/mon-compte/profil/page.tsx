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

  // Compatibilité : si le compte a été créé avant l'ajout des champs
  // prénom/nom séparés, on les déduit du nom complet existant plutôt que
  // d'afficher des champs vides.
  const parties = (client.nom || '').trim().split(' ');
  const prenomAffiche = client.prenom || parties[0] || '';
  const nomAffiche = client.nomDeFamille || parties.slice(1).join(' ') || '';

  return (
    <div className="page-mon-compte conteneur">
      <div className="mon-compte__entete">
        <h1>Mon profil</h1>
      </div>
      <FormulaireProfilClient
        prenom={prenomAffiche}
        nomDeFamille={nomAffiche}
        email={client.email}
        telephone={client.telephone || ''}
        aUnMotDePasse={!!client.password}
      />
    </div>
  );
}
