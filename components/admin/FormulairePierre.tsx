'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type CouleurOption = { id: string; nom: string; codeHex: string };

export default function FormulairePierre({ couleurs }: { couleurs: CouleurOption[] }) {
  const router = useRouter();
  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');
  const [couleurPierreId, setCouleurPierreId] = useState('');
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [erreur, setErreur] = useState('');

  async function gererSoumission(e: React.FormEvent) {
    e.preventDefault();
    setEnvoiEnCours(true);
    setErreur('');
    try {
      const res = await fetch('/api/admin/pierres', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom, description, couleurPierreId: couleurPierreId || undefined }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur');
      }
      setNom('');
      setDescription('');
      setCouleurPierreId('');
      router.refresh();
    } catch (err: any) {
      setErreur(err.message || 'Erreur lors de la création.');
    } finally {
      setEnvoiEnCours(false);
    }
  }

  return (
    <div className="admin-carte">
      <h2>Ajouter une pierre</h2>
      <form onSubmit={gererSoumission} className="admin-form">
        <div>
          <label>Nom</label>
          <input
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            placeholder="Ex : Diamant, Émeraude, Onyx..."
            required
          />
        </div>
        <div>
          <label>Description (affichée dans la popup "En savoir plus")</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Ex : L'émeraude est une pierre précieuse verte, symbole de renouveau..."
          />
        </div>
        <div>
          <label>Couleur associée</label>
          <select value={couleurPierreId} onChange={(e) => setCouleurPierreId(e.target.value)}>
            <option value="">Aucune couleur</option>
            {couleurs.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nom}
              </option>
            ))}
          </select>
          {couleurs.length === 0 && (
            <p className="formulaire-produit__aide">
              Aucune couleur créée. Ajoutez-en depuis <a href="/admin/couleurs-pierre">Admin &gt; Couleurs de pierre</a>.
            </p>
          )}
        </div>
        {erreur && <p style={{ color: '#a8412a', fontSize: '0.85rem' }}>{erreur}</p>}
        <button type="submit" className="btn btn-primaire" disabled={envoiEnCours}>
          {envoiEnCours ? 'Création...' : 'Créer la pierre'}
        </button>
      </form>
    </div>
  );
}
