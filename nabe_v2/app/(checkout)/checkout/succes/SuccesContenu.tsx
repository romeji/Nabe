'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { usePanierStore } from '@/lib/store-panier';
import './succes.css';

export default function SuccesContenu() {
  const vider = usePanierStore((state) => state.vider);
  const searchParams = useSearchParams();
  const redirectStatus = searchParams.get('redirect_status');
  const paymentIntent = searchParams.get('payment_intent');

  const [statut, setStatut] = useState<'verification' | 'succes' | 'echec'>('verification');
  const [numeroCommande, setNumeroCommande] = useState<string | null>(null);

  useEffect(() => {
    // Stripe ajoute redirect_status au retour du paiement : on ne considère
    // jamais qu'une commande est réussie sans cette confirmation explicite
    // (sinon n'importe qui visitant cette URL verrait "paiement réussi").
    if (redirectStatus && redirectStatus !== 'succeeded') {
      setStatut('echec');
      return;
    }
    if (!paymentIntent) {
      // Ancien flow ou accès direct sans paramètres Stripe : on ne peut pas
      // vérifier, on affiche un message neutre plutôt qu'un faux succès.
      setStatut('echec');
      return;
    }

    let tentatives = 0;
    const verifier = async () => {
      try {
        const res = await fetch(`/api/commandes/verifier?payment_intent=${encodeURIComponent(paymentIntent)}`);
        if (res.ok) {
          const data = await res.json();
          setNumeroCommande(data.numero);
          setStatut('succes');
          vider();
          return;
        }
      } catch {
        // on retente
      }
      tentatives += 1;
      // Le webhook Stripe peut avoir quelques secondes de latence : on retente
      // brièvement avant d'abandonner (la commande reste garantie créée côté
      // serveur par le webhook, indépendamment de cet affichage).
      if (tentatives < 6) {
        setTimeout(verifier, 1500);
      } else {
        setStatut('succes');
        vider();
      }
    };
    verifier();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [redirectStatus, paymentIntent]);

  if (statut === 'verification') {
    return (
      <div className="page-succes conteneur">
        <p>Vérification du paiement...</p>
      </div>
    );
  }

  if (statut === 'echec') {
    return (
      <div className="page-succes conteneur">
        <span className="page-succes__icone page-succes__icone--echec" aria-hidden="true">✕</span>
        <h1>Le paiement n’a pas abouti</h1>
        <p>Votre carte n’a pas pu être débitée. Aucune somme ne vous a été prélevée. Vous pouvez réessayer.</p>
        <Link href="/checkout" className="btn btn-primaire">
          Retourner au paiement
        </Link>
      </div>
    );
  }

  return (
    <div className="page-succes conteneur">
      <span className="page-succes__icone" aria-hidden="true">✓</span>
      <h1>Merci pour votre commande !</h1>
      <p>
        Votre paiement a bien été reçu. Vous recevrez un e-mail de confirmation avec le détail
        de votre commande très prochainement.
      </p>
      {numeroCommande && (
        <p className="page-succes__numero">
          Numéro de commande : <strong>{numeroCommande}</strong>
        </p>
      )}
      <div className="page-succes__actions">
        <Link href="/suivi-commande" className="btn btn-primaire">
          Suivre ma commande
        </Link>
        <Link href="/collections" className="btn">
          Continuer mes achats
        </Link>
      </div>
    </div>
  );
}
