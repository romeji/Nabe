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
  // Props optionnelles transmises depuis la fiche produit (ignorées si la popup vient du header)
  boiteCadeauActif?: boolean;
  boiteCadeauNom?: string;
  boiteCadeauPrix?: number;
  boiteCadeauImage?: string;
  boiteCadeauProduitId?: string;
}

type ConfigPopup = {
  seuilLivraison: number;
  seuilLivraisonActif: boolean;
  seuilSurprise: number;
  surpriseActif: boolean;
  articleBonusActif: boolean;
  articleBonusId: string;
  // Champs du vrai produit article bonus (chargé depuis la DB)
  articleBonusNom: string;
  articleBonusPrix: number;
  articleBonusImage: string;
};

const CONFIG_DEFAUT: ConfigPopup = {
  seuilLivraison: 60,
  seuilLivraisonActif: true,
  seuilSurprise: 100,
  surpriseActif: false,
  articleBonusActif: false,
  articleBonusId: '',
  articleBonusNom: '',
  articleBonusPrix: 0,
  articleBonusImage: '',
};

export default function PopupPanier({
  ouverte, onFermer,
}: PopupPanierProps) {
  const articles = usePanierStore(s => s.articles);
  const retirerArticle = usePanierStore(s => s.retirerArticle);
  const modifierQuantite = usePanierStore(s => s.modifierQuantite);
  const ajouterArticle = usePanierStore(s => s.ajouterArticle);
  const [codePromo, setCodePromo] = useState('');
  const [mounted, setMounted] = useState(false);
  const [cfg, setCfg] = useState<ConfigPopup>(CONFIG_DEFAUT);

  useEffect(() => { setMounted(true); }, []);

  // Charge la config une seule fois à l'ouverture
  useEffect(() => {
    if (!ouverte) return;
    fetch('/api/config-public')
      .then(r => r.json())
      .then(async (data) => {
        const bonusId = data.popup_panier_article_bonus_id || '';
        let bonusNom = '', bonusPrix = 0, bonusImage = '';

        // Charge les infos du vrai produit si un ID est défini
        if (bonusId && data.popup_panier_article_bonus_actif === 'true') {
          try {
            const res = await fetch(`/api/produits/${bonusId}`);
            if (res.ok) {
              const p = await res.json();
              bonusNom = p.nom || '';
              bonusPrix = parseFloat(p.prix) || 0;
              bonusImage = p.images?.[0]?.url || '';
            }
          } catch {}
        }

        setCfg({
          seuilLivraison: parseFloat(data.popup_panier_seuil_livraison) || 60,
          seuilLivraisonActif: data.popup_panier_seuil_livraison_actif !== 'false',
          seuilSurprise: parseFloat(data.popup_panier_seuil_surprise) || 100,
          surpriseActif: data.popup_panier_surprise_actif === 'true',
          articleBonusActif: data.popup_panier_article_bonus_actif === 'true',
          articleBonusId: bonusId,
          articleBonusNom: bonusNom,
          articleBonusPrix: bonusPrix,
          articleBonusImage: bonusImage,
        });
      })
      .catch(() => {});
  }, [ouverte]);

  useEffect(() => {
    if (ouverte) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [ouverte]);

  if (!mounted) return null;

  const articleBonus = cfg.articleBonusActif && cfg.articleBonusId;
  const bonusDansPanier = !!(articleBonus && articles.find(a => a.produitId === cfg.articleBonusId));

  function basculerBonus(coche: boolean) {
    if (!cfg.articleBonusId) return;
    if (coche) {
      ajouterArticle({
        produitId: cfg.articleBonusId,
        nom: cfg.articleBonusNom,
        prix: cfg.articleBonusPrix,
        image: cfg.articleBonusImage,
        quantite: 1,
      });
    } else {
      retirerArticle(cfg.articleBonusId, undefined);
    }
  }

  const articlesFiltres = articles.filter(a => a.produitId !== cfg.articleBonusId);
  const total = articles.reduce((sum, a) => sum + a.prix * a.quantite, 0);

  // Barre de progression : seuil livraison obligatoire, surprise optionnel
  const seuilMax = cfg.surpriseActif ? cfg.seuilSurprise : cfg.seuilLivraison;
  const progressPct = cfg.seuilLivraisonActif ? Math.min((total / seuilMax) * 100, 100) : 0;

  let messageProgress = '';
  if (cfg.seuilLivraisonActif) {
    if (total >= (cfg.surpriseActif ? cfg.seuilSurprise : cfg.seuilLivraison)) {
      messageProgress = cfg.surpriseActif ? '🎁 Bijou surprise offert !' : '🚚 Livraison offerte !';
    } else if (cfg.surpriseActif && total >= cfg.seuilLivraison) {
      messageProgress = `Livraison offerte ! Plus que ${formaterPrix(cfg.seuilSurprise - total)} pour ton bijou surprise`;
    } else {
      messageProgress = `Plus que ${formaterPrix(cfg.seuilLivraison - total)} et profite de ta livraison à domicile offerte !`;
    }
  }

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

        {articlesFiltres.length === 0 && !articleBonus ? (
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

            {/* Articles scrollables */}
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

              {/* Article bonus optionnel (boîte cadeau, etc.) */}
              {articleBonus && cfg.articleBonusNom && (
                <div className="popup-panier__boite">
                  <div className="popup-panier__boite-img">
                    {cfg.articleBonusImage ? (
                      <Image src={cfg.articleBonusImage} alt={cfg.articleBonusNom} width={52} height={52} style={{ objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: 52, height: 52, background: '#f1e0cb', borderRadius: 4 }} />
                    )}
                  </div>
                  <span className="popup-panier__boite-nom">{cfg.articleBonusNom.toUpperCase()}</span>
                  <span className="popup-panier__boite-prix">{formaterPrix(cfg.articleBonusPrix)}</span>
                  <input
                    type="checkbox"
                    checked={bonusDansPanier}
                    onChange={e => basculerBonus(e.target.checked)}
                    className="popup-panier__boite-check"
                  />
                </div>
              )}
            </div>

            {/* Barre de progression livraison */}
            {cfg.seuilLivraisonActif && (
              <div className="popup-panier__progress">
                <p className="popup-panier__progress-msg">{messageProgress}</p>
                <div className="popup-panier__progress-barre">
                  <div className="popup-panier__progress-fill" style={{ width: `${progressPct}%` }} />
                </div>
                <div className="popup-panier__progress-labels">
                  <span>{formaterPrix(cfg.seuilLivraison)}<br /><small>Livraison offerte</small></span>
                  {cfg.surpriseActif && (
                    <span style={{ textAlign: 'right' }}>{formaterPrix(cfg.seuilSurprise)}<br /><small>Bijou surprise offert</small></span>
                  )}
                </div>
              </div>
            )}

            {/* Pied fixe */}
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
