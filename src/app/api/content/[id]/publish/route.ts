import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase/server';
import { publishToSocialMedia } from '@/lib/social/publisher';

/** Statuses a parent can approve from. 'failed' is legacy: older code set it on social failures. */
const APPROVABLE = ['review_needed', 'failed'];

/**
 * POST /api/content/[id]/publish
 * - Approve: content awaiting review is published on the site and sent to social.
 * - Retry: already-published content is re-sent only to platforms that haven't
 *   got it yet (the publisher skips the rest).
 *
 * Social-media failures are recorded per platform in social_posts and never
 * change the content's own status — the item stays live on the site.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = createSupabaseAdmin();

    const { data: existing, error: readError } = await supabase
      .from('content')
      .select('status, visibility')
      .eq('id', id)
      .single();

    if (readError || !existing) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    if (APPROVABLE.includes(existing.status)) {
      // Conditional on status, and checked for a matched row, so two approvals
      // arriving together publish once: the second finds the status already
      // changed and stops here instead of posting to social media again.
      const { data: approved, error: updateError } = await supabase
        .from('content')
        .update({
          status: 'published',
          visibility: 'public',
          published_at: new Date().toISOString(),
        })
        .eq('id', id)
        .in('status', APPROVABLE)
        .select('id');

      if (updateError) {
        console.error('Publish update error:', updateError);
        return NextResponse.json({ error: 'Failed to publish content' }, { status: 500 });
      }
      if (!approved?.length) {
        return NextResponse.json({ error: 'This content is already being published' }, { status: 409 });
      }
    } else if (existing.status === 'published') {
      // Retry — respect a parent who has since made the item private.
      if (existing.visibility !== 'public') {
        return NextResponse.json(
          { error: 'Content is private. Make it public before sharing to social media.' },
          { status: 409 },
        );
      }
    } else {
      return NextResponse.json(
        { error: `Content with status "${existing.status}" can't be published` },
        { status: 409 },
      );
    }

    const social = await publishToSocialMedia(id);

    const { data: content } = await supabase.from('content').select('*').eq('id', id).single();

    return NextResponse.json({ content, social });
  } catch (err) {
    console.error('Publish error:', err);
    return NextResponse.json({ error: 'Publishing failed' }, { status: 500 });
  }
}
