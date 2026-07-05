'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LABELS_TYPE_BIJOU, LABELS_DISPONIBILITE } from '@/lib/utils';
import './filtres-collections.css';

type Matiere = { id: string; nom: string; nombreProduits?: number };
type Couleur = { id: string; nom: string; codeHex: string; nombreProduits?: number };
type PierreOption = { id: string; nom: string; nombreProduits?: number };

const TAILLES_BAGUE = ['48', '50', '52', '54', '56', '58', '60'];
const TAILLES_BRACELET = ['S', 'M', 'L'];

export default function FiltresCollections({
  matieres = [],
  pierres = [],
  couleurs = [],
  prixMinGlobal = 0,
  prixMaxGlobal = 1000,
  comptesType = {},
  comptesDisponibilite = {},
}: {
  matieres?: Matiere[];
  pierres?: PierreOption[];
  couleurs?: Couleur[];
  prixMinGlobal?: number;
  prixMaxGlobal?: number;
  comptesType?: Record<string, number>;
  comptesDisponibilite?: Record<string, number>;
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
  const pisteRef = useRef<HTMLDivElement>(null);
  const [glissementActif, setGlissementActif] = useState<'min' | 'max' | null>(null);

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

  function appliquerPrix(min: number, max: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (min > prixMinGlobal) params.set('prixMin', String(min));
    else params.delete('prixMin');
    if (max < prixMaxGlobal) params.set('prixMax', String(max));
    else params.delete('prixMax');
    router.push(`/collections?${params.toString()}`);
  }

  function reinitialiser() {
    router.push('/collections');
  }

  // ── Double curseur de prix : une seule piste, deux poignées rondes ──
  const etendue = Math.max(prixMaxGlobal - prixMinGlobal, 1);
  const pourcentMin = ((prixMin - prixMinGlobal) / etendue) * 100;
  const pourcentMax = ((prixMax - prixMinGlobal) / etendue) * 100;

  const valeurDepuisPosition = useCallback(
    (clientX: number) => {
      if (!pisteRef.current) return prixMinGlobal;
      const rect = pisteRef.current.getBoundingClientRect();
      const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
      return Math.round(prixMinGlobal + ratio * etendue);
    },
    [prixMinGlobal, etendue]
  );

  useEffect(() => {
    if (!glissementActif) return;

    function gererDeplacement(e: MouseEvent | TouchEvent) {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const valeur = valeurDepuisPosition(clientX);
      if (glissementActif === 'min') {
        setPrixMin((prev) => Math.min(valeur, prixMax));
      } else {
        setPrixMax((prev) => Math.max(valeur, prixMin));
      }
    }
    function gererRelachement() {
      setGlissementActif(null);
    }

    window.addEventListener('mousemove', gererDeplacement);
    window.addEventListener('touchmove', gererDeplacement);
    window.addEventListener('mouseup', gererRelachement);
    window.addEventListener('touchend', gererRelachement);
    return () => {
      window.removeEventListener('mousemove', gererDeplacement);
      window.removeEventListener('touchmove', gererDeplacement);
      window.removeEventListener('mouseup', gererRelachement);
      window.removeEventListener('touchend', gererRelachement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [glissementActif, valeurDepuisPosition]);

  // Applique le filtre une fois le glissement terminé (pas à chaque pixel)
  useEffect(() => {
    if (glissementActif === null) {
      const minUrl = parseInt(searchParams.get('prixMin') || String(prixMinGlobal));
      const maxUrl = parseInt(searchParams.get('prixMax') || String(prixMaxGlobal));
      if (minUrl !== prixMin || maxUrl !== prixMax) {
        appliquerPrix(prixMin, prixMax);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [glissementActif]);

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
              {typeof comptesType[valeur] === 'number' && (
                <span className="filtres-collections__compteur">({comptesType[valeur]})</span>
              )}
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

            <div className="filtres-collections__slider-prix" ref={pisteRef}>
              <div className="filtres-collections__slider-piste" />
              <div
                className="filtres-collections__slider-remplissage"
                style={{ left: `${pourcentMin}%`, right: `${100 - pourcentMax}%` }}
              />
              <div
                role="slider"
                aria-label="Prix minimum"
                aria-valuemin={prixMinGlobal}
                aria-valuemax={prixMaxGlobal}
                aria-valuenow={prixMin}
                tabIndex={0}
                className="filtres-collections__slider-poignee"
                style={{ left: `${pourcentMin}%` }}
                onMouseDown={() => setGlissementActif('min')}
                onTouchStart={() => setGlissementActif('min')}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowLeft') setPrixMin((p) => Math.max(p - 1, prixMinGlobal));
                  if (e.key === 'ArrowRight') setPrixMin((p) => Math.min(p + 1, prixMax));
                }}
              />
              <div
                role="slider"
                aria-label="Prix maximum"
                aria-valuemin={prixMinGlobal}
                aria-valuemax={prixMaxGlobal}
                aria-valuenow={prixMax}
                tabIndex={0}
                className="filtres-collections__slider-poignee"
                style={{ left: `${pourcentMax}%` }}
                onMouseDown={() => setGlissementActif('max')}
                onTouchStart={() => setGlissementActif('max')}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowLeft') setPrixMax((p) => Math.max(p - 1, prixMin));
                  if (e.key === 'ArrowRight') setPrixMax((p) => Math.min(p + 1, prixMaxGlobal));
                }}
              />
            </div>
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
              {typeof m.nombreProduits === 'number' && (
                <span className="filtres-collections__compteur">({m.nombreProduits})</span>
              )}
            </label>
          ))}
        </div>

        {pierres.length > 0 && (
          <div className="filtres-collections__groupe">
            <h3>Pierre</h3>
            {pierres.map((p) => (
              <label key={p.id} className="filtres-collections__case">
                <input
                  type="checkbox"
                  checked={pierreActive === p.id}
                  onChange={() => appliquerFiltre('pierre', pierreActive === p.id ? null : p.id)}
                />
                {p.nom}
                {typeof p.nombreProduits === 'number' && (
                  <span className="filtres-collections__compteur">({p.nombreProduits})</span>
                )}
              </label>
            ))}
          </div>
        )}

        {couleurs.length > 0 && (
          <div className="filtres-collections__groupe">
            <h3>Couleur de pierre</h3>
            <div className="filtres-collections__couleurs-liste">
              {couleurs.map((c) => (
                <label key={c.id} className="filtres-collections__case filtres-collections__case-couleur">
                  <input
                    type="radio"
                    name="couleur-pierre"
                    checked={couleurActive === c.id}
                    onChange={() => appliquerFiltre('couleur', couleurActive === c.id ? null : c.id)}
                  />
                  <span className="filtres-collections__rond" style={{ backgroundColor: c.codeHex }} />
                  {c.nom}
                  {typeof c.nombreProduits === 'number' && (
                    <span className="filtres-collections__compteur">({c.nombreProduits})</span>
                  )}
                </label>
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
                {typeof comptesDisponibilite[valeur] === 'number' && (
                  <span className="filtres-collections__compteur">({comptesDisponibilite[valeur]})</span>
                )}
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
