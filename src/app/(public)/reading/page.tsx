import type { Metadata } from 'next';
import { connection } from 'next/server';
import { getPublishedContent } from '@/lib/content/public';
import { SectionPage } from '@/components/public/SectionPage';

export const metadata: Metadata = {
  title: 'Books That Spark',
  description: "Ahana's reading reflections and book reviews — stories that ignite a young imagination.",
  openGraph: {
    title: 'Books That Spark | Ahana\'s World',
    description: "Ahana's reading reflections and book reviews.",
  },
};

export default async function ReadingPage() {
  // Render per request so newly published work appears straight away.
  await connection();
  const items = await getPublishedContent('reading');
  return <SectionPage section="reading" title="Books That Spark" items={items} />;
}
