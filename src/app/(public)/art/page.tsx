import type { Metadata } from 'next';
import { connection } from 'next/server';
import { getPublishedContent } from '@/lib/content/public';
import { SectionPage } from '@/components/public/SectionPage';

export const metadata: Metadata = {
  title: 'From the Sketchbook',
  description: "Explore Ahana's art and drawings — watercolors, sketches, and creative experiments from a young artist.",
  openGraph: {
    title: 'From the Sketchbook | Ahana\'s World',
    description: "Explore Ahana's art and drawings.",
  },
};

export default async function ArtPage() {
  // Render per request so newly published work appears straight away.
  await connection();
  const items = await getPublishedContent('art');
  return <SectionPage section="art" title="From the Sketchbook" items={items} />;
}
