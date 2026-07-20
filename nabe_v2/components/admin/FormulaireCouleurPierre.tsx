'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function FormulaireCouleurPierre() {
  const router = useRouter();
  const [nom, setNom] = useState('');
  const [codeHex, setCodeHex] = useState('#F5F0E6');
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [erreur, setErreur] = useState('');

  async function gererSoumission(e: React.FormEvent) {
    e.preventDefault();
    setEnvoiEnCours(true);
    setErreur('');
    try {
      const res = await fetch('/api/admin/couleurs-pierre', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom, codeHex }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur');
      }
      setNom('');
      setCodeHex('#F5F0E6');
      router.refresh();
    } catch (err: any) {
      setErreur(err.message || 'Erreur lors de la création.');
    } finally {
      setEnvoiEnCours(false);
    }
  }

  return (
    <div className="admin-carte">
      <h2>Ajouter une couleur de pierre</h2>
      <form onSubmit={gererSoumission} className="admin-form">
        <div>
          <label>Nom</label>
          <input
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            placeholder="Ex : Blanc, Champagne, Rose..."
            required
          />
        </div>
        <div>
          <label>Couleur</label>
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
            <input
              type="color"
              value={codeHex}
              onChange={(e) => setCodeHex(e.target.value)}
              style={{ width: 50, height: 38, padding: 2, cursor: 'pointer' }}
            />
            <input
              type="text"
              value={codeHex}
              onChange={(e) => setCodeHex(e.target.value)}
              placeholder="#F5F0E6"
              style={{ flex: 1 }}
            />
          </div>
        </div>
        {erreur && <p style={{ color: '#a8412a', fontSize: '0.85rem' }}>{erreur}</p>}
        <button type="submit" className="btn btn-primaire" disabled={envoiEnCours}>
          {envoiEnCours ? 'Création...' : 'Créer la couleur'}
        </button>
      </form>
    </div>
  );
}
