import '../page-info.css';

export const metadata = { title: 'Mentions légales' };

export default function PageMentionsLegales() {
  return (
    <div className="page-info">
      <div className="page-info__entete">
        <h1>Mentions légales</h1>
      </div>

      <section className="page-info__section">
        <h2>Édition du site</h2>
        <p>
          Le site nabe-bijoux.fr est édité par la maison Nabe, joaillerie artisanale.
        </p>
        <ul>
          <li>Atelier : Lyon, France</li>
          <li>E-mail : bonjour@nabe-bijoux.fr</li>
          <li>Téléphone : +33 6 12 34 56 78</li>
        </ul>
        <p style={{ fontSize: '0.85rem', fontStyle: 'italic' }}>
          Informations à compléter avec votre numéro SIRET, votre forme juridique et votre adresse
          de siège social dès l'immatriculation de votre activité.
        </p>
      </section>

      <section className="page-info__section">
        <h2>Hébergement</h2>
        <p>
          Le site est hébergé par Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis.
        </p>
      </section>

      <section className="page-info__section">
        <h2>Propriété intellectuelle</h2>
        <p>
          L'ensemble des contenus présents sur ce site (textes, photographies, logo, créations)
          est la propriété exclusive de Nabe, sauf mention contraire. Toute reproduction, même
          partielle, est interdite sans autorisation préalable.
        </p>
      </section>

      <section className="page-info__section">
        <h2>Données personnelles</h2>
        <p>
          Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez
          d'un droit d'accès, de rectification et de suppression des données vous concernant.
          Pour exercer ce droit, contactez-nous via notre <a href="/contact">page Contact</a>.
        </p>
        <p>
          Les données collectées (nom, e-mail, adresse) lors d'une commande ou d'une demande
          sur-mesure sont utilisées exclusivement pour le traitement de votre demande et ne sont
          jamais cédées à des tiers à des fins commerciales.
        </p>
      </section>

      <section className="page-info__section">
        <h2>Cookies</h2>
        <p>
          Ce site utilise uniquement des cookies techniques nécessaires à son fonctionnement
          (panier d'achat). Aucun cookie publicitaire ou de traçage tiers n'est utilisé.
        </p>
      </section>
    </div>
  );
}
