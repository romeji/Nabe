import { verifierSessionAdmin } from '@/lib/auth-helpers';
import { redirect } from 'next/navigation';
import PromotionsClient from '@/components/admin/PromotionsClient';
import './promotions.css';

export default async function PageAdminPromotions() {
  const session = await verifierSessionAdmin();
  if (!session) redirect('/admin/login');

  return (
    <div className="admin-promotions">
      <div className="admin-entete">
        <h1>Promotions</h1>
        <p className="admin-promotions__sous-titre">
          Définissez un prix promotionnel pour chaque bijou. Le prix barré s'affiche automatiquement sur le site
          tant que la promotion est active.
        </p>
      </div>
      <PromotionsClient />
    </div>
  );
}
