import Image from 'next/image';
import { getContenuPage } from '@/lib/contenu';
import TexteRiche from '@/components/site/TexteRiche';
import '../pages-marque.css';

export const metadata = { title: 'Artisanat' };
export const revalidate = 60;

export default async function PageArtisanat() {
  const c = await getContenuPage('artisanat');

  return (
    <div className="page-marque">
      <section className="page-marque__hero" style={{ backgroundImage: "url('/images/savoirfaire-fabrication.jpg')" }}>
        <div className="page-marque__hero-contenu conteneur">
          <span className="etiquette etiquette--claire">{c.hero_label}</span>
          <h1>{c.hero_titre}</h1>
          <p>{c.hero_soustitre}</p>
        </div>
      </section>

      <section className="page-marque__intro conteneur">
        <span className="etiquette etiquette--centre">{c.intro_label}</span>
        <h2>{c.intro_titre}</h2>
        <TexteRiche html={c.intro_texte} />
      </section>

      <section className="page-marque__bloc conteneur">
        <div className="page-marque__image">
          <Image src="/images/atelier-mains.jpg" alt="Bijou façonné à la main" width={620} height={520} />
        </div>
        <div className="page-marque__texte">
          <span className="etiquette">{c.bloc1_label}</span>
          <h2>{c.bloc1_titre}</h2>
          <TexteRiche html={c.bloc1_texte} />
        </div>
      </section>

      <section className="page-marque__bloc page-marque__bloc--inverse conteneur">
        <div className="page-marque__texte">
          <span className="etiquette">{c.bloc2_label}</span>
          <h2>{c.bloc2_titre}</h2>
          <TexteRiche html={c.bloc2_texte} />
        </div>
        <div className="page-marque__image">
          <Image src="/images/savoirfaire-creation.jpg" alt="Création de bijou en atelier" width={620} height={520} />
        </div>
      </section>

      <section className="page-marque__valeurs conteneur">
        <Valeur index="01" titre={c.valeur1_titre} texte={c.valeur1_texte} />
        <Valeur index="02" titre={c.valeur2_titre} texte={c.valeur2_texte} />
        <Valeur index="03" titre={c.valeur3_titre} texte={c.valeur3_texte} />
      </section>
    </div>
  );
}

function Valeur({ index, titre, texte }: { index: string; titre: string; texte: string }) {
  return (
    <div className="page-marque__valeur">
      <span>{index}</span>
      <h3>{titre}</h3>
      <p>{texte}</p>
    </div>
  );
}
