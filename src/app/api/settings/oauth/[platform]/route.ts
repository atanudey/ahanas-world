import { NextResponse } from 'next/server';

/**
 * GET /api/settings/oauth/[platform]
 * Initiates OAuth flow for Facebook/Google by redirecting to consent screen.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ platform: string }> },
) {
  const { platform } = await params;

  if (platform === 'facebook') {
    const appId = process.env.FACEBOOK_APP_ID;
    if (!appId) {
      return NextResponse.json(
        { error: 'Facebook App ID not configured. Add FACEBOOK_APP_ID to .env.local' },
        { status: 500 },
      );
    }

    const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/settings/oauth/callback`;
    const scopes = 'pages_manage_posts,pages_read_engagement,instagram_basic,instagram_content_publish';
    const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes}&state=facebook&response_type=code`;

    return NextResponse.redirect(authUrl);
  }

  if (platform === 'google') {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      return NextResponse.json(
        { error: 'Google Client ID not configured. Add GOOGLE_CLIENT_ID to .env.local' },
        { status: 500 },
      );
    }

    const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/settings/oauth/callback';
    const scopes = 'https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly';
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&state=google&response_type=code&access_type=offline&prompt=consent`;

    return NextResponse.redirect(authUrl);
  }

  return NextResponse.json({ error: 'Unknown platform' }, { status: 400 });
}
