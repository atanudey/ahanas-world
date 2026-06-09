import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase/server';
import { hashPin, verifyPin } from '@/lib/auth/pin';
import { createSessionToken, SESSION_COOKIE, SESSION_TTL_SECONDS } from '@/lib/auth/session';

function setSessionCookie(response: NextResponse, token: string): NextResponse {
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
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

    if (!pin || typeof pin !== 'string' || pin.length < 4) {
      return NextResponse.json({ error: 'PIN must be at least 4 digits' }, { status: 400 });
    }

    const supabase = createSupabaseAdmin();
    const { data: settings } = await supabase
      .from('parent_settings')
      .select('admin_pin_hash')
      .eq('id', 1)
      .single();

    const isFirstTime = !settings?.admin_pin_hash;

    if (isFirstTime) {
      // First-time setup — store the PIN and start a session.
      await supabase
        .from('parent_settings')
        .update({ admin_pin_hash: await hashPin(pin) })
        .eq('id', 1);

      const token = await createSessionToken();
      return setSessionCookie(
        NextResponse.json({ success: true, firstTime: true }),
        token,
      );
    }

    // Existing PIN — verify in constant time.
    const ok = await verifyPin(pin, settings.admin_pin_hash);
    if (!ok) {
      return NextResponse.json({ error: 'Incorrect PIN' }, { status: 401 });
    }

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
