import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase/server';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = createSupabaseAdmin();

    const [contentResult, postsResult] = await Promise.all([
      supabase.from('content').select('*').eq('id', id).single(),
      supabase.from('social_posts').select('*').eq('content_id', id).order('created_at'),
    ]);

    if (contentResult.error) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...contentResult.data,
      social_posts: postsResult.data ?? [],
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = createSupabaseAdmin();
    const body = await request.json();

    // Only allow updating specific fields
    const allowedFields = [
      'title', 'description', 'story', 'notes', 'category', 'medium',
      'status', 'visibility', 'sections',
    ];
    const updates: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (key in body) updates[key] = body[key];
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    // If status is changing to 'published', set published_at
    if (updates.status === 'published') {
      updates.published_at = new Date().toISOString();
      updates.visibility = 'public';
    }

    const { data, error } = await supabase
      .from('content')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      // .single() reports "no rows" as PGRST116 — that's a missing id, not a server fault.
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Content not found' }, { status: 404 });
      }
      console.error('Content update error:', error);
      return NextResponse.json({ error: 'Failed to update content' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = createSupabaseAdmin();

    // Get the content to find media paths
    const { data: content, error: readError } = await supabase
      .from('content')
      .select('media_path, thumbnail_path')
      .eq('id', id)
      .single();

    if (readError || !content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    // Delete the DB record first (cascades to social_posts). If this fails the
    // files are still intact; deleting files first could orphan a live record.
    const { error } = await supabase.from('content').delete().eq('id', id);

    if (error) {
      console.error('Content delete error:', error);
      return NextResponse.json({ error: 'Failed to delete content' }, { status: 500 });
    }

    // Best-effort file cleanup — the record is already gone.
    if (content.media_path) {
      const { error: mediaError } = await supabase.storage.from('media').remove([content.media_path]);
      if (mediaError) console.error('Media cleanup error:', mediaError);
    }
    if (content.thumbnail_path) {
      const { error: thumbError } = await supabase.storage.from('thumbnails').remove([content.thumbnail_path]);
      if (thumbError) console.error('Thumbnail cleanup error:', thumbError);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
