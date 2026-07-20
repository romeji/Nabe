import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifierTokenDesabonnement } from '@/lib/newsletter-token';

export async function POST(req: NextRequest) {
  try {
    const { email, token } = await req.json();

    if (!email || !token || !verifierTokenDesabonnement(email, token)) {
      return NextResponse.json({ error: 'Lien de désabonnement invalide.' }, { status: 400 });
    }

    await prisma.abonneNewsletter.updateMany({
      where: { email: email.toLowerCase().trim() },
      data: { actif: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur désabonnement newsletter:', error);
    return NextResponse.json({ error: 'Une erreur est survenue.' }, { status: 500 });
  }
}
