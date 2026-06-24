import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';
import { authClientOptions } from '@/lib/auth-client';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authClientOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Connexion requise' }, { status: 401 });
  }
  const clientId = (session.user as any).id as string;

  try {
    const { nom, telephone, motDePasseActuel, nouveauMotDePasse } = await req.json();

    const donnees: any = {};
    if (nom !== undefined) donnees.nom = nom;
    if (telephone !== undefined) donnees.telephone = telephone;

    if (nouveauMotDePasse) {
      const client = await prisma.client.findUnique({ where: { id: clientId } });
      if (!client) {
        return NextResponse.json({ error: 'Client introuvable' }, { status: 404 });
      }

      if (client.password) {
        if (!motDePasseActuel) {
          return NextResponse.json({ error: 'Mot de passe actuel requis.' }, { status: 400 });
        }
        const valide = await bcrypt.compare(motDePasseActuel, client.password);
        if (!valide) {
          return NextResponse.json({ error: 'Mot de passe actuel incorrect.' }, { status: 400 });
        }
      }

      if (nouveauMotDePasse.length < 6) {
        return NextResponse.json(
          { error: 'Le nouveau mot de passe doit contenir au moins 6 caractères.' },
          { status: 400 }
        );
      }

      donnees.password = await bcrypt.hash(nouveauMotDePasse, 10);
    }

    const client = await prisma.client.update({
      where: { id: clientId },
      data: donnees,
      select: { id: true, nom: true, email: true, telephone: true },
    });

    return NextResponse.json(client);
  } catch (error: any) {
    console.error('Erreur mise à jour profil:', error);
    return NextResponse.json({ error: error.message || 'Erreur' }, { status: 400 });
  }
}
