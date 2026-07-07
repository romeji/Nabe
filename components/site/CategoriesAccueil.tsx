import Link from 'next/link';
import Image from 'next/image';

type CategorieAffichee = { id: string; nom: string; slug: string; image: string | null };

// Icône affichée dans le badge de chaque carte catégorie, choisie selon le nom.
function IconeCategorie({ nom }: { nom: string }) {
  const n = nom.toLowerCase();

  if (n.includes('bague')) {
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="15.5" r="5.8" />
        <path d="M9.6 10 12 4l2.4 6" />
      </svg>
    );
  }
  if (n.includes('collier')) {
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4.5 4.5c0 5.8 3.4 9.5 7.5 9.5s7.5-3.7 7.5-9.5" />
        <circle cx="12" cy="16.8" r="2.4" />
      </svg>
    );
  }
  if (n.includes('boucle') || n.includes('oreille')) {
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="9.5" cy="6" r="2.4" />
        <path d="M9.5 8.4v3.2a3 3 0 0 0 6 0" />
        <circle cx="14.5" cy="6" r="2.4" />
      </svg>
    );
  }
  if (n.includes('bracelet')) {
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="7.8" />
        <circle cx="12" cy="4.6" r="1.2" fill="currentColor" stroke="none" />
        <circle cx="19" cy="12" r="1.2" fill="currentColor" stroke="none" />
        <circle cx="12" cy="19.4" r="1.2" fill="currentColor" stroke="none" />
        <circle cx="5" cy="12" r="1.2" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
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
