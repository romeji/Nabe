'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

type CouleurOption = { id: string; nom: string; codeHex: string };
type PierreLigne = {
  id: string;
  nom: string;
  description: string | null;
  couleurs: { couleurPierre: CouleurOption }[];
  _count: { produits: number };
};

export default function LignePierre({ pierre, couleurs }: { pierre: PierreLigne; couleurs: CouleurOption[] }) {
  const router = useRouter();
  const [edition, setEdition] = useState(false);
  const [nom, setNom] = useState(pierre.nom);
  const [description, setDescription] = useState(pierre.description || '');
  const [couleursIdsSel, setCouleursIdsSel] = useState<string[]>(pierre.couleurs.map(c => couleurs.find(co => co.nom === c.couleurPierre.nom)?.id).filter(Boolean) as string[]);
  const [confirmationSuppression, setConfirmationSuppression] = useState(false);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState('');

  function basculerCouleur(id: string) {
    setCouleursIdsSel(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  }

  async function sauvegarder() {
    if (!nom.trim()) {
      setErreur('Le nom ne peut pas être vide.');
      return;
    }
    setEnCours(true);
    setErreur('');
    try {
      const res = await fetch(`/api/admin/pierres/${pierre.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom, description, couleursIds: couleursIdsSel }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur');
      }
      setEdition(false);
      router.refresh();
    } catch (err: any) {
      setErreur(err.message || 'Erreur lors de la mise à jour.');
    } finally {
      setEnCours(false);
    }
  }

  async function supprimer() {
    setEnCours(true);
    try {
      const res = await fetch(`/api/admin/pierres/${pierre.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      alert('Erreur lors de la suppression.');
      setEnCours(false);
    }
  }

  if (edition) {
    return (
      <tr>
        <td colSpan={5}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.5rem 0' }}>
            <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Nom" />
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Description" />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {couleurs.map((c) => (
                <button key={c.id} type="button" onClick={() => basculerCouleur(c.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.6rem',
                    borderRadius: '999px', cursor: 'pointer', fontSize: '0.8rem',
                    border: couleursIdsSel.includes(c.id) ? '2px solid var(--nabe-terracotta)' : '1px solid #ccc',
                    background: couleursIdsSel.includes(c.id) ? 'var(--nabe-sable)' : 'white',
                  }}>
                  <span style={{ width: 12, height: 12, borderRadius: '50%', background: c.codeHex, border: '1px solid #ccc' }} />
                  {c.nom}
                </button>
              ))}
            </div>
            {erreur && <p className="admin-categories__erreur">{erreur}</p>}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="admin-btn-icone" onClick={sauvegarder} disabled={enCours}>
                {enCours ? '...' : 'Enregistrer'}
              </button>
              <button className="admin-btn-icone" onClick={() => setEdition(false)}>Annuler</button>
            </div>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td>{pierre.nom}</td>
      <td style={{ maxWidth: 280, fontSize: '0.85rem', color: 'var(--texte-secondaire)' }}>
        {pierre.description ? pierre.description.slice(0, 80) + (pierre.description.length > 80 ? '…' : '') : '—'}
      </td>
      <td>
        {pierre.couleurs.length > 0 ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            {pierre.couleurs.map((c, i) => (
              <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{
                  display: 'inline-block', width: 14, height: 14, borderRadius: '50%',
                  backgroundColor: c.couleurPierre.codeHex, border: '1px solid var(--nabe-argile)',
                }} />
                <span style={{ fontSize: '0.82rem' }}>{c.couleurPierre.nom}</span>
              </span>
            ))}
          </span>
        ) : '—'}
      </td>
      <td>{pierre._count.produits}</td>
      <td className="admin-categories__actions">
        {confirmationSuppression ? (
          <>
            <span className="admin-categories__confirmation">Confirmer ?</span>
            <button className="admin-btn-icone admin-btn-supprimer" onClick={supprimer} disabled={enCours}>Oui</button>
            <button className="admin-btn-icone" onClick={() => setConfirmationSuppression(false)}>Annuler</button>
          </>
        ) : (
          <>
            <button className="admin-btn-icone" onClick={() => setEdition(true)}>Modifier</button>
            <button className="admin-btn-icone admin-btn-supprimer" onClick={() => setConfirmationSuppression(true)}>Supprimer</button>
          </>
        )}
      </td>
    </tr>
  );
}
