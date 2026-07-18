import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { verifierLimiteTaux, obtenirIp } from '@/lib/rate-limit';
import { EMAIL_EXPEDITEUR, genererHtmlMotDePasseModifie, resend } from '@/lib/resend';
import { getContenuPage } from '@/lib/contenu';

function hacherToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function POST(req: NextRequest) {
  try {
    const { autorise } = await verifierLimiteTaux('reinitialiser-mot-de-passe', obtenirIp(req), 10, 60);
    if (!autorise) {
      return NextResponse.json({ error: 'Trop de tentatives. Reessayez plus tard.' }, { status: 429 });
    }

    const { email, token, password } = await req.json();
    const emailNormalise = String(email || '').trim().toLowerCase();
    const tokenRecu = String(token || '');
    const nouveauMotDePasse = String(password || '');

    if (!emailNormalise || !tokenRecu || nouveauMotDePasse.length < 6) {
      return NextResponse.json({ error: 'Lien invalide ou mot de passe trop court.' }, { status: 400 });
    }

    const tokenHash = hacherToken(tokenRecu);
    const verification = await prisma.verificationToken.findUnique({ where: { token: tokenHash } });

    if (
      !verification ||
      verification.identifier !== `password-reset:${emailNormalise}` ||
      verification.expires < new Date()
    ) {
      return NextResponse.json({ error: 'Ce lien est invalide ou expire.' }, { status: 400 });
    }

    const client = await prisma.client.findUnique({ where: { email: emailNormalise } });
    if (!client) {
      await prisma.verificationToken.delete({ where: { token: tokenHash } });
      return NextResponse.json({ error: 'Ce lien est invalide ou expire.' }, { status: 400 });
    }

    await prisma.client.update({
      where: { id: client.id },
      data: {
        password: await bcrypt.hash(nouveauMotDePasse, 10),
        tentativesEchouees: 0,
        verrouJusqua: null,
      },
    });
    await prisma.verificationToken.delete({ where: { token: tokenHash } });

    try {
      const emailsContenu = await getContenuPage('emails');
      await resend.emails.send({
        from: EMAIL_EXPEDITEUR,
        to: client.email,
        subject: emailsContenu.mdp_modifie_sujet || 'Votre mot de passe Nabe a ete modifie',
        html: genererHtmlMotDePasseModifie(client.nom?.split(' ')[0] || 'vous', emailsContenu.mdp_modifie_message),
      });
    } catch (err) {
      console.error('Erreur envoi email confirmation reset mot de passe :', err);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erreur reinitialisation mot de passe:', error);
    return NextResponse.json({ error: error.message || 'Erreur' }, { status: 400 });
  }
}
