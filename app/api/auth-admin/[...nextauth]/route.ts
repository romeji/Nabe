import NextAuth from 'next-auth';
import { NextRequest } from 'next/server';
import { authOptions } from '@/lib/auth';

const handler = NextAuth(authOptions);

function normaliserRequeteAdmin(req: NextRequest): NextRequest {
  const url = req.nextUrl.clone();

  if (url.pathname.startsWith('/api/auth-admin/')) {
    url.pathname = url.pathname.replace(
      '/api/auth-admin/',
      '/api/auth/',
    );
  }

  return new NextRequest(url, req);
}

export async function GET(req: NextRequest, context: unknown) {
  return handler(normaliserRequeteAdmin(req) as any, context as any);
}

export async function POST(req: NextRequest, context: unknown) {
  return handler(normaliserRequeteAdmin(req) as any, context as any);
}
