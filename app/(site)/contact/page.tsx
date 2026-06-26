import { getContenuPage } from '@/lib/contenu';
import TexteRiche from '@/components/site/TexteRiche';
import ContactFormulaire from '@/components/site/ContactFormulaire';
import '../hero-commun.css';
import './contact.css';

export const metadata = { title: 'Contact' };
export const revalidate = 60;

export default async function PageContact() {
  const c = await getContenuPage('contact');

  return (
    <div className="page-contact">
      <section className="hero-commun" style={{ backgroundImage: "url('/images/contact-hero.jpg')" }}>
        <div className="hero-commun__overlay" />
        <div className="hero-commun__contenu">
          <h1>{c.hero_titre}</h1>
          <TexteRiche html={c.hero_soustitre} as="span" />
        </div>
      </section>

      <section className="contact-corps conteneur">
        <div className="contact-corps__infos">
          <h2>{c.ecrivez_titre}</h2>
          <TexteRiche html={c.ecrivez_texte} />

          <div className="contact-corps__bloc">
            <h3>Email</h3>
            <p>{c.email}</p>
          </div>
          <div className="contact-corps__bloc">
            <h3>Téléphone</h3>
            <p>{c.telephone}</p>
          </div>
          <div className="contact-corps__bloc">
            <h3>Atelier</h3>
            <p>{c.adresse_atelier}</p>
          </div>
        </div>

        <ContactFormulaire />
      </section>

      <section className="contact-rdv conteneur">
        <div className="contact-rdv__image" />
        <div className="contact-rdv__texte">
          <span className="etiquette">{c.rdv_label}</span>
          <h2><TexteRiche html={c.rdv_texte} as="span" /></h2>
          <a href="/contact" className="btn btn-primaire">
            {c.rdv_bouton}
          </a>
        </div>
      </section>
    </div>
  );
}
