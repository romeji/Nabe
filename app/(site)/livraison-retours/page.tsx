import '../page-info.css';

export const metadata = { title: 'Livraison & Retours' };

export default function PageLivraisonRetours() {
  return (
    <div className="page-info">
      <div className="page-info__entete">
        <h1>Livraison &amp; Retours</h1>
        <p>Tout savoir sur l'expédition et le retour de vos bijoux Nabe.</p>
      </div>

      <section className="page-info__section">
        <h2>Livraison</h2>
        <p>
          Chaque commande est emballée avec soin dans notre atelier à Lyon avant expédition.
          La livraison est <strong>offerte</strong> pour toute commande, en France métropolitaine
          comme à l'international.
        </p>
        <h3>Délais d'expédition</h3>
        <ul>
          <li>Bijoux en stock : expédition sous 2 à 4 jours ouvrés</li>
          <li>Bijoux en fabrication sur commande : délai indiqué sur la fiche produit (généralement 2 à 3 semaines)</li>
          <li>Pièces sur-mesure : délai communiqué individuellement après validation du devis</li>
        </ul>
        <h3>Zones de livraison</h3>
        <p>
          Nous livrons en France métropolitaine, en Belgique, en Suisse, au Luxembourg et à Monaco.
          Pour toute autre destination, contactez-nous avant de passer commande.
        </p>
        <h3>Suivi de commande</h3>
        <p>
          Un e-mail de confirmation avec le détail de votre commande vous est envoyé dès la
          validation du paiement. Le numéro de suivi colis vous est transmis dès l'expédition.
        </p>
      </section>

      <section className="page-info__section">
        <h2>Retours &amp; échanges</h2>
        <p>
          Vous disposez d'un délai de <strong>14 jours</strong> à compter de la réception de votre
          commande pour demander un retour ou un échange.
        </p>
        <h3>Conditions de retour</h3>
        <ul>
          <li>Le bijou doit être retourné dans son état d'origine, non porté, avec son écrin</li>
          <li>Les pièces réalisées sur-mesure ou personnalisées (gravure) ne sont ni reprises ni échangées</li>
          <li>Les frais de retour sont à la charge du client, sauf en cas de défaut de fabrication</li>
        </ul>
        <h3>Comment retourner un bijou ?</h3>
        <p>
          Contactez-nous via notre <a href="/contact">formulaire de contact</a> en précisant votre
          numéro de commande. Nous vous indiquerons la marche à suivre et l'adresse de retour.
        </p>
        <h3>Remboursement</h3>
        <p>
          Une fois le bijou reçu et vérifié, le remboursement est effectué sur le moyen de paiement
          utilisé lors de l'achat, dans un délai de 5 à 10 jours ouvrés.
        </p>
      </section>

      <section className="page-info__section">
        <h2>Une question ?</h2>
        <p>
          N'hésitez pas à nous écrire via la page <a href="/contact">Contact</a>, nous vous
          répondrons avec plaisir.
        </p>
      </section>
    </div>
  );
}
