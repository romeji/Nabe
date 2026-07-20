'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { formaterPrix } from '@/lib/utils';
import './suivi-commande.css';

type LigneCommande = {
  id: string;
  nomProduit: string;
  imageUrl: string | null;
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
  pays: string | null;
  modeLivraison: string | null;
  modePaiementLabel: string | null;
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
  urlFacture,
  tvaApplicable = false,
  tvaTaux = 20,
}: {
  commande: CommandeDetail;
  /** 'connecte' envoie commandeId (vérifié via la session), 'invite' envoie numero+email. */
  modeAnnulation: { type: 'connecte'; commandeId: string } | { type: 'invite'; numero: string; email: string };
  /** Lien vers la page facture imprimable ; masqué si non fourni (ex: commande invité). */
  urlFacture?: string;
  tvaApplicable?: boolean;
  tvaTaux?: number;
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
        <h3>Livraison à :</h3>
        {commande.modeLivraison === 'mondial_relay' && commande.pointRelaisNom ? (
          <p>
            Point relais : <strong>{commande.pointRelaisNom}</strong>
            <br />
            {commande.pointRelaisAdresse}
          </p>
        ) : (
          <p>
            {commande.clientNom}
            <br />
            {commande.adresseLivraison}
            <br />
            {commande.codePostal} {commande.ville}
            {commande.pays ? `, ${commande.pays}` : ''}
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

      {commande.modePaiementLabel && (
        <div className="suivi-commande__bloc">
          <h3>Mode de paiement</h3>
          <p>{commande.modePaiementLabel}</p>
        </div>
      )}

      <div className="suivi-commande__bloc">
        <h3>Articles</h3>
        <ul className="suivi-commande__lignes">
          {commande.lignes.map((l: any) => (
            <li key={l.id} className="suivi-commande__ligne-article">
              <div className="suivi-commande__ligne-image">
                {l.imageUrl ? (
                  <Image src={l.imageUrl} alt={l.nomProduit} width={52} height={52} style={{ objectFit: 'cover' }} />
                ) : (
                  <div className="suivi-commande__ligne-placeholder" />
                )}
              </div>
              <span className="suivi-commande__ligne-nom">
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
          {tvaApplicable ? (
            (() => {
              const total = Number(commande.total);
              const totalHT = total / (1 + tvaTaux / 100);
              const montantTva = total - totalHT;
              return (
                <>
                  <div>
                    <span>Total hors TVA</span>
                    <span>{formaterPrix(totalHT)}</span>
                  </div>
                  <div>
                    <span>Estimation de la TVA ({tvaTaux}%)</span>
                    <span>{formaterPrix(montantTva)}</span>
                  </div>
                  <div className="suivi-commande__total-final">
                    <span>Montant total TTC</span>
                    <span>{formaterPrix(total)}</span>
                  </div>
                </>
              );
            })()
          ) : (
            <div className="suivi-commande__total-final">
              <span>Total</span>
              <span>{formaterPrix(commande.total)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="suivi-commande__actions-secondaires">
        {urlFacture && (
          <a href={urlFacture} target="_blank" rel="noreferrer" className="btn">
            Télécharger la facture
          </a>
        )}
        <Link
          href={`/contact?type=probleme&sujet=${encodeURIComponent(`Problème avec ma commande ${commande.numero}`)}&message=${encodeURIComponent(`Bonjour,\n\nJ'ai un problème concernant ma commande ${commande.numero}.\n\n`)}`}
          className="btn"
        >
          Signaler un problème
        </Link>
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
