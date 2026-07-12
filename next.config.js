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
  async headers() {
    return [
      {
        // Appliqué à toutes les routes
        source: '/:path*',
        headers: [
          // Empêche le site d'être affiché dans une <iframe> sur un autre domaine (protection anti-clickjacking)
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          // Empêche le navigateur de "deviner" un type de fichier différent du Content-Type déclaré
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // N'envoie pas l'URL complète comme referrer vers des sites externes
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Désactive l'accès à la caméra/micro/géolocalisation par défaut (le site n'en a pas besoin)
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          // Force HTTPS pendant 2 ans, y compris pour les sous-domaines (une fois le domaine définitif en place)
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          {
            key: 'Content-Security-Policy',
            // Autorise explicitement Stripe (paiement), Google Analytics (si activé), Cloudinary (images).
            // IMPORTANT : à tester avec précaution après mise en ligne — une CSP mal réglée peut bloquer
            // silencieusement le paiement Stripe ou d'autres scripts sans erreur visible pour l'utilisateur.
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://www.googletagmanager.com https://www.google-analytics.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob: https://res.cloudinary.com https://www.google-analytics.com",
              "font-src 'self' data: https://fonts.gstatic.com",
              "connect-src 'self' https://api.stripe.com https://www.google-analytics.com https://data.geopf.fr https://api.mondialrelay.com",
              "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
              "object-src 'none'",
              "base-uri 'self'",
            ].join('; '),
          },
        ],
      },
    ];
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
