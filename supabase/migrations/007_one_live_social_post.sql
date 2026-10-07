-- Migration 007: At most one live social post per platform per content.
--
-- Two approvals arriving at the same moment could each record a 'publishing'
-- row and post the same video twice. With this index the second insert fails,
-- and the publisher records that platform as failed instead of posting again.
-- Finished rows ('failed', 'skipped') are not covered, so retries can still
-- replace them.
--
-- If an existing database already holds duplicates from before this fix, the
-- index is skipped with a notice rather than failing the migration; remove the
-- duplicate rows and re-run the CREATE INDEX statement by hand.

DO $$
BEGIN
  CREATE UNIQUE INDEX IF NOT EXISTS social_posts_one_live_per_platform
    ON social_posts (content_id, platform)
    WHERE status IN ('publishing', 'published');
EXCEPTION WHEN unique_violation THEN
  RAISE NOTICE 'social_posts has duplicate live rows; index social_posts_one_live_per_platform not created.';
END
$$;
