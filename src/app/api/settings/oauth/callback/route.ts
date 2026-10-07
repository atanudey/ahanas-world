import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase/server';
import { getAppCredentials } from '@/lib/credentials';
import { OAUTH_STATE_COOKIE, verifyOAuthState } from '@/lib/auth/oauth-state';

/**
 * GET /api/settings/oauth/callback
 * Handles OAuth redirect from Facebook/Google, exchanges code for tokens,
 * and stores them in parent_settings.
 *
 * Security: this route is public (the SameSite=Strict session cookie isn't sent
 * on the provider's redirect), so it only acts on a signed state that matches the
 * cookie set by the proxy-protected initiation route. Without that check anyone
 * could attach their own social account and receive the child's approved posts.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const errorParam = searchParams.get('error');
  const creds = await getAppCredentials();

  const redirectTo = (params: Record<string, string>) => {
    const url = new URL('/parent', creds.siteUrl);
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
    const response = NextResponse.redirect(url.toString());
    response.cookies.delete({ name: OAUTH_STATE_COOKIE, path: '/api/settings/oauth' });
    return response;
  };

  if (errorParam || !code) {
    return redirectTo({ oauth_error: errorParam || 'no_code' });
  }

  const platform = await verifyOAuthState(state, request.cookies.get(OAUTH_STATE_COOKIE)?.value);
  if (!platform) {
    return redirectTo({ oauth_error: 'invalid_state' });
  }

  const supabase = createSupabaseAdmin();

  try {
    if (platform === 'facebook') {
      await handleFacebookCallback(code, supabase, creds);
    } else {
      await handleGoogleCallback(code, supabase, creds);
    }
    return redirectTo({ oauth_success: platform });
  } catch (err) {
    console.error('OAuth callback error:', err);
    return redirectTo({ oauth_error: 'exchange_failed' });
  }
}

async function fetchJson(url: string, init?: RequestInit) {
  const res = await fetch(url, init);
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.error) {
    throw new Error(`Request failed (${res.status}): ${JSON.stringify(data?.error ?? data)}`);
  }
  return data;
}

function graphUrl(path: string, params: Record<string, string>): string {
  const url = new URL(`https://graph.facebook.com/v21.0/${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return url.toString();
}

async function handleFacebookCallback(
  code: string,
  supabase: ReturnType<typeof createSupabaseAdmin>,
  creds: Awaited<ReturnType<typeof getAppCredentials>>,
) {
  const redirectUri = `${creds.siteUrl}/api/settings/oauth/callback`;

  // Exchange code for short-lived token
  const tokenData = await fetchJson(graphUrl('oauth/access_token', {
    client_id: creds.facebookAppId,
    redirect_uri: redirectUri,
    client_secret: creds.facebookAppSecret,
    code,
  }));
  if (!tokenData.access_token) throw new Error('No access token');

  // Exchange for long-lived token — page tokens derived from it don't expire.
  const longData = await fetchJson(graphUrl('oauth/access_token', {
    grant_type: 'fb_exchange_token',
    client_id: creds.facebookAppId,
    client_secret: creds.facebookAppSecret,
    fb_exchange_token: tokenData.access_token,
  }));
  if (!longData.access_token) throw new Error('No long-lived access token');

  // Get pages and Instagram accounts
  const pagesData = await fetchJson(graphUrl('me/accounts', {
    fields: 'id,name,access_token,instagram_business_account',
    access_token: longData.access_token,
  }));
  const page = pagesData.data?.[0];

  if (!page?.access_token) throw new Error('No Facebook pages found');

  const { error } = await supabase.from('parent_settings').update({
    facebook_access_token: page.access_token,
    facebook_page_id: page.id,
    // Clear a stale Instagram link when the newly connected page has none.
    instagram_account_id: page.instagram_business_account?.id ?? null,
  }).eq('id', 1);
  if (error) throw error;
}

async function handleGoogleCallback(
  code: string,
  supabase: ReturnType<typeof createSupabaseAdmin>,
  creds: Awaited<ReturnType<typeof getAppCredentials>>,
) {
  const redirectUri = creds.googleRedirectUri || `${creds.siteUrl}/api/settings/oauth/callback`;

  // Exchange code for tokens
  const tokenData = await fetchJson('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: creds.googleClientId,
      client_secret: creds.googleClientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });
  if (!tokenData.refresh_token) throw new Error('No refresh token');

  // Get channel info — publishing needs the channel id, so fail if there isn't one.
  const channelData = await fetchJson(
    'https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true',
    { headers: { Authorization: `Bearer ${tokenData.access_token}` } },
  );
  const channelId = channelData.items?.[0]?.id;
  if (!channelId) throw new Error('No YouTube channel found for this account');

  const { error } = await supabase.from('parent_settings').update({
    youtube_refresh_token: tokenData.refresh_token,
    youtube_channel_id: channelId,
  }).eq('id', 1);
  if (error) throw error;
}
