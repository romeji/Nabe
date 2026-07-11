'use client';

import { useEffect, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function ConnexionContenu() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);
  const [chargementGoogle, setChargementGoogle] = useState(false);

  const redirectParam = searchParams.get('redirect');
  const urlRetour = redirectParam?.startsWith('/') && !redirectParam.startsWith('//') ? redirectParam : '/mon-compte';

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      router.replace(urlRetour);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session]);

  async function gererConnexion(e: React.FormEvent) {
    e.preventDefault();
    setChargement(true);
    setErreur('');

    const resultat = await signIn('credentials', {
      email,
      password: motDePasse,
      redirect: false,
    });

    if (resultat?.error) {
      setErreur('Email ou mot de passe incorrect.');
      setChargement(false);
      return;
    }

    router.push(urlRetour);
    router.refresh();
  }

  async function gererConnexionGoogle() {
    setChargementGoogle(true);
    await signIn('google', { callbackUrl: urlRetour });
  }

  return (
    <div className="page-connexion conteneur">
      <div className="connexion-carte">
        <h1>Connexion</h1>
        <p className="connexion-soustitre">Accédez à votre compte Nabe</p>

        <button type="button" className="connexion-google" onClick={gererConnexionGoogle} disabled={chargementGoogle}>
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.12-.84 2.07-1.79 2.71v2.26h2.9c1.7-1.56 2.69-3.87 2.69-6.61z" />
            <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.55-1.84.86-3.06.86-2.36 0-4.36-1.59-5.08-3.73H.96v2.34C2.45 15.98 5.48 18 9 18z" />
            <path fill="#FBBC05" d="M3.92 10.69c-.18-.55-.29-1.13-.29-1.69s.11-1.14.29-1.69V4.97H.96A8.96 8.96 0 000 9c0 1.45.35 2.82.96 4.03l2.96-2.34z" />
            <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0 5.48 0 2.45 2.02.96 4.97l2.96 2.34C4.64 5.17 6.64 3.58 9 3.58z" />
          </svg>
          {chargementGoogle ? 'Connexion...' : 'Continuer avec Google'}
        </button>

        <div className="connexion-separateur">
          <span>ou</span>
        </div>

        <form onSubmit={gererConnexion}>
          <label htmlFor="connexion-email">Email</label>
          <input
            id="connexion-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
            autoComplete="email"
          />

          <label htmlFor="connexion-password">Mot de passe</label>
          <input
            id="connexion-password"
            type="password"
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            required
            autoComplete="current-password"
          />

          {erreur && <p className="connexion-erreur">{erreur}</p>}

          <button type="submit" className="btn btn-primaire" disabled={chargement}>
            {chargement ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p className="connexion-lien">
          Pas encore de compte ? <Link href="/inscription">Créer un compte</Link>
        </p>
      </div>
    </div>
  );
}
