'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type CouleurPierre = {
  id: string;
  nom: string;
  codeHex: string;
  _count: { pierres: number };
};

export default function LigneCouleurPierre({ couleur }: { couleur: CouleurPierre }) {
  const router = useRouter();
  const [edition, setEdition] = useState(false);
  const [nom, setNom] = useState(couleur.nom);
  const [codeHex, setCodeHex] = useState(couleur.codeHex);
  const [confirmationSuppression, setConfirmationSuppression] = useState(false);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState('');

  async function sauvegarder() {
    if (!nom.trim()) {
      setErreur('Le nom ne peut pas être vide.');
      return;
    }
    setEnCours(true);
    setErreur('');
    try {
      const res = await fetch(`/api/admin/couleurs-pierre/${couleur.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom, codeHex }),
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
      const res = await fetch(`/api/admin/couleurs-pierre/${couleur.id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la suppression.');
      router.refresh();
    } catch (e: any) {
      setEnCours(false);
      alert(e.message || 'Erreur lors de la suppression.');
    }
  }

  return (
    <tr>
      <td>
        <span
          style={{
            display: 'inline-block',
            width: 22,
            height: 22,
            borderRadius: '50%',
            backgroundColor: couleur.codeHex,
            border: '1px solid var(--nabe-beige-fonce)',
          }}
        />
      </td>
      <td>
        {edition ? (
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <input
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="admin-categories__input-inline"
              autoFocus
            />
            <input type="color" value={codeHex} onChange={(e) => setCodeHex(e.target.value)} style={{ width: 36 }} />
          </div>
        ) : (
          couleur.nom
        )}
        {erreur && <p className="admin-categories__erreur">{erreur}</p>}
      </td>
      <td>{couleur._count.pierres}</td>
      <td className="admin-categories__actions">
        {confirmationSuppression ? (
          <>
            <span className="admin-categories__confirmation">
              {couleur._count.pierres > 0
                ? `Supprimer ? Cette couleur sera retirée de ${couleur._count.pierres} pierre${couleur._count.pierres > 1 ? 's' : ''}.`
                : 'Confirmer la suppression ?'}
            </span>
            <button className="admin-btn-icone admin-btn-supprimer" onClick={supprimer} disabled={enCours}>
              Oui
            </button>
            <button className="admin-btn-icone" onClick={() => setConfirmationSuppression(false)}>
              Annuler
            </button>
          </>
        ) : edition ? (
          <>
            <button className="admin-btn-icone" onClick={sauvegarder} disabled={enCours}>
              {enCours ? '...' : 'Enregistrer'}
            </button>
            <button
              className="admin-btn-icone"
              onClick={() => {
                setEdition(false);
                setNom(couleur.nom);
                setCodeHex(couleur.codeHex);
                setErreur('');
              }}
            >
              Annuler
            </button>
          </>
        ) : (
          <>
            <button className="admin-btn-icone" onClick={() => setEdition(true)}>
              Modifier
            </button>
            <button className="admin-btn-icone admin-btn-supprimer" onClick={() => setConfirmationSuppression(true)}>
              Supprimer
            </button>
          </>
        )}
      </td>
    </tr>
  );
}
