import Image from 'next/image';
import Link from 'next/link';
import '../pages-marque.css';

export const metadata = { title: 'Artisanat' };

const etapes = [
  {
    image: '/images/croquis.jpg',
    titre: 'Inspiration',
    texte: 'Tout commence par une idée, une émotion, une histoire. Nous imaginons des bijoux intemporels et élégants.',
  },
  {
    image: '/images/savoirfaire-creation.jpg',
    titre: 'Croquis',
    texte: 'Nos créations prennent vie sur papier, où chaque détail est soigneusement pensé.',
  },
  {
    image: '/images/signature-bague.jpg',
    titre: 'Sélection des pierres',
    texte: 'Nous sélectionnons avec soin des pierres naturelles et perles de haute qualité.',
  },
  {
    image: '/images/atelier-mains.jpg',
    titre: 'Fabrication',
    texte: 'Chaque pièce est façonnée à la main par nos artisans dans notre atelier.',
  },
  {
    image: '/images/savoirfaire-fabrication.jpg',
    titre: 'Polissage',
    texte: 'Nos bijoux sont polis avec soin pour révéler tout leur éclat et leur finesse.',
  },
  {
    image: '/images/bague-atelier.jpg',
    titre: 'Contrôle qualité',
    texte: 'Chaque bijou est vérifié minutieusement avant de vous être expédié.',
  },
];

const materiaux = [
  { image: '/images/savoirfaire-fabrication.jpg', titre: 'Argent 925', texte: 'Un métal précieux résistant et lumineux.' },
  { image: '/images/signature-bague.jpg', titre: 'Or 18 carats', texte: 'Un or de qualité pour des bijoux durables.' },
  { image: '/images/savoirfaire-inspiration.jpg', titre: 'Pierres naturelles', texte: 'Sélectionnées pour leur beauté et leur éclat.' },
  { image: '/images/main-bague.jpg', titre: 'Perles', texte: 'Perles d’eau douce aux reflets uniques.' },
];

const qualites = [
  { icone: 'fleur', titre: 'Fait main', texte: 'Chaque bijou est réalisé à la main dans notre atelier.' },
  { icone: 'balance', titre: 'Durable', texte: 'Nous utilisons des matériaux de qualité et responsables.' },
  { icone: 'bouclier', titre: 'Responsable', texte: 'Nous privilégions une production raisonnée et éthique.' },
  { icone: 'soleil', titre: 'Contrôlé', texte: 'Chaque pièce est contrôlée avec soin avant expédition.' },
];

export default function PageArtisanat() {
  return (
    <main className="page-marque page-marque--artisanat">
      <section className="marque-hero" style={{ backgroundImage: "url('/images/atelier-mains.jpg')" }}>
        <div className="marque-hero__ombre" />
        <div className="marque-hero__contenu">
          <h1>L’art de créer avec passion.</h1>
          <p>
            Chaque bijou est le fruit d’un savoir-faire artisanal et d’une attention
            méticuleuse à chaque étape.
          </p>
        </div>
      </section>

      <section className="artisanat-etapes marque-section">
        <span className="marque-label">Les étapes de fabrication</span>
        <div className="artisanat-etapes__liste">
          {etapes.map((etape, index) => (
            <article className="artisanat-etape" key={etape.titre}>
              <span className="artisanat-etape__numero">{String(index + 1).padStart(2, '0')}</span>
              <div className="artisanat-etape__image">
                <Image src={etape.image} alt={etape.titre} width={320} height={220} />
              </div>
              <div className="artisanat-etape__texte">
                <h2>{etape.titre}</h2>
                <p>{etape.texte}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="artisanat-materiaux">
        <div className="marque-section">
          <span className="marque-label">Des matériaux d’exception</span>
          <div className="artisanat-materiaux__grille">
            {materiaux.map((matiere) => (
              <article className="artisanat-matiere" key={matiere.titre}>
                <div>
                  <Image src={matiere.image} alt={matiere.titre} width={180} height={140} />
                </div>
                <h2>{matiere.titre}</h2>
                <p>{matiere.texte}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="artisanat-qualites">
        <span className="marque-label">Nos engagements qualité</span>
        <div className="artisanat-qualites__grille">
          {qualites.map((qualite) => (
            <article key={qualite.titre}>
              <span className={`marque-icone marque-icone--${qualite.icone}`} aria-hidden="true" />
              <h2>{qualite.titre}</h2>
              <p>{qualite.texte}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="marque-cta marque-cta--atelier" style={{ backgroundImage: "url('/images/atelier-portrait.jpg')" }}>
        <div>
          <h2>Chaque création est réalisée dans notre atelier.</h2>
          <p>Aucune production industrielle.</p>
          <Link href="/mon-histoire" className="marque-bouton">Découvrir notre histoire</Link>
        </div>
      </section>
    </main>
  );
}
