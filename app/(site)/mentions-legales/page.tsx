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
          Informations à compléter avec votre numéro SIRET, votre forme juridique (ex. entreprise
          individuelle, EURL, SASU...), votre numéro de TVA intracommunautaire le cas échéant, votre
          capital social si applicable, et l'adresse de votre siège social dès l'immatriculation de
          votre activité.
        </p>
      </section>

      <section className="page-info__section">
        <h2>Directeur de la publication</h2>
        <p style={{ fontSize: '0.85rem', fontStyle: 'italic' }}>
          Le nom du directeur de la publication (obligatoire selon l'article 6-III de la loi n°
          2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique) est à compléter ici
          — en général la personne physique responsable de l'activité, ou son représentant légal une
          fois la structure immatriculée.
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
          Pour exercer ce droit, contactez-nous via notre <a href="/contact">page Contact</a>. Le
          détail des traitements et des sous-traitants utilisés figure dans notre{' '}
          <a href="/confidentialite">politique de confidentialité</a>.
        </p>
        <p>
          Les données collectées (nom, e-mail, adresse) lors d'une commande ou d'une demande
          sur-mesure sont utilisées exclusivement pour le traitement de votre demande et ne sont
          jamais cédées à des tiers à des fins commerciales.
        </p>
      </section>

      <section className="page-info__section">
        <h2>Médiation de la consommation</h2>
        <p>
          Conformément aux articles L.616-1 et R.616-1 du Code de la consommation, tout
          consommateur a le droit de recourir gratuitement à un médiateur de la consommation en vue
          de la résolution amiable d'un litige, après démarche préalable écrite auprès de Nabe via
          la <a href="/contact">page Contact</a>.
        </p>
        <p style={{ fontSize: '0.85rem', fontStyle: 'italic' }}>
          Coordonnées du médiateur à compléter ici une fois votre adhésion faite auprès d'un
          médiateur agréé (liste disponible sur{' '}
          <a href="https://www.economie.gouv.fr/mediation-conso" target="_blank" rel="noreferrer">
            economie.gouv.fr/mediation-conso
          </a>
          ) — obligatoire pour tout site marchand vendant à des particuliers en France.
        </p>
      </section>

      <section className="page-info__section">
        <h2>Cookies</h2>
        <p>
          Ce site utilise des cookies techniques nécessaires à son fonctionnement (panier d'achat,
          session), ainsi que, uniquement avec votre consentement explicite, un cookie de mesure
          d'audience (Google Analytics). Le détail figure dans notre{' '}
          <a href="/confidentialite">politique de confidentialité</a>.
        </p>
      </section>
    </div>
  );
}
