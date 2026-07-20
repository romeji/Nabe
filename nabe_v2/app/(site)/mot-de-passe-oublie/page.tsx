'use client';

import { useState } from 'react';
import Link from 'next/link';
import '../connexion/connexion.css';

export default function PageMotDePasseOublie() {
  const [email, setEmail] = useState('');
  const [enCours, setEnCours] = useState(false);
  const [envoye, setEnvoye] = useState(false);
  const [erreur, setErreur] = useState('');

  async function envoyer(e: React.FormEvent) {
    e.preventDefault();
    setEnCours(true);
    setErreur('');

    try {
      const res = await fetch('/api/auth-client/mot-de-passe-oublie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Erreur lors de la demande.');
      }
      setEnvoye(true);
    } catch (err: any) {
      setErreur(err.message || 'Erreur lors de la demande.');
    } finally {
      setEnCours(false);
    }
  }

  return (
    <div className="page-connexion conteneur">
      <div className="connexion-carte">
        <h1>Mot de passe oublie</h1>
        <p className="connexion-soustitre">
          Indiquez votre adresse e-mail pour recevoir un lien de reinitialisation.
        </p>

        {envoye ? (
          <>
            <p className="connexion-soustitre">
              Si un compte existe avec cette adresse, un e-mail vient d'etre envoye.
            </p>
            <p className="connexion-lien">
              <Link href="/connexion">Retour a la connexion</Link>
            </p>
          </>
        ) : (
          <form onSubmit={envoyer}>
            <label htmlFor="email-reset">Email</label>
            <input
              id="email-reset"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              autoComplete="email"
            />

            {erreur && <p className="connexion-erreur">{erreur}</p>}

            <button type="submit" className="btn btn-primaire" disabled={enCours}>
              {enCours ? 'Envoi...' : 'Recevoir le lien'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
