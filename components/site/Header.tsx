'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePanierStore } from '@/lib/store-panier';
import './header.css';

const LIENS_NAV = [
  { href: '/', label: 'Accueil' },
  { href: '/la-maison', label: 'La Maison' },
  { href: '/collections', label: 'Collections' },
  { href: '/sur-mesure', label: 'Sur mesure' },
  { href: '/journal', label: 'Journal' },
  { href: '/contact', label: 'Contact' },
];

export default function Header() {
  const [menuOuvert, setMenuOuvert] = useState(false);
  const pathname = usePathname();
  const nombreArticles = usePanierStore((state) => state.nombreArticles());

  return (
    <header className="nabe-header">
      <div className="nabe-header__conteneur">
        <button
          className="nabe-header__burger"
          onClick={() => setMenuOuvert(!menuOuvert)}
          aria-label="Menu"
        >
          ☰
        </button>

        <Link href="/" className="nabe-header__logo">
          Nabe
        </Link>

        <nav className={`nabe-header__nav ${menuOuvert ? 'ouvert' : ''}`}>
          {LIENS_NAV.map((lien) => (
            <Link
              key={lien.href}
              href={lien.href}
              className={`nabe-header__lien ${pathname === lien.href ? 'actif' : ''}`}
              onClick={() => setMenuOuvert(false)}
            >
              {lien.label}
            </Link>
          ))}
        </nav>

        <div className="nabe-header__actions">
          <button className="nabe-header__icone" aria-label="Rechercher">
            🔍
          </button>
          <Link href="/panier" className="nabe-header__icone nabe-header__panier" aria-label="Panier">
            🛍️
            {nombreArticles > 0 && (
              <span className="nabe-header__badge">{nombreArticles}</span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
