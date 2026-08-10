import { NextRequest, NextResponse } from 'next/server';
import { verifierSessionAdmin } from '@/lib/auth-helpers';
import { uploadVideoCloudinary } from '@/lib/cloudinary';

export const runtime = 'nodejs';

/**
 * Rapatrie une vidéo Instagram (fournie via son media_url, temporaire) vers
 * notre propre compte Cloudinary, pour obtenir une URL permanente qui ne
 * dépend plus d'Instagram. C'est ce lien Cloudinary qui est ensuite affiché
 * sur le site avec notre lecteur vidéo, sans jamais montrer la page
 * Instagram derrière.
 */
export async function POST(req: NextRequest) {
  const session = await verifierSessionAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { mediaUrl } = await req.json();
    if (!mediaUrl || typeof mediaUrl !== 'string') {
      return NextResponse.json({ error: 'Vidéo Instagram introuvable (media_url manquant).' }, { status: 400 });
    }

    const resultat = await uploadVideoCloudinary(mediaUrl);
    return NextResponse.json({ url: resultat.url });
  } catch (error) {
    console.error('Import vidéo Instagram → Cloudinary impossible :', error instanceof Error ? error.message : 'erreur inconnue');
    return NextResponse.json({ error: "Impossible d'importer cette vidéo depuis Instagram." }, { status: 502 });
  }
}
