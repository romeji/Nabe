'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Collection = {
  id: string;
  nom: string;
  slug: string;
  actif: boolean;
  image: string | null;
  _count: { produits: number };
};

export default function LigneCollection({ collection }: { collection: Collection }) {
  const router = useRouter();
  const [edition, setEdition] = useState(false);
  const [nom, setNom] = useState(collection.nom);
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
      const res = await fetch(`/api/admin/collections/${collection.id}`, {
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

  async function basculerActif() {
    setEnCours(true);
    try {
      const res = await fetch(`/api/admin/collections/${collection.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actif: !collection.actif }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      alert('Erreur lors de la mise à jour.');
    } finally {
      setEnCours(false);
    }
  }

  async function supprimer() {
    setEnCours(true);
    try {
      const res = await fetch(`/api/admin/collections/${collection.id}`, { method: 'DELETE' });
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
        {collection.image ? (
          <img src={collection.image} alt={collection.nom} className="admin-produits__miniature" />
        ) : (
          <div className="admin-produits__miniature-vide" />
        )}
      </td>
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
          collection.nom
        )}
        {erreur && <p className="admin-categories__erreur">{erreur}</p>}
      </td>
      <td>{collection.slug}</td>
      <td>{collection._count.produits}</td>
      <td>
        <button
          className={`admin-badge ${collection.actif ? 'admin-badge--succes' : 'admin-badge--neutre'}`}
          onClick={basculerActif}
          disabled={enCours}
          style={{ cursor: 'pointer', border: 'none' }}
        >
          {collection.actif ? 'Active' : 'Masquée'}
        </button>
      </td>
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
                setNom(collection.nom);
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
