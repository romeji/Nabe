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
  matcher: [
    '/admin',
    '/admin/produits/:path*',
    '/admin/promotions/:path*',
    '/admin/categories/:path*',
    '/admin/collections/:path*',
    '/admin/matieres/:path*',
    '/admin/pierres/:path*',
    '/admin/couleurs-pierre/:path*',
    '/admin/stock/:path*',
    '/admin/commandes/:path*',
    '/admin/sur-mesure/:path*',
    '/admin/messages/:path*',
    '/admin/contenu/:path*',
    '/admin/newsletters/:path*',
    '/admin/codes-promo/:path*',
    '/admin/temoignages/:path*',
    '/admin/reglages/:path*',
  ],
};
