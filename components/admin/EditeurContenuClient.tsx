'use client';

import { useState } from 'react';

type Champ = { cle: string; label: string; type: 'texte' | 'html' };

export default function EditeurContenuClient({
  page,
  titrePage,
  champs,
  valeursInitiales,
}: {
  page: string;
  titrePage: string;
  champs: Champ[];
  valeursInitiales: Record<string, string>;
}) {
  const [valeurs, setValeurs] = useState(valeursInitiales);
  const [enregistrement, setEnregistrement] = useState<string | null>(null);
  const [succes, setSucces] = useState<string | null>(null);

  async function sauvegarder(cle: string, type: string) {
    setEnregistrement(cle);
    setSucces(null);
    try {
      const res = await fetch('/api/admin/contenu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page, cle, valeur: valeurs[cle], type }),
      });
      if (!res.ok) throw new Error();
      setSucces(cle);
      setTimeout(() => setSucces(null), 2000);
    } catch {
      alert('Erreur lors de la sauvegarde.');
    } finally {
      setEnregistrement(null);
    }
  }

  return (
    <div className="admin-carte editeur-contenu">
      <h2>{titrePage}</h2>
      {champs.map((champ) => (
        <div key={champ.cle} className="editeur-contenu__champ">
          <label>{champ.label}</label>
          <textarea
            value={valeurs[champ.cle]}
            onChange={(e) => setValeurs((v) => ({ ...v, [champ.cle]: e.target.value }))}
            rows={3}
            placeholder="Laissez vide pour garder le texte par défaut"
          />
          <button
            className="admin-btn-icone"
            onClick={() => sauvegarder(champ.cle, champ.type)}
            disabled={enregistrement === champ.cle}
          >
            {enregistrement === champ.cle ? 'Enregistrement...' : succes === champ.cle ? '✓ Enregistré' : 'Enregistrer'}
          </button>
        </div>
      ))}
    </div>
  );
}
