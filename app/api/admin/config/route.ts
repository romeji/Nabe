import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifierSessionAdmin } from '@/lib/auth-helpers';
import { DEFAUTS_CONFIG, getConfigSite } from '@/lib/config-site';

export async function GET(req: NextRequest) {
  const session = await verifierSessionAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const config = await getConfigSite();
  return NextResponse.json(config);
}

export async function POST(req: NextRequest) {
  const session = await verifierSessionAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const donnees: Record<string, string> = await req.json();

    const entreesAutorisees = Object.entries(donnees).filter(([cle]) =>
      Object.prototype.hasOwnProperty.call(DEFAUTS_CONFIG, cle)
    );

    await Promise.all(
      entreesAutorisees.map(([cle, valeur]) =>
        prisma.configSite.upsert({
          where: { cle },
          update: { valeur: String(valeur) },
          create: { cle, valeur: String(valeur) },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erreur sauvegarde config:', error);
    return NextResponse.json({ error: error.message || 'Erreur' }, { status: 400 });
  }
}
