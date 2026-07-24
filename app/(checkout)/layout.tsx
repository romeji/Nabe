import Link from 'next/link';
import ProvidersClient from '@/components/site/ProvidersClient';
import NotificationsApp from '@/components/site/NotificationsApp';
import { getConfigSite } from '@/lib/config-site';
import './checkout-layout.css';

export default async function CheckoutLayout({ children }: { children: React.ReactNode }) {
  const config = await getConfigSite();

  return (
    <ProvidersClient>
      <NotificationsApp actif={config.notifications_app_actif === 'true'} />
      <div className="checkout-layout">
        <header className="checkout-layout__entete">
          <Link href="/" className="checkout-layout__logo">Nabe</Link>
        </header>
        <main>{children}</main>
      </div>
    </ProvidersClient>
  );
}
