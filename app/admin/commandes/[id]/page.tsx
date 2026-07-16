import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formaterPrix, LABELS_STATUT_COMMANDE } from '@/lib/utils';
import StatutCommandeSelect from '@/components/admin/StatutCommandeSelect';
import '../commandes.css';

export default async function PageAdminDetailCommande({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');

  const params = await paramsPromise;
  const commande = await prisma.commande.findUnique({
    where: { id: params.id },
    include: { lignes: true },
  });
  if (!commande) notFound();

  return (
    <div className="admin-commande-detail">
      <div className="admin-entete">
        <div>
          <Link href="/admin/commandes" className="admin-dashboard__lien">
            ← Toutes les ventes
          </Link>
          <h1>Commande {commande.numero}</h1>
        </div>
        <Link href={`/admin/commandes/${commande.id}/facture`} className="btn btn-primaire" target="_blank">
          Télécharger la facture
        </Link>
      </div>

      <div className="admin-carte admin-commande-detail__section">
        <div className="admin-commande-detail__ligne-info">
          <div>
            <strong>Date</strong>
            <p>
              {new Date(commande.createdAt).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
          <div>
            <strong>Statut</strong>
            <StatutCommandeSelect commandeId={commande.id} statutInitial={commande.statut} />
          </div>
          <div>
            <strong>Mode de paiement</strong>
            <p>{commande.modePaiementLabel || '—'}</p>
          </div>
        </div>
      </div>

      <div className="admin-commande-detail__grille">
        <div className="admin-carte admin-commande-detail__section">
          <h2>Client</h2>
          <p>{commande.clientNom}</p>
          <p>{commande.clientEmail}</p>
          {commande.clientTelephone && <p>{commande.clientTelephone}</p>}
        </div>

        <div className="admin-carte admin-commande-detail__section">
          <h2>Livraison à</h2>
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
              <br />
              {commande.pays}
            </p>
          )}
          {commande.numeroSuivi && (
            <p style={{ marginTop: '0.5rem' }}>
              Suivi : <strong>{commande.numeroSuivi}</strong>
            </p>
          )}
        </div>
      </div>

      <div className="admin-carte admin-commande-detail__section">
        <h2>Articles</h2>
        <div className="admin-commande-detail__articles">
          {commande.lignes.map((l) => (
            <div key={l.id} className="admin-commande-detail__article">
              <div className="admin-commande-detail__article-image">
                {l.imageUrl ? (
                  <Image src={l.imageUrl} alt={l.nomProduit} width={56} height={56} style={{ objectFit: 'cover' }} />
                ) : (
                  <div className="admin-commande-detail__article-placeholder" />
                )}
              </div>
              <div className="admin-commande-detail__article-info">
                <p>{l.nomProduit}</p>
                {l.taille && <span>Taille {l.taille}</span>}
              </div>
              <span>{l.quantite} ×</span>
              <span>{formaterPrix(l.prixUnitaire.toString())}</span>
              <strong>{formaterPrix(Number(l.prixUnitaire) * l.quantite)}</strong>
            </div>
          ))}
        </div>

        <div className="admin-commande-detail__totaux">
          <div>
            <span>Sous-total</span>
            <span>{formaterPrix(commande.sousTotal.toString())}</span>
          </div>
          {Number(commande.montantReduction) > 0 && (
            <div>
              <span>Réduction</span>
              <span>−{formaterPrix(commande.montantReduction.toString())}</span>
            </div>
          )}
          <div>
            <span>Livraison</span>
            <span>{Number(commande.fraisLivraison) === 0 ? 'Offerte' : formaterPrix(commande.fraisLivraison.toString())}</span>
          </div>
          <div className="admin-commande-detail__total-final">
            <span>Total</span>
            <span>{formaterPrix(commande.total.toString())}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
