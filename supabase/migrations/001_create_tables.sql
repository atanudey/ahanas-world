-- Content registry: every capture from the Hub
CREATE TABLE IF NOT EXISTS content (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type            TEXT NOT NULL CHECK (type IN ('song','video','art','reading','space_science','milestone')),
  title           TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  description     TEXT DEFAULT '',
  story           TEXT DEFAULT '',
  notes           TEXT DEFAULT '',
  category        TEXT DEFAULT '',
  medium          TEXT DEFAULT '',
  status          TEXT NOT NULL DEFAULT 'review_needed'
                    CHECK (status IN ('draft','review_needed','scheduled','published','failed','archived','private')),
  visibility      TEXT NOT NULL DEFAULT 'public'
                    CHECK (visibility IN ('public','private','internal')),
  sections        TEXT[] DEFAULT '{}',

  -- Storage references
  media_path      TEXT,
  thumbnail_path  TEXT,
  media_type      TEXT,
  file_size_bytes BIGINT,
  duration_ms     INTEGER,

  views           INTEGER DEFAULT 0,
  xp_awarded      INTEGER DEFAULT 0,

  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  published_at    TIMESTAMPTZ
);

-- Social media post tracking
CREATE TABLE IF NOT EXISTS social_posts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id       UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  platform         TEXT NOT NULL CHECK (platform IN ('facebook','instagram','youtube')),
  status           TEXT NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending','publishing','published','failed','skipped')),
  platform_post_id TEXT,
  platform_url     TEXT,
  error_message    TEXT,
  retry_count      INTEGER DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT now(),
  published_at     TIMESTAMPTZ
);

-- Singleton parent settings
CREATE TABLE IF NOT EXISTS parent_settings (
  id                      INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  auto_publish            BOOLEAN DEFAULT false,
  facebook_enabled        BOOLEAN DEFAULT true,
  instagram_enabled       BOOLEAN DEFAULT true,
  youtube_enabled         BOOLEAN DEFAULT true,
  require_review          BOOLEAN DEFAULT true,

  -- OAuth tokens (stored server-side only)
  facebook_access_token   TEXT,
  facebook_page_id        TEXT,
  instagram_account_id    TEXT,
  youtube_refresh_token   TEXT,
  youtube_channel_id      TEXT,

  updated_at              TIMESTAMPTZ DEFAULT now()
);

-- Insert default settings
INSERT INTO parent_settings (id) VALUES (1) ON CONFLICT DO NOTHING;

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER content_updated_at
  BEFORE UPDATE ON content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER settings_updated_at
  BEFORE UPDATE ON parent_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS policies
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_settings ENABLE ROW LEVEL SECURITY;

-- Anon can only read published public content
CREATE POLICY "Public can read published content"
  ON content FOR SELECT
  USING (visibility = 'public' AND status = 'published');

-- Service role bypasses RLS automatically

-- Indexes
CREATE INDEX idx_content_status ON content(status);
CREATE INDEX idx_content_type ON content(type);
CREATE INDEX idx_content_created ON content(created_at DESC);
CREATE INDEX idx_social_posts_content ON social_posts(content_id);
