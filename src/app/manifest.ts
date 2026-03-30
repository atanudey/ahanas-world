import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ahana's World — Songs, Sketches, Stories & Stars",
    short_name: "Ahana's World",
    description: "A young creative explorer's world where songs, sketches, stories, and stars meet.",
    start_url: '/hub',
    display: 'standalone',
    background_color: '#0f0326',
    theme_color: '#7c3aed',
    icons: [
      {
        src: '/icon',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}
