import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createSupabaseAdmin();
    const { data, error } = await supabase
      .from('parent_settings')
      .select('id, auto_publish, facebook_enabled, instagram_enabled, youtube_enabled, require_review, facebook_page_id, instagram_account_id, youtube_channel_id, updated_at')
      .eq('id', 1)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }

    // Add connection status (don't expose tokens)
    const { data: fullSettings } = await supabase
      .from('parent_settings')
      .select('facebook_access_token, youtube_refresh_token')
      .eq('id', 1)
      .single();

    return NextResponse.json({
      ...data,
      facebook_connected: !!fullSettings?.facebook_access_token,
      instagram_connected: !!fullSettings?.facebook_access_token && !!data?.instagram_account_id,
      youtube_connected: !!fullSettings?.youtube_refresh_token,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = createSupabaseAdmin();
    const body = await request.json();

    const allowedFields = [
      'auto_publish', 'facebook_enabled', 'instagram_enabled',
      'youtube_enabled', 'require_review',
    ];
    const updates: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (key in body) updates[key] = body[key];
    }

    const { data, error } = await supabase
      .from('parent_settings')
      .update(updates)
      .eq('id', 1)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
