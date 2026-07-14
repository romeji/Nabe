import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import {
  estVerrouille,
  calculerApresEchec,
  ETAT_APRES_SUCCES,
} from '@/lib/anti-bruteforce';

export const authClientOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,

  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 30,
  },

  pages: {
    signIn: '/connexion',
    error: '/connexion',
  },

  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === 'production'
          ? '__Secure-client-session-token'
          : 'client-session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),

    CredentialsProvider({
      name: 'Identifiants',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email.trim().toLowerCase();

        const client = await prisma.client.findUnique({
          where: { email },
        });

        if (!client?.password) {
          return null;
        }

        if (estVerrouille(client.verrouJusqua)) {
          return null;
        }

        const motDePasseValide = await bcrypt.compare(
          credentials.password,
          client.password,
        );

        if (!motDePasseValide) {
          const { tentativesEchouees, verrouJusqua } =
            calculerApresEchec(client.tentativesEchouees);

          await prisma.client.update({
            where: { id: client.id },
            data: { tentativesEchouees, verrouJusqua },
          });

          return null;
        }

        if (client.tentativesEchouees > 0 || client.verrouJusqua) {
          await prisma.client.update({
            where: { id: client.id },
            data: ETAT_APRES_SUCCES,
          });
        }

        return {
          id: client.id,
          email: client.email,
          name: client.nom || undefined,
          image: client.image || undefined,
        };
      },
    }),
  ],

  callbacks: {
    async signIn() {
      return true;
    },

    async redirect({ url, baseUrl }) {
      try {
        const destination = new URL(url, baseUrl);
        const origine = new URL(baseUrl);

        if (destination.origin !== origine.origin) {
          return `${baseUrl}/mon-compte`;
        }

        if (
          destination.pathname === '/admin' ||
          destination.pathname.startsWith('/admin/')
        ) {
          return `${baseUrl}/mon-compte`;
        }

        return destination.toString();
      } catch {
        return `${baseUrl}/mon-compte`;
      }
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as typeof session.user & { id?: string }).id =
          token.id as string | undefined;
      }

      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
