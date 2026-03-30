import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase/server';
import { publishToSocialMedia } from '@/lib/social/publisher';

/**
 * POST /api/content/[id]/publish
 * Called when parent approves content — sets status to published and
 * triggers social media publishing.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = createSupabaseAdmin();

    // Set content to published
    const { data: content, error } = await supabase
      .from('content')
      .update({
        status: 'published',
        visibility: 'public',
        published_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    // Publish to social media
    const result = await publishToSocialMedia(id);

    // If all platform publishes failed, mark content as failed
    if (result.failed.length > 0 && result.published.length === 0) {
      await supabase
        .from('content')
        .update({ status: 'failed' })
        .eq('id', id);
    }

    return NextResponse.json({
      content,
      social: result,
    });
  } catch (err) {
    console.error('Publish error:', err);
    return NextResponse.json({ error: 'Publishing failed' }, { status: 500 });
  }
}
