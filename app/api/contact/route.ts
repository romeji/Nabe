import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const schema = z.object({
  nom: z.string().min(1),
  email: z.string().email(),
  sujet: z.string().min(1),
  message: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const donnees = schema.parse(body);

    await prisma.messageContact.create({
      data: donnees,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur contact:', error);
    return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
  }
}
