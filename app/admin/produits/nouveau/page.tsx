import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import FormulaireProduit from '@/components/admin/FormulaireProduit';

export default async function PageNouveauProduit() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');

  return (
    <div>
      <div className="admin-entete">
        <h1>Ajouter un bijou</h1>
      </div>
      <FormulaireProduit />
    </div>
  );
}
