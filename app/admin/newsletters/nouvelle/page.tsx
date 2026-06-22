import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import FormulaireNewsletter from '@/components/admin/FormulaireNewsletter';

export default async function PageNouvelleNewsletter() {
  const session = await getServerSession(authOptions);
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
