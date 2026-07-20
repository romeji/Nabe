import { redirect, notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authClientOptions } from '@/lib/auth-client';
import { prisma } from '@/lib/prisma';
import { getConfigSite } from '@/lib/config-site';
import FactureCommande from '@/components/site/FactureCommande';

export const metadata = { title: 'Facture' };

export default async function PageFactureClient({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = await paramsPromise;
  const session = await getServerSession(authClientOptions);
  if (!session?.user) redirect(`/connexion?redirect=/mon-compte/commandes/${params.id}/facture`);

  const clientId = (session.user as any).id as string;

  const [commande, config] = await Promise.all([
    prisma.commande.findUnique({
      where: { id: params.id },
      include: { lignes: true },
    }),
    getConfigSite(),
  ]);

  if (!commande || commande.clientId !== clientId) notFound();

  return (
    <div style={{ padding: '2rem 1rem', background: 'var(--nabe-creme, #f7f1e8)', minHeight: '100vh' }}>
      <FactureCommande
        commande={{
          ...commande,
          sousTotal: commande.sousTotal.toString(),
          montantReduction: commande.montantReduction.toString(),
          fraisLivraison: commande.fraisLivraison.toString(),
          total: commande.total.toString(),
          lignes: commande.lignes.map((l) => ({ ...l, prixUnitaire: l.prixUnitaire.toString() })),
        }}
        identite={{
          nom: config.facturation_nom || 'Nabe',
          adresse: config.facturation_adresse || '',
          siret: config.facturation_siret || '',
          tvaApplicable: config.tva_applicable === 'true',
          tvaTaux: parseFloat(config.tva_taux) || 20,
        }}
      />
    </div>
  );
}
