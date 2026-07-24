import '../page-info.css';
import { getConfigSite } from '@/lib/config-site';

export const metadata = { title: 'Conditions Générales de Vente' };

export default async function PageCGV() {
  const config = await getConfigSite();
  const livraisonIncluse = config.livraison_incluse_dans_prix === 'true';

  return (
    <div className="page-info">
      <div className="page-info__entete">
        <h1>Conditions Générales de Vente</h1>
        <p>En vigueur au {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</p>
      </div>

      <section className="page-info__section">
        <h2>Article 1 — Objet</h2>
        <p>
          Les présentes Conditions Générales de Vente (CGV) régissent les ventes de bijoux réalisées
          par la maison Nabe à destination de ses clients, via le site nabe-bijoux.fr. Toute commande
          passée sur le site implique l'acceptation sans réserve des présentes CGV.
        </p>
      </section>

      <section className="page-info__section">
        <h2>Article 2 — Produits</h2>
        <p>
          Les bijoux proposés sont façonnés à la main dans notre atelier. De légères variations
          (teinte des pierres naturelles, finitions) peuvent exister entre les photographies du site
          et le bijou reçu, propres au caractère artisanal de chaque pièce.
        </p>
      </section>

      <section className="page-info__section">
        <h2>Article 3 — Prix</h2>
        <p>
          Les prix sont indiqués en euros, toutes taxes comprises (TTC). Nabe se réserve le droit de
          modifier ses prix à tout moment, le prix applicable étant celui en vigueur au moment de la
          validation de la commande.
        </p>
        <p>
          {livraisonIncluse
            ? "Les frais de livraison standard sont inclus dans les prix affichés : aucun frais de livraison supplémentaire n'est ajouté au paiement pour les modes proposés sur le site."
            : "Les frais de livraison sont calculés séparément au moment de la commande, selon le poids du panier et le mode de livraison choisi. Le montant exact est affiché avant validation du paiement."}
        </p>
      </section>

      <section className="page-info__section">
        <h2>Article 4 — Commande &amp; paiement</h2>
        <p>
          La commande est validée après confirmation du paiement intégral, traité de façon sécurisée
          via notre prestataire Stripe (voir notre page <a href="/paiement-securise">Paiement sécurisé</a>).
        </p>
      </section>

      <section className="page-info__section">
        <h2>Article 5 — Livraison</h2>
        <p>
          Les modalités et délais de livraison sont détaillés sur notre page{' '}
          <a href="/livraison-retours">Livraison &amp; Retours</a>.
        </p>
        <p>
          À titre indicatif, les bijoux en stock sont généralement expédiés sous 2 à 4 jours ouvrés.
          Les bijoux fabriqués sur commande suivent le délai indiqué sur la fiche produit. Les pièces
          sur-mesure suivent le délai communiqué dans le devis accepté. À défaut de délai spécifique
          indiqué avant la commande, la livraison interviendra au plus tard dans le délai légal de
          30 jours suivant la validation de la commande.
        </p>
      </section>

      <section className="page-info__section">
        <h2>Article 6 — Droit de rétractation et retours</h2>
        <p>
          Conformément à la législation en vigueur, vous disposez d'un délai de 14 jours à compter
          de la réception de votre commande pour exercer votre droit de rétractation sur un bijou non
          personnalisé. Après notification de votre décision, vous disposez de 14 jours pour retourner
          le bijou dans son état d'origine, non porté, avec son écrin.
        </p>
        <p>
          Les pièces réalisées sur-mesure, personnalisées, gravées, ou fabriquées/ajustées spécialement
          selon les spécifications du client, sont exclues du droit de rétractation conformément à
          l'article L221-28 du Code de la consommation, sauf défaut de conformité ou vice caché.
        </p>
        <p>
          En cas de rétractation valable, Nabe rembourse les sommes encaissées, y compris les frais de
          livraison standard facturés à la commande le cas échéant, dans un délai maximum de 14 jours
          à compter de la réception de la demande. Le remboursement peut être différé jusqu'à réception
          du bijou retourné ou jusqu'à fourniture d'une preuve d'expédition du retour.
        </p>
      </section>

      <section className="page-info__section">
        <h2>Article 7 — Garanties</h2>
        <p>
          Tous nos bijoux bénéficient de la garantie légale de conformité et de la garantie contre
          les vices cachés, conformément aux articles 1641 et suivants du Code civil.
        </p>
      </section>

      <section className="page-info__section">
        <h2>Article 8 — Sur-mesure</h2>
        <p>
          Les commandes sur-mesure font l'objet d'un devis préalable et d'un accord spécifique avec
          la cliente ou le client avant tout règlement. Le délai de fabrication est communiqué lors
          de l'acceptation du devis.
        </p>
        <p>
          Le paiement d'une création sur-mesure intervient après acceptation du devis, par lien de
          paiement sécurisé ou tout autre moyen indiqué dans le devis. La fabrication démarre après
          acceptation écrite du devis et encaissement du montant demandé. Une fois la fabrication
          lancée, la commande ne peut plus être annulée au titre du droit de rétractation, sauf défaut
          de conformité ou vice caché.
        </p>
      </section>

      <section className="page-info__section">
        <h2>Article 9 — Litiges et médiation</h2>
        <p>
          Les présentes CGV sont soumises au droit français. En cas de litige, une solution amiable
          sera recherchée en priorité avant toute action judiciaire. Conformément aux articles
          L.616-1 et R.616-1 du Code de la consommation, vous pouvez également recourir gratuitement
          à un médiateur de la consommation (voir nos{' '}
          <a href="/mentions-legales">Mentions légales</a> pour ses coordonnées), après démarche
          écrite préalable auprès de nous.
        </p>
      </section>

      <section className="page-info__section">
        <h2>Article 10 — Preuve et archivage</h2>
        <p>
          Les registres informatisés de Nabe et de son prestataire de paiement Stripe sont
          conservés dans des conditions raisonnables de sécurité et considérés comme preuve des
          communications, commandes et paiements intervenus entre les parties.
        </p>
      </section>

      <section className="page-info__section">
        <h2>Article 11 — Force majeure</h2>
        <p>
          Nabe ne pourra être tenue responsable de tout retard ou inexécution consécutif à la
          survenance d'un cas de force majeure habituellement reconnu par la jurisprudence française.
        </p>
      </section>

      <section className="page-info__section">
        <h2>Article 12 — Modification des CGV</h2>
        <p>
          Nabe se réserve le droit de modifier les présentes CGV à tout moment. Les CGV applicables
          sont celles en vigueur à la date de la commande.
        </p>
      </section>
    </div>
  );
}
