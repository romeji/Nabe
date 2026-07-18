import Image from 'next/image';
import Link from 'next/link';
import { getContenuPage } from '@/lib/contenu';
import TexteRiche from '@/components/site/TexteRiche';
import '../pages-marque.css';

export const metadata = { title: 'Mon Histoire' };

export default async function PageMonHistoire() {
  const c = await getContenuPage('mon-histoire');

  const dates = [
    { icone: c.date1_icone, titre: c.date1_titre, texte: c.date1_texte },
    { icone: c.date2_icone, titre: c.date2_titre, texte: c.date2_texte },
    { icone: c.date3_icone, titre: c.date3_titre, texte: c.date3_texte },
    { icone: c.date4_icone, titre: c.date4_titre, texte: c.date4_texte },
  ];

  const galerie = [
    { src: c.galerie1_image, alt: 'Bijou façonné à la main' },
    { src: c.galerie2_image, alt: 'Outils et bijoux sur établi' },
    { src: c.galerie3_image, alt: 'Atelier de joaillerie' },
    { src: c.galerie4_image, alt: 'Vase et fleurs dans l’atelier' },
    { src: c.galerie5_image, alt: 'Finition d’une bague' },
  ];

  return (
    <main className="page-marque page-marque--histoire">
      <section className="marque-hero marque-hero--centre" style={{ backgroundImage: `url('${c.hero_image}')` }}>
        <div className="marque-hero__ombre" />
        <div className="marque-hero__contenu">
          <h1>{c.hero_titre}</h1>
          <TexteRiche html={c.hero_texte} />
          <Link href="/la-maison" className="marque-bouton">{c.hero_bouton}</Link>
        </div>
      </section>

      <section className="histoire-vision marque-section">
        <div className="histoire-vision__image">
          <Image src={c.vision_image} alt="Bijoux Nabe portés à la main" width={540} height={720} />
        </div>
        <div className="histoire-vision__texte">
          <span className="marque-label">{c.vision_label}</span>
          <h2>{c.vision_titre}</h2>
          <TexteRiche html={c.vision_texte} />
        </div>
      </section>

      <section className="marque-frise">
        <span className="marque-label">{c.frise_label}</span>
        <div className="marque-frise__grille">
          {dates.map((item: any, index: number) => (
            <article className="marque-frise__item" key={index}>
              <span className={`marque-icone marque-icone--${item.icone}`} aria-hidden="true" />
              <h3>{item.titre}</h3>
              <p>{item.texte}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="histoire-atelier marque-section">
        <span className="marque-label">{c.atelier_label}</span>
        <div className="histoire-galerie">
          {galerie.map((image: any, index: number) => (
            <div className={`histoire-galerie__image histoire-galerie__image--${index + 1}`} key={index}>
              <Image src={image.src} alt={image.alt} width={520} height={360} />
            </div>
          ))}
        </div>
      </section>

      <section className="marque-citation">
        <span aria-hidden="true">"</span>
        <TexteRiche html={c.citation_texte} />
      </section>

      <section className="marque-cta" style={{ backgroundImage: `url('${c.cta_image}')` }}>
        <div>
          <span className="marque-label">{c.cta_label}</span>
          <h2>{c.cta_titre}</h2>
          <Link href="/collections" className="marque-bouton">{c.cta_bouton}</Link>
        </div>
      </section>
    </main>
  );
}
