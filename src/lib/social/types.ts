export type SocialPlatform = 'facebook' | 'instagram' | 'youtube';

export interface PublishRequest {
  contentId: string;
  platform: SocialPlatform;
  mediaUrl: string;
  mediaType: 'image' | 'audio' | 'video';
  title: string;
  description: string;
}

export interface PublishResult {
  success: boolean;
  platformPostId?: string;
  platformUrl?: string;
  error?: string;
}

export interface SocialPlatformClient {
  publish(request: PublishRequest, tokens: PlatformTokens): Promise<PublishResult>;
  isConfigured(tokens: PlatformTokens): boolean;
}

export interface PlatformTokens {
  facebook_access_token?: string | null;
  facebook_page_id?: string | null;
  instagram_account_id?: string | null;
  youtube_refresh_token?: string | null;
  youtube_channel_id?: string | null;
}
