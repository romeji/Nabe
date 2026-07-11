'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formaterPrix } from '@/lib/utils';
import './suivi-commande.css';

type LigneCommande = {
  id: string;
  nomProduit: string;
  taille: string | null;
  quantite: number;
  prixUnitaire: string | number;
};

export type CommandeDetail = {
  id: string;
  numero: string;
  statut: string;
  createdAt: string | Date;
  clientNom: string;
  adresseLivraison: string | null;
  ville: string | null;
  codePostal: string | null;
  modeLivraison: string | null;
  pointRelaisNom: string | null;
  pointRelaisAdresse: string | null;
  numeroSuivi: string | null;
  urlSuivi: string | null;
  sousTotal: string | number;
  montantReduction: string | number;
  fraisLivraison: string | number;
  total: string | number;
  lignes: LigneCommande[];
};

const ETAPES = [
  { cle: 'PAYEE', label: 'Commande confirmée' },
  { cle: 'EN_PREPARATION', label: 'En préparation' },
  { cle: 'EXPEDIEE', label: 'Expédiée' },
  { cle: 'LIVREE', label: 'Livrée' },
];

const STATUTS_ANNULABLES = ['EN_ATTENTE', 'PAYEE', 'EN_PREPARATION'];

export default function SuiviCommandeDetail({
  commande,
  modeAnnulation,
}: {
  commande: CommandeDetail;
  /** 'connecte' envoie commandeId (vérifié via la session), 'invite' envoie numero+email. */
  modeAnnulation: { type: 'connecte'; commandeId: string } | { type: 'invite'; numero: string; email: string };
}) {
  const router = useRouter();
  const [confirmationDemandee, setConfirmationDemandee] = useState(false);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState('');
  const [annulee, setAnnulee] = useState(false);

  const estAnnulee = commande.statut === 'ANNULEE' || commande.statut === 'REMBOURSEE' || annulee;
  const peutAnnuler = STATUTS_ANNULABLES.includes(commande.statut) && !annulee;
  const etapeActuelle = ETAPES.findIndex((e) => e.cle === commande.statut);

  async function confirmerAnnulation() {
    setEnCours(true);
    setErreur('');
    try {
      const res = await fetch('/api/commandes/annuler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          modeAnnulation.type === 'connecte'
            ? { commandeId: modeAnnulation.commandeId }
            : { numero: modeAnnulation.numero, email: modeAnnulation.email }
        ),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de l’annulation.');
      setAnnulee(true);
      setConfirmationDemandee(false);
      router.refresh();
    } catch (e: any) {
      setErreur(e.message || 'Erreur lors de l’annulation.');
    } finally {
      setEnCours(false);
    }
  }

  return (
    <div className="suivi-commande">
      <div className="suivi-commande__entete">
        <div>
          <h2>{commande.numero}</h2>
          <p>Passée le {new Date(commande.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <span className={`suivi-commande__badge suivi-commande__badge--${commande.statut.toLowerCase()}`}>
          {estAnnulee ? (commande.statut === 'REMBOURSEE' || annulee ? 'Remboursée' : 'Annulée') : ETAPES[etapeActuelle]?.label || 'En attente de paiement'}
        </span>
      </div>

      {!estAnnulee && (
        <div className="suivi-commande__timeline">
          {ETAPES.map((etape: any, i: number) => (
            <div key={etape.cle} className={`suivi-commande__etape${i <= etapeActuelle ? ' suivi-commande__etape--faite' : ''}`}>
              <span className="suivi-commande__point" />
              <span>{etape.label}</span>
            </div>
          ))}
        </div>
      )}

      <div className="suivi-commande__bloc">
        <h3>Livraison</h3>
        {commande.modeLivraison === 'mondial_relay' && commande.pointRelaisNom ? (
          <p>
            Point relais : <strong>{commande.pointRelaisNom}</strong>
            <br />
            {commande.pointRelaisAdresse}
          </p>
        ) : (
          <p>
            {commande.adresseLivraison}
            <br />
            {commande.codePostal} {commande.ville}
          </p>
        )}
        {commande.numeroSuivi && (
          <p style={{ marginTop: '0.5rem' }}>
            Numéro de suivi : <strong>{commande.numeroSuivi}</strong>
            {commande.urlSuivi && (
              <>
                {' '}
                — <a href={commande.urlSuivi} target="_blank" rel="noreferrer">suivre mon colis</a>
              </>
            )}
          </p>
        )}
      </div>

      <div className="suivi-commande__bloc">
        <h3>Articles</h3>
        <ul className="suivi-commande__lignes">
          {commande.lignes.map((l: any) => (
            <li key={l.id}>
              <span>
                {l.quantite} × {l.nomProduit}
                {l.taille ? ` (taille ${l.taille})` : ''}
              </span>
              <span>{formaterPrix(Number(l.prixUnitaire) * l.quantite)}</span>
            </li>
          ))}
        </ul>
        <div className="suivi-commande__totaux">
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
          <div className="suivi-commande__total-final">
            <span>Total</span>
            <span>{formaterPrix(commande.total)}</span>
          </div>
        </div>
      </div>

      {peutAnnuler && (
        <div className="suivi-commande__annulation">
          {!confirmationDemandee ? (
            <button type="button" className="btn" onClick={() => setConfirmationDemandee(true)}>
              Annuler la commande
            </button>
          ) : (
            <div className="suivi-commande__confirmation">
              <p>
                Confirmer l’annulation ? Vous serez intégralement remboursé(e) (produits + livraison) sous quelques
                jours ouvrés sur votre moyen de paiement d’origine.
              </p>
              <div>
                <button type="button" className="btn btn-primaire" disabled={enCours} onClick={confirmerAnnulation}>
                  {enCours ? 'Annulation...' : 'Oui, annuler et rembourser'}
                </button>
                <button type="button" className="btn" onClick={() => setConfirmationDemandee(false)} disabled={enCours}>
                  Retour
                </button>
              </div>
              {erreur && <p className="suivi-commande__erreur">{erreur}</p>}
            </div>
          )}
        </div>
      )}

      {commande.statut === 'EXPEDIEE' || commande.statut === 'LIVREE' ? (
        <p className="suivi-commande__aide">
          Cette commande a déjà été expédiée. Pour un retour ou un souci avec votre colis, contactez-nous directement.
        </p>
      ) : null}

      {annulee && <p className="suivi-commande__succes">Votre commande a bien été annulée et remboursée.</p>}
    </div>
  );
}
