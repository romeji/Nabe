'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import './panneau-navigation.css';

type ItemSimple = { id: string; nom: string; slug: string };
type CategorieItem = ItemSimple & { logoAccueil?: string | null; image?: string | null };

type MenuConfig = {
  categoriesActif: boolean;
  collectionsActif: boolean;
  pagesActif: boolean;
  aideActif: boolean;
};

const iconesCategories = ['bagues', 'colliers', 'boucles', 'bracelets', 'diamant', 'cadeau'];

export default function PanneauNavigation({
  ouvert,
  onFermer,
}: {
  ouvert: boolean;
  onFermer: () => void;
}) {
  const [categories, setCategories] = useState<CategorieItem[]>([]);
  const [collections, setCollections] = useState<ItemSimple[]>([]);
  const [journalActif, setJournalActif] = useState(false);
  const [menu, setMenu] = useState<MenuConfig>({
    categoriesActif: true,
    collectionsActif: true,
    pagesActif: true,
    aideActif: true,
  });
  const [monte, setMonte] = useState(false);

  useEffect(() => setMonte(true), []);

  useEffect(() => {
    if (!ouvert) return;

    const overflowInitial = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = overflowInitial;
    };
  }, [ouvert]);

  useEffect(() => {
    if (!ouvert) return;

    function fermerAvecEchap(e: KeyboardEvent) {
      if (e.key === 'Escape') onFermer();
    }

    window.addEventListener('keydown', fermerAvecEchap);
    return () => window.removeEventListener('keydown', fermerAvecEchap);
  }, [ouvert, onFermer]);

  useEffect(() => {
    if (ouvert && categories.length === 0 && collections.length === 0) {
      fetch('/api/menu')
        .then((res) => res.json())
        .then((data) => {
          setCategories(data.categories || []);
          setCollections(data.collections || []);
          setJournalActif(!!data.journalActif);
          setMenu((actuel) => ({ ...actuel, ...(data.menu || {}) }));
        })
        .catch(() => {});
    }
  }, [ouvert, categories.length, collections.length]);

  if (!ouvert || !monte) return null;

  return createPortal(
    <div className="panneau-nav__overlay" role="presentation" onClick={(e) => e.stopPropagation()}>
      <div className="panneau-nav" onClick={(e) => e.stopPropagation()}>
        <div className="panneau-nav__entete">
          <button className="panneau-nav__fermer" onClick={onFermer} aria-label="Fermer le menu">
            &times;
          </button>
        </div>

        <div className="panneau-nav__corps">
          {menu.categoriesActif && (
            <section className="panneau-nav__section">
              <h3>Collections</h3>
              {categories.map((c, index) => {
                const logo = c.logoAccueil || c.image;
                return (
                  <Link key={c.id} href={`/collections?categorie=${c.slug}`} className="panneau-nav__lien panneau-nav__lien--icone" onClick={onFermer}>
                    {logo ? (
                      <img src={logo} alt="" className="panneau-nav__icone panneau-nav__icone--logo" aria-hidden="true" />
                    ) : (
                      <span className={`panneau-nav__icone panneau-nav__icone--${iconesCategories[index] || 'bijou'}`} aria-hidden="true" />
                    )}
                    <span>{c.nom}</span>
                  </Link>
                );
              })}
            </section>
          )}

          {menu.collectionsActif && collections.length > 0 && (
            <section className="panneau-nav__section">
              <h3>Collections</h3>
              {collections.map((c) => (
                <Link key={c.id} href={`/collections?collection=${c.slug}`} className="panneau-nav__lien" onClick={onFermer}>
                  <span>{c.nom}</span>
                </Link>
              ))}
            </section>
          )}

          {menu.pagesActif && (
            <section className="panneau-nav__section">
              <h3>&Agrave; propos</h3>
              <Link href="/mon-histoire" className="panneau-nav__lien" onClick={onFermer}>Mon Histoire</Link>
              <Link href="/artisanat" className="panneau-nav__lien" onClick={onFermer}>Artisanat</Link>
              <Link href="/engagements" className="panneau-nav__lien" onClick={onFermer}>Engagements</Link>
              {journalActif && <Link href="/journal" className="panneau-nav__lien" onClick={onFermer}>Journal</Link>}
            </section>
          )}

          {menu.aideActif && (
            <section className="panneau-nav__section">
              <h3>Aide &amp; infos</h3>
              <Link href="/livraison-retours" className="panneau-nav__lien" onClick={onFermer}>Livraison &amp; Retours</Link>
              <Link href="/paiement-securise" className="panneau-nav__lien" onClick={onFermer}>Paiement s&eacute;curis&eacute;</Link>
              <Link href="/faq" className="panneau-nav__lien" onClick={onFermer}>FAQ</Link>
              <Link href="/contact" className="panneau-nav__lien" onClick={onFermer}>Contact</Link>
            </section>
          )}

          <Link href="/mon-histoire" className="panneau-nav__histoire" onClick={onFermer}>
            <span>Chaque bijou<br />raconte une <em>histoire.</em></span>
            <strong>D&eacute;couvrir mon histoire</strong>
          </Link>

          <div className="panneau-nav__pied">
            <div className="panneau-nav__sociaux" aria-label="R&eacute;seaux sociaux">
              <a href="https://www.instagram.com/nabe.bijoux/" target="_blank" rel="noreferrer noopener" aria-label="Instagram">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4.2" />
                  <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
                </svg>
              </a>
              <a href="https://www.tiktok.com/@nabe.bijoux" target="_blank" rel="noreferrer noopener" aria-label="TikTok">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                  <path d="M16.6 3c.3 2 1.6 3.6 3.6 3.9v2.7c-1.3.1-2.6-.3-3.6-1v6.4a5.4 5.4 0 1 1-5.4-5.4c.3 0 .5 0 .8.1v2.8a2.6 2.6 0 1 0 2 2.5V3h2.6z" />
                </svg>
              </a>
            </div>
            <Link href="/mon-compte" className="panneau-nav__compte" onClick={onFermer}>
              <span>Mon compte</span>
              <span className="panneau-nav__compte-icone" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
