import { createSupabaseAdmin } from '@/lib/supabase/server';
import { getMediaUrl } from '@/lib/utils/storage';
import { facebookClient } from './facebook';
import { instagramClient } from './instagram';
import { youtubeClient } from './youtube';
import type { SocialPlatform, PlatformTokens, PublishRequest } from './types';

/**
 * Determines which platforms to publish to based on content type.
 * - Images (art/reading photos) → Facebook + Instagram
 * - Audio (songs) → Facebook + Instagram + YouTube
 * - Video → Facebook + Instagram + YouTube
 */
function getPlatformsForContentType(
  contentType: string,
  mediaType: string,
): SocialPlatform[] {
  if (mediaType.startsWith('video/') || contentType === 'video') {
    return ['facebook', 'instagram', 'youtube'];
  }
  if (mediaType.startsWith('audio/') || contentType === 'song') {
    return ['facebook', 'instagram', 'youtube'];
  }
  // Images — no YouTube
  return ['facebook', 'instagram'];
}

function getMediaCategory(mimeType: string): 'image' | 'audio' | 'video' {
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  return 'image';
}

const clients = {
  facebook: facebookClient,
  instagram: instagramClient,
  youtube: youtubeClient,
};

/**
 * Publish content to all applicable social platforms.
 * Called when a parent approves content from the dashboard.
 */
export async function publishToSocialMedia(contentId: string): Promise<{
  published: SocialPlatform[];
  failed: SocialPlatform[];
  skipped: SocialPlatform[];
}> {
  const supabase = createSupabaseAdmin();

  // Fetch content
  const { data: content, error: contentError } = await supabase
    .from('content')
    .select('*')
    .eq('id', contentId)
    .single();

  if (contentError || !content) {
    throw new Error('Content not found');
  }

  // Fetch parent settings
  const { data: settings } = await supabase
    .from('parent_settings')
    .select('*')
    .eq('id', 1)
    .single();

  if (!settings) {
    throw new Error('Parent settings not found');
  }

  const tokens: PlatformTokens = {
    facebook_access_token: settings.facebook_access_token,
    facebook_page_id: settings.facebook_page_id,
    instagram_account_id: settings.instagram_account_id,
    youtube_refresh_token: settings.youtube_refresh_token,
    youtube_channel_id: settings.youtube_channel_id,
  };

  // Determine applicable platforms
  const mediaType = content.media_type || 'image/jpeg';
  const allPlatforms = getPlatformsForContentType(content.type, mediaType);

  // Filter by enabled settings
  const enabledPlatforms = allPlatforms.filter((p) => {
    if (p === 'facebook') return settings.facebook_enabled;
    if (p === 'instagram') return settings.instagram_enabled;
    if (p === 'youtube') return settings.youtube_enabled;
    return false;
  });

  if (!content.media_path) {
    // Text-only content (e.g., reading without photo) — skip social
    return { published: [], failed: [], skipped: allPlatforms };
  }

  const mediaUrl = getMediaUrl(content.media_path);

  const result = { published: [] as SocialPlatform[], failed: [] as SocialPlatform[], skipped: [] as SocialPlatform[] };

  for (const platform of enabledPlatforms) {
    const client = clients[platform];

    // Check if platform is configured with tokens
    if (!client.isConfigured(tokens)) {
      // Create a skipped record
      await supabase.from('social_posts').insert({
        content_id: contentId,
        platform,
        status: 'skipped',
        error_message: `${platform} is not connected yet`,
      });
      result.skipped.push(platform);
      continue;
    }

    // Create pending record
    const { data: post } = await supabase.from('social_posts').insert({
      content_id: contentId,
      platform,
      status: 'publishing',
    }).select().single();

    const request: PublishRequest = {
      contentId,
      platform,
      mediaUrl,
      mediaType: getMediaCategory(mediaType),
      title: content.title,
      description: content.description || content.notes || '',
    };

    const publishResult = await client.publish(request, tokens);

    if (publishResult.success) {
      await supabase.from('social_posts')
        .update({
          status: 'published',
          platform_post_id: publishResult.platformPostId,
          platform_url: publishResult.platformUrl,
          published_at: new Date().toISOString(),
        })
        .eq('id', post?.id);
      result.published.push(platform);
    } else {
      await supabase.from('social_posts')
        .update({
          status: 'failed',
          error_message: publishResult.error,
        })
        .eq('id', post?.id);
      result.failed.push(platform);
    }
  }

  // Mark not-enabled platforms as skipped
  for (const p of allPlatforms) {
    if (!enabledPlatforms.includes(p)) {
      result.skipped.push(p);
    }
  }

  return result;
}
