import { NextResponse } from 'next/server';
import { getAppCredentials } from '@/lib/credentials';

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

    const redirectUri = `${creds.siteUrl}/api/settings/oauth/callback`;
    const scopes = 'pages_manage_posts,pages_read_engagement,instagram_basic,instagram_content_publish';
    const authUrl = `https://www.facebook.com/v21.0/dialog/oauth?client_id=${creds.facebookAppId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes}&state=facebook&response_type=code`;

    return NextResponse.redirect(authUrl);
  }

  if (platform === 'google') {
    if (!creds.googleClientId) {
      return NextResponse.json(
        { error: 'Google Client ID not configured. Set it in Publish Settings.' },
        { status: 500 },
      );
    }

    const redirectUri = creds.googleRedirectUri || `${creds.siteUrl}/api/settings/oauth/callback`;
    const scopes = 'https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly';
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${creds.googleClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&state=google&response_type=code&access_type=offline&prompt=consent`;

    return NextResponse.redirect(authUrl);
  }

  return NextResponse.json({ error: 'Unknown platform' }, { status: 400 });
}
