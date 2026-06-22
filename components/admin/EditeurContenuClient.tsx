'use client';

import { useState } from 'react';
import type { ChampContenu } from '@/lib/registre-contenu';

export default function EditeurContenuClient({
  page,
  titrePage,
  champs,
  valeursInitiales,
}: {
  page: string;
  titrePage: string;
  champs: ChampContenu[];
  valeursInitiales: Record<string, string>;
}) {
  const [valeurs, setValeurs] = useState(valeursInitiales);
  const [enregistrementCle, setEnregistrementCle] = useState<string | null>(null);
  const [succesCle, setSuccesCle] = useState<string | null>(null);
  const [enregistrementTout, setEnregistrementTout] = useState(false);
  const [succesTout, setSuccesTout] = useState(false);

  async function sauvegarderChamp(cle: string, type: string) {
    setEnregistrementCle(cle);
    setSuccesCle(null);
    try {
      const res = await fetch('/api/admin/contenu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page, cle, valeur: valeurs[cle], type }),
      });
      if (!res.ok) throw new Error();
      setSuccesCle(cle);
      setTimeout(() => setSuccesCle(null), 2000);
    } catch {
      alert('Erreur lors de la sauvegarde.');
    } finally {
      setEnregistrementCle(null);
    }
  }

  async function sauvegarderTout() {
    setEnregistrementTout(true);
    setSuccesTout(false);
    try {
      await Promise.all(
        champs.map((champ) =>
          fetch('/api/admin/contenu', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ page, cle: champ.cle, valeur: valeurs[champ.cle], type: champ.type }),
          })
        )
      );
      setSuccesTout(true);
      setTimeout(() => setSuccesTout(false), 2500);
    } catch {
      alert('Erreur lors de la sauvegarde de la page.');
    } finally {
      setEnregistrementTout(false);
    }
  }

  function reinitialiserChamp(champ: ChampContenu) {
    setValeurs((v) => ({ ...v, [champ.cle]: champ.defaut }));
  }

  return (
    <div className="admin-carte editeur-contenu">
      <div className="editeur-contenu__entete">
        <h2>{titrePage}</h2>
        <button className="btn btn-primaire" onClick={sauvegarderTout} disabled={enregistrementTout}>
          {enregistrementTout ? 'Enregistrement...' : succesTout ? '✓ Page enregistrée' : 'Tout enregistrer'}
        </button>
      </div>

      {champs.map((champ) => {
        const valeurModifiee = valeurs[champ.cle] !== champ.defaut;
        return (
          <div key={champ.cle} className="editeur-contenu__champ">
            <div className="editeur-contenu__champ-entete">
              <label>{champ.label}</label>
              {valeurModifiee && (
                <button
                  type="button"
                  className="editeur-contenu__reinitialiser"
                  onClick={() => reinitialiserChamp(champ)}
                  title="Revenir au texte par défaut"
                >
                  ↺ Réinitialiser
                </button>
              )}
            </div>

            {champ.type === 'texte_long' ? (
              <textarea
                value={valeurs[champ.cle] ?? ''}
                onChange={(e) => setValeurs((v) => ({ ...v, [champ.cle]: e.target.value }))}
                rows={4}
              />
            ) : (
              <input
                type="text"
                value={valeurs[champ.cle] ?? ''}
                onChange={(e) => setValeurs((v) => ({ ...v, [champ.cle]: e.target.value }))}
              />
            )}

            <button
              className="admin-btn-icone"
              onClick={() => sauvegarderChamp(champ.cle, champ.type)}
              disabled={enregistrementCle === champ.cle}
            >
              {enregistrementCle === champ.cle
                ? 'Enregistrement...'
                : succesCle === champ.cle
                ? '✓ Enregistré'
                : 'Enregistrer ce champ'}
            </button>
          </div>
        );
      })}
    </div>
  );
}
