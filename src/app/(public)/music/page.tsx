import type { Metadata } from 'next';
import { connection } from 'next/server';
import { getPublishedContent } from '@/lib/content/public';
import { SectionPage } from '@/components/public/SectionPage';

export const metadata: Metadata = {
  title: 'Songs from the Stars',
  description: "Listen to Ahana's original songs and musical creations — melodies from a young creative explorer.",
  openGraph: {
    title: 'Songs from the Stars | Ahana\'s World',
    description: "Listen to Ahana's original songs and musical creations.",
  },
};

export default async function MusicPage() {
  // Render per request so newly published work appears straight away.
  await connection();
  const items = await getPublishedContent('music');
  return <SectionPage section="music" title="Songs from the Stars" items={items} />;
}
