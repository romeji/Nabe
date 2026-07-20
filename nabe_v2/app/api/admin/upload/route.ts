import { NextRequest, NextResponse } from 'next/server';
import { verifierSessionAdmin } from '@/lib/auth-helpers';
import { uploadImageCloudinary } from '@/lib/cloudinary';

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
