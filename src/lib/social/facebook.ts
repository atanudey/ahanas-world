import type { PublishRequest, PublishResult, PlatformTokens, SocialPlatformClient } from './types';

const GRAPH_API = 'https://graph.facebook.com/v19.0';

export const facebookClient: SocialPlatformClient = {
  isConfigured(tokens: PlatformTokens): boolean {
    return !!(tokens.facebook_access_token && tokens.facebook_page_id);
  },

  async publish(request: PublishRequest, tokens: PlatformTokens): Promise<PublishResult> {
    const { facebook_access_token: accessToken, facebook_page_id: pageId } = tokens;
    if (!accessToken || !pageId) {
      return { success: false, error: 'Facebook not connected. Please connect your Facebook Page in settings.' };
    }

    try {
      if (request.mediaType === 'image') {
        return await publishPhoto(pageId, accessToken, request);
      } else {
        return await publishVideo(pageId, accessToken, request);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown Facebook error';
      return { success: false, error: msg };
    }
  },
};

async function publishPhoto(
  pageId: string,
  accessToken: string,
  request: PublishRequest,
): Promise<PublishResult> {
  const res = await fetch(`${GRAPH_API}/${pageId}/photos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: request.mediaUrl,
      message: `${request.title}\n\n${request.description}`,
      access_token: accessToken,
    }),
  });

  const data = await res.json();

  if (!res.ok || data.error) {
    return { success: false, error: data.error?.message || 'Facebook photo upload failed' };
  }

  return {
    success: true,
    platformPostId: data.post_id || data.id,
    platformUrl: `https://facebook.com/${data.post_id || data.id}`,
  };
}

async function publishVideo(
  pageId: string,
  accessToken: string,
  request: PublishRequest,
): Promise<PublishResult> {
  const res = await fetch(`${GRAPH_API}/${pageId}/videos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      file_url: request.mediaUrl,
      title: request.title,
      description: request.description,
      access_token: accessToken,
    }),
  });

  const data = await res.json();

  if (!res.ok || data.error) {
    return { success: false, error: data.error?.message || 'Facebook video upload failed' };
  }

  return {
    success: true,
    platformPostId: data.id,
    platformUrl: `https://facebook.com/${data.id}`,
  };
}
