import Link from 'next/link';
import Image from 'next/image';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { getContenuPage } from '@/lib/contenu';
import { getConfigSite, configEstActive } from '@/lib/config-site';
import { authClientOptions } from '@/lib/auth-client';
import CarrouselProduits from '@/components/site/CarrouselProduits';
import TexteRiche from '@/components/site/TexteRiche';
import CategoriesAccueil from '@/components/site/CategoriesAccueil';
import './accueil.css';

export const revalidate = 60;

const DUREE_NOUVEAU_JOURS = 21;

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
  const session = await getServerSession(authClientOptions);
  const clientId = (session?.user as any)?.id as string | undefined;

  const collectionsSelectionActif = configEstActive(config, 'collections_selection_actif');
  const carrousselBestsellerActif = configEstActive(config, 'carrousel_bestseller_actif');
  const carrousselNouvelleCollectionActif = configEstActive(config, 'carrousel_nouvelle_collection_actif');
  const categoriesAccueilActif = configEstActive(config, 'categories_accueil_actif');
  const temoignagesActif = configEstActive(config, 'temoignages_actif');
  const idsCategoriesAccueil = (config.categories_accueil_ids || '').split(',').filter(Boolean);
  const idsCollectionsSelection = (config.collections_selection_ids || '').split(',').filter(Boolean);

  const [contenu, collectionsSelection, bestsellers, produitsNouvelleCollection, temoignages, favorisIds, categoriesAccueil] =
    await Promise.all([
      getContenuPage('accueil'),
      collectionsSelectionActif && idsCollectionsSelection.length > 0
        ? prisma.collection.findMany({
            where: { id: { in: idsCollectionsSelection }, actif: true },
          })
        : Promise.resolve([]),
      carrousselBestsellerActif
        ? prisma.produit.findMany({
            where: { actif: true },
            include: { images: { orderBy: { ordre: 'asc' }, take: 1 } },
            orderBy: { nombreVentes: 'desc' },
            take: 8,
          })
        : Promise.resolve([]),
      carrousselNouvelleCollectionActif && config.carrousel_nouvelle_collection_id
        ? prisma.produit.findMany({
            where: { actif: true, collectionId: config.carrousel_nouvelle_collection_id },
            include: { images: { orderBy: { ordre: 'asc' }, take: 1 } },
            take: 8,
          })
        : Promise.resolve([]),
      temoignagesActif
        ? prisma.temoignage.findMany({ where: { actif: true }, orderBy: { ordre: 'asc' }, take: 3 })
        : Promise.resolve([]),
      clientId
        ? prisma.favori.findMany({ where: { clientId }, select: { produitId: true } })
        : Promise.resolve([]),
      categoriesAccueilActif && idsCategoriesAccueil.length > 0
        ? prisma.categorie.findMany({ where: { id: { in: idsCategoriesAccueil } } })
        : Promise.resolve([]),
    ]);

  const idsFavoris = favorisIds.map((f: any) => f.produitId);
  // On respecte l'ordre choisi par l'admin plutôt que l'ordre renvoyé par la requête
  const categoriesAccueilOrdonnees = idsCategoriesAccueil
    .map((id: any) => categoriesAccueil.find((c: any) => c.id === id))
    .filter(Boolean) as typeof categoriesAccueil;
  const collectionsSelectionOrdonnees = idsCollectionsSelection
    .map((id: any) => collectionsSelection.find((c: any) => c.id === id))
    .filter(Boolean) as typeof collectionsSelection;

  return (
    <div className="page-accueil">
      {/* HERO */}
      <section className="accueil-hero">
        <div className="accueil-hero__overlay" />
        <div className="accueil-hero__contenu">
          <h1 className="accueil-hero__titre">
            L&apos;éclat de chaque <span className="accent-clair">histoire.</span>
          </h1>
          <TexteRiche className="accueil-hero__soustitre" html={contenu.hero_soustitre} />
          <div className="accueil-hero__actions">
            <Link href="/collections" className="btn btn-primaire">
              {contenu.hero_bouton_1}
            </Link>
            <Link href="/la-maison" className="btn btn-secondaire">
              {contenu.hero_bouton_2}
            </Link>
          </div>
        </div>
      </section>

      {/* REASSURANCE */}
      <section className="accueil-reassurance">
        <div className="accueil-reassurance__item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
            <path d="M14 3l2.5 2.5L7 15l-4 1 1-4z" />
            <path d="M17.5 2.5 21 6l-2 2-3.5-3.5z" />
          </svg>
          <span>Fabrication artisanale</span>
        </div>
        <div className="accueil-reassurance__item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
            <path d="M6 3h12l3.5 5L12 21 2.5 8z" />
            <path d="M2.5 8h19M9 3l-2 5 5 13 5-13-2-5" />
          </svg>
          <span>Matériaux de qualité</span>
        </div>
        <div className="accueil-reassurance__item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
            <path d="M12 2 4 5.5v6C4 16.7 7.4 20.9 12 22c4.6-1.1 8-5.3 8-10.5v-6z" />
          </svg>
          <span>Paiement sécurisé</span>
        </div>
        <div className="accueil-reassurance__item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
            <path d="M21 12a9 9 0 1 1-3.5-7.1" />
            <path d="M21 3v5h-5" />
          </svg>
          <span>Retours sous 14 jours</span>
        </div>
      </section>

      {/* NOS COLLECTIONS (catégories) */}
      {categoriesAccueilActif && categoriesAccueilOrdonnees.length > 0 && (
        <section className="accueil-categories-section conteneur">
          <span className="etiquette etiquette--centre">{contenu.collections_label}</span>
          <CategoriesAccueil
            categories={categoriesAccueilOrdonnees.map((c: any) => ({
              id: c.id,
              nom: c.nom,
              slug: c.slug,
              image: c.imageAccueilFond || c.image,
              logoAccueil: c.logoAccueil,
            }))}
          />
          <div className="accueil-categories-section__cta">
            <Link href="/collections" className="btn btn-contour">
              Voir toutes les collections
            </Link>
          </div>
        </section>
      )}

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
              <Link href="/collections" className="accueil-nouveautes__lien">
                Découvrir →
              </Link>
            </div>
            <div className="accueil-nouveautes__produits">
              <CarrouselProduits produits={serialiser(produitsNouvelleCollection)} favorisIds={idsFavoris} />
            </div>
          </div>
        </section>
      )}

      {/* NOTRE HISTOIRE */}
      <section className="accueil-histoire conteneur">
        <div className="accueil-histoire__carte">
          <div className="accueil-histoire__image">
            <Image
              src="/images/atelier-mains.jpg"
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

      {/* POURQUOI NOUS CHOISIR */}
      <section className="accueil-pourquoi conteneur">
        <span className="etiquette etiquette--centre">Pourquoi nous choisir ?</span>
        <div className="accueil-pourquoi__grille">
          <div className="accueil-pourquoi__item">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M6 3h12l3.5 5L12 21 2.5 8z" />
              <path d="M2.5 8h19M9 3l-2 5 5 13 5-13-2-5" />
            </svg>
            <h3>Bijoux faits main</h3>
            <p>Chaque pièce est unique et réalisée avec passion.</p>
          </div>
          <div className="accueil-pourquoi__item">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M12 2c4 3 7 7 7 11a7 7 0 1 1-14 0c0-4 3-8 7-11z" />
            </svg>
            <h3>Matériaux responsables</h3>
            <p>Nous sélectionnons des matériaux durables et de qualité.</p>
          </div>
          <div className="accueil-pourquoi__item">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M12 2 4 5.5v6C4 16.7 7.4 20.9 12 22c4.6-1.1 8-5.3 8-10.5v-6z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
            <h3>Paiement sécurisé</h3>
            <p>Vos transactions sont protégées à chaque étape.</p>
          </div>
          <div className="accueil-pourquoi__item">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M3 7h11v9H3z" />
              <path d="M14 10h3.5l3.5 3v3h-7z" />
              <circle cx="7" cy="18.5" r="1.6" />
              <circle cx="17.5" cy="18.5" r="1.6" />
            </svg>
            <h3>Livraison offerte</h3>
            <p>À partir de 100 € d&apos;achat en France métropolitaine.</p>
          </div>
        </div>
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
                href={`/collections?collection=${collection.slug}`}
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
          <CarrouselProduits produits={serialiser(bestsellers)} favorisIds={idsFavoris} />
        </section>
      )}

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
            <input type="email" name="email" placeholder="Votre e-mail" required />
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
