import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { verifierSessionAdmin } from '@/lib/auth-helpers';
import { creerUrlAutorisationInstagram, instagramMetaEstConfigure } from '@/lib/instagram-meta';

export const runtime = 'nodejs';

const NOM_COOKIE_ETAT = 'nabe-instagram-oauth-state';

function urlRetour(req: NextRequest) {
  const origine = process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin;
  return new URL('/api/admin/instagram/callback', origine).toString();
}

export async function GET(req: NextRequest) {
  const session = await verifierSessionAdmin();
  if (!session) {
    return NextResponse.redirect(new URL('/admin/login', req.url));
  }

  if (!instagramMetaEstConfigure()) {
    return NextResponse.redirect(new URL('/admin/reglages?instagram=configuration', req.url));
  }

  const etat = crypto.randomBytes(32).toString('base64url');
  const reponse = NextResponse.redirect(creerUrlAutorisationInstagram(urlRetour(req), etat));
  reponse.cookies.set({
    name: NOM_COOKIE_ETAT,
    value: etat,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 10 * 60,
  });
  return reponse;
}
