'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { LABELS_TYPE_BIJOU, LABELS_MATIERE, LABELS_PIERRE } from '@/lib/utils';
import './filtres-collections.css';

export default function FiltresCollections() {
  const router = useRouter();
  const searchParams = useSearchParams();

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

  return (
    <aside className="filtres-collections">
      <div className="filtres-collections__entete">
        <h2>Filtrer</h2>
        <button onClick={reinitialiser} className="filtres-collections__reset">
          Réinitialiser
        </button>
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
        {Object.entries(LABELS_MATIERE).map(([valeur, label]) => (
          <label key={valeur} className="filtres-collections__case">
            <input
              type="checkbox"
              checked={matiereActive === valeur}
              onChange={() => appliquerFiltre('matiere', matiereActive === valeur ? null : valeur)}
            />
            {label}
          </label>
        ))}
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
    </aside>
  );
}
