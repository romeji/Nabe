/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/panier',
        destination: '/checkout',
        permanent: true,
      },
      {
        source: '/admin/couleurs-pierre',
        destination: '/admin/pierres',
        permanent: true,
      },
      {
        source: '/admin/politiques',
        destination: '/admin/contenu?page=popups-produit',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
