import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { verifierLimiteTaux, obtenirIp } from '@/lib/rate-limit';
import { EMAIL_EXPEDITEUR, genererHtmlReinitialisationMotDePasse, resend } from '@/lib/resend';

function hacherToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function POST(req: NextRequest) {
  try {
    const { autorise } = await verifierLimiteTaux('mot-de-passe-oublie', obtenirIp(req), 5, 60);
    if (!autorise) {
      return NextResponse.json({ success: true });
    }

    const { email } = await req.json();
    const emailNormalise = String(email || '').trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalise)) {
      return NextResponse.json({ success: true });
    }

    const client = await prisma.client.findUnique({ where: { email: emailNormalise } });
    if (!client) {
      return NextResponse.json({ success: true });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = hacherToken(token);
    const identifier = `password-reset:${emailNormalise}`;
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.verificationToken.deleteMany({ where: { identifier } });
    await prisma.verificationToken.create({
      data: { identifier, token: tokenHash, expires },
    });

    const urlBase = process.env.NEXT_PUBLIC_SITE_URL || 'https://nabe-bijoux.fr';
    const lien = `${urlBase}/reinitialiser-mot-de-passe?email=${encodeURIComponent(emailNormalise)}&token=${token}`;

    try {
      await resend.emails.send({
        from: EMAIL_EXPEDITEUR,
        to: emailNormalise,
        subject: 'Reinitialiser votre mot de passe Nabe',
        html: genererHtmlReinitialisationMotDePasse(client.nom?.split(' ')[0] || 'vous', lien),
      });
    } catch (err) {
      console.error('Erreur envoi email reinitialisation mot de passe :', err);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur mot de passe oublie:', error);
    return NextResponse.json({ success: true });
  }
}
