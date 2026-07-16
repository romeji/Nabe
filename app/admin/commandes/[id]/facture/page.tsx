import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getConfigSite } from '@/lib/config-site';
import FactureCommande from '@/components/site/FactureCommande';

export const metadata = { title: 'Facture' };

export default async function PageFactureAdmin({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');

  const params = await paramsPromise;
  const [commande, config] = await Promise.all([
    prisma.commande.findUnique({
      where: { id: params.id },
      include: { lignes: true },
    }),
    getConfigSite(),
  ]);

  if (!commande) notFound();

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
