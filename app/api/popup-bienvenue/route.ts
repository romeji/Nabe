import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resend, EMAIL_EXPEDITEUR, genererHtmlSurprisePopup } from '@/lib/resend';
import { getContenuPage } from '@/lib/contenu';
import { getConfigSite } from '@/lib/config-site';
import { verifierLimiteTaux, obtenirIp } from '@/lib/rate-limit';

function genererSegmentCode(): string {
  return Math.random().toString(36).substring(2, 7).toUpperCase();
}

export async function POST(req: NextRequest) {
  try {
    const { autorise } = await verifierLimiteTaux('popup-bienvenue', obtenirIp(req), 5, 60);
    if (!autorise) {
      return NextResponse.json({ error: 'Trop de tentatives. Réessayez plus tard.' }, { status: 429 });
    }

    const { prenom, email } = await req.json();

    if (!prenom || !prenom.trim() || !email || !email.includes('@')) {
      return NextResponse.json({ error: 'Prénom et e-mail valides requis.' }, { status: 400 });
    }

    const config = await getConfigSite();
    const pourcentage = parseFloat(config.popup_bienvenue_pourcentage || '10');

    // On inscrit aussi la personne à la newsletter (cohérent avec l'intention "ajout email")
    await prisma.abonneNewsletter.upsert({
      where: { email },
      update: {},
      create: { email },
    });

    // Un code par personne : on génère un code unique à usage unique, lié à cet email
    // via l'inscription newsletter déjà faite ci-dessus.
    const code = `BIENVENUE-${genererSegmentCode()}`;

    const codeReduction = await prisma.codeReduction.create({
      data: {
        code,
        type: 'POURCENTAGE',
        valeur: pourcentage,
        utilisationMax: 1,
      },
    });

    // Envoi de l'email avec le code
    try {
      const emailsContenu = await getContenuPage('emails');
      const sujetTemplate = emailsContenu.popup_surprise_sujet || '{prenom}, votre surprise Nabe vous attend 🎁';
      await resend.emails.send({
        from: EMAIL_EXPEDITEUR,
        to: email,
        subject: sujetTemplate.replace('{prenom}', prenom),
        html: genererHtmlSurprisePopup({ prenom, pourcentage, code, messagePersonnalise: emailsContenu.popup_surprise_message }),
      });
    } catch (err) {
      console.error('Erreur envoi email popup bienvenue (le code reste valide) :', err);
    }

    return NextResponse.json({ success: true, code });
  } catch (error: any) {
    console.error('Erreur popup bienvenue:', error);
    return NextResponse.json({ error: error.message || 'Erreur' }, { status: 500 });
  }
}
