import Link from 'next/link';
import Image from 'next/image';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { formaterPrix, promoEstActive, pourcentageReduction } from '@/lib/utils';
import { authClientOptions } from '@/lib/auth-client';
import FiltresCollections from '@/components/site/FiltresCollections';
import TriCollections from '@/components/site/TriCollections';
import BoutonFavori from '@/components/site/BoutonFavori';
import '../collections/collections.css';

// Icône affichée en filigrane quand un produit n'a pas encore de photo,
// choisie selon son type de bijou.
function IconePlaceholderProduit({ type }: { type: string }) {
  if (type === 'BAGUE') {
    return (
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
        <circle cx="12" cy="15.5" r="5.8" />
        <path d="M9.6 10 12 4l2.4 6" />
      </svg>
    );
  }
  if (type === 'COLLIER') {
    return (
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M4.5 4.5c0 5.8 3.4 9.5 7.5 9.5s7.5-3.7 7.5-9.5" />
        <circle cx="12" cy="16.8" r="2.4" />
      </svg>
    );
  }
  if (type === 'BOUCLES_OREILLES') {
    return (
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
        <circle cx="9.5" cy="6" r="2.4" />
        <path d="M9.5 8.4v3.2a3 3 0 0 0 6 0" />
        <circle cx="14.5" cy="6" r="2.4" />
      </svg>
    );
  }
  if (type === 'BRACELET') {
    return (
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
        <circle cx="12" cy="12" r="7.8" />
        <circle cx="12" cy="4.6" r="1.2" fill="currentColor" stroke="none" />
        <circle cx="19" cy="12" r="1.2" fill="currentColor" stroke="none" />
        <circle cx="12" cy="19.4" r="1.2" fill="currentColor" stroke="none" />
        <circle cx="5" cy="12" r="1.2" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M6 3h12l3.5 5L12 21 2.5 8z" />
      <path d="M2.5 8h19M9 3l-2 5 5 13 5-13-2-5" />
    </svg>
  );
}

export const metadata = {
  title: 'Nos bijoux artisanaux',
  description:
    'Découvrez les bijoux artisanaux Nabe : bagues, colliers, bracelets et pièces uniques façonnés à la main en argent 925 et matières précieuses.',
  alternates: { canonical: '/nos-bijoux' },
  openGraph: {
    title: 'Nos bijoux artisanaux | Nabe',
    description:
      'Bagues, colliers, bracelets et pièces uniques façonnés à la main en France.',
    images: [{ url: '/images/collections-hero.jpg', width: 1200, height: 630, alt: 'Collections de bijoux artisanaux Nabe' }],
  },
};
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Même seuil que sur l'accueil et la fiche produit : un produit publié depuis
// moins de 21 jours est considéré comme "nouveau" et porte le badge correspondant.
const DUREE_NOUVEAU_JOURS = 21;

type Props = {
  searchParams: Promise<{
    type?: string;
    matiere?: string;
    pierre?: string; // id de la Pierre sélectionnée
    couleur?: string; // id de la CouleurPierre sélectionnée
    disponibilite?: string; // valeurs séparées par des virgules
    taille?: string;
    tri?: string;
    prixMin?: string;
    prixMax?: string;
    categorie?: string;
    collection?: string;
  }>;
};

export default async function PageCollections({ searchParams: searchParamsPromise }: Props) {
  const searchParams = await searchParamsPromise;
  const where: any = { actif: true };

  if (searchParams.type) where.type = searchParams.type;
  if (searchParams.matiere) where.matiereId = searchParams.matiere;
  if (searchParams.pierre) where.pierres = { some: { pierreId: searchParams.pierre } };
  if (searchParams.couleur) {
    where.pierres = {
      some: {
        ...(searchParams.pierre ? { pierreId: searchParams.pierre } : {}),
        pierre: { couleurs: { some: { couleurPierreId: searchParams.couleur } } },
      },
    };
  }
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

  const [produits, totalActifs, matieresBrutes, pierresBrutes, couleursBrutes, bornesPrix, favorisIds, comptesParType, comptesParDispo] =
    await Promise.all([
      prisma.produit.findMany({
        where,
        include: { images: { orderBy: { ordre: 'asc' }, take: 1 }, matiere: true },
        orderBy,
      }),
      prisma.produit.count({ where: { actif: true } }),
      prisma.matiere.findMany({
        orderBy: { ordre: 'asc' },
        include: { _count: { select: { produits: { where: { actif: true } } } } },
      }),
      prisma.pierre.findMany({
        orderBy: { ordre: 'asc' },
        include: { produits: { include: { produit: { select: { actif: true } } } } },
      }),
      prisma.couleurPierre.findMany({
        orderBy: { ordre: 'asc' },
        include: { pierres: { include: { pierre: { include: { produits: { include: { produit: true } } } } } } },
      }),
      prisma.produit.aggregate({
        where: { actif: true },
        _min: { prix: true },
        _max: { prix: true },
      }),
      clientId
        ? prisma.favori.findMany({ where: { clientId }, select: { produitId: true } })
        : Promise.resolve([]),
      prisma.produit.groupBy({ by: ['type'], where: { actif: true }, _count: { _all: true } }),
      prisma.produit.groupBy({ by: ['disponibilite'], where: { actif: true }, _count: { _all: true } }),
    ]);

  const idsFavoris = new Set(favorisIds.map((f: any) => f.produitId));
  const prixMinGlobal = Math.floor(parseFloat(bornesPrix._min.prix?.toString() || '0'));
  const prixMaxGlobal = Math.ceil(parseFloat(bornesPrix._max.prix?.toString() || '1000'));

  const comptesTypeMap = Object.fromEntries(comptesParType.map((c: any) => [c.type, c._count._all]));
  const comptesDispoMap = Object.fromEntries(comptesParDispo.map((c: any) => [c.disponibilite, c._count._all]));

  const matieresDisponibles = matieresBrutes.map((m: any) => ({
    id: m.id,
    nom: m.nom,
    nombreProduits: m._count.produits,
  }));

  const pierresDisponibles = pierresBrutes.map((p: any) => ({
    id: p.id,
    nom: p.nom,
    nombreProduits: p.produits.filter((pp: any) => pp.produit.actif).length,
  }));

  // Calcule, pour chaque couleur, le nombre de bijoux actifs distincts qui ont une pierre de cette couleur
  const couleursDisponibles = couleursBrutes.map((couleur: any) => {
    const idsProduits = new Set<string>();
    couleur.pierres.forEach((pierreCouleur: any) => {
      pierreCouleur.pierre.produits.forEach((pp: any) => {
        if (pp.produit.actif) idsProduits.add(pp.produitId);
      });
    });
    return { id: couleur.id, nom: couleur.nom, codeHex: couleur.codeHex, nombreProduits: idsProduits.size };
  });

  return (
    <div className="page-collections">
      <div className="collections-fil-ariane conteneur">
        <Link href="/">Accueil</Link> / <span>Nos bijoux</span>
      </div>

      <div className="collections-entete conteneur">
        <div>
          <span className="etiquette">Boutique</span>
          <h1>Nos bijoux</h1>
          <p>{totalActifs} pièces façonnées à la main</p>
        </div>
        <TriCollections />
      </div>
      <div className="collections-entete-separateur conteneur" />

      <div className="collections-corps conteneur">
        <FiltresCollections
          matieres={matieresDisponibles}
          pierres={pierresDisponibles}
          couleurs={couleursDisponibles}
          prixMinGlobal={prixMinGlobal}
          prixMaxGlobal={prixMaxGlobal}
          comptesType={comptesTypeMap}
          comptesDisponibilite={comptesDispoMap}
        />

        <div className="collections-resultats">
          {produits.length === 0 ? (
            <p className="collections-vide">
              Aucune création ne correspond à ces critères pour le moment.
            </p>
          ) : (
            <div className="collections-grille">
              {produits.map((produit: any) => {
                const enPromo = promoEstActive({
                  promoActive: produit.promoActive,
                  prixPromo: produit.prixPromo?.toString() ?? null,
                  promoDebut: produit.promoDebut,
                  promoFin: produit.promoFin,
                });
                const estNouveau = new Date(produit.createdAt).getTime() > Date.now() - DUREE_NOUVEAU_JOURS * 24 * 60 * 60 * 1000;
                return (
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
                        <div className="produit-carte__placeholder">
                          <IconePlaceholderProduit type={produit.type} />
                        </div>
                      )}
                    </div>
                    {enPromo ? (
                      <span className="produit-carte__badge-promo">
                        -{pourcentageReduction(produit.prix.toString(), produit.prixPromo!.toString())}%
                      </span>
                    ) : (
                      estNouveau && <span className="produit-carte__badge-nouveau">Nouveau</span>
                    )}
                    <h3>{produit.nom}</h3>
                    <p className="produit-carte__details">{produit.matiere?.nom || ''}</p>
                    {enPromo ? (
                      <span className="produit-carte__prix produit-carte__prix--promo">
                        <span className="produit-carte__prix-barre">{formaterPrix(produit.prix.toString())}</span>
                        <span className="produit-carte__prix-reduit">{formaterPrix(produit.prixPromo!.toString())}</span>
                      </span>
                    ) : (
                      <span className="produit-carte__prix">{formaterPrix(produit.prix.toString())}</span>
                    )}
                  </Link>
                  <BoutonFavori
                    produitId={produit.id}
                    initialementFavori={idsFavoris.has(produit.id)}
                    className="produit-carte__coeur"
                  />
                </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
