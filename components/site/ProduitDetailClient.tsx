'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePanierStore } from '@/lib/store-panier';
import {
  formaterPrix,
  LABELS_MATIERE,
  LABELS_PIERRE,
  LABELS_DISPONIBILITE,
} from '@/lib/utils';

type ImageProduit = { id: string; url: string; alt: string | null };
type Produit = {
  id: string;
  nom: string;
  slug: string;
  description: string;
  prix: string;
  matiere: string;
  pierre: string;
  delaiFabrication: string | null;
  fabriqueEnFrance: boolean;
  tailleSurMesure: boolean;
  taillesDisponibles: string[];
  disponibilite: string;
  images: ImageProduit[];
};

export default function ProduitDetailClient({
  produit,
  suggestions,
}: {
  produit: Produit;
  suggestions: any[];
}) {
  const [imageActive, setImageActive] = useState(0);
  const [tailleChoisie, setTailleChoisie] = useState('');
  const [quantite, setQuantite] = useState(1);
  const [ajoute, setAjoute] = useState(false);
  const ajouterArticle = usePanierStore((state) => state.ajouterArticle);

  const imagesAffichees = produit.images.length > 0 ? produit.images : [{ id: 'placeholder', url: '', alt: '' }];

  function gererAjoutPanier() {
    if (produit.taillesDisponibles.length > 0 && !tailleChoisie) {
      return;
    }
    ajouterArticle({
      produitId: produit.id,
      nom: produit.nom,
      prix: parseFloat(produit.prix),
      image: produit.images[0]?.url || '',
      taille: tailleChoisie || undefined,
      quantite,
    });
    setAjoute(true);
    setTimeout(() => setAjoute(false), 2000);
  }

  return (
    <div className="page-produit">
      <div className="produit-fil-ariane conteneur">
        <Link href="/">Accueil</Link> / <Link href="/collections">Bijoux</Link> /{' '}
        <span>{produit.nom}</span>
      </div>

      <div className="produit-principal conteneur">
        <div className="produit-galerie">
          <div className="produit-galerie__vignettes">
            {imagesAffichees.map((img, i) => (
              <button
                key={img.id}
                className={`produit-galerie__vignette ${i === imageActive ? 'actif' : ''}`}
                onClick={() => setImageActive(i)}
              >
                {img.url && <Image src={img.url} alt={img.alt || produit.nom} width={80} height={80} />}
              </button>
            ))}
          </div>
          <div className="produit-galerie__principale">
            {imagesAffichees[imageActive]?.url ? (
              <Image
                src={imagesAffichees[imageActive].url}
                alt={imagesAffichees[imageActive].alt || produit.nom}
                width={600}
                height={700}
                priority
              />
            ) : (
              <div className="produit-galerie__placeholder" />
            )}
          </div>
        </div>

        <div className="produit-infos">
          <h1>{produit.nom}</h1>
          <p className="produit-infos__prix">{formaterPrix(produit.prix)}</p>
          <p className="produit-infos__description">{produit.description}</p>

          <ul className="produit-infos__caracteristiques">
            <li>
              <strong>Matière :</strong> {LABELS_MATIERE[produit.matiere]}
            </li>
            {produit.pierre !== 'AUCUNE' && (
              <li>
                <strong>Pierre :</strong> {LABELS_PIERRE[produit.pierre]}
              </li>
            )}
            {produit.delaiFabrication && (
              <li>
                <strong>Délai de fabrication :</strong> {produit.delaiFabrication}
              </li>
            )}
            {produit.fabriqueEnFrance && <li>Fabriqué à la main en France</li>}
            <li>
              <strong>Taille :</strong>{' '}
              {produit.tailleSurMesure ? 'Sur mesure' : 'Voir tailles disponibles'}
            </li>
          </ul>

          {produit.taillesDisponibles.length > 0 && (
            <div className="produit-infos__champ">
              <label>Taille</label>
              <select value={tailleChoisie} onChange={(e) => setTailleChoisie(e.target.value)}>
                <option value="">Choisir une taille</option>
                {produit.taillesDisponibles.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="produit-infos__champ">
            <label>Quantité</label>
            <div className="produit-infos__quantite">
              <button onClick={() => setQuantite(Math.max(1, quantite - 1))}>−</button>
              <span>{quantite}</span>
              <button onClick={() => setQuantite(quantite + 1)}>+</button>
            </div>
          </div>

          <button
            className="btn btn-or produit-infos__ajouter"
            onClick={gererAjoutPanier}
            disabled={produit.disponibilite === 'EPUISE'}
          >
            {produit.disponibilite === 'EPUISE'
              ? 'Épuisé'
              : ajoute
              ? 'Ajouté ✓'
              : 'Ajouter au panier 🛍️'}
          </button>

          <p className="produit-infos__rassurance">
            Livraison offerte · Retours sous 14 jours · Paiement sécurisé
          </p>
        </div>
      </div>

      {suggestions.length > 0 && (
        <div className="produit-suggestions conteneur">
          <h2>Vous aimerez aussi</h2>
          <div className="produit-suggestions__grille">
            {suggestions.map((s) => (
              <Link key={s.id} href={`/collections/${s.slug}`} className="produit-suggestions__carte">
                {s.images[0] ? (
                  <Image src={s.images[0].url} alt={s.nom} width={250} height={250} />
                ) : (
                  <div className="produit-suggestions__placeholder" />
                )}
                <p>{s.nom}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
