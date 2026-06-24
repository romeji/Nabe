'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import './panneau-navigation.css';

type ItemSimple = { id: string; nom: string; slug: string };

export default function PanneauNavigation({
  ouvert,
  onFermer,
}: {
  ouvert: boolean;
  onFermer: () => void;
}) {
  const [categories, setCategories] = useState<ItemSimple[]>([]);
  const [collections, setCollections] = useState<ItemSimple[]>([]);
  const [monte, setMonte] = useState(false);

  useEffect(() => setMonte(true), []);

  useEffect(() => {
    if (ouvert && categories.length === 0 && collections.length === 0) {
      fetch('/api/menu')
        .then((res) => res.json())
        .then((data) => {
          setCategories(data.categories || []);
          setCollections(data.collections || []);
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
            ✕
          </button>
        </div>

        <div className="panneau-nav__corps">
          <h3>Catégories</h3>
          <hr />
          <Link href="/collections" onClick={onFermer}>
            TOUS LES BIJOUX
          </Link>
          {categories.map((c) => (
            <Link key={c.id} href={`/collections?categorie=${c.slug}`} onClick={onFermer}>
              {c.nom.toUpperCase()}
            </Link>
          ))}

          {collections.length > 0 && (
            <>
              <h3>Collections</h3>
              <hr />
              {collections.map((c) => (
                <Link key={c.id} href={`/collections?collection=${c.slug}`} onClick={onFermer}>
                  {c.nom.toUpperCase()}
                </Link>
              ))}
            </>
          )}

          <h3>Pages</h3>
          <hr />
          <Link href="/la-maison" onClick={onFermer}>LA MAISON</Link>
          <Link href="/sur-mesure" onClick={onFermer}>SUR MESURE</Link>
          <Link href="/journal" onClick={onFermer}>JOURNAL</Link>
          <Link href="/contact" onClick={onFermer}>CONTACT</Link>
        </div>
      </div>
    </div>,
    document.body
  );
}
