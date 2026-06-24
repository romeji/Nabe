'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function FormulaireCollectionClient() {
  const router = useRouter();
  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<{ url: string; publicId?: string } | null>(null);
  const [uploadEnCours, setUploadEnCours] = useState(false);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
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
      setImage({ url: resultat.url, publicId: resultat.publicId });
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
      const res = await fetch('/api/admin/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom, description, image: image?.url }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur');
      }
      setNom('');
      setDescription('');
      setImage(null);
      router.refresh();
    } catch (err: any) {
      setErreur(err.message || 'Erreur lors de la création de la collection.');
    } finally {
      setEnvoiEnCours(false);
    }
  }

  return (
    <div className="admin-carte">
      <h2>Ajouter une collection</h2>
      <form onSubmit={gererSoumission} className="admin-form">
        <div>
          <label>Nom</label>
          <input
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            placeholder="Ex : Été 2026, Pierre de lune..."
            required
          />
        </div>
        <div>
          <label>Description (optionnelle)</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
        </div>
        <div>
          <label>Image de présentation (optionnelle)</label>
          <input type="file" accept="image/*" onChange={gererUploadImage} disabled={uploadEnCours} />
          {uploadEnCours && <p style={{ fontSize: '0.8rem', color: 'var(--texte-secondaire)' }}>Envoi en cours...</p>}
          {image && <img src={image.url} alt="" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 4, marginTop: 6 }} />}
        </div>
        {erreur && <p style={{ color: '#a8412a', fontSize: '0.85rem' }}>{erreur}</p>}
        <button type="submit" className="btn btn-primaire" disabled={envoiEnCours || uploadEnCours}>
          {envoiEnCours ? 'Création...' : 'Créer la collection'}
        </button>
      </form>
    </div>
  );
}
