'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

type CategorieAffichee = {
  id: string;
  nom: string;
  slug: string;
  image: string | null;
};

// Icône affichée en filigrane quand une catégorie n'a pas encore de photo,
// choisie selon son nom. Remplace la photo — jamais affichée en plus.
function IconeCategorie({ nom }: { nom: string }) {
  const n = nom.toLowerCase();

  if (n.includes('bague')) {
    return (
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
        <circle cx="12" cy="15.5" r="5.8" />
        <path d="M9.6 10 12 4l2.4 6" />
      </svg>
    );
  }
  if (n.includes('collier')) {
    return (
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
        <path d="M4.5 4.5c0 5.8 3.4 9.5 7.5 9.5s7.5-3.7 7.5-9.5" />
        <circle cx="12" cy="16.8" r="2.4" />
      </svg>
    );
  }
  if (n.includes('boucle') || n.includes('oreille')) {
    return (
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
        <circle cx="9.5" cy="6" r="2.4" />
        <path d="M9.5 8.4v3.2a3 3 0 0 0 6 0" />
        <circle cx="14.5" cy="6" r="2.4" />
      </svg>
    );
  }
  if (n.includes('bracelet')) {
    return (
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
        <circle cx="12" cy="12" r="7.8" />
        <circle cx="12" cy="4.6" r="1.2" fill="currentColor" stroke="none" />
        <circle cx="19" cy="12" r="1.2" fill="currentColor" stroke="none" />
        <circle cx="12" cy="19.4" r="1.2" fill="currentColor" stroke="none" />
        <circle cx="5" cy="12" r="1.2" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  return (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
      <path d="M6 3h12l3.5 5L12 21 2.5 8z" />
      <path d="M2.5 8h19M9 3l-2 5 5 13 5-13-2-5" />
    </svg>
  );
}

export default function CategoriesAccueil({ categories }: { categories: CategorieAffichee[] }) {
  const pisteRef = useRef<HTMLDivElement>(null);
  const [etapeActive, setEtapeActive] = useState(0);
  const nombreEtapes = Math.max(1, categories.length - 3);

  function mettreAJourIndicateur() {
    const piste = pisteRef.current;
    if (!piste) return;
    const maximum = piste.scrollWidth - piste.clientWidth;
    const progression = maximum > 0 ? piste.scrollLeft / maximum : 0;
    setEtapeActive(Math.round(progression * (nombreEtapes - 1)));
  }

  if (categories.length === 0) return null;

  return (
    <div className="accueil-categories__carrousel">
      <div className="accueil-categories__grille" ref={pisteRef} onScroll={mettreAJourIndicateur}>
        {categories.map((c: any) => (
          <Link key={c.id} href={`/nos-bijoux?categorie=${c.slug}`} className="accueil-categories__carte">
            <div className="accueil-categories__image">
              {c.image ? (
                <Image src={c.image} alt={c.nom} width={280} height={280} />
              ) : (
                <div className="accueil-categories__placeholder">
                  <IconeCategorie nom={c.nom} />
                </div>
              )}
            </div>
            <div className="accueil-categories__panneau">
              <span className="accueil-categories__nom">{c.nom}</span>
            </div>
          </Link>
        ))}
      </div>
      {categories.length > 4 && (
        <div className="accueil-categories__indicateur" aria-hidden="true">
          {Array.from({ length: nombreEtapes }, (_, index) => (
            <span
              className={index === etapeActive ? 'accueil-categories__indicateur-trait--actif' : ''}
              key={index}
            />
          ))}
        </div>
      )}
    </div>
  );
}
