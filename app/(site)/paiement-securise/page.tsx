import '../page-info.css';

export const metadata = { title: 'Paiement sécurisé' };

export default function PagePaiementSecurise() {
  return (
    <div className="page-info">
      <div className="page-info__entete">
        <h1>Paiement sécurisé</h1>
        <p>Vos achats chez Nabe sont protégés à chaque étape.</p>
      </div>

      <section className="page-info__section">
        <h2>Un paiement chiffré et certifié</h2>
        <p>
          Tous les paiements effectués sur notre site sont traités par <strong>Stripe</strong>,
          l'un des prestataires de paiement en ligne les plus utilisés et certifiés au monde
          (certification PCI-DSS niveau 1, la norme de sécurité la plus stricte du secteur bancaire).
        </p>
        <p>
          Vos coordonnées bancaires ne sont jamais stockées sur nos serveurs : elles transitent
          uniquement, de façon chiffrée, entre votre navigateur et Stripe.
        </p>
        <p>
          Selon votre banque, une authentification forte (3D Secure) peut vous être demandée au
          moment du paiement, conformément à la réglementation européenne DSP2 sur les paiements en
          ligne — une étape supplémentaire de vérification directement avec votre banque.
        </p>
      </section>

      <section className="page-info__section">
        <h2>Moyens de paiement acceptés</h2>
        <ul>
          <li>Carte bancaire (Visa, Mastercard, American Express)</li>
        </ul>
      </section>

      <section className="page-info__section">
        <h2>Remboursement</h2>
        <p>
          En cas d'annulation ou de retour accepté, le remboursement est effectué sur le moyen de
          paiement utilisé lors de l'achat, sous quelques jours ouvrés selon les délais propres à
          votre banque.
        </p>
      </section>

      <section className="page-info__section">
        <h2>Confidentialité de vos données</h2>
        <p>
          Les informations transmises lors de votre commande (nom, adresse, e-mail) sont utilisées
          uniquement pour le traitement et la livraison de votre commande. Elles ne sont ni
          revendues, ni partagées avec des tiers à des fins commerciales.
        </p>
      </section>

      <section className="page-info__section">
        <h2>Une question sur un paiement ?</h2>
        <p>
          Si vous rencontrez un problème lors du paiement ou avez une question sur une transaction,
          contactez-nous via la page <a href="/contact">Contact</a> en précisant votre numéro de
          commande si vous en avez un.
        </p>
      </section>
    </div>
  );
}
