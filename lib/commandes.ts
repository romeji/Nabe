import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { resend, EMAIL_EXPEDITEUR, genererHtmlAnnulationCommande } from '@/lib/resend';
import { getContenuPage } from '@/lib/contenu';

/**
 * Statuts à partir desquels un client peut encore annuler lui-même sa
 * commande : avant l'expédition. Une fois "EXPEDIEE" ou "LIVREE", l'auto-
 * annulation n'est plus proposée (il faut alors gérer un retour, pas une
 * simple annulation) — voir la doc pour le détail du raisonnement.
 */
export const STATUTS_ANNULABLES_PAR_CLIENT = ['EN_ATTENTE', 'PAYEE'];

/**
 * Annule une commande : rembourse intégralement via Stripe (produits + frais
 * de port, puisqu'aucune expédition n'a encore été engagée à ce stade
 * — voir la documentation pour l'explication complète),
 * remet le stock à disposition, journalise le mouvement, passe la commande
 * en statut ANNULEE/REMBOURSEE et prévient le client par e-mail.
 *
 * Ne fait aucune vérification de propriété/autorisation : c'est la
 * responsabilité de l'appelant (route API) de vérifier que la personne qui
 * demande l'annulation a bien le droit de le faire.
 */
export async function annulerCommande(commandeId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const commande = await prisma.commande.findUnique({
    where: { id: commandeId },
    include: { lignes: true },
  });

  if (!commande) return { ok: false, error: 'Commande introuvable.' };

  if (!STATUTS_ANNULABLES_PAR_CLIENT.includes(commande.statut)) {
    return {
      ok: false,
      error:
        commande.statut === 'EXPEDIEE' || commande.statut === 'LIVREE'
          ? 'Cette commande a déjà été expédiée : contactez-nous directement pour un retour.'
          : 'Cette commande ne peut plus être annulée.',
    };
  }

  let rembourse = false;

  // Remboursement Stripe intégral (produits + livraison), uniquement si un
  // paiement a bien été capturé (statut au-delà de EN_ATTENTE).
  if (commande.statut !== 'EN_ATTENTE' && commande.stripePaymentIntentId) {
    try {
      await stripe.refunds.create({ payment_intent: commande.stripePaymentIntentId });
      rembourse = true;
    } catch (err: any) {
      // Si Stripe indique que la charge est déjà remboursée, ce n'est pas un
      // échec côté nous : on continue le reste du processus normalement.
      if (err?.code !== 'charge_already_refunded') {
        console.error('Erreur remboursement Stripe:', err);
        return { ok: false, error: "Le remboursement n'a pas pu être effectué. Réessayez ou contactez le support." };
      }
      rembourse = true;
    }
  }

  // Remise en stock des articles (global + par taille), et journalisation.
  for (const ligne of commande.lignes) {
    if (!ligne.produitId) continue;

    const produit = await prisma.produit.findUnique({
      where: { id: ligne.produitId },
      include: { stockTailles: true },
    });
    if (!produit) continue;

    await prisma.produit.update({
      where: { id: produit.id },
      data: { stock: { increment: ligne.quantite }, nombreVentes: { decrement: ligne.quantite } },
    });

    if (ligne.taille) {
      const stockTaille = produit.stockTailles.find((s: any) => s.taille === ligne.taille);
      if (stockTaille) {
        await prisma.stockTaille.update({
          where: { id: stockTaille.id },
          data: { quantite: { increment: ligne.quantite } },
        });
      }
    }

    await prisma.mouvementStock.create({
      data: {
        produitId: produit.id,
        produitNom: produit.nom,
        type: 'ENTREE',
        quantite: ligne.quantite,
        motif: `Annulation commande ${commande.numero}`,
      },
    });
  }

  const nouveauStatut = rembourse ? 'REMBOURSEE' : 'ANNULEE';

  await prisma.commande.update({
    where: { id: commande.id },
    data: { statut: nouveauStatut },
  });

  if (commande.clientEmail) {
    try {
      const emailsContenu = await getContenuPage('emails');
      const sujetDefaut = `Commande {numero} ${rembourse ? 'remboursée' : 'annulée'} — Nabe`;
      await resend.emails.send({
        from: EMAIL_EXPEDITEUR,
        to: commande.clientEmail,
        subject: (emailsContenu.commande_annulee_sujet || sujetDefaut).replace('{numero}', commande.numero),
        html: genererHtmlAnnulationCommande({
          prenom: commande.clientNom.split(' ')[0] || 'vous',
          numero: commande.numero,
          total: Number(commande.total),
          rembourse,
          messagePersonnalise: emailsContenu.commande_annulee_message,
        }),
      });
    } catch (err) {
      console.error("Erreur envoi email d'annulation (commande annulée quand même) :", err);
    }
  }

  return { ok: true };
}
