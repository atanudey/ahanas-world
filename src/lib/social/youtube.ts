import type { PublishRequest, PublishResult, PlatformTokens, SocialPlatformClient } from './types';
import { getAppCredentials } from '@/lib/credentials';

export const youtubeClient: SocialPlatformClient = {
  isConfigured(tokens: PlatformTokens): boolean {
    return !!(tokens.youtube_refresh_token && tokens.youtube_channel_id);
  },

  async publish(request: PublishRequest, tokens: PlatformTokens): Promise<PublishResult> {
    const { youtube_refresh_token: refreshToken } = tokens;
    if (!refreshToken) {
      return { success: false, error: 'YouTube not connected. Please connect your YouTube channel in settings.' };
    }

    try {
      // Step 1: Get a fresh access token
      const accessToken = await refreshAccessToken(refreshToken);
      if (!accessToken) {
        return { success: false, error: 'YouTube token refresh failed. Please reconnect in settings.' };
      }

      // Step 2: Download the media file
      const mediaRes = await fetch(request.mediaUrl);
      if (!mediaRes.ok) {
        return { success: false, error: 'Could not download media for YouTube upload' };
      }
      const mediaBlob = await mediaRes.blob();

      // Step 3: Initiate resumable upload
      const metadata = {
        snippet: {
          title: request.title,
          description: `${request.description}\n\nUploaded from Ahana's World`,
          categoryId: '22', // People & Blogs
        },
        status: {
          privacyStatus: 'public',
          selfDeclaredMadeForKids: true,
        },
      };

      const initiateRes = await fetch(
        'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Upload-Content-Type': mediaBlob.type,
            'X-Upload-Content-Length': String(mediaBlob.size),
          },
          body: JSON.stringify(metadata),
        },
      );

      if (!initiateRes.ok) {
        const err = await initiateRes.json().catch(() => ({}));
        return { success: false, error: err.error?.message || 'YouTube upload initiation failed' };
      }

      const uploadUrl = initiateRes.headers.get('Location');
      if (!uploadUrl) {
        return { success: false, error: 'YouTube did not return upload URL' };
      }

      // Step 4: Upload the video bytes
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': mediaBlob.type },
        body: mediaBlob,
      });

      if (!uploadRes.ok) {
        return { success: false, error: 'YouTube video upload failed' };
      }

      const videoData = await uploadRes.json();

      return {
        success: true,
        platformPostId: videoData.id,
        platformUrl: `https://youtube.com/watch?v=${videoData.id}`,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown YouTube error';
      return { success: false, error: msg };
    }
  },
};

async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  const creds = await getAppCredentials();

  if (!creds.googleClientId || !creds.googleClientSecret) return null;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: creds.googleClientId,
      client_secret: creds.googleClientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data.access_token ?? null;
}
