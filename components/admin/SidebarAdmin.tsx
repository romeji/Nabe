'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import './sidebar.css';

const LIENS = [
  { href: '/admin', label: 'Tableau de bord', icone: '📊' },
  { href: '/admin/produits', label: 'Bijoux', icone: '💍' },
  { href: '/admin/categories', label: 'Catégories', icone: '🏷️' },
  { href: '/admin/stock', label: 'Stock', icone: '📦' },
  { href: '/admin/commandes', label: 'Ventes', icone: '🛍️' },
  { href: '/admin/sur-mesure', label: 'Sur-mesure', icone: '✏️' },
  { href: '/admin/messages', label: 'Messages', icone: '✉️' },
  { href: '/admin/contenu', label: 'Contenu du site', icone: '🖊️' },
];

export default function SidebarAdmin() {
  const pathname = usePathname();

  return (
    <aside className="admin-sidebar">
      <Link href="/admin" className="admin-sidebar__logo">
        Nabe
      </Link>
      <nav className="admin-sidebar__nav">
        {LIENS.map((lien) => {
          const actif = pathname === lien.href || (lien.href !== '/admin' && pathname?.startsWith(lien.href));
          return (
            <Link key={lien.href} href={lien.href} className={`admin-sidebar__lien ${actif ? 'actif' : ''}`}>
              <span>{lien.icone}</span> {lien.label}
            </Link>
          );
        })}
      </nav>
      <div className="admin-sidebar__bas">
        <Link href="/" className="admin-sidebar__lien" target="_blank">
          <span>🌐</span> Voir le site
        </Link>
        <button onClick={() => signOut({ callbackUrl: '/admin/login' })} className="admin-sidebar__deconnexion">
          <span>🚪</span> Déconnexion
        </button>
      </div>
    </aside>
  );
}
