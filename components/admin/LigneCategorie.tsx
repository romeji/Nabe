'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Categorie = {
  id: string;
  nom: string;
  slug: string;
  image?: string | null;
  imageAccueilFond?: string | null;
  logoAccueil?: string | null;
  _count: { produits: number };
};

export default function LigneCategorie({ categorie }: { categorie: Categorie }) {
  const router = useRouter();
  const [edition, setEdition] = useState(false);
  const [nom, setNom] = useState(categorie.nom);
  const [image, setImage] = useState(categorie.image || '');
  const [imageAccueilFond, setImageAccueilFond] = useState(categorie.imageAccueilFond || '');
  const [logoAccueil, setLogoAccueil] = useState(categorie.logoAccueil || '');
  const [uploadEnCours, setUploadEnCours] = useState(false);
  const [confirmationSuppression, setConfirmationSuppression] = useState(false);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState('');

  async function gererUploadImage(e: React.ChangeEvent<HTMLInputElement>, definirImage: (url: string) => void) {
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
      definirImage(resultat.url);
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
        body: JSON.stringify({ nom, image, imageAccueilFond, logoAccueil }),
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
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la suppression.');
      router.refresh();
    } catch (e: any) {
      setEnCours(false);
      alert(e.message || 'Erreur lors de la suppression.');
    }
  }

  function annulerEdition() {
    setEdition(false);
    setNom(categorie.nom);
    setImage(categorie.image || '');
    setImageAccueilFond(categorie.imageAccueilFond || '');
    setLogoAccueil(categorie.logoAccueil || '');
    setErreur('');
  }

  if (edition) {
    return (
      <tr className="admin-table__edition-row">
        <td colSpan={4}>
          <div className="admin-inline-edit">
            <div className="admin-inline-edit__media">
              <ApercuCarre url={image} mode="cover" />
              <div className="admin-inline-edit__champs">
                <input
                  type="text"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  className="admin-categories__input-inline"
                  autoFocus
                  placeholder="Nom de la catégorie"
                />
                <ChampUpload label="Image principale" onChange={(e) => gererUploadImage(e, setImage)} disabled={uploadEnCours} />
                <ChampUpload label="Fond accueil" onChange={(e) => gererUploadImage(e, setImageAccueilFond)} disabled={uploadEnCours} />
                <ChampUpload label="Logo accueil" onChange={(e) => gererUploadImage(e, setLogoAccueil)} disabled={uploadEnCours} />
                {uploadEnCours && <span style={{ fontSize: '0.78rem', color: 'var(--texte-secondaire)' }}>Envoi en cours...</span>}
              </div>
            </div>
            <div className="admin-categories__apercus">
              <ApercuImage url={imageAccueilFond} libelle="Fond accueil" mode="cover" />
              <ApercuImage url={logoAccueil} libelle="Logo accueil" mode="contain" />
            </div>
            {erreur && <p className="admin-categories__erreur">{erreur}</p>}
            <div className="admin-inline-edit__actions">
              <button className="admin-btn-icone" onClick={sauvegarder} disabled={enCours || uploadEnCours}>
                {enCours ? '...' : 'Enregistrer'}
              </button>
              <button className="admin-btn-icone" onClick={annulerEdition}>
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
          <ApercuCarre url={categorie.image || ''} mode="cover" petit />
          {categorie.nom}
        </div>
      </td>
      <td>{categorie.slug}</td>
      <td>{categorie._count.produits}</td>
      <td className="admin-categories__actions">
        {confirmationSuppression ? (
          <>
            <span className="admin-categories__confirmation">
              {categorie._count.produits > 0
                ? `Supprimer ? ${categorie._count.produits} produit${categorie._count.produits > 1 ? 's' : ''} seront détaché${categorie._count.produits > 1 ? 's' : ''} (pas supprimés).`
                : 'Confirmer la suppression ?'}
            </span>
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

function ChampUpload({
  label,
  disabled,
  onChange,
}: {
  label: string;
  disabled: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <>
      <label className="admin-categories__label-upload">{label}</label>
      <input type="file" accept="image/*" onChange={onChange} disabled={disabled} />
    </>
  );
}

function ApercuCarre({ url, mode, petit = false }: { url: string; mode: 'cover' | 'contain'; petit?: boolean }) {
  const taille = petit ? 36 : 64;
  if (!url) {
    return <div style={{ width: taille, height: taille, borderRadius: 6, background: '#f1e0cb', flexShrink: 0 }} />;
  }
  return (
    <img
      src={url}
      alt=""
      style={{ width: taille, height: taille, objectFit: mode, borderRadius: 6, background: '#f1e0cb', flexShrink: 0 }}
    />
  );
}

function ApercuImage({ url, libelle, mode }: { url: string; libelle: string; mode: 'cover' | 'contain' }) {
  return (
    <div className="admin-categories__apercu">
      <span>{libelle}</span>
      <ApercuCarre url={url} mode={mode} />
    </div>
  );
}
