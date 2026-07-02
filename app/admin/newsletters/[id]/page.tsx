import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import FormulaireNewsletter from '@/components/admin/FormulaireNewsletter';
import BoutonSupprimerNewsletter from '@/components/admin/BoutonSupprimerNewsletter';

export default async function PageEditionNewsletter({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');

  const [newsletter, nombreAbonnes] = await Promise.all([
    prisma.newsletter.findUnique({ where: { id: params.id } }),
    prisma.abonneNewsletter.count(),
  ]);

  if (!newsletter) notFound();

  return (
    <div>
      <div className="admin-entete">
        <h1>{newsletter.statut === 'ENVOYEE' ? 'Newsletter envoyée' : 'Modifier la newsletter'}</h1>
        {newsletter.statut !== 'ENVOYEE' && <BoutonSupprimerNewsletter newsletterId={newsletter.id} />}
      </div>
      <FormulaireNewsletter
        newsletterInitiale={{
          id: newsletter.id,
          sujet: newsletter.sujet,
          contenu: newsletter.contenu,
          statut: newsletter.statut,
          nombreDestinataires: newsletter.nombreDestinataires,
          envoyeeLe: newsletter.envoyeeLe?.toISOString() || null,
        }}
        nombreAbonnes={nombreAbonnes}
      />
    </div>
  );
}
