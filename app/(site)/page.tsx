import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { getContenuPage } from '@/lib/contenu';
import './accueil.css';

export const revalidate = 60;

export default async function PageAccueil() {
  const [contenu, produitsEnAvant, temoignages] = await Promise.all([
    getContenuPage('accueil'),
    prisma.produit.findMany({
      where: { enAvant: true, actif: true },
      include: { images: { orderBy: { ordre: 'asc' }, take: 1 } },
      take: 4,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.temoignage.findMany({ where: { actif: true }, orderBy: { ordre: 'asc' }, take: 3 }),
  ]);

  return (
    <div className="page-accueil">
      {/* HERO */}
      <section className="accueil-hero">
        <div className="accueil-hero__overlay" />
        <div className="accueil-hero__contenu">
          <h1 className="accueil-hero__logo">{contenu.hero_logo}</h1>
          <p className="accueil-hero__soustitre">{contenu.hero_soustitre}</p>
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
          <span className="accueil-histoire__label">{contenu.histoire_label}</span>
          <h2>
            Chaque bijou <span className="accent">raconte une histoire.</span>
          </h2>
          <p>{contenu.histoire_texte}</p>
          <Link href="/la-maison" className="accueil-histoire__lien">
            {contenu.histoire_lien}
          </Link>
        </div>
      </section>

      {/* NOS COLLECTIONS */}
      <section className="accueil-collections conteneur">
        <span className="accueil-collections__label">{contenu.collections_label}</span>
        <div className="accueil-collections__grille">
          {produitsEnAvant.length > 0 ? (
            produitsEnAvant.map((produit) => (
              <Link
                key={produit.id}
                href={`/collections/${produit.slug}`}
                className="accueil-collections__carte"
              >
                <div className="accueil-collections__image">
                  {produit.images[0] ? (
                    <Image
                      src={produit.images[0].url}
                      alt={produit.images[0].alt || produit.nom}
                      width={300}
                      height={300}
                    />
                  ) : (
                    <div className="accueil-collections__placeholder" />
                  )}
                </div>
                <h3>{produit.nom}</h3>
                <span className="accueil-collections__decouvrir">Découvrir →</span>
              </Link>
            ))
          ) : (
            <p className="accueil-collections__vide">{contenu.collections_vide}</p>
          )}
        </div>
      </section>

      {/* SAVOIR-FAIRE */}
      <section className="accueil-savoirfaire conteneur">
        <span className="accueil-savoirfaire__label">{contenu.savoirfaire_label}</span>
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
            <p>{contenu.savoirfaire_etape1_texte}</p>
          </div>
          <div className="accueil-savoirfaire__etape">
            <div className="accueil-savoirfaire__image">
              <Image src="/images/savoirfaire-creation.jpg" alt="Création" width={300} height={220} />
            </div>
            <span className="accueil-savoirfaire__numero">02</span>
            <h3>{contenu.savoirfaire_etape2_titre}</h3>
            <p>{contenu.savoirfaire_etape2_texte}</p>
          </div>
          <div className="accueil-savoirfaire__etape">
            <div className="accueil-savoirfaire__image">
              <Image src="/images/savoirfaire-fabrication.jpg" alt="Fabrication" width={300} height={220} />
            </div>
            <span className="accueil-savoirfaire__numero">03</span>
            <h3>{contenu.savoirfaire_etape3_titre}</h3>
            <p>{contenu.savoirfaire_etape3_texte}</p>
          </div>
        </div>
      </section>

      {/* PIECE SIGNATURE */}
      <section className="accueil-signature">
        <div className="accueil-signature__overlay" />
        <div className="accueil-signature__contenu">
          <span>{contenu.signature_label}</span>
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
          <span className="accueil-temoignages__label">{contenu.temoignages_label}</span>
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
        <p>{contenu.newsletter_texte}</p>
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
