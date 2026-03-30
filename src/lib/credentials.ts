import { createSupabaseAdmin } from '@/lib/supabase/server';

export interface AppCredentials {
  facebookAppId: string;
  facebookAppSecret: string;
  googleClientId: string;
  googleClientSecret: string;
  googleRedirectUri: string;
  siteUrl: string;
}

/**
 * Reads app credentials from parent_settings (DB-first), falling back to env vars.
 * This is the single source of truth for all credential reads on the server.
 */
export async function getAppCredentials(): Promise<AppCredentials> {
  try {
    const supabase = createSupabaseAdmin();
    const { data } = await supabase
      .from('parent_settings')
      .select('facebook_app_id, facebook_app_secret, google_client_id, google_client_secret, google_redirect_uri, site_url')
      .eq('id', 1)
      .single();

    return {
      facebookAppId: data?.facebook_app_id || process.env.FACEBOOK_APP_ID || '',
      facebookAppSecret: data?.facebook_app_secret || process.env.FACEBOOK_APP_SECRET || '',
      googleClientId: data?.google_client_id || process.env.GOOGLE_CLIENT_ID || '',
      googleClientSecret: data?.google_client_secret || process.env.GOOGLE_CLIENT_SECRET || '',
      googleRedirectUri: data?.google_redirect_uri || process.env.GOOGLE_REDIRECT_URI || '',
      siteUrl: data?.site_url || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    };
  } catch {
    // Fallback to env vars if DB is unreachable
    return {
      facebookAppId: process.env.FACEBOOK_APP_ID || '',
      facebookAppSecret: process.env.FACEBOOK_APP_SECRET || '',
      googleClientId: process.env.GOOGLE_CLIENT_ID || '',
      googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      googleRedirectUri: process.env.GOOGLE_REDIRECT_URI || '',
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    };
  }
}
