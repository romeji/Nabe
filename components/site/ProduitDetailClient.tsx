'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePanierStore } from '@/lib/store-panier';
import { formaterPrix } from '@/lib/utils';
import BoutonFavori from './BoutonFavori';
import GuideTailles from './GuideTailles';
import ReassuranceProduit from './ReassuranceProduit';
import PopupPierres from './PopupPierres';
import PopupDetailsProduit from './popups/PopupDetailsProduit';
import LiensInfoProduit from './LiensInfoProduit';
import ComposerAvec from './ComposerAvec';
import BandeauReassurance from './BandeauReassurance';
import PopupPanier from './PopupPanier';

type ImageProduit = { id: string; url: string; alt: string | null };
type PierreInfo = {
  id: string;
  nom: string;
  description: string | null;
  couleurs: { nom: string; codeHex: string }[];
};
type Produit = {
  id: string;
  reference: string;
  nom: string;
  slug: string;
  description: string;
  prix: string;
  matiere: { nom: string } | null;
  collection: { nom: string; slug: string } | null;
  pierres: PierreInfo[];
  delaiFabrication: string | null;
  fabriqueEnFrance: boolean;
  tailleSurMesure: boolean;
  taillesDisponibles: string[];
  disponibilite: string;
  stock: number;
  stockTailles: { taille: string; quantite: number }[];
  images: ImageProduit[];
};

type Suggestion = {
  id: string;
  nom: string;
  slug: string;
  prix: string;
  images: { url: string }[];
};

type ProduitComposable = {
  id: string;
  nom: string;
  slug: string;
  prix: string;
  image: string | null;
};

export default function ProduitDetailClient({
  produit,
  suggestions,
  suggestionsActives,
  estFavori,
  composables,
  galeriePosition = 'gauche',
  boiteCadeauActif = false,
  boiteCadeauNom,
  boiteCadeauPrix,
  boiteCadeauImage,
  boiteCadeauProduitId,
  popupOuvertureActive = true,
}: {
  produit: Produit;
  suggestions: Suggestion[];
  suggestionsActives: boolean;
  estFavori: boolean;
  composables: ProduitComposable[];
  galeriePosition?: 'gauche' | 'bas';
  boiteCadeauActif?: boolean;
  boiteCadeauNom?: string;
  boiteCadeauPrix?: number;
  boiteCadeauImage?: string;
  boiteCadeauProduitId?: string;
  popupOuvertureActive?: boolean;
}) {
  const [imageActive, setImageActive] = useState(0);
  const [tailleChoisie, setTailleChoisie] = useState('');
  const [popupDetailsOuverte, setPopupDetailsOuverte] = useState(false);
  const [popupPanierOuverte, setPopupPanierOuverte] = useState(false);
  const [erreurTaille, setErreurTaille] = useState(false);
  const [erreurStock, setErreurStock] = useState(false);
  const ajouterArticle = usePanierStore((state) => state.ajouterArticle);

  const imagesAffichees = produit.images.length > 0 ? produit.images : [{ id: 'placeholder', url: '', alt: '' }];

  // Stock disponible pour la taille choisie (ou stock global si pas de système de taille)
  function stockDisponiblePour(taille: string): number {
    if (produit.stockTailles.length > 0) {
      const ligne = produit.stockTailles.find((s) => s.taille === taille);
      return ligne?.quantite ?? 0;
    }
    return produit.stock;
  }

  function gererAjoutPanier() {
    if (produit.taillesDisponibles.length > 0 && !tailleChoisie) {
      setErreurTaille(true);
      return;
    }
    setErreurTaille(false);

    const stockDispo = stockDisponiblePour(tailleChoisie);
    if (stockDispo <= 0) {
      setErreurStock(true);
      return;
    }
    setErreurStock(false);

    ajouterArticle({
      produitId: produit.id,
      nom: produit.nom,
      prix: parseFloat(produit.prix),
      image: produit.images[0]?.url || '',
      taille: tailleChoisie || undefined,
      quantite: 1,
      stockMax: stockDispo,
    });

    if (popupOuvertureActive) {
      setPopupPanierOuverte(true);
    }
  }

  return (
    <div className="page-produit">
      <div className="produit-fil-ariane conteneur">
        <Link href="/">Accueil</Link> / <Link href="/collections">Bijoux</Link> /{' '}
        <span>{produit.nom}</span>
      </div>

      <div className={`produit-principal conteneur produit-principal--${galeriePosition}`}>
        <div className={`produit-galerie produit-galerie--${galeriePosition}`}>
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
                fill
                sizes="(max-width: 900px) 90vw, 420px"
                style={{ objectFit: 'cover' }}
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

          <p className="produit-infos__matiere-pierre">
            {[produit.matiere?.nom, ...produit.pierres.map((p) => p.nom)].filter(Boolean).join(', ')}
          </p>

          {/* Référence + lien Détails produits */}
          <div className="produit-infos__reference-ligne">
            <span className="produit-infos__reference">{produit.reference}</span>
            <button
              type="button"
              className="produit-infos__lien-details"
              onClick={() => setPopupDetailsOuverte(true)}
            >
              Détails produits
            </button>
          </div>

          <p className="produit-infos__prix">
            {formaterPrix(produit.prix)} <span>Taxes comprises</span>
          </p>

          {produit.pierres.length > 0 && <PopupPierres pierres={produit.pierres} />}

          {/* Sélecteur de taille en boutons façon VCA */}
          {produit.taillesDisponibles.length > 0 && (
            <div className="produit-infos__champ">
              <div className="produit-infos__label-taille">
                <label>Taille</label>
              </div>
              <div className="produit-infos__tailles-boutons">
                {produit.taillesDisponibles.map((t) => {
                  const stockTaille = stockDisponiblePour(t);
                  const epuisee = produit.stockTailles.length > 0 && stockTaille <= 0;
                  return (
                    <button
                      key={t}
                      type="button"
                      disabled={epuisee}
                      className={`produit-infos__taille-bouton${tailleChoisie === t ? ' produit-infos__taille-bouton--actif' : ''}${epuisee ? ' produit-infos__taille-bouton--epuise' : ''}`}
                      onClick={() => { setTailleChoisie(t); setErreurTaille(false); setErreurStock(false); }}
                    >
                      {t}
                    </button>
                  );
                })}
                <GuideTailles trigger={<span className="guide-tailles__lien">Trouver ma taille</span>} />
              </div>
              {erreurTaille && (
                <p className="produit-infos__erreur-taille">Merci de choisir une taille.</p>
              )}
              {erreurStock && (
                <p className="produit-infos__erreur-taille">Cette taille n'est plus en stock.</p>
              )}
              <p className="produit-infos__precommande">
                Vous ne trouvez pas votre taille,{' '}
                <Link href="/sur-mesure">contactez-moi pour une pré-commande</Link>.
              </p>
            </div>
          )}

          <button
            className="produit-infos__ajouter"
            onClick={gererAjoutPanier}
            disabled={produit.disponibilite === 'EPUISE' || (produit.taillesDisponibles.length === 0 && produit.stock <= 0)}
          >
            {produit.disponibilite === 'EPUISE' || (produit.taillesDisponibles.length === 0 && produit.stock <= 0)
              ? 'ÉPUISÉ'
              : `AJOUTER AU PANIER · ${formaterPrix(produit.prix)}`}
          </button>

          <p className="produit-infos__retours">Retours sans frais dans un délai de 30 jours</p>

          <LiensInfoProduit />

          <ComposerAvec produits={composables} />
        </div>
      </div>

      <ReassuranceProduit />

      {suggestionsActives && suggestions.length > 0 && (
        <div className="produit-suggestions conteneur">
          <h2>Découvrez également ces créations</h2>
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

      <BandeauReassurance />

      <PopupDetailsProduit
        ouverte={popupDetailsOuverte}
        onFermer={() => setPopupDetailsOuverte(false)}
        reference={produit.reference}
        description={produit.description}
        pierres={produit.pierres}
        taillesDisponibles={produit.taillesDisponibles}
      />

      <PopupPanier
        ouverte={popupPanierOuverte}
        onFermer={() => setPopupPanierOuverte(false)}
        boiteCadeauActif={boiteCadeauActif}
        boiteCadeauNom={boiteCadeauNom}
        boiteCadeauPrix={boiteCadeauPrix}
        boiteCadeauImage={boiteCadeauImage}
        boiteCadeauProduitId={boiteCadeauProduitId}
      />
    </div>
  );
}
