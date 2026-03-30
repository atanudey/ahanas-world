import type { Metadata } from 'next';
import { SectionPage } from '@/components/public/SectionPage';

export const metadata: Metadata = {
  title: 'Tiny Science Wonders',
  description: "Ahana's space and science explorations — discoveries, experiments, and cosmic curiosity.",
  openGraph: {
    title: 'Tiny Science Wonders | Ahana\'s World',
    description: "Ahana's space and science explorations.",
  },
};

export default function SpacePage() {
  return <SectionPage section="space" title="Tiny Science Wonders" />;
}
