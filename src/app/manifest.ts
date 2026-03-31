import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: 'ahanas-world',
    name: "Ahana's World — Songs, Sketches, Stories & Stars",
    short_name: "Ahana's World",
    description: "A young creative explorer's world where songs, sketches, stories, and stars meet.",
    start_url: '/hub',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0f0326',
    theme_color: '#7c3aed',
    lang: 'en',
    dir: 'ltr',
    categories: ['education', 'kids', 'entertainment', 'creativity'],
    icons: [
      {
        src: '/icon',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icon-512',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    screenshots: [
      {
        src: '/screenshots/hub.png',
        sizes: '1080x1920',
        type: 'image/png',
        label: 'Creative Studio — capture songs, art, and stories',
      },
      {
        src: '/screenshots/parent.png',
        sizes: '1080x1920',
        type: 'image/png',
        label: 'Parent Dashboard — review and publish content',
      },
    ],
    shortcuts: [
      {
        name: 'Creative Studio',
        short_name: 'Studio',
        url: '/hub',
        description: 'Open the creative capture studio',
      },
      {
        name: 'Parent Dashboard',
        short_name: 'Parent',
        url: '/parent/login',
        description: 'Manage and publish content',
      },
    ],
  };
}
