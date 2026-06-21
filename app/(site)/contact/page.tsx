import ContactFormulaire from '@/components/site/ContactFormulaire';
import './contact.css';

export const metadata = { title: 'Contact' };

export default function PageContact() {
  return (
    <div className="page-contact">
      <section className="contact-hero">
        <div className="contact-hero__overlay" />
        <div className="contact-hero__contenu">
          <h1>Contact</h1>
          <p>Une question, une envie, un projet ? Je serais ravie d'échanger avec vous.</p>
        </div>
      </section>

      <section className="contact-corps conteneur">
        <div className="contact-corps__infos">
          <h2>Écrivez-moi</h2>
          <p>
            Pour toute demande d'information, collaboration ou projet sur-mesure, remplissez le
            formulaire ci-contre.
          </p>

          <div className="contact-corps__bloc">
            <h3>Email</h3>
            <p>bonjour@nabe-bijoux.fr</p>
          </div>
          <div className="contact-corps__bloc">
            <h3>Téléphone</h3>
            <p>+33 6 12 34 56 78</p>
          </div>
          <div className="contact-corps__bloc">
            <h3>Atelier</h3>
            <p>Lyon, France</p>
          </div>
        </div>

        <ContactFormulaire />
      </section>

      <section className="contact-rdv conteneur">
        <div className="contact-rdv__image" />
        <div className="contact-rdv__texte">
          <span>Rendez-vous à l'atelier</span>
          <h2>L'atelier Nabe vous accueille sur rendez-vous pour découvrir les collections et échanger sur vos envies.</h2>
          <a href="/contact" className="btn btn-primaire">
            Prendre rendez-vous
          </a>
        </div>
      </section>
    </div>
  );
}
