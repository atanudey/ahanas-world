import type { Metadata } from 'next';
import { connection } from 'next/server';
import { getPublishedContent } from '@/lib/content/public';
import { SectionPage } from '@/components/public/SectionPage';

export const metadata: Metadata = {
  title: 'Tiny Science Wonders',
  description: "Ahana's space and science explorations — discoveries, experiments, and cosmic curiosity.",
  openGraph: {
    title: 'Tiny Science Wonders | Ahana\'s World',
    description: "Ahana's space and science explorations.",
  },
};

export default async function SpacePage() {
  // Render per request so newly published work appears straight away.
  await connection();
  const items = await getPublishedContent('space');
  return <SectionPage section="space" title="Tiny Science Wonders" items={items} />;
}
