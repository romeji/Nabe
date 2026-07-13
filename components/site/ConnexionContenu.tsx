'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
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
  const urlRetour =
    redirectParam?.startsWith('/') && !redirectParam.startsWith('//') && !/^\/admin(\/|$|\?)/.test(redirectParam)
      ? redirectParam
      : '/mon-compte';

  // Garde-fou absolu (non négociable) : cette page ne doit jamais naviguer
  // vers /admin, quelle qu'en soit la raison (configuration manquante,
  // erreur NextAuth, manipulation de l'URL...).
  function estCibleAdminSuspecte(url: string | undefined | null) {
    if (!url) return false;
    try {
      return /^\/admin(\/|$|\?)/.test(new URL(url, window.location.origin).pathname);
    } catch {
      return false;
    }
  }

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

    try {
      // IMPORTANT : on n'utilise volontairement PAS le helper signIn() ici.
      // next-auth/react partage un état global unique (__NEXTAUTH.basePath)
      // entre TOUS les SessionProvider de l'appli — admin (/api/auth) et
      // boutique (/api/auth-client) se marchaient dessus, ce qui pouvait
      // faire atterrir une connexion client sur le système admin. On appelle
      // donc directement et explicitement le bon endpoint, sans dépendre de
      // cet état partagé fragile.
      const csrfRes = await fetch('/api/auth-client/csrf');
      const { csrfToken } = await csrfRes.json();

      const reponse = await fetch('/api/auth-client/callback/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          csrfToken: csrfToken || '',
          email,
          password: motDePasse,
          json: 'true',
        }),
      });

      const data = await reponse.json().catch(() => ({}));

      if (estCibleAdminSuspecte(data?.url) || estCibleAdminSuspecte(reponse.url)) {
        console.error('Navigation vers /admin bloquée depuis la connexion boutique (garde-fou de sécurité).');
        setErreur('Une erreur est survenue. Réessayez, ou contactez-nous si cela persiste.');
        setChargement(false);
        return;
      }

      if (!reponse.ok || (data?.url && /[?&]error=/.test(data.url))) {
        setErreur('Email ou mot de passe incorrect.');
        setChargement(false);
        return;
      }

      router.push(urlRetour);
      router.refresh();
    } catch {
      setErreur('Une erreur est survenue. Réessayez.');
      setChargement(false);
    }
  }

  async function gererConnexionGoogle() {
    setChargementGoogle(true);
    try {
      // Même raison que pour gererConnexion() ci-dessus : signIn('google', ...)
      // dépend de l'état global partagé de next-auth/react, qui peut pointer
      // vers le mauvais système (admin) selon ce qui a été monté en dernier
      // dans le navigateur. On construit donc nous-mêmes, explicitement,
      // l'appel vers /api/auth-client (jamais /api/auth).
      const csrfRes = await fetch('/api/auth-client/csrf');
      const { csrfToken } = await csrfRes.json();

      const reponse = await fetch('/api/auth-client/signin/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Auth-Return-Redirect': '1',
        },
        body: new URLSearchParams({
          csrfToken: csrfToken || '',
          callbackUrl: urlRetour,
          json: 'true',
        }),
      });

      const data = await reponse.json().catch(() => ({}));

      console.log('[debug google signin]', { status: reponse.status, url: reponse.url, data });

      // GARDE-FOU ABSOLU (non négociable) : la boutique ne doit JAMAIS
      // rediriger ou naviguer vers /admin, quelle qu'en soit la raison
      // (mauvaise config, erreur NextAuth, comportement inattendu du
      // serveur...). On vérifie explicitement avant toute navigation, sur
      // l'URL renvoyée dans le corps ET sur l'URL finale de la réponse elle-même.
      if (estCibleAdminSuspecte(data?.url) || estCibleAdminSuspecte(reponse.url)) {
        console.error('Navigation vers /admin bloquée depuis la connexion boutique (garde-fou de sécurité).');
        setChargementGoogle(false);
        setErreur('La connexion avec Google n’est pas encore configurée. Utilisez votre e-mail et mot de passe, ou réessayez plus tard.');
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      } else {
        setChargementGoogle(false);
        setErreur('Impossible de démarrer la connexion Google. Réessayez.');
      }
    } catch {
      setChargementGoogle(false);
      setErreur('Impossible de démarrer la connexion Google. Réessayez.');
    }
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
          <Link href="/mot-de-passe-oublie">Mot de passe oublie ?</Link>
        </p>

        <p className="connexion-lien">
          Pas encore de compte ? <Link href="/inscription">Créer un compte</Link>
        </p>
      </div>
    </div>
  );
}
