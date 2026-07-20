import NextAuth from 'next-auth';
import { authClientOptions } from '@/lib/auth-client';

const handler = NextAuth(authClientOptions);

export { handler as GET, handler as POST };
