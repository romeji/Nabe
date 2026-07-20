'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function BoutonFavori({
  produitId,
  initialementFavori = false,
  className = '',
}: {
  produitId: string;
  initialementFavori?: boolean;
  className?: string;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [estFavori, setEstFavori] = useState(initialementFavori);
  const [enCours, setEnCours] = useState(false);

  async function basculer(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!session?.user) {
      router.push('/connexion?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    setEnCours(true);
    const nouveauStatut = !estFavori;
    setEstFavori(nouveauStatut); // optimiste

    try {
      const res = await fetch('/api/favoris', {
        method: nouveauStatut ? 'POST' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ produitId }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      setEstFavori(!nouveauStatut); // rollback si échec
    } finally {
      setEnCours(false);
    }
  }

  return (
    <button
      className={`bouton-favori ${estFavori ? 'actif' : ''} ${className}`}
      onClick={basculer}
      disabled={enCours}
      aria-label={estFavori ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      type="button"
    >
      {estFavori ? '♥' : '♡'}
    </button>
  );
}
