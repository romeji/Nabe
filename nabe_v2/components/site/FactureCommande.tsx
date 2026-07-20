'use client';

import { formaterPrix } from '@/lib/utils';
import './facture-commande.css';

type LigneFacture = {
  id: string;
  nomProduit: string;
  taille: string | null;
  quantite: number;
  prixUnitaire: string | number;
};

export type DonneesFacture = {
  numero: string;
  createdAt: string | Date;
  clientNom: string;
  clientEmail: string;
  adresseLivraison: string | null;
  ville: string | null;
  codePostal: string | null;
  pays: string | null;
  modePaiementLabel: string | null;
  sousTotal: string | number;
  montantReduction: string | number;
  fraisLivraison: string | number;
  total: string | number;
  lignes: LigneFacture[];
};

export type IdentiteFacturation = {
  nom: string;
  adresse: string;
  siret: string;
  tvaApplicable: boolean;
  tvaTaux: number;
};

/**
 * Facture imprimable en HTML — volontairement sans dépendance PDF côté
 * serveur (fragile en environnement serverless). Le bouton "Imprimer /
 * Enregistrer en PDF" utilise l'impression native du navigateur, qui permet
 * d'enregistrer en PDF sur tous les systèmes sans aucune dépendance.
 */
export default function FactureCommande({
  commande,
  identite,
}: {
  commande: DonneesFacture;
  identite: IdentiteFacturation;
}) {
  const total = Number(commande.total);
  const totalHT = identite.tvaApplicable ? total / (1 + identite.tvaTaux / 100) : total;
  const montantTva = identite.tvaApplicable ? total - totalHT : 0;

  return (
    <div className="facture">
      <div className="facture__actions-ecran">
        <button type="button" className="btn btn-primaire" onClick={() => window.print()}>
          Imprimer / Enregistrer en PDF
        </button>
      </div>

      <div className="facture__papier">
        <div className="facture__entete">
          <div>
            <h1>{identite.nom}</h1>
            {identite.adresse && <p>{identite.adresse}</p>}
            {identite.siret ? (
              <p>SIRET : {identite.siret}</p>
            ) : (
              <p className="facture__mention">Auto-entrepreneur en cours d'immatriculation</p>
            )}
          </div>
          <div className="facture__entete-droite">
            <h2>Facture</h2>
            <p>
              N° <strong>{commande.numero}</strong>
            </p>
            <p>
              {new Date(commande.createdAt).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>

        <div className="facture__adresses">
          <div>
            <h3>Facturé à</h3>
            <p>{commande.clientNom}</p>
            <p>{commande.clientEmail}</p>
          </div>
          <div>
            <h3>Livré à</h3>
            <p>{commande.adresseLivraison}</p>
            <p>
              {commande.codePostal} {commande.ville}
            </p>
            <p>{commande.pays}</p>
          </div>
        </div>

        <table className="facture__table">
          <thead>
            <tr>
              <th>Article</th>
              <th>Qté</th>
              <th>Prix unitaire</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {commande.lignes.map((l) => (
              <tr key={l.id}>
                <td>
                  {l.nomProduit}
                  {l.taille ? ` (taille ${l.taille})` : ''}
                </td>
                <td>{l.quantite}</td>
                <td>{formaterPrix(l.prixUnitaire)}</td>
                <td>{formaterPrix(Number(l.prixUnitaire) * l.quantite)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="facture__totaux">
          <div>
            <span>Sous-total</span>
            <span>{formaterPrix(commande.sousTotal)}</span>
          </div>
          {Number(commande.montantReduction) > 0 && (
            <div>
              <span>Réduction</span>
              <span>−{formaterPrix(commande.montantReduction)}</span>
            </div>
          )}
          <div>
            <span>Livraison</span>
            <span>{Number(commande.fraisLivraison) === 0 ? 'Offerte' : formaterPrix(commande.fraisLivraison)}</span>
          </div>
          {identite.tvaApplicable ? (
            <>
              <div>
                <span>Total HT</span>
                <span>{formaterPrix(totalHT)}</span>
              </div>
              <div>
                <span>TVA ({identite.tvaTaux}%)</span>
                <span>{formaterPrix(montantTva)}</span>
              </div>
              <div className="facture__total-final">
                <span>Total TTC</span>
                <span>{formaterPrix(total)}</span>
              </div>
            </>
          ) : (
            <>
              <div className="facture__mention-tva">
                <span>TVA non applicable, art. 293 B du CGI</span>
              </div>
              <div className="facture__total-final">
                <span>Total</span>
                <span>{formaterPrix(total)}</span>
              </div>
            </>
          )}
        </div>

        {commande.modePaiementLabel && (
          <p className="facture__paiement">Payé par {commande.modePaiementLabel}</p>
        )}
      </div>
    </div>
  );
}
