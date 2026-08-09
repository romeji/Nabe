'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type ImageUpload = { url: string; publicId?: string };

export default function FormulaireCategorieClient() {
  const router = useRouter();
  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<ImageUpload | null>(null);
  const [uploadEnCours, setUploadEnCours] = useState(false);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [erreur, setErreur] = useState('');

  async function gererUploadImage(
    e: React.ChangeEvent<HTMLInputElement>,
    definirImage: (image: ImageUpload) => void
  ) {
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
      definirImage({ url: resultat.url, publicId: resultat.publicId });
    } catch {
      setErreur("Erreur lors de l'upload de l'image.");
    } finally {
      setUploadEnCours(false);
    }
  }

  async function gererSoumission(e: React.FormEvent) {
    e.preventDefault();
    setEnvoiEnCours(true);
    setErreur('');
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom: nom.trim(),
          description: description.trim(),
          image: image?.url,
        }),
      });
      if (!res.ok) throw new Error();
      setNom('');
      setDescription('');
      setImage(null);
      router.refresh();
    } catch {
      setErreur('Erreur lors de la création de la catégorie.');
    } finally {
      setEnvoiEnCours(false);
    }
  }

  return (
    <div className="admin-carte">
      <h2>Ajouter une catégorie</h2>
      <form onSubmit={gererSoumission} className="admin-form">
        <div>
          <label>Nom</label>
          <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} required />
        </div>
        <div>
          <label>Description (optionnelle)</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
        </div>
        <ChampImage
          label="Image de la catégorie (affichée sur l'accueil)"
          image={image}
          mode="cover"
          disabled={uploadEnCours}
          onChange={(e) => gererUploadImage(e, setImage)}
        />
        {uploadEnCours && <p style={{ fontSize: '0.8rem', color: 'var(--texte-secondaire)' }}>Envoi en cours...</p>}
        {erreur && <p style={{ color: '#a8412a', fontSize: '0.85rem' }}>{erreur}</p>}
        <button type="submit" className="btn btn-primaire" disabled={envoiEnCours || uploadEnCours}>
          {envoiEnCours ? 'Création...' : 'Créer la catégorie'}
        </button>
      </form>
    </div>
  );
}

function ChampImage({
  label,
  image,
  mode,
  disabled,
  onChange,
}: {
  label: string;
  image: ImageUpload | null;
  mode: 'cover' | 'contain';
  disabled: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      <label>{label}</label>
      <input type="file" accept="image/*" onChange={onChange} disabled={disabled} />
      {image && (
        <img
          src={image.url}
          alt=""
          style={{ width: 80, height: 80, objectFit: mode, borderRadius: 4, marginTop: 6 }}
        />
      )}
    </div>
  );
}
