'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Categorie = {
  id: string;
  nom: string;
  slug: string;
  _count: { produits: number };
};

export default function LigneCategorie({ categorie }: { categorie: Categorie }) {
  const router = useRouter();
  const [edition, setEdition] = useState(false);
  const [nom, setNom] = useState(categorie.nom);
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
      const res = await fetch(`/api/admin/categories/${categorie.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom }),
      });
      if (!res.ok) throw new Error();
      setEdition(false);
      router.refresh();
    } catch {
      setErreur('Erreur lors de la mise à jour.');
    } finally {
      setEnCours(false);
    }
  }

  async function supprimer() {
    setEnCours(true);
    try {
      const res = await fetch(`/api/admin/categories/${categorie.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      alert('Erreur lors de la suppression.');
      setEnCours(false);
    }
  }

  return (
    <tr>
      <td>
        {edition ? (
          <input
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="admin-categories__input-inline"
            autoFocus
          />
        ) : (
          categorie.nom
        )}
        {erreur && <p className="admin-categories__erreur">{erreur}</p>}
      </td>
      <td>{categorie.slug}</td>
      <td>{categorie._count.produits}</td>
      <td className="admin-categories__actions">
        {confirmationSuppression ? (
          <>
            <span className="admin-categories__confirmation">Confirmer ?</span>
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
                setNom(categorie.nom);
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
