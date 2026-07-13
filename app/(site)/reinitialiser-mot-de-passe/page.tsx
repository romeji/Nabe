'use client';

import { Suspense } from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import '../connexion/connexion.css';

function ContenuReinitialiserMotDePasse() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const token = searchParams.get('token') || '';

  const [motDePasse, setMotDePasse] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [enCours, setEnCours] = useState(false);
  const [succes, setSucces] = useState(false);
  const [erreur, setErreur] = useState('');

  async function reinitialiser(e: React.FormEvent) {
    e.preventDefault();
    setErreur('');

    if (motDePasse !== confirmation) {
      setErreur('Les deux mots de passe ne correspondent pas.');
      return;
    }

    setEnCours(true);
    try {
      const res = await fetch('/api/auth-client/reinitialiser-mot-de-passe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, password: motDePasse }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la reinitialisation.');
      setSucces(true);
    } catch (err: any) {
      setErreur(err.message || 'Erreur lors de la reinitialisation.');
    } finally {
      setEnCours(false);
    }
  }

  return (
    <div className="page-connexion conteneur">
      <div className="connexion-carte">
        <h1>Nouveau mot de passe</h1>

        {!email || !token ? (
          <>
            <p className="connexion-erreur">Ce lien est invalide.</p>
            <p className="connexion-lien">
              <Link href="/mot-de-passe-oublie">Demander un nouveau lien</Link>
            </p>
          </>
        ) : succes ? (
          <>
            <p className="connexion-soustitre">Votre mot de passe a ete modifie.</p>
            <p className="connexion-lien">
              <Link href="/connexion">Se connecter</Link>
            </p>
          </>
        ) : (
          <form onSubmit={reinitialiser}>
            <label htmlFor="nouveau-password">Nouveau mot de passe</label>
            <input
              id="nouveau-password"
              type="password"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              minLength={6}
              required
              autoFocus
              autoComplete="new-password"
            />

            <label htmlFor="confirmation-password">Confirmer le nouveau mot de passe</label>
            <input
              id="confirmation-password"
              type="password"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              minLength={6}
              required
              autoComplete="new-password"
            />

            {erreur && <p className="connexion-erreur">{erreur}</p>}

            <button type="submit" className="btn btn-primaire" disabled={enCours}>
              {enCours ? 'Enregistrement...' : 'Modifier le mot de passe'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function PageReinitialiserMotDePasse() {
  return (
    <Suspense fallback={null}>
      <ContenuReinitialiserMotDePasse />
    </Suspense>
  );
}
