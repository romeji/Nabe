import { verifierSessionAdmin } from '@/lib/auth-helpers';
import { redirect } from 'next/navigation';
import FormulaireProduit from '@/components/admin/FormulaireProduit';

export default async function PageNouveauProduit() {
  const session = await verifierSessionAdmin();
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
