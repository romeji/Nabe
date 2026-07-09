'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Temoignage = {
  id: string;
  auteur: string;
  texte: string;
  note: number;
  ordre: number;
  actif: boolean;
};

export default function TemoignagesAdminClient({ temoignages }: { temoignages: Temoignage[] }) {
  const router = useRouter();
  const [enEdition, setEnEdition] = useState<string | null>(null);
  const [brouillon, setBrouillon] = useState<Partial<Temoignage>>({});
  const [nouveau, setNouveau] = useState({ auteur: '', texte: '', note: 5 });
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [erreur, setErreur] = useState('');

  function commencerEdition(t: Temoignage) {
    setEnEdition(t.id);
    setBrouillon({ auteur: t.auteur, texte: t.texte, note: t.note });
  }

  async function sauvegarderEdition(id: string) {
    setEnvoiEnCours(true);
    try {
      const res = await fetch(`/api/admin/temoignages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(brouillon),
      });
      if (!res.ok) throw new Error();
      setEnEdition(null);
      router.refresh();
    } catch {
      alert('Erreur lors de la sauvegarde.');
    } finally {
      setEnvoiEnCours(false);
    }
  }

  async function basculerActif(t: Temoignage) {
    try {
      const res = await fetch(`/api/admin/temoignages/${t.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actif: !t.actif }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      alert("Erreur lors du changement de statut.");
    }
  }

  async function supprimer(id: string) {
    if (!confirm('Supprimer définitivement ce témoignage ?')) return;
    try {
      const res = await fetch(`/api/admin/temoignages/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      alert('Erreur lors de la suppression.');
    }
  }

  async function creer(e: React.FormEvent) {
    e.preventDefault();
    setEnvoiEnCours(true);
    setErreur('');
    try {
      const res = await fetch('/api/admin/temoignages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nouveau),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur');
      }
      setNouveau({ auteur: '', texte: '', note: 5 });
      router.refresh();
    } catch (err: any) {
      setErreur(err.message || 'Erreur lors de la création.');
    } finally {
      setEnvoiEnCours(false);
    }
  }

  return (
    <div className="admin-categories__grille">
      <div className="admin-table-scroll"><table className="admin-table">
        <thead>
          <tr>
            <th>Auteur</th>
            <th>Texte</th>
            <th>Note</th>
            <th>Visible sur le site</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {temoignages.map((t) => (
            <tr key={t.id}>
              {enEdition === t.id ? (
                <>
                  <td>
                    <input
                      type="text"
                      value={brouillon.auteur ?? ''}
                      onChange={(e) => setBrouillon((b) => ({ ...b, auteur: e.target.value }))}
                    />
                  </td>
                  <td>
                    <textarea
                      rows={2}
                      style={{ width: '100%' }}
                      value={brouillon.texte ?? ''}
                      onChange={(e) => setBrouillon((b) => ({ ...b, texte: e.target.value }))}
                    />
                  </td>
                  <td>
                    <select
                      value={brouillon.note ?? 5}
                      onChange={(e) => setBrouillon((b) => ({ ...b, note: Number(e.target.value) }))}
                    >
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>
                          {'★'.repeat(n)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>{t.actif ? 'Oui' : 'Non'}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button className="btn btn-primaire" disabled={envoiEnCours} onClick={() => sauvegarderEdition(t.id)}>
                      Enregistrer
                    </button>{' '}
                    <button className="btn" onClick={() => setEnEdition(null)}>
                      Annuler
                    </button>
                  </td>
                </>
              ) : (
                <>
                  <td>{t.auteur}</td>
                  <td style={{ maxWidth: '360px' }}>{t.texte}</td>
                  <td>{'★'.repeat(t.note)}</td>
                  <td>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                      <input type="checkbox" checked={t.actif} onChange={() => basculerActif(t)} />
                      {t.actif ? 'Oui' : 'Non'}
                    </label>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button className="btn" onClick={() => commencerEdition(t)}>
                      Modifier
                    </button>{' '}
                    <button className="btn" style={{ color: '#a8412a' }} onClick={() => supprimer(t.id)}>
                      Supprimer
                    </button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table></div>

      <div className="admin-carte">
        <h2>Ajouter un témoignage</h2>
        <form onSubmit={creer} className="admin-form">
          <div>
            <label>Auteur</label>
            <input
              type="text"
              value={nouveau.auteur}
              onChange={(e) => setNouveau((n) => ({ ...n, auteur: e.target.value }))}
              placeholder="Ex : Claire M."
              required
            />
          </div>
          <div>
            <label>Texte du témoignage</label>
            <textarea
              rows={3}
              value={nouveau.texte}
              onChange={(e) => setNouveau((n) => ({ ...n, texte: e.target.value }))}
              placeholder="Ex : Un bijou magnifique, livré avec soin..."
              required
            />
          </div>
          <div>
            <label>Note</label>
            <select value={nouveau.note} onChange={(e) => setNouveau((n) => ({ ...n, note: Number(e.target.value) }))}>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {'★'.repeat(n)}
                </option>
              ))}
            </select>
          </div>
          {erreur && <p style={{ color: '#a8412a', fontSize: '0.85rem' }}>{erreur}</p>}
          <button type="submit" className="btn btn-primaire" disabled={envoiEnCours}>
            {envoiEnCours ? 'Création...' : 'Ajouter le témoignage'}
          </button>
        </form>
      </div>

      {temoignages.length === 0 && (
        <p style={{ color: 'var(--texte-secondaire)', fontStyle: 'italic', marginTop: '1rem' }}>
          Aucun témoignage pour le moment. La section "Ils nous font confiance" ne s'affichera pas tant
          qu'aucun témoignage actif n'est ajouté.
        </p>
      )}
    </div>
  );
}
