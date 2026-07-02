'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
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

const ADRESSE_VIDE: Adresse = {
  email: '', prenom: '', nom: '', adresse: '', complement: '',
  ville: '', codePostal: '', pays: 'France', telephone: '',
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

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/succes`,
      },
    });

    // Si on arrive ici, c'est qu'il y a eu une erreur (sinon Stripe redirige automatiquement)
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
  const router = useRouter();
  const articles = usePanierStore((s) => s.articles);
  const codeApplique = usePanierStore((s) => s.codePromoApplique);
  const definirCodePromo = usePanierStore((s) => s.definirCodePromo);

  const [monte, setMonte] = useState(false);
  const [adresse, setAdresse] = useState<Adresse>(ADRESSE_VIDE);
  const [codePromo, setCodePromo] = useState('');
  const [erreurCode, setErreurCode] = useState('');
  const [validationCode, setValidationCode] = useState(false);

  const [etape, setEtape] = useState<'adresse' | 'paiement'>('adresse');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [chargementIntent, setChargementIntent] = useState(false);
  const [erreurIntent, setErreurIntent] = useState('');

  useEffect(() => { setMonte(true); }, []);

  const sousTotal = articles.reduce((s, a) => s + a.prix * a.quantite, 0);
  const reduction = codeApplique?.reduction || 0;
  const fraisLivraison = 0;
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
    return !!(adresse.email && adresse.prenom && adresse.nom && adresse.adresse && adresse.ville && adresse.codePostal);
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
        {/* Colonne gauche : formulaire */}
        <div className="checkout__formulaire">

          {etape === 'adresse' && (
            <form onSubmit={continuerVersPaiement}>
              <div className="checkout__etape">
                <h2>Étape 1/2 : Vos coordonnées</h2>
                <label>Adresse e-mail</label>
                <input
                  type="email"
                  required
                  value={adresse.email}
                  onChange={(e) => majAdresse('email', e.target.value)}
                  placeholder="vous@exemple.fr"
                />
              </div>

              <div className="checkout__etape">
                <h2>Étape 2/2 : Adresse de livraison</h2>
                <div className="checkout__ligne-double">
                  <div>
                    <label>Prénom</label>
                    <input required value={adresse.prenom} onChange={(e) => majAdresse('prenom', e.target.value)} />
                  </div>
                  <div>
                    <label>Nom</label>
                    <input required value={adresse.nom} onChange={(e) => majAdresse('nom', e.target.value)} />
                  </div>
                </div>
                <label>Adresse</label>
                <input required value={adresse.adresse} onChange={(e) => majAdresse('adresse', e.target.value)} placeholder="7 rue Joseph Cugnot" />
                <label>Complément (appartement, bâtiment...)</label>
                <input value={adresse.complement} onChange={(e) => majAdresse('complement', e.target.value)} />
                <div className="checkout__ligne-double">
                  <div>
                    <label>Code postal</label>
                    <input required value={adresse.codePostal} onChange={(e) => majAdresse('codePostal', e.target.value)} />
                  </div>
                  <div>
                    <label>Ville</label>
                    <input required value={adresse.ville} onChange={(e) => majAdresse('ville', e.target.value)} />
                  </div>
                </div>
                <label>Téléphone (optionnel)</label>
                <input type="tel" value={adresse.telephone} onChange={(e) => majAdresse('telephone', e.target.value)} />
              </div>

              <div className="checkout__etape checkout__mode-expedition">
                <h2>Mode d'expédition</h2>
                <div className="checkout__option-expedition checkout__option-expedition--actif">
                  <span>Livraison à domicile standard</span>
                  <strong>Offerte</strong>
                </div>
              </div>

              {erreurIntent && <p className="checkout__erreur">{erreurIntent}</p>}

              <button type="submit" className="checkout__btn-valider" disabled={!champsAdresseValides() || chargementIntent}>
                {chargementIntent ? 'Préparation du paiement...' : 'CONTINUER VERS LE PAIEMENT'}
              </button>
            </form>
          )}

          {etape === 'paiement' && clientSecret && stripePromise && (
            <div className="checkout__etape">
              <h2>Paiement</h2>
              <p className="checkout__paiement-securise">
                🔒 Paiement 100% sécurisé, géré directement par Stripe. Vos informations bancaires ne
                transitent jamais par nos serveurs.
              </p>
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <FormulairePaiement onRetour={() => setEtape('adresse')} />
              </Elements>
            </div>
          )}
        </div>

        {/* Colonne droite : résumé (sticky) */}
        <div className="checkout__resume">
          <div className="checkout__resume-articles">
            {articles.map((article) => (
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
                <span>✓ Code « {codeApplique.code} »</span>
                <button type="button" onClick={retirerCode}>✕</button>
              </div>
            ) : (
              <div className="checkout__code-champ">
                <input
                  placeholder="Code de réduction ou carte-cadeau"
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
              <span>Sous-total · {articles.reduce((n, a) => n + a.quantite, 0)} article{articles.length > 1 ? 's' : ''}</span>
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
              <span>Offerte</span>
            </div>
            <div className="checkout__ligne-total checkout__ligne-total--final">
              <span>Total</span>
              <span>{formaterPrix(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
