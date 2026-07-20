import Image from 'next/image';
import Link from 'next/link';
import { getContenuPage } from '@/lib/contenu';
import TexteRiche from '@/components/site/TexteRiche';
import '../pages-marque.css';

export const metadata = { title: 'Artisanat' };

export default async function PageArtisanat() {
  const c = await getContenuPage('artisanat');

  const etapes = [
    { image: c.etape1_image, titre: c.etape1_titre, texte: c.etape1_texte },
    { image: c.etape2_image, titre: c.etape2_titre, texte: c.etape2_texte },
    { image: c.etape3_image, titre: c.etape3_titre, texte: c.etape3_texte },
    { image: c.etape4_image, titre: c.etape4_titre, texte: c.etape4_texte },
    { image: c.etape5_image, titre: c.etape5_titre, texte: c.etape5_texte },
    { image: c.etape6_image, titre: c.etape6_titre, texte: c.etape6_texte },
  ];

  const materiaux = [
    { image: c.materiau1_image, titre: c.materiau1_titre, texte: c.materiau1_texte },
    { image: c.materiau2_image, titre: c.materiau2_titre, texte: c.materiau2_texte },
    { image: c.materiau3_image, titre: c.materiau3_titre, texte: c.materiau3_texte },
    { image: c.materiau4_image, titre: c.materiau4_titre, texte: c.materiau4_texte },
  ];

  const qualites = [
    { icone: c.qualite1_icone, titre: c.qualite1_titre, texte: c.qualite1_texte },
    { icone: c.qualite2_icone, titre: c.qualite2_titre, texte: c.qualite2_texte },
    { icone: c.qualite3_icone, titre: c.qualite3_titre, texte: c.qualite3_texte },
    { icone: c.qualite4_icone, titre: c.qualite4_titre, texte: c.qualite4_texte },
  ];

  return (
    <main className="page-marque page-marque--artisanat">
      <section className="marque-hero" style={{ backgroundImage: `url('${c.hero_image}')` }}>
        <div className="marque-hero__ombre" />
        <div className="marque-hero__contenu">
          <h1>{c.hero_titre}</h1>
          <TexteRiche html={c.hero_texte} />
        </div>
      </section>

      <section className="artisanat-etapes marque-section">
        <span className="marque-label">{c.etapes_label}</span>
        <div className="artisanat-etapes__liste">
          {etapes.map((etape: any, index: number) => (
            <article className="artisanat-etape" key={index}>
              <span className="artisanat-etape__numero">{String(index + 1).padStart(2, '0')}</span>
              <div className="artisanat-etape__image">
                <Image src={etape.image} alt={etape.titre} width={320} height={220} />
              </div>
              <div className="artisanat-etape__texte">
                <h2>{etape.titre}</h2>
                <TexteRiche html={etape.texte} as="div" />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="artisanat-materiaux">
        <div className="marque-section">
          <span className="marque-label">{c.materiaux_label}</span>
          <div className="artisanat-materiaux__grille">
            {materiaux.map((matiere: any, index: number) => (
              <article className="artisanat-matiere" key={index}>
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
        <span className="marque-label">{c.qualites_label}</span>
        <div className="artisanat-qualites__grille">
          {qualites.map((qualite: any, index: number) => (
            <article key={index}>
              <span className={`marque-icone marque-icone--${qualite.icone}`} aria-hidden="true" />
              <h2>{qualite.titre}</h2>
              <p>{qualite.texte}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="marque-cta marque-cta--atelier" style={{ backgroundImage: `url('${c.cta_image}')` }}>
        <div>
          <h2>{c.cta_titre}</h2>
          <p>{c.cta_texte}</p>
          <Link href="/mon-histoire" className="marque-bouton">{c.cta_bouton}</Link>
        </div>
      </section>
    </main>
  );
}
