import Link from 'next/link';
import Image from 'next/image';

type CategorieAffichee = { id: string; nom: string; slug: string; image: string | null };

// Icône affichée dans le badge de chaque carte catégorie, choisie selon le nom.
function IconeCategorie({ nom }: { nom: string }) {
  const n = nom.toLowerCase();

  if (n.includes('bague')) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
        <circle cx="12" cy="15" r="6.2" />
        <path d="M9.4 9.2 12 3l2.6 6.2" />
      </svg>
    );
  }
  if (n.includes('collier')) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
        <path d="M4 4c0 6 3.6 10 8 10s8-4 8-10" />
        <circle cx="12" cy="16.5" r="2.6" />
      </svg>
    );
  }
  if (n.includes('boucle') || n.includes('oreille')) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
        <path d="M9 3.5a3 3 0 1 1 6 0v2a3 3 0 1 1-6 0z" />
        <path d="M10.5 8.5v3a3.5 3.5 0 0 0 7 0" />
      </svg>
    );
  }
  if (n.includes('bracelet')) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
        <circle cx="12" cy="12" r="8.2" />
        <circle cx="12" cy="4.6" r="1.3" fill="currentColor" stroke="none" />
        <circle cx="19.4" cy="12" r="1.3" fill="currentColor" stroke="none" />
        <circle cx="12" cy="19.4" r="1.3" fill="currentColor" stroke="none" />
        <circle cx="4.6" cy="12" r="1.3" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
      <path d="M6 3h12l3.5 5L12 21 2.5 8z" />
      <path d="M2.5 8h19M9 3l-2 5 5 13 5-13-2-5" />
    </svg>
  );
}

export default function CategoriesAccueil({ categories }: { categories: CategorieAffichee[] }) {
  if (categories.length === 0) return null;

  return (
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
          <div className="accueil-categories__panneau">
            <span className="accueil-categories__icone">
              <IconeCategorie nom={c.nom} />
            </span>
            <span className="accueil-categories__nom">{c.nom}</span>
            <span className="accueil-categories__fleche" aria-hidden="true">
              →
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
