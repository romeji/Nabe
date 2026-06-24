import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authClientOptions } from '@/lib/auth-client';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authClientOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Connexion requise' }, { status: 401 });
  }
  const clientId = (session.user as any).id as string;

  const adresses = await prisma.adressePostale.findMany({
    where: { clientId },
    orderBy: [{ parDefaut: 'desc' }, { createdAt: 'desc' }],
  });

  return NextResponse.json(adresses);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authClientOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Connexion requise' }, { status: 401 });
  }
  const clientId = (session.user as any).id as string;

  try {
    const { libelle, destinataire, ligne1, ligne2, ville, codePostal, pays, telephone, parDefaut } =
      await req.json();

    if (!destinataire || !ligne1 || !ville || !codePostal) {
      return NextResponse.json({ error: 'Champs obligatoires manquants.' }, { status: 400 });
    }

    if (parDefaut) {
      await prisma.adressePostale.updateMany({ where: { clientId }, data: { parDefaut: false } });
    }

    const nombreAdresses = await prisma.adressePostale.count({ where: { clientId } });

    const adresse = await prisma.adressePostale.create({
      data: {
        clientId,
        libelle,
        destinataire,
        ligne1,
        ligne2,
        ville,
        codePostal,
        pays: pays || 'France',
        telephone,
        parDefaut: parDefaut || nombreAdresses === 0,
      },
    });

    return NextResponse.json(adresse, { status: 201 });
  } catch (error: any) {
    console.error('Erreur création adresse:', error);
    return NextResponse.json({ error: error.message || 'Erreur' }, { status: 400 });
  }
}
