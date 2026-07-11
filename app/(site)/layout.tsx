import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';
import ProvidersClient from '@/components/site/ProvidersClient';
import PopupBienvenue from '@/components/site/PopupBienvenue';
import ConsentementCookies from '@/components/site/ConsentementCookies';
import { getConfigSite } from '@/lib/config-site';

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = await getConfigSite();

  return (
    <ProvidersClient>
      <Header />
      <main>{children}</main>
      <Footer />
      <PopupBienvenue />
      <ConsentementCookies
        googleAnalyticsActif={config.google_analytics_actif === 'true'}
        googleAnalyticsId={config.google_analytics_id || ''}
      />
    </ProvidersClient>
  );
}
