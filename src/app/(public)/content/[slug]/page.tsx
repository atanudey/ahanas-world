import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPublishedContentBySlug } from '@/lib/content/public';
import { ContentDetailClient } from '@/components/public/ContentDetailClient';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = await getPublishedContentBySlug(slug);
  if (!item) {
    return { title: 'Not found', robots: { index: false } };
  }

  const description = item.description || `${item.title} by Ahana`;
  return {
    title: item.title,
    description,
    openGraph: {
      title: `${item.title} | Ahana's World`,
      description,
      // Relative; resolved against metadataBase in the root layout.
      ...(item.thumbnail && { images: [item.thumbnail] }),
    },
  };
}

export default async function ContentDetailPage({ params }: Props) {
  const { slug } = await params;
  const item = await getPublishedContentBySlug(slug);
  if (!item) notFound();

  return <ContentDetailClient item={item} />;
}
