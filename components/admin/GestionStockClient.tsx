'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Produit = { id: string; nom: string; stock: number };
type Mouvement = {
  id: string;
  produitNom: string;
  type: string;
  quantite: number;
  motif: string | null;
  createdAt: string;
};

const LABELS_TYPE: Record<string, string> = {
  ENTREE: 'Entrée',
  SORTIE: 'Sortie',
  AJUSTEMENT: 'Ajustement',
  VENTE: 'Vente',
};

export default function GestionStockClient({
  produits,
  mouvements,
}: {
  produits: Produit[];
  mouvements: Mouvement[];
}) {
  const router = useRouter();
  const [produitId, setProduitId] = useState('');
  const [type, setType] = useState('ENTREE');
  const [quantite, setQuantite] = useState(1);
  const [motif, setMotif] = useState('');
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [erreur, setErreur] = useState('');

  async function gererSoumission(e: React.FormEvent) {
    e.preventDefault();
    if (!produitId) {
      setErreur('Sélectionnez un bijou.');
      return;
    }
    setEnvoiEnCours(true);
    setErreur('');

    try {
      const res = await fetch('/api/admin/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ produitId, type, quantite, motif }),
      });
      if (!res.ok) throw new Error();
      setQuantite(1);
      setMotif('');
      router.refresh();
    } catch {
      setErreur('Erreur lors de l\'enregistrement du mouvement.');
    } finally {
      setEnvoiEnCours(false);
    }
  }

  return (
    <div className="admin-stock__grille">
      <div className="admin-carte">
        <h2>Nouveau mouvement</h2>
        <form onSubmit={gererSoumission} className="admin-form">
          <div>
            <label>Bijou</label>
            <select value={produitId} onChange={(e) => setProduitId(e.target.value)}>
              <option value="">Sélectionnez un bijou</option>
              {produits.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nom} (stock actuel : {p.stock})
                </option>
              ))}
            </select>
          </div>

          <div className="admin-form__ligne">
            <div>
              <label>Type de mouvement</label>
              <select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="ENTREE">Entrée (réassort)</option>
                <option value="SORTIE">Sortie (casse, retour fournisseur...)</option>
                <option value="AJUSTEMENT">Ajustement</option>
              </select>
            </div>
            <div>
              <label>Quantité</label>
              <input
                type="number"
                min="1"
                value={quantite}
                onChange={(e) => setQuantite(parseInt(e.target.value) || 1)}
              />
            </div>
          </div>

          <div>
            <label>Motif (optionnel)</label>
            <input
              type="text"
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              placeholder="Ex : Réassort fournisseur, casse atelier..."
            />
          </div>

          {erreur && <p style={{ color: '#a8412a', fontSize: '0.85rem' }}>{erreur}</p>}

          <button type="submit" className="btn btn-primaire" disabled={envoiEnCours}>
            {envoiEnCours ? 'Enregistrement...' : 'Enregistrer le mouvement'}
          </button>
        </form>
      </div>

      <div className="admin-carte">
        <h2>Historique des mouvements</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Bijou</th>
              <th>Type</th>
              <th>Quantité</th>
              <th>Motif</th>
            </tr>
          </thead>
          <tbody>
            {mouvements.map((m) => (
              <tr key={m.id}>
                <td>{new Date(m.createdAt).toLocaleDateString('fr-FR')}</td>
                <td>{m.produitNom}</td>
                <td>{LABELS_TYPE[m.type]}</td>
                <td style={{ color: m.quantite < 0 ? '#a8412a' : '#2e6b2e' }}>
                  {m.quantite > 0 ? `+${m.quantite}` : m.quantite}
                </td>
                <td>{m.motif || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {mouvements.length === 0 && (
          <p style={{ color: 'var(--texte-secondaire)', fontStyle: 'italic', padding: '1rem 0' }}>
            Aucun mouvement enregistré.
          </p>
        )}
      </div>
    </div>
  );
}
