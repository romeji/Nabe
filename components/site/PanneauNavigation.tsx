'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import './panneau-navigation.css';

type ItemSimple = { id: string; nom: string; slug: string };

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
  const [categories, setCategories] = useState<ItemSimple[]>([]);
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
              {categories.map((c, index) => (
                <Link key={c.id} href={`/collections?categorie=${c.slug}`} className="panneau-nav__lien panneau-nav__lien--icone" onClick={onFermer}>
                  <span className={`panneau-nav__icone panneau-nav__icone--${iconesCategories[index] || 'bijou'}`} aria-hidden="true" />
                  <span>{c.nom}</span>
                </Link>
              ))}
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
              <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" aria-label="Instagram">IG</a>
              <a href="https://www.pinterest.com/" target="_blank" rel="noreferrer" aria-label="Pinterest">P</a>
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
