import type { Metadata } from 'next';
import { MOCK_CONTENT } from '@/lib/constants';
import { ContentDetailClient } from '@/components/public/ContentDetailClient';
import { createSupabaseAdmin } from '@/lib/supabase/server';
import { getThumbnailUrl } from '@/lib/utils/storage';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  // Try DB first
  try {
    const supabase = createSupabaseAdmin();
    const { data } = await supabase
      .from('content')
      .select('title, description, thumbnail_path')
      .eq('slug', slug)
      .eq('status', 'published')
      .eq('visibility', 'public')
      .single();

    if (data) {
      const ogImage = data.thumbnail_path ? getThumbnailUrl(data.thumbnail_path) : undefined;
      return {
        title: data.title,
        description: data.description || `${data.title} by Ahana`,
        openGraph: {
          title: `${data.title} | Ahana's World`,
          description: data.description || `${data.title} by Ahana`,
          ...(ogImage && { images: [ogImage] }),
        },
      };
    }
  } catch {
    // Fall through to mock data
  }

  // Fallback to mock
  const item = MOCK_CONTENT.find((i) => i.slug === slug);
  if (item) {
    return {
      title: item.title,
      description: item.description,
      openGraph: {
        title: `${item.title} | Ahana's World`,
        description: item.description,
      },
    };
  }

  return { title: 'Content' };
}

export default async function ContentDetailPage({ params }: Props) {
  const { slug } = await params;
  return <ContentDetailClient slug={slug} />;
}
