import { getServerSession } from 'next-auth';
import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';
import ProvidersClient from '@/components/site/ProvidersClient';
import PopupBienvenue from '@/components/site/PopupBienvenue';
import ConsentementCookies from '@/components/site/ConsentementCookies';
import SuiviPageVue from '@/components/site/SuiviPageVue';
import { getConfigSite } from '@/lib/config-site';
import { authClientOptions } from '@/lib/auth-client';

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = await getConfigSite();
  // On récupère la session déjà validée côté serveur et on l'injecte dans le
  // SessionProvider : le Header n'a ainsi jamais besoin d'attendre un fetch
  // client pour connaître l'état de connexion, ce qui évite tout état
  // transitoire "non connecté" incohérent avec la réalité (ex: après avoir
  // navigué entre l'admin et le site dans le même navigateur).
  const session = await getServerSession(authClientOptions);

  return (
    <ProvidersClient session={session}>
      <SuiviPageVue />
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
