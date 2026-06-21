'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function FormulaireCategorieClient() {
  const router = useRouter();
  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  async function gererSoumission(e: React.FormEvent) {
    e.preventDefault();
    setEnvoiEnCours(true);
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom, description }),
      });
      if (!res.ok) throw new Error();
      setNom('');
      setDescription('');
      router.refresh();
    } catch {
      alert('Erreur lors de la création de la catégorie.');
    } finally {
      setEnvoiEnCours(false);
    }
  }

  return (
    <div className="admin-carte">
      <h2>Ajouter une catégorie</h2>
      <form onSubmit={gererSoumission} className="admin-form">
        <div>
          <label>Nom</label>
          <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} required />
        </div>
        <div>
          <label>Description (optionnelle)</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
        </div>
        <button type="submit" className="btn btn-primaire" disabled={envoiEnCours}>
          {envoiEnCours ? 'Création...' : 'Créer la catégorie'}
        </button>
      </form>
    </div>
  );
}
