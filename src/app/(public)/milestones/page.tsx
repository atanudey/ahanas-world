import type { Metadata } from 'next';
import { connection } from 'next/server';
import { getPublishedContent } from '@/lib/content/public';
import { SectionPage } from '@/components/public/SectionPage';

export const metadata: Metadata = {
  title: 'Growth Journey',
  description: "Follow Ahana's creative milestones — achievements, growth moments, and breakthroughs.",
  openGraph: {
    title: 'Growth Journey | Ahana\'s World',
    description: "Follow Ahana's creative milestones.",
  },
};

export default async function MilestonesPage() {
  // Render per request so newly published work appears straight away.
  await connection();
  const items = await getPublishedContent('milestones');
  return <SectionPage section="milestones" title="Growth Journey" items={items} />;
}
