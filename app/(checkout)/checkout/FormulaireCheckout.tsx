'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { usePanierStore } from '@/lib/store-panier';
import { formaterPrix } from '@/lib/utils';
import './checkout.css';

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

type Adresse = {
  email: string;
  prenom: string;
  nom: string;
  adresse: string;
  complement: string;
  ville: string;
  codePostal: string;
  pays: string;
  telephone: string;
};

type AdresseEnregistree = {
  id: string;
  libelle: string | null;
  destinataire: string;
  ligne1: string;
  ligne2: string | null;
  ville: string;
  codePostal: string;
  pays: string;
  telephone: string | null;
  parDefaut: boolean;
};

type ModeLivraison = { id: string; label: string; prix: number; delai: string; necessitePointRelais?: boolean };

type PointRelais = {
  numero: string;
  nom: string;
  adresse: string;
  codePostal: string;
  ville: string;
  distanceMetres: number | null;
};

const ADRESSE_VIDE: Adresse = {
  email: '',
  prenom: '',
  nom: '',
  adresse: '',
  complement: '',
  ville: '',
  codePostal: '',
  pays: 'FR',
  telephone: '',
};

function FormulairePaiement({ onRetour }: { onRetour: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState('');

  async function gererConfirmation(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setEnCours(true);
    setErreur('');

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${siteUrl}/checkout/succes` },
    });

    if (error) {
      setErreur(error.message || 'Le paiement a été refusé. Merci de vérifier vos informations.');
      setEnCours(false);
    }
  }

  return (
    <form onSubmit={gererConfirmation} className="checkout__paiement-form">
      <PaymentElement />
      {erreur && <p className="checkout__erreur">{erreur}</p>}
      <div className="checkout__paiement-actions">
        <button type="button" className="checkout__lien-retour" onClick={onRetour}>
          ← Modifier mes informations
        </button>
        <button type="submit" className="checkout__btn-valider" disabled={!stripe || enCours}>
          {enCours ? 'Traitement...' : 'VALIDER LA COMMANDE'}
        </button>
      </div>
    </form>
  );
}

export default function FormulaireCheckout() {
  const { data: session, status: statutSession } = useSession();
  const articles = usePanierStore((s) => s.articles);
  const codeApplique = usePanierStore((s) => s.codePromoApplique);
  const definirCodePromo = usePanierStore((s) => s.definirCodePromo);

  const [monte, setMonte] = useState(false);
  const [adresse, setAdresse] = useState<Adresse>(ADRESSE_VIDE);
  const [codePromo, setCodePromo] = useState('');
  const [erreurCode, setErreurCode] = useState('');
  const [validationCode, setValidationCode] = useState(false);
  const [modeLivraisonId, setModeLivraisonId] = useState('');
  const [modesLivraison, setModesLivraison] = useState<ModeLivraison[]>([]);
  const [chargementModes, setChargementModes] = useState(false);
  const [pointsRelais, setPointsRelais] = useState<PointRelais[]>([]);
  const [pointRelaisChoisi, setPointRelaisChoisi] = useState<PointRelais | null>(null);
  const [rechercheRelaisEnCours, setRechercheRelaisEnCours] = useState(false);
  const [erreurRelais, setErreurRelais] = useState('');
  const [suggestionsAdresse, setSuggestionsAdresse] = useState<
    { label: string; adresse: string; codePostal: string; ville: string }[]
  >([]);
  const [suggestionsVisibles, setSuggestionsVisibles] = useState(false);
  const suggestionsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [adressesEnregistrees, setAdressesEnregistrees] = useState<AdresseEnregistree[]>([]);
  const [adresseSelectionneeId, setAdresseSelectionneeId] = useState<string>('nouvelle');
  const [etape, setEtape] = useState<'adresse' | 'paiement'>('adresse');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [chargementIntent, setChargementIntent] = useState(false);
  const [livraisonIncluse, setLivraisonIncluse] = useState(false);
  const [erreurIntent, setErreurIntent] = useState('');

  useEffect(() => setMonte(true), []);

  useEffect(() => {
    if (articles.length === 0) return;
    setChargementModes(true);
    fetch('/api/livraison/tarifs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ articles: articles.map((a: any) => ({ id: a.produitId, quantite: a.quantite })) }),
    })
      .then((r) => (r.ok ? r.json() : { modes: [] }))
      .then((data: { modes: ModeLivraison[]; livraisonIncluse?: boolean }) => {
        setModesLivraison(data.modes || []);
        if (data.modes?.length > 0) setModeLivraisonId((actuel) => actuel || data.modes[0].id);
        // Si livraison incluse dans le prix, on sélectionne auto le premier mode sans afficher le choix
        if (data.livraisonIncluse) setLivraisonIncluse(true);
      })
      .catch(() => setModesLivraison([]))
      .finally(() => setChargementModes(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articles.map((a: any) => `${a.produitId}:${a.quantite}`).join(',')]);

  function gererSaisieAdresse(valeur: string) {
    majAdresse('adresse', valeur);
    if (suggestionsTimer.current) clearTimeout(suggestionsTimer.current);

    if (valeur.trim().length < 3) {
      setSuggestionsAdresse([]);
      setSuggestionsVisibles(false);
      return;
    }

    suggestionsTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/adresse/autocomplete?q=${encodeURIComponent(valeur)}`);
        const data = await res.json();
        setSuggestionsAdresse(data.suggestions || []);
        setSuggestionsVisibles(true);
      } catch {
        setSuggestionsAdresse([]);
      }
    }, 300);
  }

  function choisirSuggestionAdresse(s: { adresse: string; codePostal: string; ville: string }) {
    setAdresse((a) => ({ ...a, adresse: s.adresse, codePostal: s.codePostal, ville: s.ville }));
    setSuggestionsVisibles(false);
    setSuggestionsAdresse([]);
  }

  async function rechercherPointsRelais() {
    if (!adresse.codePostal) {
      setErreurRelais('Merci de renseigner votre code postal.');
      return;
    }
    setRechercheRelaisEnCours(true);
    setErreurRelais('');
    setPointsRelais([]);
    try {
      const res = await fetch('/api/livraison/points-relais', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codePostal: adresse.codePostal, ville: adresse.ville, pays: adresse.pays }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur de recherche');
      setPointsRelais(data.points || []);
      if ((data.points || []).length === 0) {
        setErreurRelais('Aucun point relais trouvé autour de ce code postal.');
      }
    } catch (e: any) {
      setErreurRelais(e.message || 'Impossible de rechercher les points relais pour le moment.');
    } finally {
      setRechercheRelaisEnCours(false);
    }
  }

  useEffect(() => {
    if (session?.user?.email && !adresse.email) {
      setAdresse((prev) => ({ ...prev, email: session.user!.email! }));
    }
  }, [session, adresse.email]);

  useEffect(() => {
    if (statutSession !== 'authenticated') return;

    fetch('/api/mon-compte/adresses')
      .then((r) => (r.ok ? r.json() : []))
      .then((data: AdresseEnregistree[]) => {
        setAdressesEnregistrees(data);
        const parDefaut = data.find((a: any) => a.parDefaut) || data[0];
        if (parDefaut) {
          appliquerAdresseEnregistree(parDefaut);
          setAdresseSelectionneeId(parDefaut.id);
        }
      })
      .catch(() => {});
  }, [statutSession]);

  function appliquerAdresseEnregistree(a: AdresseEnregistree) {
    const [prenom, ...resteNom] = a.destinataire.split(' ');
    setAdresse((prev) => ({
      ...prev,
      prenom: prenom || '',
      nom: resteNom.join(' ') || '',
      adresse: a.ligne1,
      complement: a.ligne2 || '',
      ville: a.ville,
      codePostal: a.codePostal,
      pays: a.pays || 'FR',
      telephone: a.telephone || '',
    }));
  }

  function choisirAdresse(id: string) {
    setAdresseSelectionneeId(id);
    if (id === 'nouvelle') {
      setAdresse((prev) => ({ ...ADRESSE_VIDE, email: prev.email }));
      return;
    }

    const trouvee = adressesEnregistrees.find((a: any) => a.id === id);
    if (trouvee) appliquerAdresseEnregistree(trouvee);
  }

  const modeLivraison = modesLivraison.find((m: any) => m.id === modeLivraisonId) || modesLivraison[0];
  const sousTotal = articles.reduce((s: any, a: any) => s + a.prix * a.quantite, 0);
  const reduction = codeApplique?.reduction || 0;
  const fraisLivraison = modeLivraison?.prix || 0;
  const total = Math.max(0, sousTotal - reduction + fraisLivraison);

  function majAdresse(champ: keyof Adresse, valeur: string) {
    setAdresse((prev) => ({ ...prev, [champ]: valeur }));
  }

  async function appliquerCode() {
    if (!codePromo.trim()) return;
    setValidationCode(true);
    setErreurCode('');

    try {
      const res = await fetch('/api/codes-promo/valider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codePromo, sousTotal }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Code invalide');
      definirCodePromo({ code: data.code, reduction: data.reduction });
    } catch (e: any) {
      setErreurCode(e.message || 'Code invalide');
      definirCodePromo(null);
    } finally {
      setValidationCode(false);
    }
  }

  function retirerCode() {
    definirCodePromo(null);
    setCodePromo('');
    setErreurCode('');
  }

  function champsAdresseValides() {
    const adresseOk = Boolean(adresse.email && adresse.prenom && adresse.nom && adresse.adresse && adresse.ville && adresse.codePostal);
    if (!adresseOk || !modeLivraison) return false;
    if (modeLivraison.necessitePointRelais && !pointRelaisChoisi) return false;
    return true;
  }

  async function continuerVersPaiement(e: React.FormEvent) {
    e.preventDefault();
    if (!champsAdresseValides()) return;

    setChargementIntent(true);
    setErreurIntent('');

    try {
      const res = await fetch('/api/checkout/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articles,
          codeReduction: codeApplique?.code,
          adresse,
          modeLivraison: { id: modeLivraison?.id },
          pointRelais: pointRelaisChoisi
            ? {
                numero: pointRelaisChoisi.numero,
                nom: pointRelaisChoisi.nom,
                adresse: pointRelaisChoisi.adresse,
                codePostal: pointRelaisChoisi.codePostal,
                ville: pointRelaisChoisi.ville,
              }
            : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la préparation du paiement.');
      setClientSecret(data.clientSecret);
      setEtape('paiement');
    } catch (e: any) {
      setErreurIntent(e.message || 'Une erreur est survenue.');
    } finally {
      setChargementIntent(false);
    }
  }

  if (!monte) return <div className="checkout conteneur" />;

  if (articles.length === 0) {
    return (
      <div className="checkout checkout--vide conteneur">
        <h1>Votre panier est vide</h1>
        <Link href="/collections" className="btn btn-primaire">Découvrir les collections</Link>
      </div>
    );
  }

  return (
    <div className="checkout">
      <div className="checkout__grille">
        <div className="checkout__formulaire">
          {etape === 'adresse' && (
            <form onSubmit={continuerVersPaiement}>
              <div className="checkout__etape">
                <div className="checkout__etape-entete">
                  <h2>Étape 1/3 : vos coordonnées</h2>
                  {statutSession !== 'authenticated' && (
                    <Link href="/connexion?redirect=/checkout" className="checkout__lien-connexion">
                      Se connecter
                    </Link>
                  )}
                </div>
                <label>Adresse e-mail</label>
                <input
                  type="email"
                  required
                  value={adresse.email}
                  onChange={(e) => majAdresse('email', e.target.value)}
                  placeholder="vous@exemple.fr"
                  disabled={statutSession === 'authenticated'}
                  autoComplete="email"
                />
              </div>

              <div className="checkout__etape">
                <h2>Étape 2/3 : adresse de livraison</h2>

                {statutSession === 'authenticated' && adressesEnregistrees.length > 0 && (
                  <div className="checkout__adresses-enregistrees">
                    {adressesEnregistrees.map((a: any) => (
                      <label
                        key={a.id}
                        className={`checkout__adresse-carte${adresseSelectionneeId === a.id ? ' checkout__adresse-carte--active' : ''}`}
                      >
                        <input
                          type="radio"
                          name="adresse-enregistree"
                          checked={adresseSelectionneeId === a.id}
                          onChange={() => choisirAdresse(a.id)}
                        />
                        <div>
                          <strong>{a.libelle || a.destinataire}</strong>
                          <p>{a.ligne1}, {a.codePostal} {a.ville}</p>
                        </div>
                      </label>
                    ))}
                    <label className={`checkout__adresse-carte${adresseSelectionneeId === 'nouvelle' ? ' checkout__adresse-carte--active' : ''}`}>
                      <input
                        type="radio"
                        name="adresse-enregistree"
                        checked={adresseSelectionneeId === 'nouvelle'}
                        onChange={() => choisirAdresse('nouvelle')}
                      />
                      <div><strong>Utiliser une nouvelle adresse</strong></div>
                    </label>
                  </div>
                )}

                {(statutSession !== 'authenticated' || adresseSelectionneeId === 'nouvelle') && (
                  <>
                    <div className="checkout__ligne-double">
                      <div>
                        <label>Prénom</label>
                        <input required value={adresse.prenom} onChange={(e) => majAdresse('prenom', e.target.value)} autoComplete="given-name" />
                      </div>
                      <div>
                        <label>Nom</label>
                        <input required value={adresse.nom} onChange={(e) => majAdresse('nom', e.target.value)} autoComplete="family-name" />
                      </div>
                    </div>
                    <label>Adresse</label>
                    <div className="checkout__adresse-autocomplete">
                      <input
                        required
                        value={adresse.adresse}
                        onChange={(e) => gererSaisieAdresse(e.target.value)}
                        onFocus={() => suggestionsAdresse.length > 0 && setSuggestionsVisibles(true)}
                        onBlur={() => setTimeout(() => setSuggestionsVisibles(false), 150)}
                        placeholder="7 rue Joseph Cugnot"
                        autoComplete="off"
                      />
                      {suggestionsVisibles && suggestionsAdresse.length > 0 && (
                        <ul className="checkout__adresse-suggestions">
                          {suggestionsAdresse.map((s: any) => (
                            <li key={s.label}>
                              <button type="button" onMouseDown={() => choisirSuggestionAdresse(s)}>
                                {s.label}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <label>Complément (appartement, bâtiment...)</label>
                    <input value={adresse.complement} onChange={(e) => majAdresse('complement', e.target.value)} autoComplete="address-line2" />
                    <div className="checkout__ligne-double">
                      <div>
                        <label>Code postal</label>
                        <input required value={adresse.codePostal} onChange={(e) => majAdresse('codePostal', e.target.value)} autoComplete="postal-code" />
                      </div>
                      <div>
                        <label>Ville</label>
                        <input required value={adresse.ville} onChange={(e) => majAdresse('ville', e.target.value)} autoComplete="address-level2" />
                      </div>
                    </div>
                    <label>Téléphone (optionnel)</label>
                    <input type="tel" value={adresse.telephone} onChange={(e) => majAdresse('telephone', e.target.value)} autoComplete="tel" />
                  </>
                )}
              </div>

              {!livraisonIncluse && (
              <div className="checkout__etape checkout__mode-expedition">
                <h2>Étape 3/3 : mode d’expédition</h2>
                {chargementModes && <p className="checkout__aide">Calcul des frais de livraison...</p>}
                {!chargementModes && modesLivraison.length === 0 && (
                  <p className="checkout__erreur">Aucun mode de livraison disponible pour le moment.</p>
                )}
                {modesLivraison.map((mode: any) => (
                  <label key={mode.id} className={`checkout__option-expedition${modeLivraisonId === mode.id ? ' checkout__option-expedition--actif' : ''}`}>
                    <span className="checkout__option-expedition-choix">
                      <input
                        type="radio"
                        name="mode-livraison"
                        checked={modeLivraisonId === mode.id}
                        onChange={() => {
                          setModeLivraisonId(mode.id);
                          setPointRelaisChoisi(null);
                        }}
                      />
                      <span>
                        {mode.label}
                        <small>{mode.delai}</small>
                      </span>
                    </span>
                    <strong>{mode.prix === 0 ? 'Offerte' : formaterPrix(mode.prix)}</strong>
                  </label>
                ))}

                {modeLivraison?.necessitePointRelais && (
                  <div className="checkout__points-relais">
                    {pointRelaisChoisi ? (
                      <div className="checkout__relais-choisi">
                        <div>
                          <strong>{pointRelaisChoisi.nom}</strong>
                          <p>{pointRelaisChoisi.adresse}, {pointRelaisChoisi.codePostal} {pointRelaisChoisi.ville}</p>
                        </div>
                        <button type="button" className="checkout__lien-retour" onClick={() => setPointRelaisChoisi(null)}>
                          Changer
                        </button>
                      </div>
                    ) : (
                      <>
                        <button type="button" className="btn" onClick={rechercherPointsRelais} disabled={rechercheRelaisEnCours}>
                          {rechercheRelaisEnCours ? 'Recherche...' : 'Choisir un point relais près de chez moi'}
                        </button>
                        {erreurRelais && <p className="checkout__erreur">{erreurRelais}</p>}
                        {pointsRelais.length > 0 && (
                          <ul className="checkout__liste-relais">
                            {pointsRelais.map((p: any) => (
                              <li key={p.numero}>
                                <button type="button" onClick={() => setPointRelaisChoisi(p)}>
                                  <strong>{p.nom}</strong>
                                  <span>{p.adresse}, {p.codePostal} {p.ville}</span>
                                  {p.distanceMetres != null && <small>{Math.round(p.distanceMetres / 100) / 10} km</small>}
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
              )}

              {erreurIntent && <p className="checkout__erreur">{erreurIntent}</p>}

              <button type="submit" className="checkout__btn-valider" disabled={!champsAdresseValides() || chargementIntent}>
                {chargementIntent ? 'Préparation du paiement...' : 'CONTINUER VERS LE PAIEMENT'}
              </button>
            </form>
          )}

          {etape === 'paiement' && clientSecret && !stripePromise && (
            <div className="checkout__etape">
              <h2>Paiement indisponible</h2>
              <p className="checkout__erreur">
                La clé publique Stripe n’est pas configurée. Ajoutez NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
                dans l’environnement de production avant d’ouvrir la boutique.
              </p>
              <button type="button" className="checkout__lien-retour" onClick={() => setEtape('adresse')}>
                ← Revenir aux informations de livraison
              </button>
            </div>
          )}

          {etape === 'paiement' && clientSecret && stripePromise && (
            <div className="checkout__etape">
              <h2>Paiement</h2>
              <p className="checkout__paiement-securise">
                Paiement 100% sécurisé, géré directement par Stripe. Vos informations bancaires ne
                transitent jamais par nos serveurs.
              </p>
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <FormulairePaiement onRetour={() => setEtape('adresse')} />
              </Elements>
            </div>
          )}

          <div className="checkout__liens-legaux">
            <Link href="/livraison-retours">Livraison et retours</Link>
            <Link href="/paiement-securise">Paiement sécurisé</Link>
            <Link href="/confidentialite">Confidentialité</Link>
            <Link href="/cgv">Conditions générales de vente</Link>
            <Link href="/mentions-legales">Mentions légales</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </div>

        <aside className="checkout__resume" aria-label="Résumé de commande">
          <div className="checkout__resume-articles">
            {articles.map((article: any) => (
              <div key={`${article.produitId}-${article.taille ?? ''}`} className="checkout__resume-article">
                <div className="checkout__resume-image">
                  {article.image && <Image src={article.image} alt={article.nom} width={56} height={56} style={{ objectFit: 'cover' }} />}
                  <span className="checkout__resume-quantite">{article.quantite}</span>
                </div>
                <div className="checkout__resume-info">
                  <p>{article.nom}</p>
                  {article.taille && <span>Taille : {article.taille}</span>}
                </div>
                <span className="checkout__resume-prix">{formaterPrix(article.prix * article.quantite)}</span>
              </div>
            ))}
          </div>

          <div className="checkout__code-promo">
            {codeApplique ? (
              <div className="checkout__code-applique">
                <span>Code « {codeApplique.code} » appliqué</span>
                <button type="button" onClick={retirerCode} aria-label="Retirer le code promotionnel">×</button>
              </div>
            ) : (
              <div className="checkout__code-champ">
                <input
                  placeholder="Code de réduction"
                  value={codePromo}
                  onChange={(e) => setCodePromo(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      appliquerCode();
                    }
                  }}
                />
                <button type="button" onClick={appliquerCode} disabled={validationCode}>
                  {validationCode ? '...' : 'Valider'}
                </button>
              </div>
            )}
            {erreurCode && <p className="checkout__erreur-code">{erreurCode}</p>}
          </div>

          <div className="checkout__totaux">
            <div className="checkout__ligne-total">
              <span>Sous-total · {articles.reduce((n: any, a: any) => n + a.quantite, 0)} article{articles.length > 1 ? 's' : ''}</span>
              <span>{formaterPrix(sousTotal)}</span>
            </div>
            {reduction > 0 && (
              <div className="checkout__ligne-total checkout__ligne-total--reduction">
                <span>Réduction</span>
                <span>−{formaterPrix(reduction)}</span>
              </div>
            )}
            <div className="checkout__ligne-total">
              <span>Livraison</span>
              <span>{fraisLivraison === 0 ? 'Offerte' : formaterPrix(fraisLivraison)}</span>
            </div>
            <div className="checkout__ligne-total checkout__ligne-total--final">
              <span>Total</span>
              <span>{formaterPrix(total)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
