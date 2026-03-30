import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase/server';
import { getAppCredentials } from '@/lib/credentials';

/**
 * GET /api/settings/oauth/callback
 * Handles OAuth redirect from Facebook/Google, exchanges code for tokens,
 * and stores them in parent_settings.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state'); // 'facebook' or 'google'
  const errorParam = searchParams.get('error');
  const creds = await getAppCredentials();
  const baseUrl = creds.siteUrl;

  if (errorParam || !code) {
    return NextResponse.redirect(
      `${baseUrl}/parent?oauth_error=${errorParam || 'no_code'}`,
    );
  }

  const supabase = createSupabaseAdmin();

  try {
    if (state === 'facebook') {
      await handleFacebookCallback(code, supabase, creds);
    } else if (state === 'google') {
      await handleGoogleCallback(code, supabase, creds);
    }

    return NextResponse.redirect(`${baseUrl}/parent?oauth_success=${state}`);
  } catch (err) {
    console.error('OAuth callback error:', err);
    return NextResponse.redirect(`${baseUrl}/parent?oauth_error=exchange_failed`);
  }
}

async function handleFacebookCallback(
  code: string,
  supabase: ReturnType<typeof createSupabaseAdmin>,
  creds: Awaited<ReturnType<typeof getAppCredentials>>,
) {
  const redirectUri = `${creds.siteUrl}/api/settings/oauth/callback`;

  // Exchange code for short-lived token
  const tokenRes = await fetch(
    `https://graph.facebook.com/v21.0/oauth/access_token?client_id=${creds.facebookAppId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${creds.facebookAppSecret}&code=${code}`,
  );
  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) throw new Error('No access token');

  // Exchange for long-lived token
  const longRes = await fetch(
    `https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${creds.facebookAppId}&client_secret=${creds.facebookAppSecret}&fb_exchange_token=${tokenData.access_token}`,
  );
  const longData = await longRes.json();
  const longToken = longData.access_token || tokenData.access_token;

  // Get pages and Instagram accounts
  const pagesRes = await fetch(
    `https://graph.facebook.com/v21.0/me/accounts?fields=id,name,access_token,instagram_business_account&access_token=${longToken}`,
  );
  const pagesData = await pagesRes.json();
  const page = pagesData.data?.[0];

  if (!page) throw new Error('No Facebook pages found');

  const updates: Record<string, string | null> = {
    facebook_access_token: page.access_token || longToken,
    facebook_page_id: page.id,
  };

  if (page.instagram_business_account?.id) {
    updates.instagram_account_id = page.instagram_business_account.id;
  }

  await supabase.from('parent_settings').update(updates).eq('id', 1);
}

async function handleGoogleCallback(
  code: string,
  supabase: ReturnType<typeof createSupabaseAdmin>,
  creds: Awaited<ReturnType<typeof getAppCredentials>>,
) {
  const redirectUri = creds.googleRedirectUri || `${creds.siteUrl}/api/settings/oauth/callback`;

  // Exchange code for tokens
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
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

  const tokenData = await tokenRes.json();
  if (!tokenData.refresh_token) throw new Error('No refresh token');

  // Get channel info
  const channelRes = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true`,
    { headers: { Authorization: `Bearer ${tokenData.access_token}` } },
  );
  const channelData = await channelRes.json();
  const channelId = channelData.items?.[0]?.id;

  await supabase.from('parent_settings').update({
    youtube_refresh_token: tokenData.refresh_token,
    youtube_channel_id: channelId || null,
  }).eq('id', 1);
}
