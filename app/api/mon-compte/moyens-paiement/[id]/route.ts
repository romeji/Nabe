import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authClientOptions } from '@/lib/auth-client';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

async function recupererClientEtVerifier(clientId: string, paymentMethodId: string) {
  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client?.stripeCustomerId) return null;

  const methode = await stripe.paymentMethods.retrieve(paymentMethodId);
  if (methode.customer !== client.stripeCustomerId) return null;

  return client;
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authClientOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Connexion requise' }, { status: 401 });
  }
  const clientId = (session.user as any).id as string;

  const client = await recupererClientEtVerifier(clientId, params.id);
  if (!client) {
    return NextResponse.json({ error: 'Moyen de paiement introuvable' }, { status: 404 });
  }

  try {
    await stripe.customers.update(client.stripeCustomerId!, {
      invoice_settings: { default_payment_method: params.id },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erreur définition moyen par défaut:', error);
    return NextResponse.json({ error: error.message || 'Erreur' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authClientOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Connexion requise' }, { status: 401 });
  }
  const clientId = (session.user as any).id as string;

  const client = await recupererClientEtVerifier(clientId, params.id);
  if (!client) {
    return NextResponse.json({ error: 'Moyen de paiement introuvable' }, { status: 404 });
  }

  try {
    await stripe.paymentMethods.detach(params.id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erreur suppression moyen de paiement:', error);
    return NextResponse.json({ error: error.message || 'Erreur' }, { status: 400 });
  }
}
