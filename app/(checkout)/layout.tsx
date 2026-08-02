import type { Metadata } from 'next';
import Link from 'next/link';
import ProvidersClient from '@/components/site/ProvidersClient';
import NotificationsApp from '@/components/site/NotificationsApp';
import { getConfigSite } from '@/lib/config-site';
import './checkout-layout.css';

export const metadata: Metadata = {
  applicationName: 'Nabe',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'Nabe',
    statusBarStyle: 'default',
  },
  icons: {
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
};

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
