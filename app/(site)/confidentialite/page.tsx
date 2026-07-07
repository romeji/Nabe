import '../page-info.css';

export const metadata = { title: 'Politique de confidentialité' };

export default function PageConfidentialite() {
  return (
    <div className="page-info">
      <div className="page-info__entete">
        <h1>Politique de confidentialité</h1>
        <p>Comment Nabe collecte, utilise et protège vos données personnelles.</p>
      </div>

      <section className="page-info__section">
        <h2>Données collectées</h2>
        <p>
          Lors d’une commande, d’une création de compte, d’une demande de contact ou d’une inscription
          à la newsletter, nous pouvons collecter votre nom, prénom, adresse e-mail, adresse de
          livraison, numéro de téléphone et historique de commande.
        </p>
      </section>

      <section className="page-info__section">
        <h2>Utilisation des données</h2>
        <p>
          Ces informations sont utilisées uniquement pour traiter vos commandes, assurer la livraison,
          répondre à vos demandes, gérer votre compte client et, si vous l’avez demandé, vous envoyer
          nos communications par e-mail.
        </p>
      </section>

      <section className="page-info__section">
        <h2>Paiement</h2>
        <p>
          Les paiements sont traités par Stripe. Vos informations bancaires ne sont jamais stockées
          sur nos serveurs. Stripe traite ces données selon ses propres standards de sécurité.
        </p>
      </section>

      <section className="page-info__section">
        <h2>Conservation</h2>
        <p>
          Les données liées aux commandes sont conservées le temps nécessaire au suivi commercial,
          comptable et légal. Vous pouvez demander la suppression ou la modification de vos données
          personnelles à tout moment.
        </p>
      </section>

      <section className="page-info__section">
        <h2>Vos droits</h2>
        <p>
          Conformément au RGPD, vous disposez d’un droit d’accès, de rectification, d’opposition,
          de limitation et de suppression des données vous concernant. Pour exercer ces droits,
          contactez-nous via la page <a href="/contact">Contact</a>.
        </p>
      </section>

      <section className="page-info__section">
        <h2>Cookies</h2>
        <p>
          Le site utilise des cookies techniques nécessaires au fonctionnement du panier, de la
          session client et du paiement. Aucun cookie publicitaire tiers n’est nécessaire au
          fonctionnement de la boutique.
        </p>
      </section>
    </div>
  );
}
