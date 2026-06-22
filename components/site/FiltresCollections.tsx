'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LABELS_TYPE_BIJOU, LABELS_PIERRE } from '@/lib/utils';
import './filtres-collections.css';

type Matiere = { id: string; nom: string };

export default function FiltresCollections({ matieres = [] }: { matieres?: Matiere[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [ouvertMobile, setOuvertMobile] = useState(false);

  function appliquerFiltre(cle: string, valeur: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (valeur) {
      params.set(cle, valeur);
    } else {
      params.delete(cle);
    }
    router.push(`/collections?${params.toString()}`);
  }

  function reinitialiser() {
    router.push('/collections');
  }

  const typeActif = searchParams.get('type');
  const matiereActive = searchParams.get('matiere');
  const pierreActive = searchParams.get('pierre');
  const triActif = searchParams.get('tri') || 'recent';

  const nombreFiltresActifs = [typeActif, matiereActive, pierreActive].filter(Boolean).length;

  return (
    <>
      <button className="filtres-collections__bouton-mobile" onClick={() => setOuvertMobile(true)}>
        🔍 Filtrer{nombreFiltresActifs > 0 ? ` (${nombreFiltresActifs})` : ''}
      </button>

      {ouvertMobile && (
        <div className="filtres-collections__overlay-mobile" onClick={() => setOuvertMobile(false)} />
      )}

      <aside className={`filtres-collections ${ouvertMobile ? 'filtres-collections--ouvert-mobile' : ''}`}>
        <div className="filtres-collections__entete">
          <h2>Filtrer</h2>
          <div className="filtres-collections__entete-actions">
            <button onClick={reinitialiser} className="filtres-collections__reset">
              Réinitialiser
            </button>
            <button
              className="filtres-collections__fermer-mobile"
              onClick={() => setOuvertMobile(false)}
              aria-label="Fermer les filtres"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="filtres-collections__groupe">
          <h3>Type de bijou</h3>
          {Object.entries(LABELS_TYPE_BIJOU).map(([valeur, label]) => (
            <label key={valeur} className="filtres-collections__case">
              <input
                type="checkbox"
                checked={typeActif === valeur}
                onChange={() => appliquerFiltre('type', typeActif === valeur ? null : valeur)}
              />
              {label}
            </label>
          ))}
        </div>

        <div className="filtres-collections__groupe">
          <h3>Matière</h3>
          {matieres.length === 0 ? (
            <p className="filtres-collections__vide">Aucune matière définie.</p>
          ) : (
            matieres.map((m) => (
              <label key={m.id} className="filtres-collections__case">
                <input
                  type="checkbox"
                  checked={matiereActive === m.id}
                  onChange={() => appliquerFiltre('matiere', matiereActive === m.id ? null : m.id)}
                />
                {m.nom}
              </label>
            ))
          )}
        </div>

        <div className="filtres-collections__groupe">
          <h3>Pierre</h3>
          {Object.entries(LABELS_PIERRE)
            .filter(([valeur]) => valeur !== 'AUCUNE')
            .map(([valeur, label]) => (
              <label key={valeur} className="filtres-collections__case">
                <input
                  type="checkbox"
                  checked={pierreActive === valeur}
                  onChange={() => appliquerFiltre('pierre', pierreActive === valeur ? null : valeur)}
                />
                {label}
              </label>
            ))}
        </div>

        <div className="filtres-collections__groupe">
          <h3>Trier par</h3>
          <select
            value={triActif}
            onChange={(e) => appliquerFiltre('tri', e.target.value)}
            className="filtres-collections__select"
          >
            <option value="recent">Nouveautés</option>
            <option value="prix-asc">Prix croissant</option>
            <option value="prix-desc">Prix décroissant</option>
            <option value="nom">Nom (A-Z)</option>
          </select>
        </div>

        <button className="filtres-collections__appliquer-mobile" onClick={() => setOuvertMobile(false)}>
          Voir les résultats
        </button>
      </aside>
    </>
  );
}
