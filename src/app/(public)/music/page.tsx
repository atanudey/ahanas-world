import type { Metadata } from 'next';
import { SectionPage } from '@/components/public/SectionPage';

export const metadata: Metadata = {
  title: 'Songs from the Stars',
  description: "Listen to Ahana's original songs and musical creations — melodies from a young creative explorer.",
  openGraph: {
    title: 'Songs from the Stars | Ahana\'s World',
    description: "Listen to Ahana's original songs and musical creations.",
  },
};

export default function MusicPage() {
  return <SectionPage section="music" title="Songs from the Stars" />;
}
