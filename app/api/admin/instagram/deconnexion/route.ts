import { NextResponse } from 'next/server';
import { verifierSessionAdmin } from '@/lib/auth-helpers';
import { deconnecterCompteInstagram } from '@/lib/instagram-meta';

export const runtime = 'nodejs';

export async function DELETE() {
  const session = await verifierSessionAdmin();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  try {
    await deconnecterCompteInstagram();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Déconnexion Instagram impossible :', error instanceof Error ? error.message : 'erreur inconnue');
    return NextResponse.json({ error: 'Impossible de déconnecter Instagram.' }, { status: 500 });
  }
}
