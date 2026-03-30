import type { Metadata } from 'next';
import { SectionPage } from '@/components/public/SectionPage';

export const metadata: Metadata = {
  title: 'Books That Spark',
  description: "Ahana's reading reflections and book reviews — stories that ignite a young imagination.",
  openGraph: {
    title: 'Books That Spark | Ahana\'s World',
    description: "Ahana's reading reflections and book reviews.",
  },
};

export default function ReadingPage() {
  return <SectionPage section="reading" title="Books That Spark" />;
}
