'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePanierStore } from '@/lib/store-panier';
import { formaterPrix, LABELS_PIERRE } from '@/lib/utils';
import BoutonFavori from './BoutonFavori';
import GuideTailles from './GuideTailles';
import AccordeonProduit from './AccordeonProduit';
import ReassuranceProduit from './ReassuranceProduit';

type ImageProduit = { id: string; url: string; alt: string | null };
type Produit = {
  id: string;
  nom: string;
  slug: string;
  description: string;
  prix: string;
  matiere: { nom: string } | null;
  collection: { nom: string; slug: string } | null;
  pierre: string;
  delaiFabrication: string | null;
  fabriqueEnFrance: boolean;
  tailleSurMesure: boolean;
  taillesDisponibles: string[];
  disponibilite: string;
  images: ImageProduit[];
};

type Suggestion = {
  id: string;
  nom: string;
  slug: string;
  prix: string;
  images: { url: string }[];
};

export default function ProduitDetailClient({
  produit,
  suggestions,
  suggestionsActives,
  estFavori,
}: {
  produit: Produit;
  suggestions: Suggestion[];
  suggestionsActives: boolean;
  estFavori: boolean;
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
          <div className="produit-infos__entete">
            <div>
              {produit.collection && (
                <Link href={`/collections?collection=${produit.collection.slug}`} className="produit-infos__collection">
                  {produit.collection.nom}
                </Link>
              )}
              <h1>{produit.nom}</h1>
            </div>
            <BoutonFavori produitId={produit.id} initialementFavori={estFavori} className="produit-infos__coeur" />
          </div>

          <p className="produit-infos__prix">{formaterPrix(produit.prix)}</p>

          <ul className="produit-infos__caracteristiques">
            {produit.matiere && (
              <li>
                <strong>Matière :</strong> {produit.matiere.nom}
              </li>
            )}
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
          </ul>

          {produit.taillesDisponibles.length > 0 && (
            <div className="produit-infos__champ">
              <div className="produit-infos__label-taille">
                <label>Taille</label>
                <GuideTailles trigger={<span className="guide-tailles__lien">Trouver ma taille</span>} />
              </div>
              <select value={tailleChoisie} onChange={(e) => setTailleChoisie(e.target.value)}>
                <option value="">Choisir une taille</option>
                {produit.taillesDisponibles.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <p className="produit-infos__precommande">
                Vous ne trouvez pas votre taille,{' '}
                <Link href="/sur-mesure">contactez-moi pour une pré-commande</Link>.
              </p>
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

          <ReassuranceProduit />

          <AccordeonProduit description={produit.description} />
        </div>
      </div>

      {suggestionsActives && suggestions.length > 0 && (
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
                <span>{formaterPrix(s.prix)}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
