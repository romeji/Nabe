import Link from 'next/link';
import Image from 'next/image';
import { formaterPrix, promoEstActive, pourcentageReduction } from '@/lib/utils';

type ProduitSuggere = {
  id: string;
  nom: string;
  slug: string;
  prix: string;
  image: string | null;
  prixPromo?: string | null;
  promoActive?: boolean;
  promoDebut?: string | null;
  promoFin?: string | null;
};

export default function ComposerAvec({ produits }: { produits: ProduitSuggere[] }) {
  if (produits.length === 0) return null;

  return (
    <div className="composer-avec">
      <h3>À composer avec</h3>
      <div className="composer-avec__grille">
        {produits.map((p) => {
          const enPromo = promoEstActive({
            promoActive: !!p.promoActive,
            prixPromo: p.prixPromo ?? null,
            promoDebut: p.promoDebut,
            promoFin: p.promoFin,
          });
          return (
            <Link key={p.id} href={`/collections/${p.slug}`} className="composer-avec__carte">
              <div className="composer-avec__image-conteneur">
                {p.image ? (
                  <Image src={p.image} alt={p.nom} width={140} height={140} />
                ) : (
                  <div className="composer-avec__placeholder" />
                )}
                {enPromo && (
                  <span className="composer-avec__badge-promo">
                    -{pourcentageReduction(p.prix, p.prixPromo!)}%
                  </span>
                )}
              </div>
              <div>
                <span>{p.nom}</span>
                {enPromo ? (
                  <strong className="composer-avec__prix--promo">
                    <span className="composer-avec__prix-barre">{formaterPrix(p.prix)}</span>
                    <span className="composer-avec__prix-reduit">{formaterPrix(p.prixPromo!)}</span>
                  </strong>
                ) : (
                  <strong>{formaterPrix(p.prix)}</strong>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
