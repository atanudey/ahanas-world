import type { Metadata } from 'next';
import { SectionPage } from '@/components/public/SectionPage';

export const metadata: Metadata = {
  title: 'Growth Journey',
  description: "Follow Ahana's creative milestones — achievements, growth moments, and breakthroughs.",
  openGraph: {
    title: 'Growth Journey | Ahana\'s World',
    description: "Follow Ahana's creative milestones.",
  },
};

export default function MilestonesPage() {
  return <SectionPage section="milestones" title="Growth Journey" />;
}
