import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authClientOptions } from '@/lib/auth-client';
import { prisma } from '@/lib/prisma';
import SuiviCommandeDetail from '@/components/site/SuiviCommandeDetail';
import '../../mon-compte.css';

export default async function PageDetailCommande({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = await paramsPromise;
  const session = await getServerSession(authClientOptions);
  if (!session?.user) redirect(`/connexion?redirect=/mon-compte/commandes/${params.id}`);

  const clientId = (session.user as any).id as string;

  const commande = await prisma.commande.findUnique({
    where: { id: params.id },
    include: { lignes: true },
  });

  if (!commande || commande.clientId !== clientId) notFound();

  return (
    <div className="page-mon-compte conteneur">
      <div className="mon-compte__entete">
        <Link href="/mon-compte/commandes" className="mon-compte__retour">
          ← Mes commandes
        </Link>
        <h1>Commande {commande.numero}</h1>
      </div>

      <SuiviCommandeDetail
        commande={{
          ...commande,
          sousTotal: commande.sousTotal.toString(),
          montantReduction: commande.montantReduction.toString(),
          fraisLivraison: commande.fraisLivraison.toString(),
          total: commande.total.toString(),
          lignes: commande.lignes.map((l: any) => ({ ...l, prixUnitaire: l.prixUnitaire.toString() })),
        }}
        modeAnnulation={{ type: 'connecte', commandeId: commande.id }}
      />
    </div>
  );
}
