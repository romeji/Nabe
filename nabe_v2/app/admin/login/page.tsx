'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import './login.css';

export default function PageLoginAdmin() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      router.replace('/admin');
    }
  }, [status, session, router]);

  async function gererConnexion(e: React.FormEvent) {
    e.preventDefault();
    setChargement(true);
    setErreur('');

    try {
      const csrfResponse = await fetch('/api/auth-admin/csrf', {
        credentials: 'same-origin',
        cache: 'no-store',
      });

      if (!csrfResponse.ok) {
        throw new Error('Impossible de récupérer le jeton CSRF.');
      }

      const { csrfToken } = await csrfResponse.json();

      const response = await fetch(
        '/api/auth-admin/callback/credentials',
        {
          method: 'POST',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            csrfToken: csrfToken ?? '',
            email: email.trim(),
            password: motDePasse,
            callbackUrl: '/admin',
            json: 'true',
          }),
        },
      );

      const resultat = await response.json().catch(() => ({}));

      if (
        !response.ok ||
        !resultat?.url ||
        /[?&]error=/.test(resultat.url)
      ) {
        setErreur('Email ou mot de passe incorrect.');
        return;
      }

      window.location.assign('/admin');
    } catch (error) {
      console.error('Erreur de connexion admin :', error);
      setErreur('Une erreur est survenue. Réessayez.');
    } finally {
      setChargement(false);
    }
  }

  return (
    <div className="admin-login">
      <form
        onSubmit={gererConnexion}
        className="admin-login__carte"
      >
        <h1 className="admin-login__logo">Nabe</h1>
        <p className="admin-login__sous-titre">
          Espace d&apos;administration
        </p>

        <label htmlFor="admin-email">Email</label>
        <input
          id="admin-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
          autoComplete="email"
        />

        <label htmlFor="admin-password">
          Mot de passe
        </label>
        <input
          id="admin-password"
          type="password"
          value={motDePasse}
          onChange={(e) => setMotDePasse(e.target.value)}
          required
          autoComplete="current-password"
        />

        {erreur && (
          <p className="admin-login__erreur">{erreur}</p>
        )}

        <button
          type="submit"
          className="btn btn-primaire"
          disabled={chargement}
        >
          {chargement ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>
    </div>
  );
}
