import { verifierSessionAdmin } from '@/lib/auth-helpers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import FormulaireNewsletter from '@/components/admin/FormulaireNewsletter';

export default async function PageNouvelleNewsletter() {
  const session = await verifierSessionAdmin();
  if (!session) redirect('/admin/login');

  const nombreAbonnes = await prisma.abonneNewsletter.count();

  return (
    <div>
      <div className="admin-entete">
        <h1>Rédiger une newsletter</h1>
      </div>
      <FormulaireNewsletter nombreAbonnes={nombreAbonnes} />
    </div>
  );
}
