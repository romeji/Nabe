'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePanierStore } from '@/lib/store-panier';
import { formaterPrix, promoEstActive, pourcentageReduction } from '@/lib/utils';
import BoutonFavori from './BoutonFavori';
import GuideTailles from './GuideTailles';
import PopupPierres from './PopupPierres';
import PopupDetailsProduit from './popups/PopupDetailsProduit';
import LiensInfoProduit from './LiensInfoProduit';
import ComposerAvec from './ComposerAvec';
import BandeauReassurance from './BandeauReassurance';

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
  prixPromo: string | null;
  promoActive: boolean;
  promoDebut: string | null;
  promoFin: string | null;
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
  galeriePosition = 'bas',
  popupOuvertureActive = true,
}: {
  produit: Produit;
  suggestions: Suggestion[];
  suggestionsActives: boolean;
  estFavori: boolean;
  composables: ProduitComposable[];
  galeriePosition?: 'gauche' | 'bas';
  popupOuvertureActive?: boolean;
}) {
  const [imageActive, setImageActive] = useState(0);
  const [tailleChoisie, setTailleChoisie] = useState('');
  const [popupDetailsOuverte, setPopupDetailsOuverte] = useState(false);
  const [erreurTaille, setErreurTaille] = useState(false);
  const [erreurStock, setErreurStock] = useState(false);
  const ajouterArticle = usePanierStore((state) => state.ajouterArticle);

  // Synchronise la max-height de la colonne droite avec la hauteur réelle de la galerie gauche
  const galerieRef = useRef<HTMLDivElement>(null);
  const infosRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function syncHauteur() {
      if (galerieRef.current && infosRef.current) {
        const h = galerieRef.current.getBoundingClientRect().height;
        if (h > 0) infosRef.current.style.maxHeight = `${h}px`;
      }
    }
    // Delay pour laisser l'image se rendre
    const timer = setTimeout(syncHauteur, 100);
    window.addEventListener('resize', syncHauteur);
    return () => { clearTimeout(timer); window.removeEventListener('resize', syncHauteur); };
  }, []);

  // Fait défiler prioritairement la colonne infos (à droite) quand l'utilisateur
  // scrolle n'importe où sur la page, tant que la section produit est visible
  // et que la colonne n'a pas atteint sa propre fin de scroll.
  useEffect(() => {
    function gererMolette(e: WheelEvent) {
      const infos = infosRef.current;
      const galerie = galerieRef.current;
      if (!infos || !galerie) return;

      // On ne détourne le scroll que si la section produit (image + infos) est visible à l'écran
      const rectGalerie = galerie.getBoundingClientRect();
      const sectionVisible = rectGalerie.top < window.innerHeight && rectGalerie.bottom > 0;
      if (!sectionVisible) return;

      // La colonne infos n'a pas de scroll interne (contenu plus court que l'image) : rien à faire
      if (infos.scrollHeight <= infos.clientHeight + 1) return;

      const scrollDescendant = e.deltaY > 0;
      const auDebut = infos.scrollTop <= 0;
      const aLaFin = infos.scrollTop + infos.clientHeight >= infos.scrollHeight - 1;

      // Si on peut encore faire défiler la colonne dans le sens voulu, on intercepte
      // le scroll de la page et on l'applique à la colonne infos à la place.
      if ((scrollDescendant && !aLaFin) || (!scrollDescendant && !auDebut)) {
        e.preventDefault();
        infos.scrollTop += e.deltaY;
      }
      // Sinon (colonne déjà à sa limite dans ce sens) : on laisse la page défiler normalement.
    }

    window.addEventListener('wheel', gererMolette, { passive: false });
    return () => window.removeEventListener('wheel', gererMolette);
  }, []);

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
      prix: promoEstActive(produit) ? parseFloat(produit.prixPromo!) : parseFloat(produit.prix),
      image: produit.images[0]?.url || '',
      taille: tailleChoisie || undefined,
      quantite: 1,
      stockMax: stockDispo,
    });
    if (popupOuvertureActive) {
      window.dispatchEvent(new CustomEvent('nabe:ouvrir-panier'));
    }
  }

  return (
    <div className="page-produit">
      <div className="produit-fil-ariane conteneur">
        <Link href="/">Accueil</Link> / <Link href="/collections">Bijoux</Link> /{' '}
        <span>{produit.nom}</span>
      </div>

      <div className={`produit-principal conteneur produit-principal--${galeriePosition}`}>
        <div ref={galerieRef} className={`produit-galerie produit-galerie--${galeriePosition}`}>
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

        <div ref={infosRef} className="produit-infos produit-infos--scroll">
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
            {promoEstActive(produit) ? (
              <>
                <span className="produit-infos__prix-barre">{formaterPrix(produit.prix)}</span>{' '}
                <span className="produit-infos__prix-promo">{formaterPrix(produit.prixPromo!)}</span>{' '}
                <span className="produit-infos__badge-promo">
                  -{pourcentageReduction(produit.prix, produit.prixPromo!)}%
                </span>{' '}
                <span>Taxes comprises</span>
              </>
            ) : (
              <>
                {formaterPrix(produit.prix)} <span>Taxes comprises</span>
              </>
            )}
          </p>

          {produit.pierres.length > 0 && <PopupPierres pierres={produit.pierres} />}

          {/* Sélecteur de taille en boutons façon VCA */}
          {produit.taillesDisponibles.length > 0 && (
            <div className="produit-infos__champ">
              <div className="produit-infos__label-taille">
                <label>Taille</label>
              </div>
              <div className="produit-infos__tailles-boutons">
                {[...produit.taillesDisponibles]
                  .sort((a, b) => {
                    const na = parseFloat(a), nb = parseFloat(b);
                    if (!isNaN(na) && !isNaN(nb)) return na - nb;
                    return a.localeCompare(b);
                  })
                  .map((t) => {
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
              : `AJOUTER AU PANIER · ${formaterPrix(promoEstActive(produit) ? produit.prixPromo! : produit.prix)}`}
          </button>

          <p className="produit-infos__retours">Retours sans frais dans un délai de 30 jours</p>

          <LiensInfoProduit />

          <ComposerAvec produits={composables} />
        </div>
      </div>

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
    </div>
  );
}
