-- Migration 003: Add app credentials & admin PIN to parent_settings
-- These columns allow all configuration to be managed from the admin UI
-- so the app works fully after Replit deployment without env var changes.

ALTER TABLE parent_settings
  ADD COLUMN IF NOT EXISTS facebook_app_id TEXT,
  ADD COLUMN IF NOT EXISTS facebook_app_secret TEXT,
  ADD COLUMN IF NOT EXISTS google_client_id TEXT,
  ADD COLUMN IF NOT EXISTS google_client_secret TEXT,
  ADD COLUMN IF NOT EXISTS google_redirect_uri TEXT,
  ADD COLUMN IF NOT EXISTS site_url TEXT,
  ADD COLUMN IF NOT EXISTS admin_pin_hash TEXT;
