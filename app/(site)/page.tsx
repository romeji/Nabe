import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { formaterPrix } from '@/lib/utils';
import './accueil.css';

export const revalidate = 60;

async function getContenu(page: string) {
  const items = await prisma.contenuPage.findMany({ where: { page } });
  const map: Record<string, string> = {};
  items.forEach((i) => (map[i.cle] = i.valeur));
  return map;
}

export default async function PageAccueil() {
  const [contenu, produitsEnAvant, temoignages] = await Promise.all([
    getContenu('accueil'),
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
          <h1 className="accueil-hero__logo">{contenu.hero_logo || 'Nabe'}</h1>
          <p className="accueil-hero__soustitre">
            {contenu.hero_soustitre ||
              "Des bijoux façonnés à la main, inspirés par l'émotion, la matière et le temps."}
          </p>
          <div className="accueil-hero__actions">
            <Link href="/collections" className="btn btn-primaire">
              Découvrir la collection
            </Link>
            <Link href="/la-maison" className="btn btn-secondaire">
              Mon histoire
            </Link>
          </div>
        </div>
      </section>

      {/* NOTRE HISTOIRE */}
      <section className="accueil-histoire conteneur">
        <div className="accueil-histoire__image">
          <Image
            src={contenu.histoire_image || '/images/atelier-mains.jpg'}
            alt="Artisan façonnant un bijou"
            width={600}
            height={500}
          />
        </div>
        <div className="accueil-histoire__texte">
          <span className="accueil-histoire__label">Notre histoire</span>
          <h2>
            Chaque bijou <span className="accent">raconte une histoire.</span>
          </h2>
          <p>
            {contenu.histoire_texte ||
              "Nabe est une maison de joaillerie artisanale née d'une passion pour la beauté des matières et le savoir-faire traditionnel. Chaque pièce est imaginée et façonnée à la main dans notre atelier, avec exigence, sensibilité et authenticité."}
          </p>
          <Link href="/la-maison" className="accueil-histoire__lien">
            Découvrir la maison →
          </Link>
        </div>
      </section>

      {/* NOS COLLECTIONS */}
      <section className="accueil-collections conteneur">
        <span className="accueil-collections__label">Nos collections</span>
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
            <p className="accueil-collections__vide">
              Ajoutez des bijoux « en avant » depuis le backoffice pour les afficher ici.
            </p>
          )}
        </div>
      </section>

      {/* SAVOIR-FAIRE */}
      <section className="accueil-savoirfaire conteneur">
        <span className="accueil-savoirfaire__label">Le savoir-faire</span>
        <h2>
          L'art de créer avec <span className="accent">passion</span>
        </h2>
        <div className="accueil-savoirfaire__grille">
          <div className="accueil-savoirfaire__etape">
            <span className="accueil-savoirfaire__numero">01</span>
            <h3>Inspiration</h3>
            <p>Chaque création naît d'une émotion, d'un voyage, d'un instant.</p>
          </div>
          <div className="accueil-savoirfaire__etape">
            <span className="accueil-savoirfaire__numero">02</span>
            <h3>Création</h3>
            <p>Croquis, recherches et sélection des plus belles matières.</p>
          </div>
          <div className="accueil-savoirfaire__etape">
            <span className="accueil-savoirfaire__numero">03</span>
            <h3>Fabrication</h3>
            <p>Façonnage à la main dans notre atelier, avec exigence et précision.</p>
          </div>
        </div>
      </section>

      {/* PIECE SIGNATURE */}
      <section className="accueil-signature">
        <div className="accueil-signature__overlay" />
        <div className="accueil-signature__contenu">
          <span>Pièce signature</span>
          <h2>
            Une création pensée pour traverser <span className="accent">les générations.</span>
          </h2>
          <Link href="/collections" className="btn btn-primaire">
            Découvrir
          </Link>
        </div>
      </section>

      {/* TEMOIGNAGES */}
      {temoignages.length > 0 && (
        <section className="accueil-temoignages conteneur">
          <span className="accueil-temoignages__label">Ils nous font confiance</span>
          <h2>Vos mots précieux</h2>
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
        <p>Inscrivez-vous à notre newsletter et découvrez nos nouveautés en avant-première.</p>
        <form className="accueil-newsletter__form" action="/api/newsletter" method="POST">
          <input type="email" name="email" placeholder="Votre e-mail" required />
          <button type="submit" className="btn btn-or">
            S'inscrire
          </button>
        </form>
      </section>
    </div>
  );
}
