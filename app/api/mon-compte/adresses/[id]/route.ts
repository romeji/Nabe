import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authClientOptions } from '@/lib/auth-client';
import { prisma } from '@/lib/prisma';

async function verifierAppartenance(adresseId: string, clientId: string) {
  const adresse = await prisma.adressePostale.findUnique({ where: { id: adresseId } });
  return adresse && adresse.clientId === clientId ? adresse : null;
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authClientOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Connexion requise' }, { status: 401 });
  }
  const clientId = (session.user as any).id as string;

  const adresseExistante = await verifierAppartenance(params.id, clientId);
  if (!adresseExistante) {
    return NextResponse.json({ error: 'Adresse introuvable' }, { status: 404 });
  }

  try {
    const body = await req.json();

    if (body.parDefaut) {
      await prisma.adressePostale.updateMany({ where: { clientId }, data: { parDefaut: false } });
    }

    const adresse = await prisma.adressePostale.update({
      where: { id: params.id },
      data: body,
    });

    return NextResponse.json(adresse);
  } catch (error: any) {
    console.error('Erreur modification adresse:', error);
    return NextResponse.json({ error: error.message || 'Erreur' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authClientOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Connexion requise' }, { status: 401 });
  }
  const clientId = (session.user as any).id as string;

  const adresseExistante = await verifierAppartenance(params.id, clientId);
  if (!adresseExistante) {
    return NextResponse.json({ error: 'Adresse introuvable' }, { status: 404 });
  }

  try {
    await prisma.adressePostale.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erreur suppression adresse:', error);
    return NextResponse.json({ error: error.message || 'Erreur' }, { status: 400 });
  }
}
