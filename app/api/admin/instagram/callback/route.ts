import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { verifierSessionAdmin } from '@/lib/auth-helpers';
import { connecterCompteInstagram } from '@/lib/instagram-meta';

export const runtime = 'nodejs';

const NOM_COOKIE_ETAT = 'nabe-instagram-oauth-state';

function urlRetour(req: NextRequest) {
  const origine = process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin;
  return new URL('/api/admin/instagram/callback', origine).toString();
}

function etatsEgaux(recu: string | undefined, attendu: string | undefined) {
  if (!recu || !attendu) return false;
  const gauche = Buffer.from(recu);
  const droite = Buffer.from(attendu);
  return gauche.length === droite.length && crypto.timingSafeEqual(gauche, droite);
}

export async function GET(req: NextRequest) {
  const session = await verifierSessionAdmin();
  if (!session) return NextResponse.redirect(new URL('/admin/login', req.url));

  const reponse = NextResponse.redirect(new URL('/admin/reglages?instagram=erreur', req.url));
  reponse.cookies.set({ name: NOM_COOKIE_ETAT, value: '', path: '/', maxAge: 0 });

  const code = req.nextUrl.searchParams.get('code');
  const etat = req.nextUrl.searchParams.get('state') || undefined;
  const etatAttendu = req.cookies.get(NOM_COOKIE_ETAT)?.value;
  if (!code || !etatsEgaux(etat, etatAttendu)) return reponse;

  try {
    await connecterCompteInstagram(code, urlRetour(req));
    const succes = NextResponse.redirect(new URL('/admin/reglages?instagram=connecte', req.url));
    succes.cookies.set({
      name: NOM_COOKIE_ETAT,
      value: '',
      path: '/',
      maxAge: 0,
    });
    return succes;
  } catch (error) {
    console.error('Connexion Instagram impossible :', error instanceof Error ? error.message : 'erreur inconnue');
    return reponse;
  }
}
