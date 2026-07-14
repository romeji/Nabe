import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

const COOKIE_ADMIN =
  process.env.NODE_ENV === 'production'
    ? '__Secure-admin-session-token'
    : 'admin-session-token';

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: COOKIE_ADMIN,
  });

  if (token) {
    return NextResponse.next();
  }

  const urlConnexion = new URL('/admin/login', req.url);
  const destination = `${req.nextUrl.pathname}${req.nextUrl.search}`;

  urlConnexion.searchParams.set('callbackUrl', destination);

  return NextResponse.redirect(urlConnexion);
}

export const config = {
  matcher: ['/admin', '/admin/((?!login(?:/|$)).*)'],
};