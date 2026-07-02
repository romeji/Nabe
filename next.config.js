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
    ];
  },
};

module.exports = nextConfig;
