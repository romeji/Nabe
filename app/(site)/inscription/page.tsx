'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import '../connexion/connexion.css';

export default function PageInscription() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);
  const [chargementGoogle, setChargementGoogle] = useState(false);

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      router.replace('/mon-compte');
    }
  }, [status, session, router]);

  async function gererInscription(e: React.FormEvent) {
    e.preventDefault();
    setChargement(true);
    setErreur('');

    try {
      const res = await fetch('/api/auth-client/inscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom, email, password: motDePasse }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la création du compte');

      // Connexion automatique après inscription réussie. Comme dans
      // ConnexionContenu.tsx : jamais signIn() de next-auth/react, qui
      // dépend d'un état global partagé avec le système admin — appel
      // direct et explicite à l'endpoint client.
      const csrfRes = await fetch('/api/auth-client/csrf');
      const { csrfToken } = await csrfRes.json();

      const reponse = await fetch('/api/auth-client/callback/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ csrfToken: csrfToken || '', email, password: motDePasse, json: 'true' }),
      });
      const dataConnexion = await reponse.json().catch(() => ({}));

      if (!reponse.ok || (dataConnexion?.url && /[?&]error=/.test(dataConnexion.url))) {
        router.push('/connexion');
        return;
      }
      router.push('/mon-compte');
      router.refresh();
    } catch (err: any) {
      setErreur(err.message);
    } finally {
      setChargement(false);
    }
  }

  async function gererInscriptionGoogle() {
    setChargementGoogle(true);
    try {
      const csrfRes = await fetch('/api/auth-client/csrf');
      const { csrfToken } = await csrfRes.json();

      const reponse = await fetch('/api/auth-client/signin/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ csrfToken: csrfToken || '', callbackUrl: '/mon-compte', json: 'true' }),
      });
      const data = await reponse.json().catch(() => ({}));

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
        <h1>Créer un compte</h1>
        <p className="connexion-soustitre">Rejoignez l'univers Nabe</p>

        <button className="connexion-google" onClick={gererInscriptionGoogle} disabled={chargementGoogle}>
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.12-.84 2.07-1.79 2.71v2.26h2.9c1.7-1.56 2.69-3.87 2.69-6.61z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.55-1.84.86-3.06.86-2.36 0-4.36-1.59-5.08-3.73H.96v2.34C2.45 15.98 5.48 18 9 18z"/>
            <path fill="#FBBC05" d="M3.92 10.69c-.18-.55-.29-1.13-.29-1.69s.11-1.14.29-1.69V4.97H.96A8.96 8.96 0 000 9c0 1.45.35 2.82.96 4.03l2.96-2.34z"/>
            <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0 5.48 0 2.45 2.02.96 4.97l2.96 2.34C4.64 5.17 6.64 3.58 9 3.58z"/>
          </svg>
          {chargementGoogle ? 'Connexion...' : "S'inscrire avec Google"}
        </button>

        <div className="connexion-separateur">
          <span>ou</span>
        </div>

        <form onSubmit={gererInscription}>
          <label>Prénom / Nom</label>
          <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} required autoFocus />

          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

          <label>Mot de passe</label>
          <input
            type="password"
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            minLength={6}
            required
          />

          {erreur && <p className="connexion-erreur">{erreur}</p>}

          <button type="submit" className="btn btn-primaire" disabled={chargement}>
            {chargement ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>

        <p className="connexion-lien">
          Déjà un compte ? <Link href="/connexion">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
