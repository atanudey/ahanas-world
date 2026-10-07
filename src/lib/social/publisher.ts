import { createSupabaseAdmin } from '@/lib/supabase/server';
import { getMediaUrl } from '@/lib/utils/storage';
import { facebookClient } from './facebook';
import { instagramClient } from './instagram';
import { youtubeClient } from './youtube';
import type { SocialPlatform, PlatformTokens, PublishRequest } from './types';

/**
 * Determines which platforms to publish to based on content type.
 * - Images (art/reading photos) → Facebook + Instagram
 * - Audio (songs) → Facebook + Instagram + YouTube (recorded as skipped until
 *   audio is converted to video — none of these accept a raw audio upload)
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
  const mediaCategory = getMediaCategory(mediaType);

  const result = { published: [] as SocialPlatform[], failed: [] as SocialPlatform[], skipped: [] as SocialPlatform[] };

  // This also runs on retry, so never re-post to a platform that already has the
  // content (or is mid-upload) — only retry the ones that failed or were skipped.
  const { data: existingPosts } = await supabase
    .from('social_posts')
    .select('platform, status')
    .eq('content_id', contentId);
  const alreadyDone = new Set(
    (existingPosts ?? [])
      .filter((p: { status: string }) => p.status === 'published' || p.status === 'publishing')
      .map((p: { platform: string }) => p.platform),
  );

  for (const platform of enabledPlatforms) {
    if (alreadyDone.has(platform)) continue;

    // Replace earlier failed/skipped rows so each platform shows its latest outcome once.
    await supabase
      .from('social_posts')
      .delete()
      .eq('content_id', contentId)
      .eq('platform', platform)
      .in('status', ['failed', 'skipped']);

    const client = clients[platform];

    // Facebook video, Instagram Reels and YouTube all need a video file; a raw
    // audio upload is rejected, so don't attempt it.
    const skipReason = mediaCategory === 'audio'
      ? `Audio-only posts aren't supported on ${platform} yet`
      : !client.isConfigured(tokens)
        ? `${platform} is not connected yet`
        : null;

    if (skipReason) {
      await supabase.from('social_posts').insert({
        content_id: contentId,
        platform,
        status: 'skipped',
        error_message: skipReason,
      });
      result.skipped.push(platform);
      continue;
    }

    // Create pending record — its id is needed to record the outcome.
    const { data: post, error: insertError } = await supabase.from('social_posts').insert({
      content_id: contentId,
      platform,
      status: 'publishing',
    }).select().single();

    if (insertError || !post) {
      console.error(`publisher: could not record ${platform} attempt`, insertError);
      result.failed.push(platform);
      continue;
    }

    const request: PublishRequest = {
      contentId,
      platform,
      mediaUrl,
      mediaType: mediaCategory,
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
        .eq('id', post.id);
      result.published.push(platform);
    } else {
      await supabase.from('social_posts')
        .update({
          status: 'failed',
          error_message: publishResult.error,
        })
        .eq('id', post.id);
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
