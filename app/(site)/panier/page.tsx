'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePanierStore } from '@/lib/store-panier';
import { formaterPrix } from '@/lib/utils';
import './panier.css';

export default function PagePanier() {
  const { articles, retirerArticle, modifierQuantite, total } = usePanierStore();
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState('');

  async function gererCheckout() {
    setChargement(true);
    setErreur('');
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articles }),
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
        <div className="page-panier__articles">
          {articles.map((article) => (
            <div key={`${article.produitId}-${article.taille}`} className="panier-article">
              <div className="panier-article__image">
                {article.image ? (
                  <Image src={article.image} alt={article.nom} width={100} height={100} />
                ) : (
                  <div className="panier-article__placeholder" />
                )}
              </div>
              <div className="panier-article__infos">
                <h3>{article.nom}</h3>
                {article.taille && <p>Taille : {article.taille}</p>}
                <div className="panier-article__quantite">
                  <button
                    onClick={() =>
                      modifierQuantite(article.produitId, Math.max(1, article.quantite - 1), article.taille)
                    }
                  >
                    −
                  </button>
                  <span>{article.quantite}</span>
                  <button
                    onClick={() =>
                      modifierQuantite(article.produitId, article.quantite + 1, article.taille)
                    }
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="panier-article__droite">
                <span className="panier-article__prix">
                  {formaterPrix(article.prix * article.quantite)}
                </span>
                <button
                  className="panier-article__retirer"
                  onClick={() => retirerArticle(article.produitId, article.taille)}
                >
                  Retirer
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="page-panier__resume">
          <h2>Résumé</h2>
          <div className="page-panier__ligne">
            <span>Sous-total</span>
            <span>{formaterPrix(total())}</span>
          </div>
          <div className="page-panier__ligne">
            <span>Livraison</span>
            <span>Offerte</span>
          </div>
          <div className="page-panier__ligne page-panier__total">
            <span>Total</span>
            <span>{formaterPrix(total())}</span>
          </div>

          {erreur && <p className="page-panier__erreur">{erreur}</p>}

          <button className="btn btn-or" onClick={gererCheckout} disabled={chargement}>
            {chargement ? 'Redirection...' : 'Procéder au paiement'}
          </button>
        </div>
      </div>
    </div>
  );
}
