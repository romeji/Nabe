import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { formaterPrix, LABELS_TYPE_BIJOU } from '@/lib/utils';
import { getContenuPage } from '@/lib/contenu';
import FiltresCollections from '@/components/site/FiltresCollections';
import './collections.css';

export const metadata = { title: 'Collections' };
export const revalidate = 60;

type Props = {
  searchParams: {
    type?: string;
    matiere?: string;
    pierre?: string;
    tri?: string;
    prixMax?: string;
  };
};

export default async function PageCollections({ searchParams }: Props) {
  const where: any = { actif: true };

  if (searchParams.type) where.type = searchParams.type;
  if (searchParams.matiere) where.matiereId = searchParams.matiere;
  if (searchParams.pierre) where.pierre = searchParams.pierre;
  if (searchParams.prixMax) where.prix = { lte: parseFloat(searchParams.prixMax) };

  let orderBy: any = { createdAt: 'desc' };
  if (searchParams.tri === 'prix-asc') orderBy = { prix: 'asc' };
  if (searchParams.tri === 'prix-desc') orderBy = { prix: 'desc' };
  if (searchParams.tri === 'nom') orderBy = { nom: 'asc' };

  const [contenu, produits, totalActifs, matieresDisponibles] = await Promise.all([
    getContenuPage('collections'),
    prisma.produit.findMany({
      where,
      include: { images: { orderBy: { ordre: 'asc' }, take: 1 }, matiere: true },
      orderBy,
    }),
    prisma.produit.count({ where: { actif: true } }),
    prisma.matiere.findMany({ orderBy: { ordre: 'asc' } }),
  ]);

  return (
    <div className="page-collections">
      <section className="collections-hero">
        <div className="collections-hero__contenu">
          <h1>{contenu.hero_titre}</h1>
          <p>{contenu.hero_soustitre}</p>
        </div>
      </section>

      <div className="collections-corps conteneur">
        <FiltresCollections matieres={matieresDisponibles} />

        <div className="collections-resultats">
          <div className="collections-resultats__entete">
            <span>{totalActifs} créations</span>
          </div>

          {produits.length === 0 ? (
            <p className="collections-vide">
              Aucune création ne correspond à ces critères pour le moment.
            </p>
          ) : (
            <div className="collections-grille">
              {produits.map((produit) => (
                <Link
                  key={produit.id}
                  href={`/collections/${produit.slug}`}
                  className="produit-carte"
                >
                  <div className="produit-carte__image">
                    {produit.images[0] ? (
                      <Image
                        src={produit.images[0].url}
                        alt={produit.images[0].alt || produit.nom}
                        width={300}
                        height={300}
                      />
                    ) : (
                      <div className="produit-carte__placeholder" />
                    )}
                    <button className="produit-carte__coeur" aria-label="Favoris" type="button">
                      ♡
                    </button>
                  </div>
                  <h3>{produit.nom}</h3>
                  <p className="produit-carte__details">{produit.matiere?.nom || ''}</p>
                  <span className="produit-carte__prix">{formaterPrix(produit.prix.toString())}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
