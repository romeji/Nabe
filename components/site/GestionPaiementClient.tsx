'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import './gestion-paiement.css';

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

type MoyenPaiement = {
  id: string;
  marque: string;
  derniers4: string;
  moisExpiration: number;
  anneeExpiration: number;
  parDefaut: boolean;
};

function FormulaireAjoutCarte({ onSucces, onAnnuler }: { onSucces: () => void; onAnnuler: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState('');

  async function gererSoumission(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setEnCours(true);
    setErreur('');

    const { error } = await stripe.confirmSetup({
      elements,
      redirect: 'if_required',
    });

    if (error) {
      setErreur(error.message || "Erreur lors de l'ajout de la carte.");
      setEnCours(false);
      return;
    }

    onSucces();
  }

  return (
    <form onSubmit={gererSoumission} className="gestion-paiement__formulaire">
      <PaymentElement />
      {erreur && <p className="gestion-paiement__erreur">{erreur}</p>}
      <div className="gestion-paiement__actions-form">
        <button type="submit" className="btn btn-primaire" disabled={!stripe || enCours}>
          {enCours ? 'Enregistrement...' : 'Ajouter cette carte'}
        </button>
        <button type="button" className="admin-btn-icone" onClick={onAnnuler}>
          Annuler
        </button>
      </div>
    </form>
  );
}

export default function GestionPaiementClient() {
  const [moyens, setMoyens] = useState<MoyenPaiement[]>([]);
  const [chargement, setChargement] = useState(true);
  const [formulaireOuvert, setFormulaireOuvert] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  function chargerMoyens() {
    setChargement(true);
    fetch('/api/mon-compte/moyens-paiement')
      .then((res) => res.json())
      .then((data) => setMoyens(data.moyensPaiement || []))
      .catch(() => setMoyens([]))
      .finally(() => setChargement(false));
  }

  useEffect(() => {
    chargerMoyens();
  }, []);

  async function ouvrirFormulaire() {
    setFormulaireOuvert(true);
    const res = await fetch('/api/mon-compte/moyens-paiement/setup-intent', { method: 'POST' });
    const data = await res.json();
    setClientSecret(data.clientSecret);
  }

  function fermerFormulaire() {
    setFormulaireOuvert(false);
    setClientSecret(null);
  }

  function gererSucces() {
    fermerFormulaire();
    chargerMoyens();
  }

  async function supprimer(id: string) {
    if (!confirm('Retirer cette carte ?')) return;
    try {
      const res = await fetch(`/api/mon-compte/moyens-paiement/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      chargerMoyens();
    } catch {
      alert('Erreur lors de la suppression.');
    }
  }

  async function definirParDefaut(id: string) {
    try {
      const res = await fetch(`/api/mon-compte/moyens-paiement/${id}`, { method: 'PATCH' });
      if (!res.ok) throw new Error();
      chargerMoyens();
    } catch {
      alert('Erreur.');
    }
  }

  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    return (
      <p className="gestion-paiement__vide">
        Le paiement enregistré n'est pas encore configuré sur ce site (clé Stripe publique manquante).
      </p>
    );
  }

  if (chargement) return <p className="gestion-paiement__chargement">Chargement...</p>;

  return (
    <div className="gestion-paiement">
      {!formulaireOuvert && (
        <button className="btn btn-primaire gestion-paiement__ajouter" onClick={ouvrirFormulaire}>
          + Ajouter une carte
        </button>
      )}

      {formulaireOuvert && clientSecret && (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <FormulaireAjoutCarte onSucces={gererSucces} onAnnuler={fermerFormulaire} />
        </Elements>
      )}

      {formulaireOuvert && !clientSecret && (
        <p className="gestion-paiement__chargement">Chargement du formulaire sécurisé...</p>
      )}

      {moyens.length === 0 && !formulaireOuvert && (
        <p className="gestion-paiement__vide">Aucune carte enregistrée pour le moment.</p>
      )}

      <div className="gestion-paiement__liste">
        {moyens.map((m) => (
          <div key={m.id} className="gestion-paiement__carte">
            {m.parDefaut && <span className="gestion-paiement__badge">Par défaut</span>}
            <div className="gestion-paiement__infos">
              <strong>
                {m.marque.toUpperCase()} •••• {m.derniers4}
              </strong>
              <span>
                Expire {String(m.moisExpiration).padStart(2, '0')}/{m.anneeExpiration}
              </span>
            </div>
            <div className="gestion-paiement__actions">
              {!m.parDefaut && <button onClick={() => definirParDefaut(m.id)}>Définir par défaut</button>}
              <button onClick={() => supprimer(m.id)} className="gestion-paiement__supprimer">
                Retirer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
