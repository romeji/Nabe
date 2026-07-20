import Link from 'next/link';
import { getContenuPage } from '@/lib/contenu';
import TexteRiche from '@/components/site/TexteRiche';
import '../page-info.css';
import '../pages-marque.css';

export const metadata = { title: 'Entretien des bijoux' };

export default async function PageEntretienBijoux() {
  const c = await getContenuPage('entretien-bijoux');

  const conseils = [
    { icone: c.conseil1_icone, titre: c.conseil1_titre, texte: c.conseil1_texte },
    { icone: c.conseil2_icone, titre: c.conseil2_titre, texte: c.conseil2_texte },
    { icone: c.conseil3_icone, titre: c.conseil3_titre, texte: c.conseil3_texte },
    { icone: c.conseil4_icone, titre: c.conseil4_titre, texte: c.conseil4_texte },
  ];

  return (
    <div className="page-info">
      <div className="page-info__entete">
        <h1>{c.hero_titre}</h1>
        <TexteRiche html={c.hero_texte} />
      </div>

      <section className="page-info__section entretien-bijoux__grille">
        {conseils.map((conseil: any, index: number) => (
          <article key={index} className="entretien-bijoux__carte">
            <span className={`marque-icone marque-icone--${conseil.icone}`} aria-hidden="true" />
            <h2>{conseil.titre}</h2>
            <TexteRiche html={conseil.texte} as="div" />
          </article>
        ))}
      </section>

      <section className="page-info__section" style={{ textAlign: 'center' }}>
        <h2>{c.cta_titre}</h2>
        <Link href="/contact" className="btn btn-primaire">{c.cta_bouton}</Link>
      </section>
    </div>
  );
}
