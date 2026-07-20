'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Matiere = {
  id: string;
  nom: string;
  slug: string;
  _count: { produits: number };
};

export default function LigneMatiere({ matiere }: { matiere: Matiere }) {
  const router = useRouter();
  const [edition, setEdition] = useState(false);
  const [nom, setNom] = useState(matiere.nom);
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
      const res = await fetch(`/api/admin/matieres/${matiere.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom }),
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
      const res = await fetch(`/api/admin/matieres/${matiere.id}`, { method: 'DELETE' });
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
        {edition ? (
          <input
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="admin-categories__input-inline"
            autoFocus
          />
        ) : (
          matiere.nom
        )}
        {erreur && <p className="admin-categories__erreur">{erreur}</p>}
      </td>
      <td>{matiere.slug}</td>
      <td>{matiere._count.produits}</td>
      <td className="admin-categories__actions">
        {confirmationSuppression ? (
          <>
            <span className="admin-categories__confirmation">
              {matiere._count.produits > 0
                ? `Supprimer ? ${matiere._count.produits} produit${matiere._count.produits > 1 ? 's' : ''} seront détaché${matiere._count.produits > 1 ? 's' : ''} (pas supprimés).`
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
                setNom(matiere.nom);
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
