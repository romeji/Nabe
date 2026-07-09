'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import './sidebar.css';

const LIENS = [
  { href: '/admin', label: 'Tableau de bord', icone: '📊' },
  { href: '/admin/produits', label: 'Bijoux', icone: '💍' },
  { href: '/admin/promotions', label: 'Promotions', icone: '💸' },
  { href: '/admin/categories', label: 'Catégories', icone: '🏷️' },
  { href: '/admin/collections', label: 'Collections', icone: '✨' },
  { href: '/admin/matieres', label: 'Matières', icone: '⚜️' },
  { href: '/admin/pierres', label: 'Pierres & Couleurs', icone: '💎' },
  { href: '/admin/stock', label: 'Stock', icone: '📦' },
  { href: '/admin/commandes', label: 'Ventes', icone: '🛍️' },
  { href: '/admin/sur-mesure', label: 'Sur-mesure', icone: '✏️' },
  { href: '/admin/messages', label: 'Messages', icone: '✉️' },
  { href: '/admin/contenu', label: 'Contenu du site', icone: '🖊️' },
  { href: '/admin/newsletters', label: 'Newsletters', icone: '📬' },
  { href: '/admin/codes-promo', label: 'Codes promo', icone: '🎁' },
  { href: '/admin/temoignages', label: 'Témoignages', icone: '💬' },
  { href: '/admin/reglages', label: 'Réglages', icone: '⚙️' },
];

export default function SidebarAdmin() {
  const pathname = usePathname();
  const [ouvert, setOuvert] = useState(false);

  // Ferme le menu mobile automatiquement à chaque changement de page
  useEffect(() => {
    setOuvert(false);
  }, [pathname]);

  return (
    <>
      <div className="admin-sidebar__barre-mobile">
        <Link href="/admin" className="admin-sidebar__logo admin-sidebar__logo--mobile">
          Nabe
        </Link>
        <button
          className="admin-sidebar__burger"
          onClick={() => setOuvert(!ouvert)}
          aria-label="Menu d'administration"
        >
          {ouvert ? '✕' : '☰'}
        </button>
      </div>

      <aside className={`admin-sidebar ${ouvert ? 'admin-sidebar--ouvert' : ''}`}>
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

      {ouvert && <div className="admin-sidebar__overlay" onClick={() => setOuvert(false)} />}
    </>
  );
}
