import Image from 'next/image';
import Link from 'next/link';
import { getContenuPage } from '@/lib/contenu';
import TexteRiche from '@/components/site/TexteRiche';
import '../pages-marque.css';

export const metadata = { title: 'Engagements' };

export default async function PageEngagements() {
  const c = await getContenuPage('engagements');

  const valeurs = [
    { icone: c.valeur1_icone, titre: c.valeur1_titre, texte: c.valeur1_texte },
    { icone: c.valeur2_icone, titre: c.valeur2_titre, texte: c.valeur2_texte },
    { icone: c.valeur3_icone, titre: c.valeur3_titre, texte: c.valeur3_texte },
    { icone: c.valeur4_icone, titre: c.valeur4_titre, texte: c.valeur4_texte },
  ];

  const raisons = [
    { icone: c.raison1_icone, titre: c.raison1_titre },
    { icone: c.raison2_icone, titre: c.raison2_titre },
    { icone: c.raison3_icone, titre: c.raison3_titre },
    { icone: c.raison4_icone, titre: c.raison4_titre },
  ];

  const stats = [
    [c.stat1_valeur, c.stat1_label],
    [c.stat2_valeur, c.stat2_label],
    [c.stat3_valeur, c.stat3_label],
    [c.stat4_valeur, c.stat4_label],
  ];

  const questions = [
    { question: c.faq1_question, reponse: c.faq1_reponse },
    { question: c.faq2_question, reponse: c.faq2_reponse },
    { question: c.faq3_question, reponse: c.faq3_reponse },
    { question: c.faq4_question, reponse: c.faq4_reponse },
  ];

  return (
    <main className="page-marque page-marque--engagements">
      <section className="marque-hero" style={{ backgroundImage: `url('${c.hero_image}')` }}>
        <div className="marque-hero__ombre" />
        <div className="marque-hero__contenu">
          <h1>{c.hero_titre}</h1>
          <TexteRiche html={c.hero_texte} />
        </div>
      </section>

      <section className="engagements-valeurs marque-section">
        <span className="marque-label">{c.valeurs_label}</span>
        <div className="engagements-valeurs__grille">
          {valeurs.map((valeur: any, index: number) => (
            <article className="engagements-valeurs__carte" key={index}>
              <span className={`marque-icone marque-icone--${valeur.icone}`} aria-hidden="true" />
              <h2>{valeur.titre}</h2>
              <p>{valeur.texte}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="engagements-fabrication">
        <div className="engagements-fabrication__texte">
          <h2>{c.fabrication_titre}</h2>
          <TexteRiche html={c.fabrication_texte} />
          <Link href="/artisanat" className="marque-bouton">{c.fabrication_bouton}</Link>
        </div>
        <div className="engagements-fabrication__image">
          <Image src={c.fabrication_image} alt="Bijou assemblé à la main" width={620} height={560} />
        </div>
      </section>

      <section className="marque-processus marque-section">
        <span className="marque-label">{c.raisons_label}</span>
        <div className="marque-processus__grille">
          {raisons.map((raison: any, index: number) => (
            <article className="marque-processus__item" key={index}>
              <span className={`marque-icone marque-icone--${raison.icone}`} aria-hidden="true" />
              <h3>{raison.titre}</h3>
            </article>
          ))}
        </div>
      </section>

      <section className="engagements-stats">
        {stats.map(([valeur, label], index) => (
          <div key={index}>
            <strong>{valeur}</strong>
            <span>{label}</span>
          </div>
        ))}
      </section>

      <section className="engagements-faq marque-section">
        <span className="marque-label">{c.faq_label}</span>
        <div className="engagements-faq__liste">
          {questions.map((item: any, index: number) => (
            <details key={index}>
              <summary>{item.question}</summary>
              <TexteRiche html={item.reponse} as="div" />
            </details>
          ))}
        </div>
      </section>

      <section className="marque-cta marque-cta--sombre" style={{ backgroundImage: `url('${c.cta_image}')` }}>
        <div>
          <h2>{c.cta_titre}</h2>
          <p>{c.cta_texte}</p>
          <Link href="/collections" className="marque-bouton">{c.cta_bouton}</Link>
        </div>
      </section>
    </main>
  );
}
