import Link from 'next/link';
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
              supplémentaire ne vous sera facturé au moment du paiement.
            </>
          ) : (
            <>
              Chaque commande est emballée avec soin dans notre atelier avant expédition. Les frais de
              livraison sont calculés automatiquement selon le poids de votre commande au moment du
              paiement ; le montant exact vous est indiqué avant validation.
            </>
          )}
        </p>
        <h3>Délais d'expédition</h3>
        <ul>
          <li>Bijoux en stock : expédition sous 2 à 4 jours ouvrés</li>
          <li>Bijoux en fabrication sur commande : délai indiqué sur la fiche produit (généralement 2 à 3 semaines)</li>
          <li>Pièces sur-mesure : délai communiqué individuellement après validation du devis</li>
        </ul>
        <h3>Délais de transport indicatifs</h3>
        <ul>
          <li>Point relais Mondial Relay : 3 à 5 jours ouvrés après expédition</li>
        </ul>
        <p>
          Ces délais de transport sont indicatifs et s'ajoutent au délai de préparation ou de fabrication.
          Si aucun délai spécifique n'est indiqué avant la commande, la livraison interviendra au plus tard
          dans le délai légal de 30 jours suivant la validation de la commande.
        </p>
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
          <Link href="/suivi-commande">Suivre ma commande</Link>.
        </p>
      </section>

      <section className="page-info__section">
        <h2>Retours &amp; échanges</h2>
        <p>
          Vous disposez d'un délai de <strong>14 jours</strong> à compter de la réception de votre
          commande pour demander un retour ou un échange sur un bijou en stock. Si votre commande n'a
          pas encore été expédiée, vous pouvez également l'annuler vous-même et être intégralement
          remboursé(e) directement depuis notre page <Link href="/suivi-commande">Suivre ma commande</Link>.
        </p>

        <h3>Bijoux non repris ni échangés</h3>
        <p>
          Par nature, les créations suivantes sont réalisées spécialement pour vous et ne peuvent donc
          <strong> ni être retournées, ni échangées, ni remboursées</strong>, y compris en cas d'erreur
          de taille de votre part :
        </p>
        <ul>
          <li>Toute pièce réalisée sur-mesure ou personnalisée (gravure, dimensions spécifiques)</li>
          <li>Toute bague commandée dans une taille précise à la demande du client</li>
        </ul>
        <p>
          Nous vous invitons donc à vérifier votre taille avec la plus grande attention avant de
          commander — notre <Link href="/guide-des-tailles">guide des tailles</Link> est là pour vous
          aider. En cas de défaut de fabrication avéré sur l'une de ces pièces, contactez-nous : chaque
          situation est étudiée individuellement.
        </p>

        <h3>Un problème avec votre commande ?</h3>
        <p>
          Que ce soit pour un retour éligible, un défaut constaté ou toute autre question sur une
          commande déjà passée, la marche à suivre est la même : rendez-vous sur votre page{' '}
          <Link href="/suivi-commande">Suivre ma commande</Link> (ou <Link href="/mon-compte/commandes">Mes commandes</Link>{' '}
          si vous êtes connecté·e), ouvrez la commande concernée et cliquez sur{' '}
          <strong>« Signaler un problème »</strong>. Décrivez votre situation et laissez-nous votre
          numéro de téléphone : nous revenons vers vous rapidement pour convenir de la suite (retour,
          échange, remboursement selon le cas).
        </p>

        <h3>Remboursement</h3>
        <p>
          Lorsqu'un retour est accepté, le remboursement est effectué sur le moyen de paiement
          utilisé lors de l'achat, dans un délai de 5 à 10 jours ouvrés après réception et vérification
          du bijou.
        </p>
      </section>

      <section className="page-info__section">
        <h2>Une question ?</h2>
        <p>
          N'hésitez pas à nous écrire via la page <Link href="/contact">Contact</Link>, nous vous
          répondrons avec plaisir.
        </p>
      </section>
    </div>
  );
}
