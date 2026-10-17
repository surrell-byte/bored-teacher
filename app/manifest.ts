import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Bored Teacher Online',
    short_name: 'Bored Teacher',
    description: 'Play classroom learning games from Bored Teacher Online.',
    start_url: '/hub',
    scope: '/',
    display: 'fullscreen',
    background_color: '#0b1628',
    theme_color: '#101827',
    icons: [
      {
        src: '/icons/app-icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/app-icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
