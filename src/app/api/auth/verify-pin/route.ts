import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase/server';

async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateSessionToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * POST /api/auth/verify-pin
 * Verifies or sets the admin PIN.
 * Body: { pin: "1234" } or { pin: "1234", action: "set" }
 */
export async function POST(request: Request) {
  try {
    const { pin, action } = await request.json();

    if (!pin || typeof pin !== 'string' || pin.length < 4) {
      return NextResponse.json({ error: 'PIN must be at least 4 digits' }, { status: 400 });
    }

    const supabase = createSupabaseAdmin();
    const { data: settings } = await supabase
      .from('parent_settings')
      .select('admin_pin_hash')
      .eq('id', 1)
      .single();

    const pinHash = await hashPin(pin);

    // First-time setup: no PIN configured yet
    if (!settings?.admin_pin_hash || action === 'set') {
      // If a PIN already exists and action is 'set', verify we're authenticated
      // (the middleware will handle this for the settings routes)
      if (!settings?.admin_pin_hash || action === 'set') {
        await supabase
          .from('parent_settings')
          .update({ admin_pin_hash: pinHash })
          .eq('id', 1);

        const token = generateSessionToken();
        const response = NextResponse.json({ success: true, firstTime: !settings?.admin_pin_hash });
        response.cookies.set('ahanas_admin_session', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 60 * 60 * 24, // 24 hours
          path: '/',
        });
        return response;
      }
    }

    // Verify PIN
    if (pinHash !== settings.admin_pin_hash) {
      return NextResponse.json({ error: 'Incorrect PIN' }, { status: 401 });
    }

    const token = generateSessionToken();
    const response = NextResponse.json({ success: true });
    response.cookies.set('ahanas_admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });
    return response;
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

    return NextResponse.json({
      pinConfigured: !!data?.admin_pin_hash,
    });
  } catch {
    return NextResponse.json({ pinConfigured: false });
  }
}
