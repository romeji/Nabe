'use client';
import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import Link from 'next/link';
import { usePanierStore } from '@/lib/store-panier';
import { formaterPrix } from '@/lib/utils';
import './popup-panier.css';

interface PopupPanierProps {
  ouverte: boolean;
  onFermer: () => void;
}

type ProduitSimple = { id: string; nom: string; slug: string; prix: string; image: string | null };

type ConfigPopup = {
  seuilLivraison: number;
  seuilLivraisonActif: boolean;
  seuilSurprise: number;
  surpriseActif: boolean;
  articleBonusActif: boolean;
  articleBonusId: string;
  articleBonusNom: string;
  articleBonusPrix: number;
  articleBonusImage: string;
  panierVideSuggestionsActif: boolean;
};

const CFG_DEFAUT: ConfigPopup = {
  seuilLivraison: 60, seuilLivraisonActif: true,
  seuilSurprise: 100, surpriseActif: false,
  articleBonusActif: false, articleBonusId: '',
  articleBonusNom: '', articleBonusPrix: 0, articleBonusImage: '',
  panierVideSuggestionsActif: false,
};

export default function PopupPanier({ ouverte, onFermer }: PopupPanierProps) {
  const articles = usePanierStore(s => s.articles);
  const retirerArticle = usePanierStore(s => s.retirerArticle);
  const modifierQuantite = usePanierStore(s => s.modifierQuantite);
  const ajouterArticle = usePanierStore(s => s.ajouterArticle);
  const codePromoApplique = usePanierStore(s => s.codePromoApplique);
  const definirCodePromo = usePanierStore(s => s.definirCodePromo);

  const [mounted, setMounted] = useState(false);
  const [cfg, setCfg] = useState<ConfigPopup>(CFG_DEFAUT);
  const [cfgChargee, setCfgChargee] = useState(false);

  // Code promo (partagé avec la page checkout via le store)
  const [codePromoSaisi, setCodePromoSaisi] = useState('');
  const [erreurCode, setErreurCode] = useState('');
  const [validationCode, setValidationCode] = useState(false);

  // Suggestions panier vide
  const [bestsellers, setBestsellers] = useState<ProduitSimple[]>([]);

  useEffect(() => { setMounted(true); }, []);

  // Scroll du body
  useEffect(() => {
    if (ouverte) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [ouverte]);

  // Charge la config à la première ouverture
  const chargerConfig = useCallback(async () => {
    if (cfgChargee) return;
    try {
      const data = await fetch('/api/config-public').then(r => r.json());
      const bonusId = data.popup_panier_article_bonus_id || '';
      let bonusNom = '', bonusPrix = 0, bonusImage = '';
      if (bonusId && data.popup_panier_article_bonus_actif === 'true') {
        try {
          const p = await fetch(`/api/produits/${bonusId}`).then(r => r.json());
          bonusNom = p.nom || ''; bonusPrix = parseFloat(p.prix) || 0; bonusImage = p.images?.[0]?.url || '';
        } catch {}
      }
      setCfg({
        seuilLivraison: parseFloat(data.popup_panier_seuil_livraison) || 60,
        seuilLivraisonActif: data.popup_panier_seuil_livraison_actif !== 'false',
        seuilSurprise: parseFloat(data.popup_panier_seuil_surprise) || 100,
        surpriseActif: data.popup_panier_surprise_actif === 'true',
        articleBonusActif: data.popup_panier_article_bonus_actif === 'true',
        articleBonusId: bonusId, articleBonusNom: bonusNom,
        articleBonusPrix: bonusPrix, articleBonusImage: bonusImage,
        panierVideSuggestionsActif: data.popup_panier_vide_actif === 'true',
      });
      setCfgChargee(true);
    } catch {}
  }, [cfgChargee]);

  useEffect(() => { if (ouverte) chargerConfig(); }, [ouverte, chargerConfig]);

  // Charge les bestsellers quand le panier est vide et l'option activée
  useEffect(() => {
    if (ouverte && cfg.panierVideSuggestionsActif && articles.length === 0 && bestsellers.length === 0) {
      fetch('/api/produits/bestsellers?limite=4')
        .then(r => r.json())
        .then(data => setBestsellers(data.produits || []))
        .catch(() => {});
    }
  }, [ouverte, cfg.panierVideSuggestionsActif, articles.length, bestsellers.length]);

  if (!mounted) return null;

  // — Helpers article bonus —
  const articleBonus = cfg.articleBonusActif && cfg.articleBonusId && cfg.articleBonusNom;
  const bonusDansPanier = !!(cfg.articleBonusId && articles.find(a => a.produitId === cfg.articleBonusId));

  function basculerBonus(coche: boolean) {
    if (!cfg.articleBonusId) return;
    if (coche) {
      ajouterArticle({ produitId: cfg.articleBonusId, nom: cfg.articleBonusNom, prix: cfg.articleBonusPrix, image: cfg.articleBonusImage, quantite: 1 });
    } else {
      retirerArticle(cfg.articleBonusId, undefined);
    }
  }

  // — Code promo (stocké dans le store, réutilisé sur la page checkout) —
  async function appliquerCode() {
    if (!codePromoSaisi.trim()) return;
    setValidationCode(true); setErreurCode('');
    try {
      const sousTotal = articles.reduce((s, a) => s + a.prix * a.quantite, 0);
      const res = await fetch('/api/codes-promo/valider', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codePromoSaisi, sousTotal }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Code invalide');
      definirCodePromo({ code: data.code, reduction: data.reduction });
      setErreurCode('');
    } catch (e: any) {
      setErreurCode(e.message || 'Code invalide');
      definirCodePromo(null);
    } finally { setValidationCode(false); }
  }

  function retirerCode() {
    definirCodePromo(null);
    setCodePromoSaisi('');
    setErreurCode('');
  }

  // — Calculs —
  const articlesFiltres = articles.filter(a => a.produitId !== cfg.articleBonusId);
  const panierVide = articlesFiltres.length === 0 && !articleBonus;
  const sousTotal = articles.reduce((s, a) => s + a.prix * a.quantite, 0);
  const reduction = codePromoApplique?.reduction || 0;
  const total = Math.max(0, sousTotal - reduction);

  const seuilMax = cfg.surpriseActif ? cfg.seuilSurprise : cfg.seuilLivraison;
  const progressPct = cfg.seuilLivraisonActif ? Math.min((sousTotal / seuilMax) * 100, 100) : 0;
  const messageProgress = !cfg.seuilLivraisonActif ? '' :
    sousTotal >= (cfg.surpriseActif ? cfg.seuilSurprise : cfg.seuilLivraison)
      ? (cfg.surpriseActif ? '🎁 Bijou surprise offert !' : '🚚 Livraison offerte !')
      : cfg.surpriseActif && sousTotal >= cfg.seuilLivraison
        ? `Livraison offerte ! Plus que ${formaterPrix(cfg.seuilSurprise - sousTotal)} pour ton bijou surprise`
        : `Plus que ${formaterPrix(cfg.seuilLivraison - sousTotal)} et profite de ta livraison à domicile offerte !`;

  return createPortal(
    <>
      <div className={`popup-panier__overlay${ouverte ? ' popup-panier__overlay--visible' : ''}`} onClick={onFermer} aria-hidden="true" />
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

        {panierVide ? (
          /* ── Panier vide ── */
          <div className="popup-panier__vide">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            <p>Votre panier est vide</p>
            <button className="popup-panier__btn-continuer" onClick={onFermer}>
              Découvrir nos créations
            </button>

            {/* Suggestions bestsellers (option admin) */}
            {cfg.panierVideSuggestionsActif && bestsellers.length > 0 && (
              <div className="popup-panier__suggestions">
                <p className="popup-panier__suggestions-titre">Nos meilleures ventes</p>
                <div className="popup-panier__suggestions-grille">
                  {bestsellers.map(p => (
                    <Link key={p.id} href={`/collections/${p.slug}`} className="popup-panier__suggestion-carte" onClick={onFermer}>
                      <div className="popup-panier__suggestion-image">
                        {p.image
                          ? <Image src={p.image} alt={p.nom} width={110} height={110} style={{ objectFit: 'cover' }} />
                          : <div className="popup-panier__suggestion-placeholder" />
                        }
                      </div>
                      <p className="popup-panier__suggestion-nom">{p.nom}</p>
                      <p className="popup-panier__suggestion-prix">{formaterPrix(p.prix)}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
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
                    {article.taille && (
                      <p className="popup-panier__article-taille">Taille : {article.taille}</p>
                    )}
                    {article.prixOriginal && article.prixOriginal > article.prix && (
                      <p className="popup-panier__article-promo">
                        <span className="popup-panier__article-prix-barre">{formaterPrix(article.prixOriginal)}</span>
                        <span className="popup-panier__article-badge-promo">
                          -{Math.round(((article.prixOriginal - article.prix) / article.prixOriginal) * 100)}%
                        </span>
                      </p>
                    )}
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

              {/* Article bonus optionnel */}
              {articleBonus && (
                <div className="popup-panier__boite">
                  <div className="popup-panier__boite-img">
                    {cfg.articleBonusImage
                      ? <Image src={cfg.articleBonusImage} alt={cfg.articleBonusNom} width={52} height={52} style={{ objectFit: 'cover' }} />
                      : <div style={{ width: 52, height: 52, background: '#f1e0cb', borderRadius: 4 }} />
                    }
                  </div>
                  <span className="popup-panier__boite-nom">{cfg.articleBonusNom.toUpperCase()}</span>
                  <span className="popup-panier__boite-prix">{formaterPrix(cfg.articleBonusPrix)}</span>
                  <input type="checkbox" checked={bonusDansPanier} onChange={e => basculerBonus(e.target.checked)} className="popup-panier__boite-check" />
                </div>
              )}
            </div>

            {/* Barre de progression livraison */}
            {cfg.seuilLivraisonActif && (
              <div className="popup-panier__progress">
                <p className="popup-panier__progress-msg">{messageProgress}</p>
                <div className="popup-panier__progress-barre">
                  <div className="popup-panier__progress-fill" style={{ width: `${progressPct}%` }}>
                    <span className="popup-panier__progress-curseur" />
                  </div>
                  <span className="popup-panier__progress-cible" />
                </div>
                <div className="popup-panier__progress-labels">
                  <span>{formaterPrix(cfg.seuilLivraison)}<br /><small>Livraison offerte</small></span>
                  {cfg.surpriseActif && (
                    <span style={{ textAlign: 'right' }}>{formaterPrix(cfg.seuilSurprise)}<br /><small>Bijou surprise offert</small></span>
                  )}
                </div>
              </div>
            )}

            {/* Pied fixe : total + code + lien checkout */}
            <div className="popup-panier__pied">
              <div className="popup-panier__total">
                <span>Total</span>
                <span>{formaterPrix(total)} EUR</span>
              </div>

              {/* Code promo (partagé avec la page checkout) */}
              {codePromoApplique ? (
                <div className="popup-panier__code-applique">
                  <span>✓ Code « {codePromoApplique.code} » — −{formaterPrix(codePromoApplique.reduction)}</span>
                  <button onClick={retirerCode} className="popup-panier__code-retirer">✕</button>
                </div>
              ) : (
                <div className="popup-panier__code-promo">
                  <input
                    placeholder="Code de réduction"
                    value={codePromoSaisi}
                    onChange={e => setCodePromoSaisi(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        appliquerCode();
                      }
                    }}
                    className="popup-panier__code-input"
                  />
                  <button onClick={appliquerCode} disabled={validationCode} className="popup-panier__code-btn">
                    {validationCode ? '...' : 'APPLIQUER'}
                  </button>
                </div>
              )}
              {erreurCode && <p className="popup-panier__erreur-code">{erreurCode}</p>}

              {/* Vers la page checkout (adresse + paiement sécurisé) */}
              <Link href="/checkout" className="popup-panier__valider" onClick={onFermer}>
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
