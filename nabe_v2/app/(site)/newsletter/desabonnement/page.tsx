'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ContenuDesabonnement() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const token = searchParams.get('token') || '';
  const [statut, setStatut] = useState<'chargement' | 'ok' | 'erreur'>('chargement');

  useEffect(() => {
    if (!email || !token) {
      setStatut('erreur');
      return;
    }
    fetch('/api/newsletter/desabonnement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, token }),
    })
      .then((res) => setStatut(res.ok ? 'ok' : 'erreur'))
      .catch(() => setStatut('erreur'));
  }, [email, token]);

  return (
    <div className="conteneur" style={{ padding: '8rem 1rem 4rem', maxWidth: 520, textAlign: 'center' }}>
      {statut === 'chargement' && <p>Traitement en cours...</p>}
      {statut === 'ok' && (
        <>
          <h1>Vous êtes désabonné(e)</h1>
          <p>Vous ne recevrez plus notre newsletter. Vous pouvez vous réinscrire à tout moment depuis le site.</p>
        </>
      )}
      {statut === 'erreur' && (
        <>
          <h1>Lien invalide</h1>
          <p>Ce lien de désabonnement n’est pas valide ou a déjà été utilisé.</p>
        </>
      )}
      <Link href="/" className="btn" style={{ marginTop: '1.5rem', display: 'inline-block' }}>
        Retour à l’accueil
      </Link>
    </div>
  );
}

export default function PageDesabonnement() {
  return (
    <Suspense fallback={<div className="conteneur" style={{ padding: '8rem 1rem' }} />}>
      <ContenuDesabonnement />
    </Suspense>
  );
}
