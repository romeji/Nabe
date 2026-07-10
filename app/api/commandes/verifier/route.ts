import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Utilisé uniquement par la page de succès juste après le paiement : ne
 * renvoie que le numéro de commande (aucune donnée sensible), à partir de
 * l'identifiant de PaymentIntent Stripe présent dans l'URL de retour.
 */
export async function GET(req: NextRequest) {
  const paymentIntent = req.nextUrl.searchParams.get('payment_intent');
  if (!paymentIntent) {
    return NextResponse.json({ error: 'Paramètre manquant.' }, { status: 400 });
  }

  const commande = await prisma.commande.findUnique({
    where: { stripePaymentIntentId: paymentIntent },
    select: { numero: true, statut: true },
  });

  if (!commande) {
    // La commande n'existe pas encore (le webhook Stripe peut avoir quelques
    // secondes de latence) : 404, le front retente automatiquement.
    return NextResponse.json({ error: 'Commande pas encore créée.' }, { status: 404 });
  }

  return NextResponse.json({ numero: commande.numero });
}
