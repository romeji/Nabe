'use client';

import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formaterPrix } from '@/lib/utils';
import BoutonFavori from './BoutonFavori';
import './carrousel-produits.css';

type ProduitCarrousel = {
  id: string;
  nom: string;
  slug: string;
  prix: string;
  image: string | null;
};

export default function CarrouselProduits({
  produits,
  favorisIds = [],
}: {
  produits: ProduitCarrousel[];
  favorisIds?: string[];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function defiler(direction: 'gauche' | 'droite') {
    if (!scrollRef.current) return;
    const largeur = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({ left: direction === 'gauche' ? -largeur : largeur, behavior: 'smooth' });
  }

  if (produits.length === 0) return null;

  return (
    <div className="carrousel-produits">
      <button className="carrousel-produits__fleche carrousel-produits__fleche--gauche" onClick={() => defiler('gauche')} aria-label="Précédent">
        ‹
      </button>

      <div className="carrousel-produits__piste" ref={scrollRef}>
        {produits.map((p) => (
          <div key={p.id} className="carrousel-produits__carte">
            <Link href={`/collections/${p.slug}`} className="carrousel-produits__lien">
              <div className="carrousel-produits__image">
                {p.image ? (
                  <Image src={p.image} alt={p.nom} width={260} height={260} />
                ) : (
                  <div className="carrousel-produits__placeholder" />
                )}
              </div>
              <h3>{p.nom}</h3>
              <span>{formaterPrix(p.prix)}</span>
            </Link>
            <BoutonFavori
              produitId={p.id}
              initialementFavori={favorisIds.includes(p.id)}
              className="carrousel-produits__coeur"
            />
          </div>
        ))}
      </div>

      <button className="carrousel-produits__fleche carrousel-produits__fleche--droite" onClick={() => defiler('droite')} aria-label="Suivant">
        ›
      </button>
    </div>
  );
}
