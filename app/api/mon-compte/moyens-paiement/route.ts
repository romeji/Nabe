import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authClientOptions } from '@/lib/auth-client';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authClientOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Connexion requise' }, { status: 401 });
  }
  const clientId = (session.user as any).id as string;

  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client?.stripeCustomerId) {
    return NextResponse.json({ moyensPaiement: [] });
  }

  try {
    const [methodes, customer] = await Promise.all([
      stripe.paymentMethods.list({ customer: client.stripeCustomerId, type: 'card' }),
      stripe.customers.retrieve(client.stripeCustomerId),
    ]);

    const idParDefaut =
      typeof customer !== 'string' && !customer.deleted
        ? (customer.invoice_settings?.default_payment_method as string | null)
        : null;

    const moyensPaiement = methodes.data.map((m) => ({
      id: m.id,
      marque: m.card?.brand || 'carte',
      derniers4: m.card?.last4 || '----',
      moisExpiration: m.card?.exp_month,
      anneeExpiration: m.card?.exp_year,
      parDefaut: m.id === idParDefaut,
    }));

    return NextResponse.json({ moyensPaiement });
  } catch (error: any) {
    console.error('Erreur récupération moyens de paiement:', error);
    return NextResponse.json({ error: error.message || 'Erreur' }, { status: 500 });
  }
}
