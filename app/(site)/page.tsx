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

function serialiser(produits: any[]) {
  return produits.map((p) => ({
    id: p.id,
    nom: p.nom,
    slug: p.slug,
    prix: p.prix.toString(),
    image: p.images[0]?.url || null,
    prixPromo: p.prixPromo ? p.prixPromo.toString() : null,
    promoActive: p.promoActive,
    promoDebut: p.promoDebut ? p.promoDebut.toISOString() : null,
    promoFin: p.promoFin ? p.promoFin.toISOString() : null,
  }));
}

export default async function PageAccueil() {
  const config = await getConfigSite();
  const session = await getServerSession(authClientOptions);
  const clientId = (session?.user as any)?.id as string | undefined;

  const carrousselSelectionActif = configEstActive(config, 'carrousel_selection_actif');
  const carrousselBestsellerActif = configEstActive(config, 'carrousel_bestseller_actif');
  const carrousselNouvelleCollectionActif = configEstActive(config, 'carrousel_nouvelle_collection_actif');
  const categoriesAccueilActif = configEstActive(config, 'categories_accueil_actif');
  const idsCategoriesAccueil = (config.categories_accueil_ids || '').split(',').filter(Boolean);

  const [contenu, produitsEnAvant, bestsellers, produitsNouvelleCollection, temoignages, favorisIds, categoriesAccueil] =
    await Promise.all([
      getContenuPage('accueil'),
      carrousselSelectionActif
        ? prisma.produit.findMany({
            where: { enAvant: true, actif: true },
            include: { images: { orderBy: { ordre: 'asc' }, take: 1 } },
            take: 8,
            orderBy: { createdAt: 'desc' },
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
      prisma.temoignage.findMany({ where: { actif: true }, orderBy: { ordre: 'asc' }, take: 3 }),
      clientId
        ? prisma.favori.findMany({ where: { clientId }, select: { produitId: true } })
        : Promise.resolve([]),
      categoriesAccueilActif && idsCategoriesAccueil.length > 0
        ? prisma.categorie.findMany({ where: { id: { in: idsCategoriesAccueil } } })
        : Promise.resolve([]),
    ]);

  const idsFavoris = favorisIds.map((f) => f.produitId);
  // On respecte l'ordre choisi par l'admin plutôt que l'ordre renvoyé par la requête
  const categoriesAccueilOrdonnees = idsCategoriesAccueil
    .map((id) => categoriesAccueil.find((c) => c.id === id))
    .filter(Boolean) as typeof categoriesAccueil;

  return (
    <div className="page-accueil">
      {/* HERO */}
      <section className="accueil-hero">
        <div className="accueil-hero__overlay" />
        <div className="accueil-hero__contenu">
          <h1 className="accueil-hero__logo">{contenu.hero_logo}</h1>
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

      {/* CATEGORIES EN AVANT (togglable, juste sous le hero) */}
      {categoriesAccueilActif && (
        <CategoriesAccueil
          categories={categoriesAccueilOrdonnees.map((c) => ({
            id: c.id,
            nom: c.nom,
            slug: c.slug,
            image: c.image,
          }))}
        />
      )}

      {/* NOUVELLE COLLECTION (togglable, au-dessus de "Notre histoire") */}
      {carrousselNouvelleCollectionActif && produitsNouvelleCollection.length > 0 && (
        <section className="accueil-carrousel conteneur">
          <span className="etiquette">Nouvelle collection</span>
          <h2>Nos toutes dernières créations</h2>
          <CarrouselProduits produits={serialiser(produitsNouvelleCollection)} favorisIds={idsFavoris} />
        </section>
      )}

      {/* NOTRE HISTOIRE */}
      <section className="accueil-histoire conteneur">
        <div className="accueil-histoire__image">
          <Image
            src="/images/atelier-mains.jpg"
            alt="Artisan façonnant un bijou"
            width={600}
            height={500}
          />
        </div>
        <div className="accueil-histoire__texte">
          <span className="etiquette">{contenu.histoire_label}</span>
          <h2>
            Chaque bijou <span className="accent">raconte une histoire.</span>
          </h2>
          <TexteRiche html={contenu.histoire_texte} />
          <Link href="/la-maison" className="accueil-histoire__lien">
            {contenu.histoire_lien}
          </Link>
        </div>
      </section>

      {/* SELECTION (carrousel des bijoux mis en avant) */}
      {carrousselSelectionActif && (
        <section className="accueil-carrousel conteneur">
          <span className="etiquette">{contenu.collections_label}</span>
          <h2>Notre sélection</h2>
          {produitsEnAvant.length > 0 ? (
            <CarrouselProduits produits={serialiser(produitsEnAvant)} favorisIds={idsFavoris} />
          ) : (
            <p className="accueil-collections__vide">{contenu.collections_vide}</p>
          )}
        </section>
      )}

      {/* SAVOIR-FAIRE */}
      <section className="accueil-savoirfaire conteneur">
        <span className="etiquette">{contenu.savoirfaire_label}</span>
        <h2>
          L'art de créer avec <span className="accent">passion</span>
        </h2>
        <div className="accueil-savoirfaire__grille">
          <div className="accueil-savoirfaire__etape">
            <div className="accueil-savoirfaire__image">
              <Image src="/images/savoirfaire-inspiration.jpg" alt="Inspiration" width={300} height={220} />
            </div>
            <span className="accueil-savoirfaire__numero">01</span>
            <h3>{contenu.savoirfaire_etape1_titre}</h3>
            <TexteRiche html={contenu.savoirfaire_etape1_texte} />
          </div>
          <div className="accueil-savoirfaire__etape">
            <div className="accueil-savoirfaire__image">
              <Image src="/images/savoirfaire-creation.jpg" alt="Création" width={300} height={220} />
            </div>
            <span className="accueil-savoirfaire__numero">02</span>
            <h3>{contenu.savoirfaire_etape2_titre}</h3>
            <TexteRiche html={contenu.savoirfaire_etape2_texte} />
          </div>
          <div className="accueil-savoirfaire__etape">
            <div className="accueil-savoirfaire__image">
              <Image src="/images/savoirfaire-fabrication.jpg" alt="Fabrication" width={300} height={220} />
            </div>
            <span className="accueil-savoirfaire__numero">03</span>
            <h3>{contenu.savoirfaire_etape3_titre}</h3>
            <TexteRiche html={contenu.savoirfaire_etape3_texte} />
          </div>
        </div>
      </section>

      {/* BESTSELLERS (togglable, au-dessus de "Pièce signature") */}
      {carrousselBestsellerActif && bestsellers.length > 0 && (
        <section className="accueil-carrousel conteneur">
          <span className="etiquette">Meilleures ventes</span>
          <h2>Vos bijoux préférés</h2>
          <CarrouselProduits produits={serialiser(bestsellers)} favorisIds={idsFavoris} />
        </section>
      )}

      {/* PIECE SIGNATURE */}
      <section className="accueil-signature">
        <div className="accueil-signature__overlay" />
        <div className="accueil-signature__contenu">
          <span className="etiquette" style={{ color: 'var(--nabe-sable)' }}>{contenu.signature_label}</span>
          <h2>
            Une création pensée pour traverser <span className="accent">les générations.</span>
          </h2>
          <Link href="/collections" className="btn btn-primaire">
            {contenu.signature_bouton}
          </Link>
        </div>
      </section>

      {/* TEMOIGNAGES */}
      {temoignages.length > 0 && (
        <section className="accueil-temoignages conteneur">
          <span className="etiquette">{contenu.temoignages_label}</span>
          <h2>{contenu.temoignages_titre}</h2>
          <div className="accueil-temoignages__grille">
            {temoignages.map((t) => (
              <div key={t.id} className="accueil-temoignages__carte">
                <div className="accueil-temoignages__etoiles">{'★'.repeat(t.note)}</div>
                <p>« {t.texte} »</p>
                <span>— {t.auteur}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* NEWSLETTER */}
      <section className="accueil-newsletter conteneur">
        <h2>
          Entrez dans <span className="accent">l'univers Nabe</span>
        </h2>
        <TexteRiche html={contenu.newsletter_texte} />
        <form className="accueil-newsletter__form" action="/api/newsletter" method="POST">
          <input type="email" name="email" placeholder="Votre e-mail" required />
          <button type="submit" className="btn btn-or">
            {contenu.newsletter_bouton}
          </button>
        </form>
      </section>
    </div>
  );
}
