import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let email: string;

    if (contentType.includes('application/json')) {
      const body = await req.json();
      email = body.email;
    } else {
      const formData = await req.formData();
      email = formData.get('email') as string;
    }

    email = email?.trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
    }

    await prisma.abonneNewsletter.upsert({
      where: { email },
      update: {},
      create: { email },
    });

    // Si la requête vient d'un formulaire HTML classique, on redirige
    if (!contentType.includes('application/json')) {
      return NextResponse.redirect(new URL('/?inscription=ok', req.url));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur newsletter:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
