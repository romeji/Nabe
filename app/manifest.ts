import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Nabe',
    short_name: 'Nabe',
    description: 'Bijoux artisanaux façonnés à la main en France.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#f6f0e8',
    theme_color: '#7c4027',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
  };
}
