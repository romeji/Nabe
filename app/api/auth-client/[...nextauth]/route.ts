import NextAuth from 'next-auth';
import { authClientOptions } from '@/lib/auth-client';
import { NextRequest } from 'next/server';

// NextAuth v4 utilise openid-client en interne qui reconstruit le redirect_uri
// depuis l'URL de la requête. On remplace donc /api/auth/ par /api/auth-client/
// dans toutes les URLs entrantes avant de les passer à NextAuth.
function patchRequest(req: NextRequest): NextRequest {
  const url = req.nextUrl.clone();
  // S'assurer que le pathname utilise /api/auth-client et non /api/auth
  if (url.pathname.startsWith('/api/auth/')) {
    url.pathname = url.pathname.replace('/api/auth/', '/api/auth-client/');
  }
  return new NextRequest(url.toString(), {
    method: req.method,
    headers: req.headers,
    body: req.body,
  });
}

const handler = NextAuth(authClientOptions);

export async function GET(req: NextRequest, context: any) {
  return handler(patchRequest(req) as any, context);
}

export async function POST(req: NextRequest, context: any) {
  return handler(patchRequest(req) as any, context);
}
