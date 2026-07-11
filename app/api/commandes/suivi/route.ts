import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifierLimiteTaux, obtenirIp } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const { autorise } = await verifierLimiteTaux('commandes-suivi', obtenirIp(req), 10, 15);
    if (!autorise) {
      return NextResponse.json({ error: 'Trop de tentatives. Réessayez dans quelques minutes.' }, { status: 429 });
    }

    const { numero, email } = await req.json();

    if (!numero?.trim() || !email?.trim()) {
      return NextResponse.json({ error: 'Merci de renseigner le numéro de commande et l’e-mail utilisé.' }, { status: 400 });
    }

    const commande = await prisma.commande.findUnique({
      where: { numero: numero.trim().toUpperCase() },
      include: { lignes: true },
    });

    // Message volontairement générique (ne pas confirmer si le numéro existe
    // ou non) pour ne pas permettre de deviner des numéros de commande valides.
    if (!commande || commande.clientEmail.toLowerCase() !== email.trim().toLowerCase()) {
      return NextResponse.json({ error: 'Aucune commande ne correspond à ces informations.' }, { status: 404 });
    }

    return NextResponse.json({ commande });
  } catch (error) {
    console.error('Erreur suivi commande:', error);
    return NextResponse.json({ error: 'Une erreur est survenue.' }, { status: 500 });
  }
}
