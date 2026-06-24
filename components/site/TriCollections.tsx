'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function TriCollections() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const triActif = searchParams.get('tri') || 'recent';

  function changerTri(valeur: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tri', valeur);
    router.push(`/collections?${params.toString()}`);
  }

  return (
    <select
      value={triActif}
      onChange={(e) => changerTri(e.target.value)}
      className="tri-collections"
    >
      <option value="recent">Trier par : Nouveautés</option>
      <option value="prix-asc">Trier par : Prix croissant</option>
      <option value="prix-desc">Trier par : Prix décroissant</option>
      <option value="nom">Trier par : Nom (A-Z)</option>
    </select>
  );
}
