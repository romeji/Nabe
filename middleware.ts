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
    '/admin/matieres/:path*',
    '/admin/stock/:path*',
    '/admin/commandes/:path*',
    '/admin/sur-mesure/:path*',
    '/admin/messages/:path*',
    '/admin/contenu/:path*',
    '/admin/newsletters/:path*',
  ],
};
