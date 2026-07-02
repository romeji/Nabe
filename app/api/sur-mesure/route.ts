import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const schema = z.object({
  modeleSelectionne: z.string().optional().nullable(),
  tailleSouhaitee: z.string().optional().nullable(),
  matiere: z.string().optional().nullable(),
  pierre: z.string().optional().nullable(),
  gravure: z.string().optional().nullable(),
  message: z.string().min(1),
  nom: z.string().min(1),
  email: z.string().email(),
  telephone: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const donnees = schema.parse(body);

    await prisma.demandeSurMesure.create({
      data: {
        modeleSelectionne: donnees.modeleSelectionne || undefined,
        tailleSouhaitee: donnees.tailleSouhaitee || undefined,
        matiere: donnees.matiere || undefined,
        pierre: donnees.pierre || undefined,
        gravure: donnees.gravure || undefined,
        message: donnees.message,
        nom: donnees.nom,
        email: donnees.email,
        telephone: donnees.telephone || undefined,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur sur-mesure:', error);
    return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
  }
}
