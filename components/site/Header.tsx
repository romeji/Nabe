'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { usePanierStore } from '@/lib/store-panier';
import PanneauNavigation from './PanneauNavigation';
import PanneauRecherche from './PanneauRecherche';
import PopupPanier from './PopupPanier';
import './header.css';

export default function Header() {
  const [menuOuvert, setMenuOuvert] = useState(false);
  const [rechercheOuverte, setRechercheOuverte] = useState(false);
  const [panierOuvert, setPanierOuvert] = useState(false);
  const [aDefile, setADefile] = useState(false);
  const [monte, setMonte] = useState(false);
  const nombreArticles = usePanierStore((state) => state.nombreArticles());
  const { data: session } = useSession();

  useEffect(() => { setMonte(true); }, []);

  useEffect(() => {
    function gererScroll() { setADefile(window.scrollY > 20); }
    gererScroll();
    window.addEventListener('scroll', gererScroll, { passive: true });
    return () => window.removeEventListener('scroll', gererScroll);
  }, []);

  // Écoute l'événement global déclenché par la fiche produit après "Ajouter au panier"
  useEffect(() => {
    function ouvrirDepuisPage() { setPanierOuvert(true); }
    window.addEventListener('nabe:ouvrir-panier', ouvrirDepuisPage);
    return () => window.removeEventListener('nabe:ouvrir-panier', ouvrirDepuisPage);
  }, []);

  return (
    <>
      <header className={`nabe-header ${aDefile ? 'nabe-header--defile' : ''}`}>
        <div className="nabe-header__conteneur">
          <button className="nabe-header__burger" onClick={() => setMenuOuvert(true)} aria-label="Menu">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="nabe-header__svg">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <Link href="/" className="nabe-header__logo">Nabe</Link>

          <div className="nabe-header__actions">
            <button className="nabe-header__icone" aria-label="Rechercher" onClick={() => setRechercheOuverte(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="nabe-header__svg">
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>

            <Link href={monte && session?.user ? '/mon-compte' : '/connexion'} className="nabe-header__icone" aria-label="Mon compte">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="nabe-header__svg">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c0-4 3.5-7 8-7s8 3 8 7" />
              </svg>
            </Link>

            {/* Icône panier → ouvre la popup (plus de lien /panier) */}
            <button
              className="nabe-header__icone nabe-header__panier"
              aria-label="Panier"
              onClick={() => setPanierOuvert(true)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="nabe-header__svg">
                <path d="M6 8h12l-1 12H7L6 8z" />
                <path d="M9 8a3 3 0 0 1 6 0" />
              </svg>
              {monte && nombreArticles > 0 && (
                <span className="nabe-header__badge">{nombreArticles}</span>
              )}
            </button>
          </div>
        </div>

        <PanneauNavigation ouvert={menuOuvert} onFermer={() => setMenuOuvert(false)} />
        <PanneauRecherche ouvert={rechercheOuverte} onFermer={() => setRechercheOuverte(false)} />
      </header>

      {/* Popup panier globale, montée depuis le Header pour être disponible partout */}
      <PopupPanier ouverte={panierOuvert} onFermer={() => setPanierOuvert(false)} />
    </>
  );
}
