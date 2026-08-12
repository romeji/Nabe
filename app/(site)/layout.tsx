import type { Metadata } from 'next';
import { Suspense } from 'react';
import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';
import ProvidersClient from '@/components/site/ProvidersClient';
import PopupBienvenue from '@/components/site/PopupBienvenue';
import ConsentementCookies from '@/components/site/ConsentementCookies';
import SuiviPageVue from '@/components/site/SuiviPageVue';
import NotificationsApp from '@/components/site/NotificationsApp';
import AnimationsSite from '@/components/site/AnimationsSite';
import { getConfigSite } from '@/lib/config-site';

export const revalidate = 60;

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

async function ServicesConfigures() {
  const config = await getConfigSite();

  return (
    <>
      <NotificationsApp actif={config.notifications_app_actif === 'true'} />
      <ConsentementCookies
        googleAnalyticsActif={config.google_analytics_actif === 'true'}
        googleAnalyticsId={config.google_analytics_id || ''}
        googleTagManagerId={process.env.NEXT_PUBLIC_GTM_ID || ''}
      />
    </>
  );
}

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProvidersClient>
      <SuiviPageVue />
      <AnimationsSite />
      <Header />
      <main>{children}</main>
      <Footer />
      <PopupBienvenue />
      <Suspense fallback={null}>
        <ServicesConfigures />
      </Suspense>
    </ProvidersClient>
  );
}
