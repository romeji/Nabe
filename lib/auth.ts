import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { estVerrouille, calculerApresEchec, ETAT_APRES_SUCCES } from '@/lib/anti-bruteforce';

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  pages: {
    signIn: '/admin/login',
  },
  // IMPORTANT (sécurité) : nom de cookie distinct de celui du site client
  // (voir lib/auth-client.ts). Sans cela, les deux configurations NextAuth
  // partagent par défaut le même nom de cookie ("next-auth.session-token"),
  // ce qui peut faire qu'une session client connectée soit lue par erreur
  // comme une session admin (et vice-versa) sur le même domaine.
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-admin-session-token' : 'admin-session-token',
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

        const admin = await prisma.admin.findUnique({
          where: { email: credentials.email },
        });

        if (!admin) {
          return null;
        }

        // Compte temporairement verrouillé suite à trop d'échecs récents :
        // on refuse sans même comparer le mot de passe.
        if (estVerrouille(admin.verrouJusqua)) {
          return null;
        }

        const motDePasseValide = await bcrypt.compare(credentials.password, admin.password);

        if (!motDePasseValide) {
          const { tentativesEchouees, verrouJusqua } = calculerApresEchec(admin.tentativesEchouees);
          await prisma.admin.update({ where: { id: admin.id }, data: { tentativesEchouees, verrouJusqua } });
          return null;
        }

        if (admin.tentativesEchouees > 0 || admin.verrouJusqua) {
          await prisma.admin.update({ where: { id: admin.id }, data: ETAT_APRES_SUCCES });
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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
