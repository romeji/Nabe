'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePanierStore } from '@/lib/store-panier';
import { formaterPrix } from '@/lib/utils';
import './panier.css';

/**
 * Page de récapitulatif et paiement.
 * Le panier principal est géré via la popup (Header > PopupPanier).
 * Cette page sert de page de finalisation : code promo + checkout Stripe.
 */
export default function PagePanier() {
  const { articles, retirerArticle, modifierQuantite, total } = usePanierStore();
  const [monte, setMonte] = useState(false);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState('');

  const [codePromoInput, setCodePromoInput] = useState('');
  const [codeApplique, setCodeApplique] = useState<{ code: string; reduction: number } | null>(null);
  const [erreurCode, setErreurCode] = useState('');
  const [validationEnCours, setValidationEnCours] = useState(false);

  useEffect(() => { setMonte(true); }, []);

  async function appliquerCode() {
    if (!codePromoInput.trim()) return;
    setValidationEnCours(true);
    setErreurCode('');
    try {
      const res = await fetch('/api/codes-promo/valider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codePromoInput, sousTotal: total() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCodeApplique({ code: data.code, reduction: data.reduction });
    } catch (err: any) {
      setErreurCode(err.message || 'Code invalide.');
      setCodeApplique(null);
    } finally {
      setValidationEnCours(false);
    }
  }

  function retirerCode() {
    setCodeApplique(null);
    setCodePromoInput('');
    setErreurCode('');
  }

  async function gererCheckout() {
    setChargement(true);
    setErreur('');
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articles, codeReduction: codeApplique?.code }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Erreur de paiement');
      }
    } catch (err: any) {
      setErreur(err.message || 'Une erreur est survenue. Merci de réessayer.');
      setChargement(false);
    }
  }

  const totalAvecReduction = Math.max(0, total() - (codeApplique?.reduction || 0));

  // Avant hydratation : état neutre pour éviter le mismatch SSR
  if (!monte) {
    return (
      <div className="page-panier conteneur">
        <h1>Votre panier</h1>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="page-panier page-panier--vide conteneur">
        <h1>Votre panier</h1>
        <p>Votre panier est vide pour le moment.</p>
        <Link href="/collections" className="btn btn-primaire">
          Découvrir les collections
        </Link>
      </div>
    );
  }

  return (
    <div className="page-panier conteneur">
      <h1>Votre panier</h1>

      <div className="page-panier__corps">
        {/* Liste des articles */}
        <div className="page-panier__articles">
          {articles.map((article) => (
            <div key={`${article.produitId}-${article.taille ?? ''}`} className="panier-article">
              <div className="panier-article__image">
                {article.image ? (
                  <Image src={article.image} alt={article.nom} width={100} height={100} style={{ objectFit: 'cover', borderRadius: 8 }} />
                ) : (
                  <div className="panier-article__placeholder" />
                )}
              </div>
              <div className="panier-article__infos">
                <h3>{article.nom}</h3>
                {article.taille && <p>Taille : {article.taille}</p>}
                <div className="panier-article__quantite">
                  <button onClick={() => modifierQuantite(article.produitId, Math.max(1, article.quantite - 1), article.taille)}>−</button>
                  <span>{article.quantite}</span>
                  <button
                    onClick={() => modifierQuantite(article.produitId, article.quantite + 1, article.taille)}
                    disabled={typeof article.stockMax === 'number' && article.quantite >= article.stockMax}
                  >+</button>
                </div>
                {typeof article.stockMax === 'number' && article.quantite >= article.stockMax && (
                  <p className="panier-article__stock-max">Stock maximum atteint pour cette taille</p>
                )}
              </div>
              <div className="panier-article__droite">
                <span className="panier-article__prix">{formaterPrix(article.prix * article.quantite)}</span>
                <button className="panier-article__retirer" onClick={() => retirerArticle(article.produitId, article.taille)}>
                  Retirer
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Résumé et paiement */}
        <div className="page-panier__resume">
          <h2>Récapitulatif</h2>

          {/* Code promo */}
          <div className="page-panier__code-promo">
            {codeApplique ? (
              <div className="page-panier__code-applique">
                <span>✓ Code « {codeApplique.code} » appliqué</span>
                <button onClick={retirerCode}>Retirer</button>
              </div>
            ) : (
              <>
                <div className="page-panier__code-champ">
                  <input
                    type="text"
                    placeholder="Code promo"
                    value={codePromoInput}
                    onChange={(e) => setCodePromoInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && appliquerCode()}
                  />
                  <button onClick={appliquerCode} disabled={validationEnCours}>
                    {validationEnCours ? '...' : 'Appliquer'}
                  </button>
                </div>
                {erreurCode && <p className="page-panier__erreur-code">{erreurCode}</p>}
              </>
            )}
          </div>

          <div className="page-panier__ligne">
            <span>Sous-total</span>
            <span>{formaterPrix(total())}</span>
          </div>
          {codeApplique && (
            <div className="page-panier__ligne page-panier__ligne-reduction">
              <span>Réduction</span>
              <span>−{formaterPrix(codeApplique.reduction)}</span>
            </div>
          )}
          <div className="page-panier__ligne">
            <span>Livraison</span>
            <span>Offerte</span>
          </div>
          <div className="page-panier__ligne page-panier__total">
            <span>Total</span>
            <span>{formaterPrix(totalAvecReduction)}</span>
          </div>

          {erreur && <p className="page-panier__erreur">{erreur}</p>}

          <button className="btn btn-or page-panier__btn-checkout" onClick={gererCheckout} disabled={chargement}>
            {chargement ? 'Redirection...' : 'Procéder au paiement →'}
          </button>
        </div>
      </div>
    </div>
  );
}
