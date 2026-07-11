'use client';

import { useEffect, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
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

    const resultat = await signIn('credentials', {
      email,
      password: motDePasse,
      redirect: false,
    });

    if (resultat?.error) {
      setErreur('Email ou mot de passe incorrect.');
      setChargement(false);
    } else {
      router.push('/admin');
      router.refresh();
    }
  }

  return (
    <div className="admin-login">
      <form onSubmit={gererConnexion} className="admin-login__carte">
        <h1 className="admin-login__logo">Nabe</h1>
        <p className="admin-login__sous-titre">Espace d'administration</p>

        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
        />

        <label>Mot de passe</label>
        <input
          type="password"
          value={motDePasse}
          onChange={(e) => setMotDePasse(e.target.value)}
          required
        />

        {erreur && <p className="admin-login__erreur">{erreur}</p>}

        <button type="submit" className="btn btn-primaire" disabled={chargement}>
          {chargement ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>
    </div>
  );
}
