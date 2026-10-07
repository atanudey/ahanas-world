-- Migration 005: Lock out admin PIN guessing.
--
-- The admin PIN is 4–8 digits and /api/auth/verify-pin is public, so without a
-- limit the whole 4-digit space can be tried in minutes. claim_pin_attempt()
-- atomically reserves an attempt BEFORE the PIN is checked: once max_attempts
-- attempts have been claimed without a success, further claims are refused until
-- the lock expires. Claiming up front (rather than counting failures afterwards)
-- means a burst of parallel requests can't slip extra guesses past the counter.
-- A successful login calls reset_pin_attempts().
--
-- The lock is global (not per-IP) because this is a single-admin app; the cost
-- is that someone hammering the endpoint can delay the parent's login by up to
-- lock_seconds.

ALTER TABLE parent_settings
  ADD COLUMN IF NOT EXISTS pin_failed_attempts INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pin_locked_until TIMESTAMPTZ;

CREATE OR REPLACE FUNCTION claim_pin_attempt(max_attempts INTEGER, lock_seconds INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  -- Old values are visible in SET expressions. A non-null pin_locked_until on a
  -- matching row means the previous lock has expired, so start counting afresh.
  UPDATE parent_settings
  SET
    pin_failed_attempts =
      (CASE WHEN pin_locked_until IS NOT NULL THEN 0 ELSE pin_failed_attempts END) + 1,
    pin_locked_until =
      CASE
        WHEN (CASE WHEN pin_locked_until IS NOT NULL THEN 0 ELSE pin_failed_attempts END) + 1 >= max_attempts
          THEN now() + make_interval(secs => lock_seconds)
        ELSE NULL
      END
  WHERE id = 1
    AND (pin_locked_until IS NULL OR pin_locked_until <= now());

  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION reset_pin_attempts()
RETURNS VOID
LANGUAGE sql
AS $$
  UPDATE parent_settings SET pin_failed_attempts = 0, pin_locked_until = NULL WHERE id = 1;
$$;

-- Only the server (service role) may call these; otherwise anyone with the anon
-- key could lock the parent out via PostgREST.
REVOKE ALL ON FUNCTION claim_pin_attempt(INTEGER, INTEGER) FROM PUBLIC;
REVOKE ALL ON FUNCTION reset_pin_attempts() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION claim_pin_attempt(INTEGER, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION reset_pin_attempts() TO service_role;
