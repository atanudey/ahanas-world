import type { PublishRequest, PublishResult, PlatformTokens, SocialPlatformClient } from './types';

const GRAPH_API = 'https://graph.facebook.com/v19.0';

export const instagramClient: SocialPlatformClient = {
  isConfigured(tokens: PlatformTokens): boolean {
    return !!(tokens.facebook_access_token && tokens.instagram_account_id);
  },

  async publish(request: PublishRequest, tokens: PlatformTokens): Promise<PublishResult> {
    const { facebook_access_token: accessToken, instagram_account_id: igId } = tokens;
    if (!accessToken || !igId) {
      return { success: false, error: 'Instagram not connected. Please connect your Instagram account in settings.' };
    }

    try {
      if (request.mediaType === 'image') {
        return await publishImage(igId, accessToken, request);
      } else {
        return await publishReel(igId, accessToken, request);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown Instagram error';
      return { success: false, error: msg };
    }
  },
};

async function publishImage(
  igId: string,
  accessToken: string,
  request: PublishRequest,
): Promise<PublishResult> {
  // Step 1: Create media container
  const containerRes = await fetch(`${GRAPH_API}/${igId}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image_url: request.mediaUrl,
      caption: `${request.title}\n\n${request.description}\n\n#AhanasWorld #KidArtist`,
      access_token: accessToken,
    }),
  });

  const containerData = await containerRes.json();
  if (!containerRes.ok || containerData.error) {
    return { success: false, error: containerData.error?.message || 'Instagram container creation failed' };
  }

  // Step 2: Wait for container to be ready, then publish
  const publishResult = await pollAndPublish(igId, containerData.id, accessToken);
  return publishResult;
}

async function publishReel(
  igId: string,
  accessToken: string,
  request: PublishRequest,
): Promise<PublishResult> {
  // Step 1: Create video container (Reel)
  const containerRes = await fetch(`${GRAPH_API}/${igId}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      video_url: request.mediaUrl,
      caption: `${request.title}\n\n${request.description}\n\n#AhanasWorld #KidArtist`,
      media_type: 'REELS',
      access_token: accessToken,
    }),
  });

  const containerData = await containerRes.json();
  if (!containerRes.ok || containerData.error) {
    return { success: false, error: containerData.error?.message || 'Instagram reel container creation failed' };
  }

  // Step 2: Poll and publish
  return await pollAndPublish(igId, containerData.id, accessToken);
}

async function pollAndPublish(
  igId: string,
  containerId: string,
  accessToken: string,
  maxAttempts = 30,
): Promise<PublishResult> {
  // Poll container status until ready
  for (let i = 0; i < maxAttempts; i++) {
    const statusRes = await fetch(
      `${GRAPH_API}/${containerId}?fields=status_code&access_token=${accessToken}`,
    );
    const statusData = await statusRes.json();

    if (statusData.status_code === 'FINISHED') break;
    if (statusData.status_code === 'ERROR') {
      return { success: false, error: 'Instagram media processing failed' };
    }

    // Wait 2 seconds between polls
    await new Promise((r) => setTimeout(r, 2000));
  }

  // Publish the container
  const publishRes = await fetch(`${GRAPH_API}/${igId}/media_publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      creation_id: containerId,
      access_token: accessToken,
    }),
  });

  const publishData = await publishRes.json();
  if (!publishRes.ok || publishData.error) {
    return { success: false, error: publishData.error?.message || 'Instagram publish failed' };
  }

  return {
    success: true,
    platformPostId: publishData.id,
    platformUrl: `https://instagram.com/p/${publishData.id}`,
  };
}
