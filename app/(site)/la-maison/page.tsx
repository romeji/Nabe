import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import './la-maison.css';

export const metadata = { title: 'La Maison' };
export const revalidate = 60;

export default async function PageLaMaison() {
  const items = await prisma.contenuPage.findMany({ where: { page: 'la-maison' } });
  const c: Record<string, string> = {};
  items.forEach((i) => (c[i.cle] = i.valeur));

  return (
    <div className="page-la-maison">
      <section className="maison-hero">
        <div className="maison-hero__overlay" />
        <div className="maison-hero__contenu">
          <h1>L'atelier Nabe</h1>
          <p>Un lieu où naissent des bijoux façonnés avec passion.</p>
        </div>
      </section>

      <section className="maison-parcours conteneur">
        <div className="maison-parcours__texte">
          <span>Mon parcours</span>
          <h2>De la passion au métier.</h2>
          <p>
            {c.parcours_texte ||
              "Depuis toujours fascinée par la beauté des matières et le travail manuel, j'ai suivi un parcours en joaillerie où j'ai appris les gestes anciens et les techniques de fabrication traditionnelles. Chaque bijou que je crée raconte une histoire, la vôtre, et reflète l'attention portée aux détails et à la qualité."}
          </p>
        </div>
        <div className="maison-parcours__image">
          <Image src={c.parcours_image || '/images/croquis.jpg'} alt="Croquis d'atelier" width={500} height={400} />
        </div>
      </section>

      <section className="maison-savoirfaire conteneur">
        <div className="maison-savoirfaire__image">
          <Image src={c.savoirfaire_image || '/images/bague-atelier.jpg'} alt="Bague en atelier" width={500} height={400} />
        </div>
        <div className="maison-savoirfaire__texte">
          <span>L'atelier</span>
          <h2>Un savoir-faire artisanal.</h2>
          <p>
            {c.savoirfaire_texte ||
              "Dans mon atelier à Lyon, chaque bijou est imaginé, dessiné et fabriqué à la main. Je travaille des métaux précieux et des pierres sélectionnées avec soin pour créer des pièces intemporelles, durables et uniques."}
          </p>
        </div>
      </section>

      <section className="maison-valeurs conteneur">
        <div className="maison-valeurs__item">
          <span className="maison-valeurs__icone">✋</span>
          <h3>Fait main</h3>
          <p>Chaque bijou est façonné à la main avec soin.</p>
        </div>
        <div className="maison-valeurs__item">
          <span className="maison-valeurs__icone">💎</span>
          <h3>Matières nobles</h3>
          <p>Des métaux précieux et pierres sélectionnées avec exigence.</p>
        </div>
        <div className="maison-valeurs__item">
          <span className="maison-valeurs__icone">✨</span>
          <h3>Pièces uniques</h3>
          <p>Des créations en petites séries ou sur mesure.</p>
        </div>
      </section>
    </div>
  );
}
