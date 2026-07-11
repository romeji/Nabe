'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  LABELS_TYPE_BIJOU,
  LABELS_DISPONIBILITE,
} from '@/lib/utils';
import './formulaire-produit.css';

type ImageProduit = { url: string; publicId?: string; alt?: string };
type OptionSimple = { id: string; nom: string };
type OptionCouleur = { id: string; nom: string; codeHex: string };
type OptionPierre = { id: string; nom: string; couleurs: { couleurPierre: OptionCouleur }[] };

type ProduitFormData = {
  id?: string;
  nom: string;
  description: string;
  prix: number;
  type: string;
  categorieId: string;
  matiereId: string;
  collectionId: string;
  pierresIds: string[];
  delaiFabrication: string;
  fabriqueEnFrance: boolean;
  tailleSurMesure: boolean;
  taillesDisponibles: string[];
  disponibilite: string;
  stock: number;
  poidsGrammes: number;
  stockParTaille: Record<string, number>;
  actif: boolean;
  enAvant: boolean;
  composerAvecActif: boolean;
  composeAvecIds: string[];
  images: ImageProduit[];
};

const TAILLES_BAGUE = ['48', '50', '52', '54', '56', '58', '60'];

export default function FormulaireProduit({ produitInitial }: { produitInitial?: Partial<ProduitFormData> }) {
  const router = useRouter();
  const [categories, setCategories] = useState<OptionSimple[]>([]);
  const [matieres, setMatieres] = useState<OptionSimple[]>([]);
  const [collections, setCollections] = useState<OptionSimple[]>([]);
  const [pierres, setPierres] = useState<OptionPierre[]>([]);
  const [tousLesProduits, setTousLesProduits] = useState<OptionSimple[]>([]);
  const [chargementOptions, setChargementOptions] = useState(true);
  const [donnees, setDonnees] = useState<ProduitFormData>({
    nom: produitInitial?.nom || '',
    description: produitInitial?.description || '',
    prix: produitInitial?.prix || 0,
    type: produitInitial?.type || 'BAGUE',
    categorieId: produitInitial?.categorieId || '',
    matiereId: produitInitial?.matiereId || '',
    collectionId: produitInitial?.collectionId || '',
    pierresIds: produitInitial?.pierresIds || [],
    delaiFabrication: produitInitial?.delaiFabrication || '',
    fabriqueEnFrance: produitInitial?.fabriqueEnFrance ?? true,
    tailleSurMesure: produitInitial?.tailleSurMesure ?? false,
    taillesDisponibles: produitInitial?.taillesDisponibles || [],
    disponibilite: produitInitial?.disponibilite || 'EN_STOCK',
    stock: produitInitial?.stock || 0,
    poidsGrammes: produitInitial?.poidsGrammes || 50,
    stockParTaille: produitInitial?.stockParTaille || {},
    actif: produitInitial?.actif ?? true,
    enAvant: produitInitial?.enAvant ?? false,
    composerAvecActif: produitInitial?.composerAvecActif ?? true,
    composeAvecIds: produitInitial?.composeAvecIds || [],
    images: produitInitial?.images || [],
  });
  const [enregistrement, setEnregistrement] = useState(false);
  const [uploadEnCours, setUploadEnCours] = useState(false);
  const [erreur, setErreur] = useState('');

  // Charge les catégories, matières, collections, pierres et la liste des produits existante
  useEffect(() => {
    async function chargerOptions() {
      try {
        const [resCategories, resMatieres, resCollections, resPierres, resProduits] = await Promise.all([
          fetch('/api/admin/categories'),
          fetch('/api/admin/matieres'),
          fetch('/api/admin/collections'),
          fetch('/api/admin/pierres'),
          fetch('/api/admin/produits'),
        ]);
        const dataCategories = await resCategories.json();
        const dataMatieres = await resMatieres.json();
        const dataCollections = await resCollections.json();
        const dataPierres = await resPierres.json();
        const dataProduits = await resProduits.json();
        setPierres(dataPierres);
        setCategories(dataCategories);
        setMatieres(dataMatieres);
        setCollections(dataCollections);
        setTousLesProduits(
          dataProduits
            .filter((p: any) => p.id !== produitInitial?.id)
            .map((p: any) => ({ id: p.id, nom: p.nom }))
        );
      } catch (err) {
        console.error('Erreur chargement catégories/matières/collections/pierres/produits:', err);
      } finally {
        setChargementOptions(false);
      }
    }
    chargerOptions();
  }, [produitInitial?.id]);

  function majChamp<K extends keyof ProduitFormData>(champ: K, valeur: ProduitFormData[K]) {
    setDonnees((d) => ({ ...d, [champ]: valeur }));
  }

  function basculerPierre(pierreId: string) {
    setDonnees((d) => ({
      ...d,
      pierresIds: d.pierresIds.includes(pierreId)
        ? d.pierresIds.filter((id: any) => id !== pierreId)
        : [...d.pierresIds, pierreId],
    }));
  }
  function basculerComposeAvec(produitId: string) {
    setDonnees((d) => {
      if (d.composeAvecIds.includes(produitId)) {
        return { ...d, composeAvecIds: d.composeAvecIds.filter((id: any) => id !== produitId) };
      }
      if (d.composeAvecIds.length >= 2) {
        return d; // déjà 2 sélectionnés, on ignore le clic
      }
      return { ...d, composeAvecIds: [...d.composeAvecIds, produitId] };
    });
  }

  function basculerTaille(taille: string) {
    setDonnees((d) => ({
      ...d,
      taillesDisponibles: d.taillesDisponibles.includes(taille)
        ? d.taillesDisponibles.filter((t: any) => t !== taille)
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
    setDonnees((d) => ({ ...d, images: d.images.filter((_: any, i: number) => i !== index) }));
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
        collectionId: donnees.collectionId || null,
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
              {categories.map((c: any) => (
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
              {matieres.map((m: any) => (
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

        <div className="admin-form__champ-pleine-largeur">
          <label>Pierres (sélection multiple, facultatif)</label>
          <div className="formulaire-produit__pierres">
            {pierres.map((p: any) => (
              <button
                key={p.id}
                type="button"
                className={`formulaire-produit__pierre-bouton ${donnees.pierresIds.includes(p.id) ? 'actif' : ''}`}
                onClick={() => basculerPierre(p.id)}
              >
                {p.couleurs.length > 0 && (
                  <span style={{ display: 'inline-flex', gap: 2, marginRight: 4 }}>
                    {p.couleurs.slice(0, 3).map((c: any, i: number) => (
                      <span
                        key={i}
                        className="formulaire-produit__pierre-pastille"
                        style={{ backgroundColor: c.couleurPierre.codeHex }}
                      />
                    ))}
                  </span>
                )}
                {p.nom}
              </button>
            ))}
          </div>
          {pierres.length === 0 && !chargementOptions && (
            <p className="formulaire-produit__aide">
              Aucune pierre créée. Ajoutez-en depuis <a href="/admin/pierres">Admin &gt; Pierres</a>.
            </p>
          )}
        </div>

        <div className="admin-form__ligne">
          <div>
            <label>Collection (facultatif)</label>
            <select value={donnees.collectionId} onChange={(e) => majChamp('collectionId', e.target.value)} disabled={chargementOptions}>
              <option value="">Aucune collection</option>
              {collections.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.nom}
                </option>
              ))}
            </select>
            {collections.length === 0 && !chargementOptions && (
              <p className="formulaire-produit__aide">
                Aucune collection créée. Ajoutez-en depuis <a href="/admin/collections">Admin &gt; Collections</a>.
              </p>
            )}
          </div>
          <div>
            <label>Délai de fabrication</label>
            <input
              type="text"
              placeholder="Ex : 2 à 3 semaines"
              value={donnees.delaiFabrication}
              onChange={(e) => majChamp('delaiFabrication', e.target.value)}
            />
          </div>
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
            {TAILLES_BAGUE.map((t: any) => (
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

        {donnees.taillesDisponibles.length > 0 ? (
          <div>
            <label>Quantité en stock par taille</label>
            <div className="formulaire-produit__stock-tailles">
              {donnees.taillesDisponibles.map((t: any) => (
                <div key={t} className="formulaire-produit__stock-taille-ligne">
                  <span className="formulaire-produit__stock-taille-label">Taille {t}</span>
                  <input
                    type="number"
                    min="0"
                    value={donnees.stockParTaille[t] ?? 0}
                    onChange={(e) =>
                      majChamp('stockParTaille', {
                        ...donnees.stockParTaille,
                        [t]: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              ))}
            </div>
            <p className="formulaire-produit__aide">
              Stock total : {Object.values(donnees.stockParTaille).reduce((a: any, b: any) => a + (b || 0), 0)}
            </p>
          </div>
        ) : (
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
          </div>
        )}

        <div className="admin-form__ligne">
          <div>
            <label>Poids (grammes, emballé)</label>
            <input
              type="number"
              min="1"
              value={donnees.poidsGrammes}
              onChange={(e) => majChamp('poidsGrammes', parseInt(e.target.value) || 1)}
            />
            <p className="formulaire-produit__aide">Utilisé pour calculer le tarif de livraison réel au checkout.</p>
          </div>
        </div>

        <div className="admin-form__ligne">
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
        <h2>"À composer avec" — suggestions sur la fiche produit</h2>
        <label className="admin-form__case">
          <input
            type="checkbox"
            checked={donnees.composerAvecActif}
            onChange={(e) => majChamp('composerAvecActif', e.target.checked)}
          />
          Afficher ce bloc sur la fiche de ce bijou
        </label>

        {donnees.composerAvecActif && (
          <div className="formulaire-produit__compose-avec">
            <p className="formulaire-produit__aide">
              Choisissez jusqu'à 2 bijoux à suggérer ({donnees.composeAvecIds.length} / 2 sélectionné(s)).
              Si aucun n'est choisi, le bloc ne s'affichera pas.
            </p>
            <div className="formulaire-produit__produits-liste">
              {tousLesProduits.map((p: any) => (
                <button
                  key={p.id}
                  type="button"
                  className={`formulaire-produit__produit-bouton ${donnees.composeAvecIds.includes(p.id) ? 'actif' : ''}`}
                  onClick={() => basculerComposeAvec(p.id)}
                  disabled={!donnees.composeAvecIds.includes(p.id) && donnees.composeAvecIds.length >= 2}
                >
                  {p.nom}
                </button>
              ))}
            </div>
            {tousLesProduits.length === 0 && !chargementOptions && (
              <p className="formulaire-produit__aide">
                Aucun autre bijou disponible pour le moment.
              </p>
            )}
          </div>
        )}
      </div>

      <div className="formulaire-produit__section">
        <h2>Photos</h2>
        <input type="file" accept="image/*" multiple onChange={gererUploadImage} disabled={uploadEnCours} />
        {uploadEnCours && <p className="formulaire-produit__upload-statut">Envoi en cours...</p>}

        <div className="formulaire-produit__images">
          {donnees.images.map((img: any, i: number) => (
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
