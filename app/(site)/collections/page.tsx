import Link from 'next/link';
import Image from 'next/image';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { formaterPrix } from '@/lib/utils';
import { getContenuPage } from '@/lib/contenu';
import { authClientOptions } from '@/lib/auth-client';
import FiltresCollections from '@/components/site/FiltresCollections';
import TriCollections from '@/components/site/TriCollections';
import BoutonFavori from '@/components/site/BoutonFavori';
import '../hero-commun.css';
import './collections.css';

export const metadata = { title: 'Collections' };
export const revalidate = 60;

type Props = {
  searchParams: {
    type?: string;
    matiere?: string;
    pierre?: string;
    couleur?: string;
    disponibilite?: string; // valeurs séparées par des virgules
    taille?: string;
    tri?: string;
    prixMin?: string;
    prixMax?: string;
    categorie?: string;
    collection?: string;
  };
};

export default async function PageCollections({ searchParams }: Props) {
  const where: any = { actif: true };

  if (searchParams.type) where.type = searchParams.type;
  if (searchParams.matiere) where.matiereId = searchParams.matiere;
  if (searchParams.pierre) where.pierre = searchParams.pierre;
  if (searchParams.couleur) where.couleurPierreId = searchParams.couleur;
  if (searchParams.categorie) where.categorie = { slug: searchParams.categorie };
  if (searchParams.collection) where.collection = { slug: searchParams.collection };
  if (searchParams.taille) where.taillesDisponibles = { has: searchParams.taille };
  if (searchParams.disponibilite) {
    const valeurs = searchParams.disponibilite.split(',').filter(Boolean);
    if (valeurs.length > 0) where.disponibilite = { in: valeurs };
  }
  if (searchParams.prixMin || searchParams.prixMax) {
    where.prix = {};
    if (searchParams.prixMin) where.prix.gte = parseFloat(searchParams.prixMin);
    if (searchParams.prixMax) where.prix.lte = parseFloat(searchParams.prixMax);
  }

  let orderBy: any = { createdAt: 'desc' };
  if (searchParams.tri === 'prix-asc') orderBy = { prix: 'asc' };
  if (searchParams.tri === 'prix-desc') orderBy = { prix: 'desc' };
  if (searchParams.tri === 'nom') orderBy = { nom: 'asc' };

  const session = await getServerSession(authClientOptions);
  const clientId = (session?.user as any)?.id as string | undefined;

  const [contenu, produits, totalActifs, matieresDisponibles, couleursDisponibles, bornesPrix, favorisIds] =
    await Promise.all([
      getContenuPage('collections'),
      prisma.produit.findMany({
        where,
        include: { images: { orderBy: { ordre: 'asc' }, take: 1 }, matiere: true },
        orderBy,
      }),
      prisma.produit.count({ where: { actif: true } }),
      prisma.matiere.findMany({ orderBy: { ordre: 'asc' } }),
      prisma.couleurPierre.findMany({ orderBy: { ordre: 'asc' } }),
      prisma.produit.aggregate({
        where: { actif: true },
        _min: { prix: true },
        _max: { prix: true },
      }),
      clientId
        ? prisma.favori.findMany({ where: { clientId }, select: { produitId: true } })
        : Promise.resolve([]),
    ]);

  const idsFavoris = new Set(favorisIds.map((f) => f.produitId));
  const prixMinGlobal = Math.floor(parseFloat(bornesPrix._min.prix?.toString() || '0'));
  const prixMaxGlobal = Math.ceil(parseFloat(bornesPrix._max.prix?.toString() || '1000'));

  return (
    <div className="page-collections">
      <section className="hero-commun" style={{ backgroundImage: "url('/images/collections-hero.jpg')" }}>
        <div className="hero-commun__overlay" />
        <div className="hero-commun__contenu">
          <h1>{contenu.hero_titre}</h1>
          <p>{contenu.hero_soustitre}</p>
        </div>
      </section>

      <div className="collections-corps conteneur">
        <FiltresCollections
          matieres={matieresDisponibles}
          couleurs={couleursDisponibles}
          prixMinGlobal={prixMinGlobal}
          prixMaxGlobal={prixMaxGlobal}
        />

        <div className="collections-resultats">
          <div className="collections-resultats__entete">
            <span>{totalActifs} créations</span>
            <TriCollections />
          </div>

          {produits.length === 0 ? (
            <p className="collections-vide">
              Aucune création ne correspond à ces critères pour le moment.
            </p>
          ) : (
            <div className="collections-grille">
              {produits.map((produit) => (
                <div key={produit.id} className="produit-carte">
                  <Link href={`/collections/${produit.slug}`} className="produit-carte__lien">
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
                    </div>
                    <h3>{produit.nom}</h3>
                    <p className="produit-carte__details">{produit.matiere?.nom || ''}</p>
                    <span className="produit-carte__prix">{formaterPrix(produit.prix.toString())}</span>
                  </Link>
                  <BoutonFavori
                    produitId={produit.id}
                    initialementFavori={idsFavoris.has(produit.id)}
                    className="produit-carte__coeur"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
