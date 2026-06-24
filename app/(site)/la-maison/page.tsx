import Image from 'next/image';
import { getContenuPage } from '@/lib/contenu';
import TexteRiche from '@/components/site/TexteRiche';
import '../hero-commun.css';
import './la-maison.css';

export const metadata = { title: 'La Maison' };
export const revalidate = 60;

export default async function PageLaMaison() {
  const c = await getContenuPage('la-maison');

  return (
    <div className="page-la-maison">
      <section className="hero-commun" style={{ backgroundImage: "url('/images/atelier-portrait.jpg')" }}>
        <div className="hero-commun__overlay" />
        <div className="hero-commun__contenu">
          <h1>{c.hero_titre}</h1>
          <p>{c.hero_soustitre}</p>
        </div>
      </section>

      <section className="maison-parcours conteneur">
        <div className="maison-parcours__texte">
          <span>{c.parcours_label}</span>
          <h2>{c.parcours_titre}</h2>
          <TexteRiche html={c.parcours_texte} />
        </div>
        <div className="maison-parcours__image">
          <Image src="/images/croquis.jpg" alt="Croquis d'atelier" width={500} height={400} />
        </div>
      </section>

      <section className="maison-savoirfaire conteneur">
        <div className="maison-savoirfaire__image">
          <Image src="/images/bague-atelier.jpg" alt="Bague en atelier" width={500} height={400} />
        </div>
        <div className="maison-savoirfaire__texte">
          <span>{c.savoirfaire_label}</span>
          <h2>{c.savoirfaire_titre}</h2>
          <TexteRiche html={c.savoirfaire_texte} />
        </div>
      </section>

      <section className="maison-valeurs conteneur">
        <div className="maison-valeurs__item">
          <span className="maison-valeurs__icone">✋</span>
          <h3>{c.valeur1_titre}</h3>
          <p>{c.valeur1_texte}</p>
        </div>
        <div className="maison-valeurs__item">
          <span className="maison-valeurs__icone">💎</span>
          <h3>{c.valeur2_titre}</h3>
          <p>{c.valeur2_texte}</p>
        </div>
        <div className="maison-valeurs__item">
          <span className="maison-valeurs__icone">✨</span>
          <h3>{c.valeur3_titre}</h3>
          <p>{c.valeur3_texte}</p>
        </div>
      </section>
    </div>
  );
}
