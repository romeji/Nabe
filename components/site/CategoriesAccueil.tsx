import Link from 'next/link';
import Image from 'next/image';

type CategorieAffichee = { id: string; nom: string; slug: string; image: string | null };

export default function CategoriesAccueil({ categories }: { categories: CategorieAffichee[] }) {
  if (categories.length === 0) return null;

  return (
    <section className="accueil-categories conteneur">
      <div className="accueil-categories__grille">
        {categories.map((c) => (
          <Link key={c.id} href={`/collections?categorie=${c.slug}`} className="accueil-categories__carte">
            <div className="accueil-categories__image">
              {c.image ? (
                <Image src={c.image} alt={c.nom} width={280} height={280} />
              ) : (
                <div className="accueil-categories__placeholder" />
              )}
            </div>
            <span>{c.nom}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
