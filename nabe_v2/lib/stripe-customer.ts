import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

/**
 * Récupère le Stripe Customer ID du client, ou en crée un si c'est la première
 * fois qu'il interagit avec le système de paiement (ajout d'une carte).
 */
export async function getOuCreerStripeCustomerId(clientId: string): Promise<string> {
  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) throw new Error('Client introuvable');

  if (client.stripeCustomerId) {
    return client.stripeCustomerId;
  }

  const customer = await stripe.customers.create({
    email: client.email,
    name: client.nom || undefined,
    metadata: { clientId },
  });

  await prisma.client.update({
    where: { id: clientId },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}
