import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import Providers from '@/components/admin/Providers';
import SidebarAdmin from '@/components/admin/SidebarAdmin';
import './admin.css';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Le middleware (middleware.ts) protège déjà toutes les pages /admin/* sauf
  // /admin/login, donc si on arrive ici sans session c'est qu'on est forcément
  // sur la page de login : on affiche alors le contenu sans sidebar.
  if (!session) {
    return <Providers>{children}</Providers>;
  }

  return (
    <Providers>
      <div className="admin-layout">
        <SidebarAdmin />
        <main className="admin-layout__contenu">{children}</main>
      </div>
    </Providers>
  );
}
