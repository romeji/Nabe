import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { verifierSessionAdmin } from '@/lib/auth-helpers';

export async function GET() {
  const session = await verifierSessionAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const admins = await prisma.admin.findMany({
    select: { id: true, email: true, name: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json(admins);
}

export async function POST(req: NextRequest) {
  const session = await verifierSessionAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { email, name, password } = await req.json();

    if (!email?.trim() || !password || password.length < 8) {
      return NextResponse.json(
        { error: 'Email requis et mot de passe de 8 caractères minimum.' },
        { status: 400 }
      );
    }

    const existant = await prisma.admin.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (existant) {
      return NextResponse.json({ error: 'Un administrateur existe déjà avec cet e-mail.' }, { status: 409 });
    }

    const motDePasseHash = await bcrypt.hash(password, 10);

    const admin = await prisma.admin.create({
      data: {
        email: email.trim().toLowerCase(),
        name: name?.trim() || undefined,
        password: motDePasseHash,
      },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    return NextResponse.json(admin, { status: 201 });
  } catch (error: any) {
    console.error('Erreur création administrateur:', error);
    return NextResponse.json({ error: error.message || 'Erreur' }, { status: 400 });
  }
}
