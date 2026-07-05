'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Categorie = {
  id: string;
  nom: string;
  slug: string;
  image?: string | null;
  _count: { produits: number };
};

export default function LigneCategorie({ categorie }: { categorie: Categorie }) {
  const router = useRouter();
  const [edition, setEdition] = useState(false);
  const [nom, setNom] = useState(categorie.nom);
  const [image, setImage] = useState(categorie.image || '');
  const [uploadEnCours, setUploadEnCours] = useState(false);
  const [confirmationSuppression, setConfirmationSuppression] = useState(false);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState('');

  async function gererUploadImage(e: React.ChangeEvent<HTMLInputElement>) {
    const fichier = e.target.files?.[0];
    if (!fichier) return;

    setUploadEnCours(true);
    setErreur('');
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(fichier);
      });

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fichier: base64 }),
      });
      if (!res.ok) throw new Error("Échec de l'upload");
      const resultat = await res.json();
      setImage(resultat.url);
    } catch {
      setErreur("Erreur lors de l'upload de l'image.");
    } finally {
      setUploadEnCours(false);
    }
  }

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
        body: JSON.stringify({ nom, image }),
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

  if (edition) {
    return (
      <tr>
        <td colSpan={4}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', padding: '0.5rem 0' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div>
                {image ? (
                  <img
                    src={image}
                    alt=""
                    style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 6, background: '#f1e0cb' }}
                  />
                ) : (
                  <div style={{ width: 64, height: 64, borderRadius: 6, background: '#f1e0cb' }} />
                )}
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <input
                  type="text"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  className="admin-categories__input-inline"
                  autoFocus
                  placeholder="Nom de la catégorie"
                />
                <input type="file" accept="image/*" onChange={gererUploadImage} disabled={uploadEnCours} />
                {uploadEnCours && <span style={{ fontSize: '0.78rem', color: 'var(--texte-secondaire)' }}>Envoi en cours...</span>}
              </div>
            </div>
            {erreur && <p className="admin-categories__erreur">{erreur}</p>}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="admin-btn-icone" onClick={sauvegarder} disabled={enCours || uploadEnCours}>
                {enCours ? '...' : 'Enregistrer'}
              </button>
              <button
                className="admin-btn-icone"
                onClick={() => {
                  setEdition(false);
                  setNom(categorie.nom);
                  setImage(categorie.image || '');
                  setErreur('');
                }}
              >
                Annuler
              </button>
            </div>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {categorie.image ? (
            <img src={categorie.image} alt="" style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 6 }} />
          ) : (
            <div style={{ width: 36, height: 36, borderRadius: 6, background: '#f1e0cb' }} />
          )}
          {categorie.nom}
        </div>
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
