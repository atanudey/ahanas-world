import type { Metadata } from 'next';
import { SectionPage } from '@/components/public/SectionPage';

export const metadata: Metadata = {
  title: 'From the Sketchbook',
  description: "Explore Ahana's art and drawings — watercolors, sketches, and creative experiments from a young artist.",
  openGraph: {
    title: 'From the Sketchbook | Ahana\'s World',
    description: "Explore Ahana's art and drawings.",
  },
};

export default function ArtPage() {
  return <SectionPage section="art" title="From the Sketchbook" />;
}
