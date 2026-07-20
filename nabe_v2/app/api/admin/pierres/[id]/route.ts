import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifierSessionAdmin } from '@/lib/auth-helpers';
import { slugify } from '@/lib/utils';

export async function PATCH(req: NextRequest, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = await paramsPromise;
  const session = await verifierSessionAdmin();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  try {
    const { nom, description, couleursIds, ordre } = await req.json();

    const donnees: any = {};
    if (nom !== undefined) { donnees.nom = nom; donnees.slug = slugify(nom); }
    if (description !== undefined) donnees.description = description;
    if (ordre !== undefined) donnees.ordre = ordre;

    // Mettre à jour les couleurs si fournies (supprimer les anciennes, créer les nouvelles)
    if (couleursIds !== undefined) {
      await prisma.pierreCouleur.deleteMany({ where: { pierreId: params.id } });
      if (couleursIds.length > 0) {
        donnees.couleurs = {
          create: couleursIds.map((couleurPierreId: string) => ({ couleurPierreId })),
        };
      }
    }

    const pierre = await prisma.pierre.update({
      where: { id: params.id },
      data: donnees,
      include: { couleurs: { include: { couleurPierre: true } } },
    });

    return NextResponse.json(pierre);
  } catch (error: any) {
    console.error('Erreur modification pierre:', error);
    if (error.code === 'P2002') return NextResponse.json({ error: 'Cette pierre existe déjà' }, { status: 400 });
    return NextResponse.json({ error: error.message || 'Erreur' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = await paramsPromise;
  const session = await verifierSessionAdmin();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  try {
    await prisma.pierre.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erreur' }, { status: 400 });
  }
}
