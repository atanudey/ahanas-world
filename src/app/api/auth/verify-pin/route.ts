import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase/server';
import { hashPin, verifyPin } from '@/lib/auth/pin';
import { createSessionToken, SESSION_COOKIE, SESSION_TTL_SECONDS } from '@/lib/auth/session';

const MAX_PIN_ATTEMPTS = 5;
const PIN_LOCK_SECONDS = 15 * 60;

function setSessionCookie(response: NextResponse, token: string): NextResponse {
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    // Lax, not Strict: the OAuth providers redirect back to this site, and a
    // Strict cookie is withheld for that whole navigation — the parent would be
    // sent to the login page instead of seeing the connection result. Every
    // state-changing route is a POST/PATCH/DELETE, which Lax still protects.
    sameSite: 'lax',
    maxAge: SESSION_TTL_SECONDS,
    path: '/',
  });
  return response;
}

/**
 * POST /api/auth/verify-pin
 * - First-time setup (no PIN configured): sets the PIN and signs the admin in.
 * - Otherwise: verifies the PIN and signs the admin in.
 *
 * Security: this endpoint is intentionally public so the admin can perform the
 * very first setup. Once a PIN exists it can ONLY be verified here, never
 * overwritten — changing the PIN requires an authenticated request to
 * PATCH /api/settings. (Previously `action: "set"` let anyone reset the PIN.)
 */
export async function POST(request: Request) {
  try {
    const { pin } = await request.json();

    if (typeof pin !== 'string' || !/^\d{4,8}$/.test(pin)) {
      return NextResponse.json({ error: 'PIN must be 4–8 digits' }, { status: 400 });
    }

    const supabase = createSupabaseAdmin();
    const { data: settings, error: readError } = await supabase
      .from('parent_settings')
      .select('admin_pin_hash')
      .eq('id', 1)
      .single();

    // Fail closed: a failed read must never be mistaken for "no PIN configured".
    if (readError || !settings) {
      console.error('verify-pin: failed to read settings', readError);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    if (!settings.admin_pin_hash) {
      // First-time setup. Only succeed if the PIN is still unset at write time, so
      // a concurrent request can't overwrite a PIN that was just configured.
      const { data: claimed, error: setError } = await supabase
        .from('parent_settings')
        .update({ admin_pin_hash: await hashPin(pin) })
        .eq('id', 1)
        .is('admin_pin_hash', null)
        .select('id');

      if (setError) {
        console.error('verify-pin: failed to set PIN', setError);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
      }
      if (!claimed?.length) {
        return NextResponse.json({ error: 'A PIN has already been set. Please sign in.' }, { status: 409 });
      }

      const token = await createSessionToken();
      return setSessionCookie(
        NextResponse.json({ success: true, firstTime: true }),
        token,
      );
    }

    // Reserve an attempt before checking — see migration 005 for the lockout rules.
    const { data: allowed, error: claimError } = await supabase.rpc('claim_pin_attempt', {
      max_attempts: MAX_PIN_ATTEMPTS,
      lock_seconds: PIN_LOCK_SECONDS,
    });
    if (claimError) {
      console.error('verify-pin: claim_pin_attempt failed (is migration 005 applied?)', claimError);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
    if (!allowed) {
      return NextResponse.json(
        { error: `Too many attempts. Try again in ${PIN_LOCK_SECONDS / 60} minutes.` },
        { status: 429 },
      );
    }

    // Existing PIN — verify in constant time.
    const ok = await verifyPin(pin, settings.admin_pin_hash);
    if (!ok) {
      return NextResponse.json({ error: 'Incorrect PIN' }, { status: 401 });
    }

    const { error: resetError } = await supabase.rpc('reset_pin_attempts');
    if (resetError) console.error('verify-pin: reset_pin_attempts failed', resetError);

    const token = await createSessionToken();
    return setSessionCookie(NextResponse.json({ success: true }), token);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/auth/verify-pin
 * Check if a PIN is configured (for the login page to know which mode to show).
 */
export async function GET() {
  try {
    const supabase = createSupabaseAdmin();
    const { data } = await supabase
      .from('parent_settings')
      .select('admin_pin_hash')
      .eq('id', 1)
      .single();

    return NextResponse.json({ pinConfigured: !!data?.admin_pin_hash });
  } catch {
    return NextResponse.json({ pinConfigured: false });
  }
}
