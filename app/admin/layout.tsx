import type { Metadata, Viewport } from 'next';
import { verifierSessionAdmin } from '@/lib/auth-helpers';
import { redirect } from 'next/navigation';
import Providers from '@/components/admin/Providers';
import SidebarAdmin from '@/components/admin/SidebarAdmin';
import './admin.css';

export const metadata: Metadata = {
  title: {
    default: 'Administration',
    template: '%s | Nabe Admin',
  },
  applicationName: 'Nabe Admin',
  manifest: '/admin/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'Nabe Admin',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    apple: [{ url: '/icons/apple-touch-icon-dark.png', sizes: '180x180', type: 'image/png' }],
  },
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  themeColor: '#171310',
  colorScheme: 'light',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await verifierSessionAdmin();

  // Le middleware (middleware.ts) protège déjà toutes les pages /admin/* sauf
  // /admin/login, donc si on arrive ici sans session c'est qu'on est forcément
  // sur la page de login : on affiche alors le contenu sans sidebar.
  if (!session) {
    return <Providers session={session}>{children}</Providers>;
  }

  return (
    <Providers session={session}>
      <div className="admin-layout">
        <SidebarAdmin />
        <main className="admin-layout__contenu">{children}</main>
      </div>
    </Providers>
  );
}
