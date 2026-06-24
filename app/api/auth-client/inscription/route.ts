import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const schema = z.object({
  nom: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const donnees = schema.parse(body);

    const existant = await prisma.client.findUnique({ where: { email: donnees.email } });
    if (existant) {
      return NextResponse.json(
        { error: 'Un compte existe déjà avec cet e-mail. Essayez de vous connecter.' },
        { status: 400 }
      );
    }

    const motDePasseHash = await bcrypt.hash(donnees.password, 10);

    const client = await prisma.client.create({
      data: {
        nom: donnees.nom,
        email: donnees.email,
        password: motDePasseHash,
      },
    });

    return NextResponse.json({ id: client.id, email: client.email }, { status: 201 });
  } catch (error: any) {
    console.error('Erreur inscription client:', error);
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors[0]?.message || 'Données invalides' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Erreur' }, { status: 400 });
  }
}
