import { NextResponse } from 'next/server';
import { getAppCredentials } from '@/lib/credentials';
import {
  createOAuthState,
  OAUTH_STATE_COOKIE,
  OAUTH_STATE_TTL_SECONDS,
} from '@/lib/auth/oauth-state';

/** Redirect to the provider and remember the signed state for the callback. */
function redirectWithState(authUrl: URL, state: string): NextResponse {
  authUrl.searchParams.set('state', state);
  const response = NextResponse.redirect(authUrl.toString());
  response.cookies.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    // Lax (not Strict) so the cookie is sent on the provider's top-level redirect back.
    sameSite: 'lax',
    maxAge: OAUTH_STATE_TTL_SECONDS,
    path: '/api/settings/oauth',
  });
  return response;
}

/**
 * GET /api/settings/oauth/[platform]
 * Initiates OAuth flow for Facebook/Google by redirecting to consent screen.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ platform: string }> },
) {
  const { platform } = await params;
  const creds = await getAppCredentials();

  if (platform === 'facebook') {
    if (!creds.facebookAppId) {
      return NextResponse.json(
        { error: 'Facebook App ID not configured. Set it in Publish Settings.' },
        { status: 500 },
      );
    }

    const authUrl = new URL('https://www.facebook.com/v21.0/dialog/oauth');
    authUrl.searchParams.set('client_id', creds.facebookAppId);
    authUrl.searchParams.set('redirect_uri', `${creds.siteUrl}/api/settings/oauth/callback`);
    authUrl.searchParams.set(
      'scope',
      'pages_show_list,pages_manage_posts,pages_read_engagement,instagram_basic,instagram_content_publish',
    );
    authUrl.searchParams.set('response_type', 'code');

    return redirectWithState(authUrl, await createOAuthState('facebook'));
  }

  if (platform === 'google') {
    if (!creds.googleClientId) {
      return NextResponse.json(
        { error: 'Google Client ID not configured. Set it in Publish Settings.' },
        { status: 500 },
      );
    }

    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', creds.googleClientId);
    authUrl.searchParams.set(
      'redirect_uri',
      creds.googleRedirectUri || `${creds.siteUrl}/api/settings/oauth/callback`,
    );
    authUrl.searchParams.set(
      'scope',
      'https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly',
    );
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('access_type', 'offline');
    authUrl.searchParams.set('prompt', 'consent');

    return redirectWithState(authUrl, await createOAuthState('google'));
  }

  return NextResponse.json({ error: 'Unknown platform' }, { status: 400 });
}
