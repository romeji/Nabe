import Link from 'next/link';
import Image from 'next/image';
import { formaterPrix } from '@/lib/utils';

type ProduitSuggere = {
  id: string;
  nom: string;
  slug: string;
  prix: string;
  image: string | null;
};

export default function ComposerAvec({ produits }: { produits: ProduitSuggere[] }) {
  if (produits.length === 0) return null;

  return (
    <div className="composer-avec">
      <h3>À composer avec</h3>
      <div className="composer-avec__grille">
        {produits.map((p) => (
          <Link key={p.id} href={`/collections/${p.slug}`} className="composer-avec__carte">
            {p.image ? (
              <Image src={p.image} alt={p.nom} width={140} height={140} />
            ) : (
              <div className="composer-avec__placeholder" />
            )}
            <div>
              <span>{p.nom}</span>
              <strong>{formaterPrix(p.prix)}</strong>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
