'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  LABELS_TYPE_BIJOU,
  LABELS_PIERRE,
  LABELS_DISPONIBILITE,
} from '@/lib/utils';
import './formulaire-produit.css';

type ImageProduit = { url: string; publicId?: string; alt?: string };
type OptionSimple = { id: string; nom: string };

type ProduitFormData = {
  id?: string;
  nom: string;
  description: string;
  prix: number;
  type: string;
  categorieId: string;
  matiereId: string;
  pierre: string;
  couleurPierre: string;
  delaiFabrication: string;
  fabriqueEnFrance: boolean;
  tailleSurMesure: boolean;
  taillesDisponibles: string[];
  disponibilite: string;
  stock: number;
  actif: boolean;
  enAvant: boolean;
  images: ImageProduit[];
};

const TAILLES_BAGUE = ['48', '50', '52', '54', '56', '58', '60'];

export default function FormulaireProduit({ produitInitial }: { produitInitial?: Partial<ProduitFormData> }) {
  const router = useRouter();
  const [categories, setCategories] = useState<OptionSimple[]>([]);
  const [matieres, setMatieres] = useState<OptionSimple[]>([]);
  const [chargementOptions, setChargementOptions] = useState(true);
  const [donnees, setDonnees] = useState<ProduitFormData>({
    nom: produitInitial?.nom || '',
    description: produitInitial?.description || '',
    prix: produitInitial?.prix || 0,
    type: produitInitial?.type || 'BAGUE',
    categorieId: produitInitial?.categorieId || '',
    matiereId: produitInitial?.matiereId || '',
    pierre: produitInitial?.pierre || 'AUCUNE',
    couleurPierre: produitInitial?.couleurPierre || '',
    delaiFabrication: produitInitial?.delaiFabrication || '',
    fabriqueEnFrance: produitInitial?.fabriqueEnFrance ?? true,
    tailleSurMesure: produitInitial?.tailleSurMesure ?? false,
    taillesDisponibles: produitInitial?.taillesDisponibles || [],
    disponibilite: produitInitial?.disponibilite || 'EN_STOCK',
    stock: produitInitial?.stock || 0,
    actif: produitInitial?.actif ?? true,
    enAvant: produitInitial?.enAvant ?? false,
    images: produitInitial?.images || [],
  });
  const [enregistrement, setEnregistrement] = useState(false);
  const [uploadEnCours, setUploadEnCours] = useState(false);
  const [erreur, setErreur] = useState('');

  // Charge les catégories et matières existantes (gérées dans Admin > Catégories / Matières)
  useEffect(() => {
    async function chargerOptions() {
      try {
        const [resCategories, resMatieres] = await Promise.all([
          fetch('/api/admin/categories'),
          fetch('/api/admin/matieres'),
        ]);
        const dataCategories = await resCategories.json();
        const dataMatieres = await resMatieres.json();
        setCategories(dataCategories);
        setMatieres(dataMatieres);
      } catch (err) {
        console.error('Erreur chargement catégories/matières:', err);
      } finally {
        setChargementOptions(false);
      }
    }
    chargerOptions();
  }, []);

  function majChamp<K extends keyof ProduitFormData>(champ: K, valeur: ProduitFormData[K]) {
    setDonnees((d) => ({ ...d, [champ]: valeur }));
  }

  function basculerTaille(taille: string) {
    setDonnees((d) => ({
      ...d,
      taillesDisponibles: d.taillesDisponibles.includes(taille)
        ? d.taillesDisponibles.filter((t) => t !== taille)
        : [...d.taillesDisponibles, taille],
    }));
  }

  async function gererUploadImage(e: React.ChangeEvent<HTMLInputElement>) {
    const fichiers = e.target.files;
    if (!fichiers || fichiers.length === 0) return;

    setUploadEnCours(true);
    setErreur('');

    const echecs: string[] = [];

    for (const fichier of Array.from(fichiers)) {
      try {
        if (fichier.size > 10 * 1024 * 1024) {
          echecs.push(`${fichier.name} (fichier trop lourd, max 10 Mo)`);
          continue;
        }

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

        if (!res.ok) {
          echecs.push(fichier.name);
          continue;
        }

        const resultat = await res.json();

        setDonnees((d) => ({
          ...d,
          images: [...d.images, { url: resultat.url, publicId: resultat.publicId, alt: d.nom }],
        }));
      } catch (err) {
        echecs.push(fichier.name);
      }
    }

    if (echecs.length > 0) {
      setErreur(
        `Échec de l'upload pour : ${echecs.join(', ')}. Vérifiez votre configuration Cloudinary ou réessayez.`
      );
    }

    setUploadEnCours(false);
    // Permet de re-sélectionner les mêmes fichiers si besoin de réessayer
    e.target.value = '';
  }

  function retirerImage(index: number) {
    setDonnees((d) => ({ ...d, images: d.images.filter((_, i) => i !== index) }));
  }

  async function gererSoumission(e: React.FormEvent) {
    e.preventDefault();
    setEnregistrement(true);
    setErreur('');

    try {
      const url = produitInitial?.id ? `/api/admin/produits/${produitInitial.id}` : '/api/admin/produits';
      const methode = produitInitial?.id ? 'PATCH' : 'POST';

      const payload = {
        ...donnees,
        categorieId: donnees.categorieId || null,
        matiereId: donnees.matiereId || null,
      };

      const res = await fetch(url, {
        method: methode,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur lors de l\'enregistrement');
      }

      router.push('/admin/produits');
      router.refresh();
    } catch (err: any) {
      setErreur(err.message);
    } finally {
      setEnregistrement(false);
    }
  }

  return (
    <form onSubmit={gererSoumission} className="formulaire-produit">
      {erreur && <p className="formulaire-produit__erreur">{erreur}</p>}

      <div className="formulaire-produit__section">
        <h2>Informations générales</h2>

        <label>Nom du bijou</label>
        <input
          type="text"
          value={donnees.nom}
          onChange={(e) => majChamp('nom', e.target.value)}
          required
        />

        <label>Description</label>
        <textarea
          value={donnees.description}
          onChange={(e) => majChamp('description', e.target.value)}
          rows={4}
          required
        />

        <div className="admin-form__ligne">
          <div>
            <label>Prix (€)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={donnees.prix}
              onChange={(e) => majChamp('prix', parseFloat(e.target.value) || 0)}
              required
            />
          </div>
          <div>
            <label>Type de bijou</label>
            <select value={donnees.type} onChange={(e) => majChamp('type', e.target.value)}>
              {Object.entries(LABELS_TYPE_BIJOU).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="admin-form__ligne">
          <div>
            <label>Catégorie</label>
            <select value={donnees.categorieId} onChange={(e) => majChamp('categorieId', e.target.value)} disabled={chargementOptions}>
              <option value="">Aucune catégorie</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nom}
                </option>
              ))}
            </select>
            {categories.length === 0 && !chargementOptions && (
              <p className="formulaire-produit__aide">
                Aucune catégorie créée. Ajoutez-en depuis <a href="/admin/categories">Admin &gt; Catégories</a>.
              </p>
            )}
          </div>
          <div>
            <label>Matière</label>
            <select value={donnees.matiereId} onChange={(e) => majChamp('matiereId', e.target.value)} disabled={chargementOptions}>
              <option value="">Sélectionner une matière</option>
              {matieres.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nom}
                </option>
              ))}
            </select>
            {matieres.length === 0 && !chargementOptions && (
              <p className="formulaire-produit__aide">
                Aucune matière créée. Ajoutez-en depuis <a href="/admin/matieres">Admin &gt; Matières</a>.
              </p>
            )}
          </div>
        </div>

        <div className="admin-form__ligne">
          <div>
            <label>Pierre</label>
            <select value={donnees.pierre} onChange={(e) => majChamp('pierre', e.target.value)}>
              {Object.entries(LABELS_PIERRE).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Couleur de la pierre</label>
            <input
              type="text"
              placeholder="Ex : Blanc, Champagne, Rose"
              value={donnees.couleurPierre}
              onChange={(e) => majChamp('couleurPierre', e.target.value)}
            />
          </div>
        </div>

        <div className="admin-form__ligne">
          <div>
            <label>Délai de fabrication</label>
            <input
              type="text"
              placeholder="Ex : 2 à 3 semaines"
              value={donnees.delaiFabrication}
              onChange={(e) => majChamp('delaiFabrication', e.target.value)}
            />
          </div>
          <div />
        </div>

        <label className="admin-form__case">
          <input
            type="checkbox"
            checked={donnees.fabriqueEnFrance}
            onChange={(e) => majChamp('fabriqueEnFrance', e.target.checked)}
          />
          Fabriqué à la main en France
        </label>
      </div>

      <div className="formulaire-produit__section">
        <h2>Tailles</h2>
        <label className="admin-form__case">
          <input
            type="checkbox"
            checked={donnees.tailleSurMesure}
            onChange={(e) => majChamp('tailleSurMesure', e.target.checked)}
          />
          Disponible uniquement sur mesure (pas de taille fixe)
        </label>

        {!donnees.tailleSurMesure && (
          <div className="formulaire-produit__tailles">
            {TAILLES_BAGUE.map((t) => (
              <button
                key={t}
                type="button"
                className={`formulaire-produit__taille ${
                  donnees.taillesDisponibles.includes(t) ? 'actif' : ''
                }`}
                onClick={() => basculerTaille(t)}
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="formulaire-produit__section">
        <h2>Stock & disponibilité</h2>
        <div className="admin-form__ligne">
          <div>
            <label>Quantité en stock</label>
            <input
              type="number"
              min="0"
              value={donnees.stock}
              onChange={(e) => majChamp('stock', parseInt(e.target.value) || 0)}
            />
          </div>
          <div>
            <label>Disponibilité</label>
            <select value={donnees.disponibilite} onChange={(e) => majChamp('disponibilite', e.target.value)}>
              {Object.entries(LABELS_DISPONIBILITE).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        </div>

        <label className="admin-form__case">
          <input type="checkbox" checked={donnees.actif} onChange={(e) => majChamp('actif', e.target.checked)} />
          Visible sur le site
        </label>
        <label className="admin-form__case">
          <input
            type="checkbox"
            checked={donnees.enAvant}
            onChange={(e) => majChamp('enAvant', e.target.checked)}
          />
          Mettre en avant sur la page d'accueil
        </label>
      </div>

      <div className="formulaire-produit__section">
        <h2>Photos</h2>
        <input type="file" accept="image/*" multiple onChange={gererUploadImage} disabled={uploadEnCours} />
        {uploadEnCours && <p className="formulaire-produit__upload-statut">Envoi en cours...</p>}

        <div className="formulaire-produit__images">
          {donnees.images.map((img, i) => (
            <div key={i} className="formulaire-produit__image">
              <img src={img.url} alt={img.alt || ''} />
              <button type="button" onClick={() => retirerImage(i)}>
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="formulaire-produit__actions">
        <button type="submit" className="btn btn-primaire" disabled={enregistrement}>
          {enregistrement ? 'Enregistrement...' : produitInitial?.id ? 'Mettre à jour' : 'Créer le bijou'}
        </button>
      </div>
    </form>
  );
}
