import Link from 'next/link';
import Image from 'next/image';
import { avecDelaiBase, prisma } from '@/lib/prisma';
import { getContenuPage } from '@/lib/contenu';
import { getConfigSite, configEstActive } from '@/lib/config-site';
import CarrouselProduits from '@/components/site/CarrouselProduits';
import TexteRiche from '@/components/site/TexteRiche';
import CategoriesAccueil from '@/components/site/CategoriesAccueil';
import ModulesAccueil from '@/components/site/ModulesAccueil';
import InstagramModule from '@/components/site/InstagramModule';
import BandeauReassuranceAccueil from '@/components/site/BandeauReassuranceAccueil';
import ReparationScrollAccueil from '@/components/site/ReparationScrollAccueil';
import './accueil.css';

export const revalidate = 60;

const DUREE_NOUVEAU_JOURS = 21;
const DELAI_DONNEES_ACCUEIL_MS = 1800;

async function avecRepliAccueil<T>(requete: Promise<T>, repli: T, source: string): Promise<T> {
  try {
    return await avecDelaiBase(requete, DELAI_DONNEES_ACCUEIL_MS);
  } catch (error) {
    console.error(`Accueil : ${source} indisponible`, error instanceof Error ? error.name : 'erreur inconnue');
    return repli;
  }
}

function serialiser(produits: any[]) {
  const seuilNouveau = Date.now() - DUREE_NOUVEAU_JOURS * 24 * 60 * 60 * 1000;
  return produits.map((p: any) => ({
    id: p.id,
    nom: p.nom,
    slug: p.slug,
    prix: p.prix.toString(),
    image: p.images[0]?.url || null,
    prixPromo: p.prixPromo ? p.prixPromo.toString() : null,
    promoActive: p.promoActive,
    promoDebut: p.promoDebut ? p.promoDebut.toISOString() : null,
    promoFin: p.promoFin ? p.promoFin.toISOString() : null,
    nouveau: new Date(p.createdAt).getTime() > seuilNouveau,
  }));
}

export default async function PageAccueil() {
  const config = await getConfigSite();

  const collectionsSelectionActif = configEstActive(config, 'collections_selection_actif');
  const carrousselBestsellerActif = configEstActive(config, 'carrousel_bestseller_actif');
  const carrousselNouvelleCollectionActif = configEstActive(config, 'carrousel_nouvelle_collection_actif');
  const categoriesAccueilActif = configEstActive(config, 'categories_accueil_actif');
  const temoignagesActif = configEstActive(config, 'temoignages_actif');
  const idsCategoriesAccueil = (config.categories_accueil_ids || '').split(',').filter(Boolean);
  const idsCollectionsSelection = (config.collections_selection_ids || '').split(',').filter(Boolean);

  const [contenu, collectionsSelection, bestsellers, produitsNouvelleCollection, temoignages, categoriesAccueil] =
    await Promise.all([
      getContenuPage('accueil'),
      collectionsSelectionActif && idsCollectionsSelection.length > 0
        ? avecRepliAccueil(
            prisma.collection.findMany({ where: { id: { in: idsCollectionsSelection }, actif: true } }),
            [],
            'collections',
          )
        : Promise.resolve([]),
      carrousselBestsellerActif
        ? avecRepliAccueil(
            prisma.produit.findMany({
              where: { actif: true },
              include: { images: { orderBy: { ordre: 'asc' }, take: 1 } },
              orderBy: { nombreVentes: 'desc' },
              take: 8,
            }),
            [],
            'meilleures ventes',
          )
        : Promise.resolve([]),
      carrousselNouvelleCollectionActif
        ? avecRepliAccueil(
            prisma.produit.findMany({
              where: {
                actif: true,
                ...(config.carrousel_nouvelle_collection_id
                  ? { collectionId: config.carrousel_nouvelle_collection_id }
                  : {}),
              },
              include: { images: { orderBy: { ordre: 'asc' }, take: 1 } },
              orderBy: { createdAt: 'desc' },
              take: 8,
            }),
            [],
            'nouveautés',
          )
        : Promise.resolve([]),
      temoignagesActif
        ? avecRepliAccueil(
            prisma.temoignage.findMany({ where: { actif: true }, orderBy: { ordre: 'asc' }, take: 3 }),
            [],
            'témoignages',
          )
        : Promise.resolve([]),
      categoriesAccueilActif
        ? idsCategoriesAccueil.length > 0
          ? avecRepliAccueil(
              prisma.categorie.findMany({ where: { id: { in: idsCategoriesAccueil } } }),
              [],
              'catégories',
            )
          : avecRepliAccueil(
              prisma.categorie.findMany({ orderBy: { ordre: 'asc' }, take: 4 }),
              [],
              'catégories',
            )
        : Promise.resolve([]),
    ]);

  // On respecte l'ordre choisi par l'admin plutôt que l'ordre renvoyé par la requête
  const categoriesAccueilOrdonnees = idsCategoriesAccueil.length > 0
    ? idsCategoriesAccueil
        .map((id: any) => categoriesAccueil.find((c: any) => c.id === id))
        .filter(Boolean) as typeof categoriesAccueil
    : categoriesAccueil;
  const collectionsSelectionOrdonnees = idsCollectionsSelection
    .map((id: any) => collectionsSelection.find((c: any) => c.id === id))
    .filter(Boolean) as typeof collectionsSelection;

  return (
    <div className="page-accueil">
      <ReparationScrollAccueil />
      {/* HERO */}
      <section className="accueil-hero">
        <Image
          src={contenu.hero_image}
          alt="Bijoux Nabe façonnés à la main"
          fill
          priority
          sizes="100vw"
          className="accueil-hero__image"
        />
        <div className="accueil-hero__overlay" />
        <div className="accueil-hero__contenu">
          <h1 className="accueil-hero__titre">
            L&apos;éclat de chaque <span className="accent-clair">histoire.</span>
          </h1>
          <TexteRiche className="accueil-hero__soustitre" html={contenu.hero_soustitre} />
          <div className="accueil-hero__actions">
            <Link href="/nos-bijoux" className="btn btn-primaire">
              {contenu.hero_bouton_1}
            </Link>
            <Link href="/la-maison" className="btn btn-secondaire">
              {contenu.hero_bouton_2}
            </Link>
          </div>
        </div>
        <span className="accueil-hero__badge" aria-hidden="true">
          100% fait main
        </span>
      </section>

      <BandeauReassuranceAccueil />

      {/* NOS COLLECTIONS (catégories) */}
      {categoriesAccueilActif && categoriesAccueilOrdonnees.length > 0 && (
        <section className="accueil-categories-section conteneur">
          <span className="etiquette etiquette--centre">{contenu.collections_label}</span>
          <h2 className="accueil-categories-section__titre">Trouvez la pièce qui vous ressemble</h2>
          <CategoriesAccueil
            categories={categoriesAccueilOrdonnees.map((c: any) => ({
              id: c.id,
              nom: c.nom,
              slug: c.slug,
              image: c.imageAccueilFond || c.image,
            }))}
          />
          <div className="accueil-categories-section__cta">
            <Link href="/nos-bijoux" className="btn btn-contour">
              Voir toutes les collections
            </Link>
          </div>
        </section>
      )}

      <ModulesAccueil config={config} />

      {/* NOUVEAUTES */}
      {carrousselNouvelleCollectionActif && produitsNouvelleCollection.length > 0 && (
        <section className="accueil-nouveautes conteneur">
          <div className="accueil-nouveautes__grille">
            <div className="accueil-nouveautes__texte">
              <span className="etiquette">Nouveautés</span>
              <h2>
                Nos dernières <span className="accent">créations</span>
              </h2>
              <p>
                Découvrez nos pièces les plus récentes, imaginées et fabriquées dans notre atelier.
              </p>
              <Link href="/nos-bijoux" className="accueil-nouveautes__lien">
                Découvrir →
              </Link>
            </div>
            <div className="accueil-nouveautes__produits">
              <CarrouselProduits produits={serialiser(produitsNouvelleCollection)} />
            </div>
          </div>
        </section>
      )}

      {/* NOTRE HISTOIRE */}
      <section className="accueil-histoire conteneur">
        <div className="accueil-histoire__carte">
          <div className="accueil-histoire__image">
            <Image
              src={contenu.histoire_image}
              alt="Artisan façonnant un bijou"
              width={560}
              height={460}
            />
          </div>
          <div className="accueil-histoire__texte">
            <span className="etiquette etiquette--claire">{contenu.histoire_label}</span>
            <h2>
              Chaque bijou <span className="accent-clair">raconte une histoire.</span>
            </h2>
            <TexteRiche html={contenu.histoire_texte} />
            <Link href="/la-maison" className="accueil-histoire__lien">
              {contenu.histoire_lien}
            </Link>
          </div>
          <svg className="accueil-histoire__feuille" viewBox="0 0 200 300" aria-hidden="true">
            <path
              d="M100 10c40 40 60 100 40 170-15 55-45 90-40 110-45-20-75-70-80-130C15 90 55 40 100 10z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
            <path d="M100 20v260" fill="none" stroke="currentColor" strokeWidth="1" />
          </svg>
        </div>
      </section>

      {/* MANIFESTE NABE */}
      <section className="accueil-manifeste conteneur">
        <span className="accueil-manifeste__logo">Nabe</span>
        <h2>
          Avec Nabe, c&apos;est fini d&apos;acheter des bijoux qui ne durent pas.
          <span> Vous avez enfin des bijoux de qualité, pensés pour vous accompagner au quotidien, même dans l&apos;eau.</span>
        </h2>
        <Link href="/mon-histoire" className="accueil-manifeste__lien">Notre histoire</Link>
      </section>

      {/* NOTRE SELECTION (collections choisies en admin) */}
      {collectionsSelectionActif && collectionsSelectionOrdonnees.length > 0 && (
        <section className="accueil-carrousel conteneur">
          <span className="etiquette etiquette--centre">{contenu.collections_label}</span>
          <h2>
            Notre <span className="accent">sélection</span>
          </h2>
          <div className="accueil-selection__grille">
            {collectionsSelectionOrdonnees.map((collection: any) => (
              <Link
                key={collection.id}
                href={`/nos-bijoux?collection=${collection.slug}`}
                className="accueil-selection__carte"
              >
                {collection.image ? (
                  <Image src={collection.image} alt={collection.nom} width={460} height={260} />
                ) : (
                  <div className="accueil-selection__placeholder" />
                )}
                <span>{collection.nom}</span>
                <strong>Découvrir</strong>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* MEILLEURES VENTES */}
      {carrousselBestsellerActif && bestsellers.length > 0 && (
        <section className="accueil-carrousel conteneur">
          <span className="etiquette etiquette--centre">Meilleures ventes</span>
          <h2>Vos bijoux préférés</h2>
          <CarrouselProduits produits={serialiser(bestsellers)} />
        </section>
      )}

      {/* INSTAGRAM */}
      <InstagramModule config={config} />

      {/* TEMOIGNAGES */}
      {temoignages.length > 0 && (
        <section className="accueil-temoignages conteneur">
          <span className="etiquette etiquette--centre">{contenu.temoignages_label}</span>
          <h2>{contenu.temoignages_titre}</h2>
          <div className="accueil-temoignages__rangee">
            <button className="accueil-temoignages__fleche" aria-hidden="true" tabIndex={-1}>
              ‹
            </button>
            <div className="accueil-temoignages__grille">
              {temoignages.map((t: any) => (
                <div key={t.id} className="accueil-temoignages__carte">
                  <div className="accueil-temoignages__etoiles">{'★'.repeat(t.note)}</div>
                  <p>« {t.texte} »</p>
                  <span>— {t.auteur}</span>
                </div>
              ))}
            </div>
            <button className="accueil-temoignages__fleche" aria-hidden="true" tabIndex={-1}>
              ›
            </button>
          </div>
        </section>
      )}

      {/* NEWSLETTER */}
      <section className="accueil-newsletter conteneur">
        <div className="accueil-newsletter__carte">
          <h2>Restez inspirée</h2>
          <TexteRiche html={contenu.newsletter_texte} />
          <form className="accueil-newsletter__form" action="/api/newsletter" method="POST">
            <input type="email" name="email" placeholder="Votre e-mail" required autoComplete="email" />
            <button type="submit" className="btn btn-or">
              {contenu.newsletter_bouton}
            </button>
          </form>
          <svg className="accueil-newsletter__feuille" viewBox="0 0 200 300" aria-hidden="true">
            <path
              d="M100 10c40 40 60 100 40 170-15 55-45 90-40 110-45-20-75-70-80-130C15 90 55 40 100 10z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
          </svg>
        </div>
      </section>
    </div>
  );
}
