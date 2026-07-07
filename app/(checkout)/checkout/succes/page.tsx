'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePanierStore } from '@/lib/store-panier';
import './succes.css';

export default function PageSucces() {
  const vider = usePanierStore((state) => state.vider);

  useEffect(() => {
    vider();
  }, [vider]);

  return (
    <div className="page-succes conteneur">
      <span className="page-succes__icone" aria-hidden="true">✓</span>
      <h1>Merci pour votre commande !</h1>
      <p>
        Votre paiement a bien été reçu. Vous recevrez un e-mail de confirmation avec le détail
        de votre commande très prochainement.
      </p>
      <Link href="/collections" className="btn btn-primaire">
        Continuer mes achats
      </Link>
    </div>
  );
}
