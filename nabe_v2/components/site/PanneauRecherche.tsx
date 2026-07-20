'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import { formaterPrix } from '@/lib/utils';
import './recherche.css';

type ResultatRecherche = {
  id: string;
  nom: string;
  slug: string;
  prix: string;
  image: string | null;
  matiere: string | null;
  collection: string | null;
};

export default function PanneauRecherche({ ouvert, onFermer }: { ouvert: boolean; onFermer: () => void }) {
  const [requete, setRequete] = useState('');
  const [resultats, setResultats] = useState<ResultatRecherche[]>([]);
  const [recherche, setRecherche] = useState(false);
  const [monte, setMonte] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setMonte(true), []);

  useEffect(() => {
    if (ouvert) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setRequete('');
      setResultats([]);
    }
  }, [ouvert]);

  useEffect(() => {
    if (requete.trim().length < 2) {
      setResultats([]);
      return;
    }
    const timeout = setTimeout(() => {
      setRecherche(true);
      fetch(`/api/recherche?q=${encodeURIComponent(requete.trim())}`)
        .then((res) => res.json())
        .then((data) => setResultats(data.produits || []))
        .catch(() => setResultats([]))
        .finally(() => setRecherche(false));
    }, 300);
    return () => clearTimeout(timeout);
  }, [requete]);

  if (!ouvert || !monte) return null;

  return createPortal(
    <div className="panneau-recherche__overlay" onClick={onFermer}>
      <div className="panneau-recherche" onClick={(e) => e.stopPropagation()}>
        <div className="panneau-recherche__barre">
          <input
            ref={inputRef}
            type="text"
            placeholder="Rechercher un bijou, une matière, une collection, une pierre..."
            value={requete}
            onChange={(e) => setRequete(e.target.value)}
          />
          <button onClick={onFermer} aria-label="Fermer la recherche">
            ✕
          </button>
        </div>

        {recherche && <p className="panneau-recherche__statut">Recherche en cours...</p>}

        {!recherche && requete.trim().length >= 2 && resultats.length === 0 && (
          <p className="panneau-recherche__statut">Aucun résultat pour « {requete} ».</p>
        )}

        {resultats.length > 0 && (
          <div className="panneau-recherche__resultats">
            {resultats.map((r: any) => (
              <Link key={r.id} href={`/collections/${r.slug}`} className="panneau-recherche__carte" onClick={onFermer}>
                {r.image ? (
                  <Image src={r.image} alt={r.nom} width={70} height={70} />
                ) : (
                  <div className="panneau-recherche__placeholder" />
                )}
                <div>
                  <strong>{r.nom}</strong>
                  <span>{[r.matiere, r.collection].filter(Boolean).join(' · ')}</span>
                </div>
                <span className="panneau-recherche__prix">{formaterPrix(r.prix)}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
