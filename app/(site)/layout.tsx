import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';
import ProvidersClient from '@/components/site/ProvidersClient';
import PopupBienvenue from '@/components/site/PopupBienvenue';

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProvidersClient>
      <Header />
      <main>{children}</main>
      <Footer />
      <PopupBienvenue />
    </ProvidersClient>
  );
}
