import Image from 'next/image';
import Link from 'next/link';
import '../pages-marque.css';

export const metadata = { title: 'Mon Histoire' };

const dates = [
  { icone: 'coeur', titre: '2024', texte: 'Création de Nabe' },
  { icone: 'atelier', titre: '100 %', texte: 'Fabrication artisanale' },
  { icone: 'bijou', titre: 'Chaque bijou', texte: 'Fabriqué à la commande' },
  { icone: 'outil', titre: '1 atelier', texte: 'En France' },
];

const galerie = [
  { src: '/images/atelier-mains.jpg', alt: 'Bijou façonné à la main' },
  { src: '/images/bague-atelier.jpg', alt: 'Outils et bijoux sur établi' },
  { src: '/images/atelier-portrait.jpg', alt: 'Atelier de joaillerie' },
  { src: '/images/savoirfaire-inspiration.jpg', alt: 'Vase et fleurs dans l’atelier' },
  { src: '/images/savoirfaire-fabrication.jpg', alt: 'Finition d’une bague' },
];

export default function PageMonHistoire() {
  return (
    <main className="page-marque page-marque--histoire">
      <section className="marque-hero marque-hero--centre" style={{ backgroundImage: "url('/images/atelier-portrait.jpg')" }}>
        <div className="marque-hero__ombre" />
        <div className="marque-hero__contenu">
          <h1>Notre histoire</h1>
          <p>Chaque bijou commence par une émotion.</p>
          <p>Fabriqué à la main dans notre atelier en France.</p>
          <Link href="/la-maison" className="marque-bouton">Découvrir l’atelier</Link>
        </div>
      </section>

      <section className="histoire-vision marque-section">
        <div className="histoire-vision__image">
          <Image src="/images/main-bague.jpg" alt="Bijoux Nabe portés à la main" width={540} height={720} />
        </div>
        <div className="histoire-vision__texte">
          <span className="marque-label">Notre vision</span>
          <h2>Créer des bijoux qui traversent le temps.</h2>
          <p>
            Nabe est née d’une envie simple : proposer des créations artisanales,
            intemporelles et réalisées avec passion.
          </p>
          <p>
            Chaque pièce est imaginée, dessinée puis fabriquée dans notre atelier.
          </p>
          <p>
            Nous privilégions les petites séries, les matériaux de qualité et le travail minutieux.
          </p>
        </div>
      </section>

      <section className="marque-frise">
        <span className="marque-label">Notre histoire en quelques dates</span>
        <div className="marque-frise__grille">
          {dates.map((item) => (
            <article className="marque-frise__item" key={item.titre}>
              <span className={`marque-icone marque-icone--${item.icone}`} aria-hidden="true" />
              <h3>{item.titre}</h3>
              <p>{item.texte}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="histoire-atelier marque-section">
        <span className="marque-label">Notre atelier</span>
        <div className="histoire-galerie">
          {galerie.map((image, index) => (
            <div className={`histoire-galerie__image histoire-galerie__image--${index + 1}`} key={image.src}>
              <Image src={image.src} alt={image.alt} width={520} height={360} />
            </div>
          ))}
        </div>
      </section>

      <section className="marque-citation">
        <span aria-hidden="true">“</span>
        <p>Nous ne fabriquons pas seulement des bijoux.</p>
        <p>Nous créons des souvenirs.</p>
      </section>

      <section className="marque-cta" style={{ backgroundImage: "url('/images/signature-bague.jpg')" }}>
        <div>
          <span className="marque-label">Découvrez notre univers</span>
          <h2>Découvrez nos collections</h2>
          <Link href="/collections" className="marque-bouton">Voir les bijoux</Link>
        </div>
      </section>
    </main>
  );
}
