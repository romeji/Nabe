import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authClientOptions } from '@/lib/auth-client';
import { stripe } from '@/lib/stripe';
import { getOuCreerStripeCustomerId } from '@/lib/stripe-customer';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authClientOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Connexion requise' }, { status: 401 });
  }
  const clientId = (session.user as any).id as string;

  try {
    const stripeCustomerId = await getOuCreerStripeCustomerId(clientId);

    const setupIntent = await stripe.setupIntents.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
    });

    return NextResponse.json({ clientSecret: setupIntent.client_secret });
  } catch (error: any) {
    console.error('Erreur création SetupIntent:', error);
    return NextResponse.json({ error: error.message || 'Erreur' }, { status: 500 });
  }
}
