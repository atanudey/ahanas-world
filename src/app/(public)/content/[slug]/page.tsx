'use client';

import { useParams } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { ContentDetail } from '@/components/public/ContentDetail';
import { MinecraftDetail } from '@/components/minecraft/MinecraftDetail';
import { MOCK_CONTENT } from '@/lib/constants';

export default function ContentDetailPage() {
  const { mode } = useTheme();
  const params = useParams();
  const slug = params.slug as string;
  const item = MOCK_CONTENT.find((i) => i.slug === slug);

  if (!item || item.visibility !== 'public' || item.status !== 'published') {
    return (
      <div className="max-w-7xl mx-auto px-6 py-32 text-center">
        <h1 className="text-4xl font-black mb-4">Not Found</h1>
        <p className="text-lg opacity-60">This content doesn&apos;t exist or isn&apos;t public yet.</p>
      </div>
    );
  }

  if (mode === 'minecraft') {
    return <MinecraftDetail item={item} />;
  }

  return <ContentDetail item={item} />;
}
