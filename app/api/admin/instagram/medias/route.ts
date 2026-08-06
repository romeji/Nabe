import { NextResponse } from 'next/server';
import { verifierSessionAdmin } from '@/lib/auth-helpers';
import { listerVideosInstagram } from '@/lib/instagram-meta';

export const runtime = 'nodejs';

export async function GET() {
  const session = await verifierSessionAdmin();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  try {
    return NextResponse.json({ videos: await listerVideosInstagram() });
  } catch (error) {
    console.error('Lecture des vidéos Instagram impossible :', error instanceof Error ? error.message : 'erreur inconnue');
    return NextResponse.json({ error: 'Impossible de récupérer les vidéos Instagram.' }, { status: 502 });
  }
}
