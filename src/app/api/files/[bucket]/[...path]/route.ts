import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase/server';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth/session';

/** Which content column references the objects in each bucket. */
const BUCKET_COLUMN = { media: 'media_path', thumbnails: 'thumbnail_path' } as const;
type Bucket = keyof typeof BUCKET_COLUMN;

const SIGNED_URL_TTL_SECONDS = 60 * 60;

function notFound() {
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

/**
 * GET /api/files/[bucket]/[...path]
 *
 * The storage buckets are private (migration 006), so this route is how a
 * browser reaches a file: it looks up the content the file belongs to, allows
 * it when that content is published and public or when the parent is signed
 * in, and redirects to a short-lived signed URL. Anything else is a 404, so
 * the route doesn't reveal which private files exist.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bucket: string; path: string[] }> },
) {
  const { bucket, path: segments } = await params;
  const column = BUCKET_COLUMN[bucket as Bucket];
  if (!column || segments.length === 0 || segments.some((s) => !s || s === '.' || s === '..')) {
    return notFound();
  }
  const path = segments.join('/');

  try {
    const supabase = createSupabaseAdmin();
    const { data: content, error } = await supabase
      .from('content')
      .select('status, visibility')
      .eq(column, path)
      .maybeSingle();
    if (error) throw error;
    if (!content) return notFound();

    const isPublic = content.status === 'published' && content.visibility === 'public';
    if (!isPublic) {
      const signedIn = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
      if (!signedIn) return notFound();
    }

    const { data: signed, error: signError } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);
    if (signError || !signed?.signedUrl) throw signError ?? new Error('No signed URL returned');

    const response = NextResponse.redirect(signed.signedUrl, 302);
    // Browsers may reuse the redirect for a while; the signed URL outlives it.
    response.headers.set('Cache-Control', `${isPublic ? 'public' : 'private'}, max-age=600`);
    return response;
  } catch (err) {
    console.error('files route error:', err);
    return NextResponse.json({ error: 'Could not load file' }, { status: 500 });
  }
}
