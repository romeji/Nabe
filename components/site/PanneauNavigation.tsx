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
    <div className="panneau-nav__overlay" onClick={onFermer}>
      <div className="panneau-nav" onClick={(e) => e.stopPropagation()}>
        <div className="panneau-nav__entete">
          <button className="panneau-nav__fermer" onClick={onFermer} aria-label="Fermer le menu">
            &times;
          </button>
        </div>

        <div className="panneau-nav__corps">
          {menu.categoriesActif && (
            <section className="panneau-nav__section">
              <h3>Cat&eacute;gories</h3>
              <Link href="/collections" onClick={onFermer}>
                TOUS LES BIJOUX
              </Link>
              {categories.map((c) => (
                <Link key={c.id} href={`/collections?categorie=${c.slug}`} onClick={onFermer}>
                  {c.nom.toUpperCase()}
                </Link>
              ))}
            </section>
          )}

          {menu.collectionsActif && collections.length > 0 && (
            <section className="panneau-nav__section">
              <h3>Collections</h3>
              {collections.map((c) => (
                <Link key={c.id} href={`/collections?collection=${c.slug}`} onClick={onFermer}>
                  {c.nom.toUpperCase()}
                </Link>
              ))}
            </section>
          )}

          {menu.pagesActif && (
            <section className="panneau-nav__section">
              <h3>&Agrave; propos</h3>
              <Link href="/la-maison" onClick={onFermer}>L'ATELIER</Link>
              <Link href="/mon-histoire" onClick={onFermer}>MON HISTOIRE</Link>
              <Link href="/artisanat" onClick={onFermer}>ARTISANAT</Link>
              <Link href="/engagements" onClick={onFermer}>ENGAGEMENTS</Link>
              <Link href="/sur-mesure" onClick={onFermer}>SUR MESURE</Link>
              {journalActif && <Link href="/journal" onClick={onFermer}>JOURNAL</Link>}
            </section>
          )}

          {menu.aideActif && (
            <section className="panneau-nav__section">
              <h3>Aide &amp; infos</h3>
              <Link href="/livraison-retours" onClick={onFermer}>LIVRAISON &amp; RETOURS</Link>
              <Link href="/paiement-securise" onClick={onFermer}>PAIEMENT S&Eacute;CURIS&Eacute;</Link>
              <Link href="/faq" onClick={onFermer}>FAQ</Link>
              <Link href="/contact" onClick={onFermer}>CONTACT</Link>
            </section>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
