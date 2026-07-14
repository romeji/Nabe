import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import {
  estVerrouille,
  calculerApresEchec,
  ETAT_APRES_SUCCES,
} from '@/lib/anti-bruteforce';

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },

  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },

  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === 'production'
          ? '__Secure-admin-session-token'
          : 'admin-session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },

  providers: [
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

        const admin = await prisma.admin.findUnique({
          where: { email },
        });

        if (!admin) {
          return null;
        }

        if (estVerrouille(admin.verrouJusqua)) {
          return null;
        }

        const motDePasseValide = await bcrypt.compare(
          credentials.password,
          admin.password,
        );

        if (!motDePasseValide) {
          const { tentativesEchouees, verrouJusqua } =
            calculerApresEchec(admin.tentativesEchouees);

          await prisma.admin.update({
            where: { id: admin.id },
            data: { tentativesEchouees, verrouJusqua },
          });

          return null;
        }

        if (admin.tentativesEchouees > 0 || admin.verrouJusqua) {
          await prisma.admin.update({
            where: { id: admin.id },
            data: ETAT_APRES_SUCCES,
          });
        }

        return {
          id: admin.id,
          email: admin.email,
          name: admin.name || 'Admin',
        };
      },
    }),
  ],

  callbacks: {
    async redirect({ url, baseUrl }) {
      try {
        const destination = new URL(url, baseUrl);
        const origine = new URL(baseUrl);

        if (destination.origin !== origine.origin) {
          return `${baseUrl}/admin`;
        }

        if (
          destination.pathname !== '/admin' &&
          !destination.pathname.startsWith('/admin/')
        ) {
          return `${baseUrl}/admin`;
        }

        return destination.toString();
      } catch {
        return `${baseUrl}/admin`;
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
