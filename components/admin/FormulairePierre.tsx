'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

type CouleurOption = { id: string; nom: string; codeHex: string };

export default function FormulairePierre({ couleurs }: { couleurs: CouleurOption[] }) {
  const router = useRouter();
  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');
  const [couleursIds, setCouleursIds] = useState<string[]>([]);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [erreur, setErreur] = useState('');

  function basculerCouleur(id: string) {
    setCouleursIds(prev => prev.includes(id) ? prev.filter((c: any) => c !== id) : [...prev, id]);
  }

  async function gererSoumission(e: React.FormEvent) {
    e.preventDefault();
    setEnvoiEnCours(true);
    setErreur('');
    try {
      const res = await fetch('/api/admin/pierres', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom, description, couleursIds }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur');
      }
      setNom('');
      setDescription('');
      setCouleursIds([]);
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
          <input type="text" value={nom} onChange={(e) => setNom(e.target.value)}
            placeholder="Ex : Diamant, Émeraude, Onyx..." required />
        </div>
        <div>
          <label>Description (affichée dans la popup "En savoir plus")</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4}
            placeholder="Ex : L'émeraude est une pierre précieuse verte, symbole de renouveau..." />
        </div>
        <div>
          <label>Couleurs associées (sélection multiple)</label>
          {couleurs.length === 0 ? (
            <p className="formulaire-produit__aide">
              Aucune couleur créée. Ajoutez-en depuis l'onglet "Couleurs" ci-dessus.
            </p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
              {couleurs.map((c: any) => (
                <button key={c.id} type="button"
                  onClick={() => basculerCouleur(c.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    padding: '0.3rem 0.7rem', borderRadius: '999px', cursor: 'pointer',
                    border: couleursIds.includes(c.id) ? '2px solid var(--nabe-terracotta)' : '1px solid #ccc',
                    background: couleursIds.includes(c.id) ? 'var(--nabe-sable)' : 'white',
                    fontSize: '0.85rem',
                  }}>
                  <span style={{ width: 14, height: 14, borderRadius: '50%', background: c.codeHex, border: '1px solid #ccc', display: 'inline-block' }} />
                  {c.nom}
                </button>
              ))}
            </div>
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
