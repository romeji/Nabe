import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import { estVerrouille, calculerApresEchec, ETAT_APRES_SUCCES } from '@/lib/anti-bruteforce';

export const authClientOptions: NextAuthOptions = {
  // L'adapter Prisma gère automatiquement les modèles Client/CompteOAuth/SessionClient
  // pour le provider Google. Pour Credentials, NextAuth ne passe pas par l'adapter
  // (limitation connue), on gère donc la session par JWT pour rester cohérent partout.
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 30, // 30 jours
  },
  pages: {
    signIn: '/connexion',
  },
  // IMPORTANT (sécurité) : voir le commentaire équivalent dans lib/auth.ts —
  // nom de cookie distinct de celui de l'admin pour éviter toute confusion
  // entre une session client et une session admin sur le même domaine.
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-client-session-token' : 'client-session-token',
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
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
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

        const client = await prisma.client.findUnique({
          where: { email: credentials.email },
        });

        if (!client || !client.password) {
          // Pas de compte, ou compte créé uniquement via Google (pas de mot de passe)
          return null;
        }

        if (estVerrouille(client.verrouJusqua)) {
          return null;
        }

        const motDePasseValide = await bcrypt.compare(credentials.password, client.password);
        if (!motDePasseValide) {
          const { tentativesEchouees, verrouJusqua } = calculerApresEchec(client.tentativesEchouees);
          await prisma.client.update({ where: { id: client.id }, data: { tentativesEchouees, verrouJusqua } });
          return null;
        }

        if (client.tentativesEchouees > 0 || client.verrouJusqua) {
          await prisma.client.update({ where: { id: client.id }, data: ETAT_APRES_SUCCES });
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
    async signIn({ user, account }) {
      // Si quelqu'un se connecte via Google avec un email qui a déjà un compte
      // "credentials" (mot de passe), on autorise quand même la fusion : NextAuth +
      // l'adapter Prisma relient automatiquement le CompteOAuth au Client existant
      // (même table Client, recherche par email).
      return true;
    },
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
