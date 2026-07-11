import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/admin/login',
  },
  // Le type de withAuth() n'accepte ici que { name }, contrairement à la
  // config NextAuth complète (lib/auth.ts) qui accepte aussi "options".
  // Le nom doit rester strictement identique entre les deux.
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-admin-session-token' : 'admin-session-token',
    },
  },
});

export const config = {
  // Protège TOUTES les routes /admin/* sauf /admin/login (sinon boucle de
  // redirection), sans avoir à lister chaque page une par une — l'ancienne
  // liste manuelle avait déjà oublié /admin/politiques.
  matcher: ['/admin', '/admin/((?!login).*)'],
};
