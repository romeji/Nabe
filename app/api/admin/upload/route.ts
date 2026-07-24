import { NextRequest, NextResponse } from 'next/server';
import { verifierSessionAdmin } from '@/lib/auth-helpers';
import { uploadImageCloudinary } from '@/lib/cloudinary';

const TAILLE_MAX_BASE64 = 8 * 1024 * 1024;
const IMAGE_DATA_URL_AUTORISEE = /^data:image\/(png|jpe?g|webp|gif);base64,[a-z0-9+/=\s]+$/i;

function typeImageDetecte(buffer: Buffer): 'png' | 'jpg' | 'webp' | 'gif' | null {
  if (buffer.length < 12) return null;
  if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png';
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'jpg';
  if (buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP') return 'webp';
  if (buffer.subarray(0, 6).toString('ascii') === 'GIF87a' || buffer.subarray(0, 6).toString('ascii') === 'GIF89a') return 'gif';
  return null;
}

export async function POST(req: NextRequest) {
  const session = await verifierSessionAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { fichier } = await req.json();

    if (!fichier || typeof fichier !== 'string') {
      return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 });
    }

    if (fichier.length > TAILLE_MAX_BASE64 || !IMAGE_DATA_URL_AUTORISEE.test(fichier)) {
      return NextResponse.json({ error: 'Format image invalide ou fichier trop volumineux.' }, { status: 400 });
    }

    const [, meta, base64] = fichier.match(/^data:image\/(png|jpe?g|webp|gif);base64,([\s\S]+)$/i) || [];
    const buffer = Buffer.from(base64 || '', 'base64');
    const typeDetecte = typeImageDetecte(buffer);
    const typeDeclare = meta?.toLowerCase() === 'jpeg' ? 'jpg' : meta?.toLowerCase();

    if (!typeDetecte || typeDetecte !== typeDeclare) {
      return NextResponse.json({ error: 'Le contenu du fichier ne correspond pas au type image annoncé.' }, { status: 400 });
    }

    const resultat = await uploadImageCloudinary(fichier);

    return NextResponse.json(resultat);
  } catch (error: any) {
    console.error('Erreur upload Cloudinary:', error);
    return NextResponse.json(
      { error: error.message || "Erreur lors de l'upload" },
      { status: 500 }
    );
  }
}
