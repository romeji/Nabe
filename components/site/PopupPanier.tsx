'use client';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import Link from 'next/link';
import { usePanierStore } from '@/lib/store-panier';
import { formaterPrix } from '@/lib/utils';
import './popup-panier.css';

interface PopupPanierProps {
  ouverte: boolean;
  onFermer: () => void;
  boiteCadeauActif?: boolean;
  boiteCadeauNom?: string;
  boiteCadeauPrix?: number;
  boiteCadeauImage?: string;
  boiteCadeauProduitId?: string;
}

export default function PopupPanier({
  ouverte, onFermer,
  boiteCadeauActif = false,
  boiteCadeauNom = 'Boîte cadeau Nabe',
  boiteCadeauPrix = 3.9,
  boiteCadeauImage = '/images/boite-cadeau.jpg',
  boiteCadeauProduitId,
}: PopupPanierProps) {
  const articles = usePanierStore(s => s.articles);
  const retirerArticle = usePanierStore(s => s.retirerArticle);
  const modifierQuantite = usePanierStore(s => s.modifierQuantite);
  const ajouterArticle = usePanierStore(s => s.ajouterArticle);
  const [codePromo, setCodePromo] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (ouverte) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [ouverte]);

  if (!mounted) return null;

  const boiteDansPanier = !!(boiteCadeauProduitId && articles.find(a => a.produitId === boiteCadeauProduitId));

  function basculerBoiteCadeau(coche: boolean) {
    if (!boiteCadeauProduitId) return;
    if (coche) {
      ajouterArticle({ produitId: boiteCadeauProduitId, nom: boiteCadeauNom, prix: boiteCadeauPrix, image: boiteCadeauImage, quantite: 1 });
    } else {
      retirerArticle(boiteCadeauProduitId, undefined);
    }
  }

  const articlesFiltres = articles.filter(a => a.produitId !== boiteCadeauProduitId);
  const total = articles.reduce((sum, a) => sum + a.prix * a.quantite, 0);

  const SEUIL_LIVRAISON = 60;
  const SEUIL_SURPRISE = 100;
  const progressPct = Math.min((total / SEUIL_SURPRISE) * 100, 100);
  const messageProgress = total >= SEUIL_SURPRISE
    ? '🎁 Bijou surprise offert !'
    : total >= SEUIL_LIVRAISON
    ? `Livraison offerte ! Plus que ${formaterPrix(SEUIL_SURPRISE - total)} pour ton bijou surprise`
    : `Plus que ${formaterPrix(SEUIL_LIVRAISON - total)} et profite de ta livraison à domicile offerte !`;

  return createPortal(
    <>
      <div
        className={`popup-panier__overlay${ouverte ? ' popup-panier__overlay--visible' : ''}`}
        onClick={onFermer}
        aria-hidden="true"
      />
      <div className={`popup-panier${ouverte ? ' popup-panier--ouverte' : ''}`} role="dialog" aria-modal="true">

        {/* En-tête */}
        <div className="popup-panier__entete">
          <h2 className="popup-panier__titre">TON PANIER</h2>
          <button className="popup-panier__fermer" onClick={onFermer} aria-label="Fermer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {articlesFiltres.length === 0 && !boiteCadeauActif ? (
          <div className="popup-panier__vide">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            <p>Votre panier est vide</p>
            <button className="popup-panier__btn-continuer" onClick={onFermer}>
              Découvrir nos créations
            </button>
          </div>
        ) : (
          <>
            {/* En-tête colonnes */}
            <div className="popup-panier__cols-entete">
              <span>BIJOUX</span>
              <span>TOTAL</span>
            </div>

            {/* Articles (zone scrollable) */}
            <div className="popup-panier__articles">
              {articlesFiltres.map(article => (
                <div key={`${article.produitId}-${article.taille ?? ''}`} className="popup-panier__article">
                  <div className="popup-panier__article-image">
                    {article.image && (
                      <Image src={article.image} alt={article.nom} width={72} height={72} style={{ objectFit: 'cover' }} />
                    )}
                  </div>
                  <div className="popup-panier__article-info">
                    <p className="popup-panier__article-nom">{article.nom}</p>
                    {article.taille && <p className="popup-panier__article-taille">Taille: {article.taille}</p>}
                    <div className="popup-panier__article-qte">
                      <button onClick={() => modifierQuantite(article.produitId, Math.max(article.quantite - 1, 1), article.taille)}>−</button>
                      <span>{article.quantite}</span>
                      <button
                        onClick={() => modifierQuantite(article.produitId, article.quantite + 1, article.taille)}
                        disabled={typeof article.stockMax === 'number' && article.quantite >= article.stockMax}
                      >+</button>
                      <button className="popup-panier__article-suppr" onClick={() => retirerArticle(article.produitId, article.taille)} aria-label="Supprimer">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6l-1 14H6L5 6"/>
                          <path d="M10 11v6"/><path d="M14 11v6"/>
                          <path d="M9 6V4h6v2"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                  <span className="popup-panier__article-prix">{formaterPrix(article.prix * article.quantite)}</span>
                </div>
              ))}

              {/* Boîte cadeau optionnelle */}
              {boiteCadeauActif && (
                <div className="popup-panier__boite">
                  <div className="popup-panier__boite-img">
                    <Image src={boiteCadeauImage} alt={boiteCadeauNom} width={52} height={52} style={{ objectFit: 'cover' }} />
                  </div>
                  <span className="popup-panier__boite-nom">{boiteCadeauNom.toUpperCase()}</span>
                  <span className="popup-panier__boite-prix">{formaterPrix(boiteCadeauPrix)}</span>
                  <input
                    type="checkbox"
                    checked={boiteDansPanier}
                    onChange={e => basculerBoiteCadeau(e.target.checked)}
                    className="popup-panier__boite-check"
                  />
                </div>
              )}
            </div>

            {/* Barre de progression livraison/surprise */}
            <div className="popup-panier__progress">
              <p className="popup-panier__progress-msg">{messageProgress}</p>
              <div className="popup-panier__progress-barre">
                <div className="popup-panier__progress-fill" style={{ width: `${progressPct}%` }} />
              </div>
              <div className="popup-panier__progress-labels">
                <span>{formaterPrix(SEUIL_LIVRAISON)}<br /><small>Livraison offerte</small></span>
                <span style={{ textAlign: 'right' }}>{formaterPrix(SEUIL_SURPRISE)}<br /><small>Bijou surprise offert</small></span>
              </div>
            </div>

            {/* Pied fixe : total + code promo + bouton */}
            <div className="popup-panier__pied">
              <div className="popup-panier__total">
                <span>Total</span>
                <span>{formaterPrix(total)} EUR</span>
              </div>

              <div className="popup-panier__code-promo">
                <input
                  placeholder="Code de réduction"
                  value={codePromo}
                  onChange={e => setCodePromo(e.target.value)}
                  className="popup-panier__code-input"
                />
                <button className="popup-panier__code-btn">APPLIQUER</button>
              </div>

              <Link href="/panier" className="popup-panier__valider" onClick={onFermer}>
                VALIDER TON PANIER
              </Link>
            </div>
          </>
        )}
      </div>
    </>,
    document.body
  );
}
