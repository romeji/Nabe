import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authClientOptions } from '@/lib/auth-client';
import { prisma } from '@/lib/prisma';
import { annulerCommande } from '@/lib/commandes';
import { verifierLimiteTaux, obtenirIp } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const { autorise } = await verifierLimiteTaux('commandes-annuler', obtenirIp(req), 10, 15);
    if (!autorise) {
      return NextResponse.json({ error: 'Trop de tentatives. Réessayez dans quelques minutes.' }, { status: 429 });
    }

    const { commandeId, numero, email } = await req.json();

    let commande;

    if (commandeId) {
      // Cas "client connecté" : on vérifie que la commande lui appartient bien.
      const session = await getServerSession(authClientOptions);
      const clientId = (session?.user as any)?.id as string | undefined;
      if (!clientId) {
        return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
      }

      commande = await prisma.commande.findUnique({ where: { id: commandeId } });
      if (!commande || commande.clientId !== clientId) {
        return NextResponse.json({ error: 'Commande introuvable.' }, { status: 404 });
      }
    } else if (numero && email) {
      // Cas "invité" (sans compte) : le numéro + l'e-mail utilisé à la commande font office de vérification.
      commande = await prisma.commande.findUnique({ where: { numero: numero.trim().toUpperCase() } });
      if (!commande || commande.clientEmail.toLowerCase() !== email.trim().toLowerCase()) {
        return NextResponse.json({ error: 'Aucune commande ne correspond à ces informations.' }, { status: 404 });
      }
    } else {
      return NextResponse.json({ error: 'Informations manquantes.' }, { status: 400 });
    }

    const resultat = await annulerCommande(commande.id);
    if (!resultat.ok) {
      return NextResponse.json({ error: resultat.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur annulation commande:', error);
    return NextResponse.json({ error: 'Une erreur est survenue.' }, { status: 500 });
  }
}
