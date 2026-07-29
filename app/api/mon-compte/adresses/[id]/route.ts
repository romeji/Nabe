import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authClientOptions } from '@/lib/auth-client';
import { prisma } from '@/lib/prisma';

async function verifierAppartenance(adresseId: string, clientId: string) {
  const adresse = await prisma.adressePostale.findUnique({ where: { id: adresseId } });
  return adresse && adresse.clientId === clientId ? adresse : null;
}

export async function PATCH(req: NextRequest, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = await paramsPromise;
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

    // Sécurité : on ne prend en compte que les champs explicitement autorisés
    // (jamais le corps brut de la requête) pour empêcher un client de
    // modifier clientId, id, ou tout autre champ non prévu (assignation de masse).
    const donnees: Record<string, any> = {};
    for (const champ of ['libelle', 'destinataire', 'ligne1', 'ligne2', 'ville', 'codePostal', 'pays', 'telephone', 'parDefaut'] as const) {
      if (body[champ] !== undefined) donnees[champ] = body[champ];
    }

    for (const champ of ['libelle', 'destinataire', 'ligne1', 'ligne2', 'ville', 'codePostal', 'pays', 'telephone'] as const) {
      if (typeof donnees[champ] === 'string') donnees[champ] = donnees[champ].trim();
    }
    if ('libelle' in donnees && !donnees.libelle) donnees.libelle = null;
    if ('ligne2' in donnees && !donnees.ligne2) donnees.ligne2 = null;
    if ('telephone' in donnees && !donnees.telephone) donnees.telephone = null;
    if ('pays' in donnees && !donnees.pays) donnees.pays = 'France';

    if (
      ('destinataire' in donnees && !donnees.destinataire) ||
      ('ligne1' in donnees && !donnees.ligne1) ||
      ('ville' in donnees && !donnees.ville) ||
      ('codePostal' in donnees && !donnees.codePostal)
    ) {
      return NextResponse.json({ error: 'Champs obligatoires manquants.' }, { status: 400 });
    }

    if (donnees.parDefaut) {
      await prisma.adressePostale.updateMany({ where: { clientId }, data: { parDefaut: false } });
    }

    const adresse = await prisma.adressePostale.update({
      where: { id: params.id },
      data: donnees,
    });

    return NextResponse.json(adresse);
  } catch (error: any) {
    console.error('Erreur modification adresse:', error);
    return NextResponse.json({ error: error.message || 'Erreur' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = await paramsPromise;
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
    const etaitParDefaut = adresseExistante.parDefaut;
    await prisma.adressePostale.delete({ where: { id: params.id } });
    if (etaitParDefaut) {
      const suivante = await prisma.adressePostale.findFirst({
        where: { clientId },
        orderBy: { createdAt: 'desc' },
      });
      if (suivante) {
        await prisma.adressePostale.update({ where: { id: suivante.id }, data: { parDefaut: true } });
      }
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erreur suppression adresse:', error);
    return NextResponse.json({ error: error.message || 'Erreur' }, { status: 400 });
  }
}
