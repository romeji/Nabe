'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formaterPrix } from '@/lib/utils';

type ProduitSimple = {
  id: string;
  nom: string;
  slug: string;
  prix: string;
  image: string | null;
};

export default function PopupPanierVide({ onFermer }: { onFermer: () => void }) {
  const [bestsellers, setBestsellers] = useState<ProduitSimple[]>([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    fetch('/api/produits/bestsellers')
      .then((res) => res.json())
      .then((data) => setBestsellers(data.produits || []))
      .catch(() => setBestsellers([]))
      .finally(() => setChargement(false));
  }, []);

  return (
    <div className="popup-panier-vide__overlay" onClick={onFermer}>
      <div className="popup-panier-vide__modal" onClick={(e) => e.stopPropagation()}>
        <button className="popup-panier-vide__fermer" onClick={onFermer} aria-label="Fermer">
          ✕
        </button>

        <h2>Ton panier est vide</h2>
        <Link href="/collections" className="btn btn-primaire popup-panier-vide__continuer" onClick={onFermer}>
          Continuer ma visite
        </Link>

        {!chargement && bestsellers.length > 0 && (
          <div className="popup-panier-vide__bestsellers">
            <h3>Les meilleures ventes, vos bijoux préférés →</h3>
            <div className="popup-panier-vide__grille">
              {bestsellers.map((p) => (
                <Link key={p.id} href={`/collections/${p.slug}`} className="popup-panier-vide__carte" onClick={onFermer}>
                  {p.image ? (
                    <Image src={p.image} alt={p.nom} width={150} height={150} />
                  ) : (
                    <div className="popup-panier-vide__placeholder" />
                  )}
                  <span>{p.nom}</span>
                  <strong>{formaterPrix(p.prix)}</strong>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
