import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/admin/login',
  },
});

export const config = {
  matcher: [
    '/admin',
    '/admin/produits/:path*',
    '/admin/categories/:path*',
    '/admin/collections/:path*',
    '/admin/matieres/:path*',
    '/admin/couleurs-pierre/:path*',
    '/admin/stock/:path*',
    '/admin/commandes/:path*',
    '/admin/sur-mesure/:path*',
    '/admin/messages/:path*',
    '/admin/contenu/:path*',
    '/admin/newsletters/:path*',
    '/admin/codes-promo/:path*',
    '/admin/reglages/:path*',
  ],
};
