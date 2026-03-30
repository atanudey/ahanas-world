import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase/server';

/** Mask a secret string, showing only the last 4 characters. */
function maskSecret(value: string | null | undefined): string {
  if (!value) return '';
  if (value.length <= 4) return '****';
  return '*'.repeat(value.length - 4) + value.slice(-4);
}

export async function GET() {
  try {
    const supabase = createSupabaseAdmin();
    const { data, error } = await supabase
      .from('parent_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }

    return NextResponse.json({
      auto_publish: data.auto_publish,
      facebook_enabled: data.facebook_enabled,
      instagram_enabled: data.instagram_enabled,
      youtube_enabled: data.youtube_enabled,
      require_review: data.require_review,
      facebook_page_id: data.facebook_page_id,
      instagram_account_id: data.instagram_account_id,
      youtube_channel_id: data.youtube_channel_id,
      updated_at: data.updated_at,
      // Connection status
      facebook_connected: !!data.facebook_access_token,
      instagram_connected: !!data.facebook_access_token && !!data.instagram_account_id,
      youtube_connected: !!data.youtube_refresh_token,
      // App credentials (secrets masked)
      facebook_app_id: data.facebook_app_id || '',
      facebook_app_secret: maskSecret(data.facebook_app_secret),
      google_client_id: data.google_client_id || '',
      google_client_secret: maskSecret(data.google_client_secret),
      google_redirect_uri: data.google_redirect_uri || '',
      site_url: data.site_url || '',
      // PIN status
      admin_pin_configured: !!data.admin_pin_hash,
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
      'facebook_app_id', 'facebook_app_secret',
      'google_client_id', 'google_client_secret',
      'google_redirect_uri', 'site_url',
    ];

    const updates: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (key in body) {
        const val = body[key];
        // Skip masked values — don't overwrite secrets with their masked display
        if (typeof val === 'string' && val.includes('***')) continue;
        updates[key] = val;
      }
    }

    // Handle admin PIN separately — hash before storing
    if ('admin_pin' in body && typeof body.admin_pin === 'string' && body.admin_pin.length >= 4) {
      const encoder = new TextEncoder();
      const data = encoder.encode(body.admin_pin);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      updates.admin_pin_hash = hashHex;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const { error } = await supabase
      .from('parent_settings')
      .update(updates)
      .eq('id', 1);

    if (error) {
      return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
