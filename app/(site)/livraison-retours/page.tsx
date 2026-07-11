import '../page-info.css';
import { getConfigSite } from '@/lib/config-site';

export const metadata = { title: 'Livraison & Retours' };

export default async function PageLivraisonRetours() {
  const config = await getConfigSite();
  const livraisonIncluse = config.livraison_incluse_dans_prix === 'true';

  return (
    <div className="page-info">
      <div className="page-info__entete">
        <h1>Livraison &amp; Retours</h1>
        <p>Tout savoir sur l'expédition et le retour de vos bijoux Nabe.</p>
      </div>

      <section className="page-info__section">
        <h2>Livraison</h2>
        <p>
          {livraisonIncluse ? (
            <>
              Chaque commande est emballée avec soin dans notre atelier avant expédition. Les frais de
              livraison sont <strong>inclus dans le prix affiché</strong> de nos bijoux : aucun montant
              supplémentaire ne vous sera facturé au moment du paiement, quel que soit le mode de
              livraison choisi (livraison à domicile Colissimo ou point relais Mondial Relay).
            </>
          ) : (
            <>
              Chaque commande est emballée avec soin dans notre atelier avant expédition. Les frais de
              livraison sont calculés automatiquement selon le poids de votre commande et le mode choisi
              au moment du paiement (livraison à domicile Colissimo ou point relais Mondial Relay) ;
              le montant exact vous est indiqué avant validation du paiement.
            </>
          )}
        </p>
        <h3>Délais d'expédition</h3>
        <ul>
          <li>Bijoux en stock : expédition sous 2 à 4 jours ouvrés</li>
          <li>Bijoux en fabrication sur commande : délai indiqué sur la fiche produit (généralement 2 à 3 semaines)</li>
          <li>Pièces sur-mesure : délai communiqué individuellement après validation du devis</li>
        </ul>
        <h3>Zones de livraison</h3>
        <p>
          Nous livrons actuellement en France métropolitaine. Pour toute autre destination,
          contactez-nous avant de passer commande afin que nous étudiions la faisabilité.
        </p>
        <h3>Suivi de commande</h3>
        <p>
          Un e-mail de confirmation avec le détail de votre commande vous est envoyé dès la
          validation du paiement, puis un second e-mail avec le numéro de suivi dès l'expédition.
          Vous pouvez également suivre l'état de votre commande à tout moment depuis notre page{' '}
          <a href="/suivi-commande">Suivre ma commande</a>.
        </p>
      </section>

      <section className="page-info__section">
        <h2>Retours &amp; échanges</h2>
        <p>
          Vous disposez d'un délai de <strong>14 jours</strong> à compter de la réception de votre
          commande pour demander un retour ou un échange. Si votre commande n'a pas encore été
          expédiée, vous pouvez également l'annuler vous-même et être intégralement remboursé(e)
          (produits et frais de port) directement depuis notre page{' '}
          <a href="/suivi-commande">Suivre ma commande</a>.
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
