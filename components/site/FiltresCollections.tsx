'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LABELS_TYPE_BIJOU, LABELS_PIERRE, LABELS_DISPONIBILITE } from '@/lib/utils';
import './filtres-collections.css';

type Matiere = { id: string; nom: string };
type Couleur = { id: string; nom: string; codeHex: string };

const TAILLES_BAGUE = ['48', '50', '52', '54', '56', '58', '60'];
const TAILLES_BRACELET = ['S', 'M', 'L'];

export default function FiltresCollections({
  matieres = [],
  couleurs = [],
  prixMinGlobal = 0,
  prixMaxGlobal = 1000,
}: {
  matieres?: Matiere[];
  couleurs?: Couleur[];
  prixMinGlobal?: number;
  prixMaxGlobal?: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [ouvertMobile, setOuvertMobile] = useState(false);

  const typeActif = searchParams.get('type');
  const matiereActive = searchParams.get('matiere');
  const pierreActive = searchParams.get('pierre');
  const couleurActive = searchParams.get('couleur');
  const tailleActive = searchParams.get('taille');
  const disponibilitesActives = (searchParams.get('disponibilite') || '').split(',').filter(Boolean);

  const [prixMin, setPrixMin] = useState(parseInt(searchParams.get('prixMin') || String(prixMinGlobal)));
  const [prixMax, setPrixMax] = useState(parseInt(searchParams.get('prixMax') || String(prixMaxGlobal)));

  useEffect(() => {
    setPrixMin(parseInt(searchParams.get('prixMin') || String(prixMinGlobal)));
    setPrixMax(parseInt(searchParams.get('prixMax') || String(prixMaxGlobal)));
  }, [searchParams, prixMinGlobal, prixMaxGlobal]);

  function appliquerFiltre(cle: string, valeur: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (valeur) {
      params.set(cle, valeur);
    } else {
      params.delete(cle);
    }
    router.push(`/collections?${params.toString()}`);
  }

  function basculerDisponibilite(valeur: string) {
    const actuelles = new Set(disponibilitesActives);
    if (actuelles.has(valeur)) {
      actuelles.delete(valeur);
    } else {
      actuelles.add(valeur);
    }
    appliquerFiltre('disponibilite', actuelles.size > 0 ? Array.from(actuelles).join(',') : null);
  }

  function appliquerPrix() {
    const params = new URLSearchParams(searchParams.toString());
    if (prixMin > prixMinGlobal) params.set('prixMin', String(prixMin));
    else params.delete('prixMin');
    if (prixMax < prixMaxGlobal) params.set('prixMax', String(prixMax));
    else params.delete('prixMax');
    router.push(`/collections?${params.toString()}`);
  }

  function reinitialiser() {
    router.push('/collections');
  }

  const afficheTailles = typeActif === 'BAGUE' || typeActif === 'BRACELET' || !typeActif;
  const optionsTailles = typeActif === 'BRACELET' ? TAILLES_BRACELET : TAILLES_BAGUE;

  return (
    <>
      <button className="filtres-collections__bouton-mobile" onClick={() => setOuvertMobile(true)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="18" x2="20" y2="18" />
          <circle cx="8" cy="6" r="1.8" fill="currentColor" />
          <circle cx="16" cy="12" r="1.8" fill="currentColor" />
          <circle cx="10" cy="18" r="1.8" fill="currentColor" />
        </svg>
        Filtrer
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
          <h3>Prix</h3>
          <div className="filtres-collections__prix">
            <div className="filtres-collections__prix-valeurs">
              <span>{prixMin} €</span>
              <span>{prixMax} €</span>
            </div>
            <input
              type="range"
              min={prixMinGlobal}
              max={prixMaxGlobal}
              value={prixMin}
              onChange={(e) => setPrixMin(Math.min(parseInt(e.target.value), prixMax))}
              onMouseUp={appliquerPrix}
              onTouchEnd={appliquerPrix}
            />
            <input
              type="range"
              min={prixMinGlobal}
              max={prixMaxGlobal}
              value={prixMax}
              onChange={(e) => setPrixMax(Math.max(parseInt(e.target.value), prixMin))}
              onMouseUp={appliquerPrix}
              onTouchEnd={appliquerPrix}
            />
          </div>
        </div>

        {afficheTailles && (
          <div className="filtres-collections__groupe">
            <h3>Taille</h3>
            <div className="filtres-collections__tailles">
              {optionsTailles.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`filtres-collections__taille ${tailleActive === t ? 'actif' : ''}`}
                  onClick={() => appliquerFiltre('taille', tailleActive === t ? null : t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="filtres-collections__groupe">
          <h3>Matière</h3>
          {matieres.map((m) => (
            <label key={m.id} className="filtres-collections__case">
              <input
                type="checkbox"
                checked={matiereActive === m.id}
                onChange={() => appliquerFiltre('matiere', matiereActive === m.id ? null : m.id)}
              />
              {m.nom}
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

        {couleurs.length > 0 && (
          <div className="filtres-collections__groupe">
            <h3>Couleur de la pierre</h3>
            <div className="filtres-collections__couleurs">
              {couleurs.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`filtres-collections__pastille ${couleurActive === c.id ? 'actif' : ''}`}
                  style={{ backgroundColor: c.codeHex }}
                  title={c.nom}
                  onClick={() => appliquerFiltre('couleur', couleurActive === c.id ? null : c.id)}
                />
              ))}
            </div>
          </div>
        )}

        <div className="filtres-collections__groupe">
          <h3>Disponibilité</h3>
          {Object.entries(LABELS_DISPONIBILITE)
            .filter(([v]) => v === 'EN_STOCK' || v === 'FABRICATION_SUR_COMMANDE' || v === 'CREATION_SUR_MESURE')
            .map(([valeur, label]) => (
              <label key={valeur} className="filtres-collections__case">
                <input
                  type="checkbox"
                  checked={disponibilitesActives.includes(valeur)}
                  onChange={() => basculerDisponibilite(valeur)}
                />
                {label}
              </label>
            ))}
        </div>

        <button className="filtres-collections__appliquer-mobile" onClick={() => setOuvertMobile(false)}>
          Voir les résultats
        </button>
      </aside>
    </>
  );
}
