import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase/server';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

function contentTypeFromCapture(captureType: string): string {
  switch (captureType) {
    case 'song': return 'song';
    case 'video': return 'video';
    case 'art': return 'art';
    case 'reading': return 'reading';
    default: return 'art';
  }
}

/** `sourceMime` is the type the capture produced (a PNG is a drawing), not the stored type. */
function categoryFromType(type: string, sourceMime: string): string {
  switch (type) {
    case 'song': return 'Audio Recording';
    case 'video': return 'Video Recording';
    case 'art': return sourceMime === 'image/png' ? 'Digital Drawing' : sourceMime ? 'Photography' : 'Artwork';
    case 'reading': return 'Book Reflection';
    default: return 'Creative Work';
  }
}

function mediumFromType(type: string, sourceMime: string): string {
  switch (type) {
    case 'song': return 'Voice & Melody';
    case 'video': return 'Video Performance';
    case 'art': return sourceMime === 'image/png' ? 'Digital Art' : sourceMime ? 'Photography' : 'Mixed Media';
    case 'reading': return 'Literary Reflection';
    default: return 'Mixed Media';
  }
}

function sectionsFromType(type: string): string[] {
  switch (type) {
    case 'song': return ['home', 'music'];
    case 'video': return ['home', 'milestones'];
    case 'art': return ['home', 'art'];
    case 'reading': return ['home', 'reading'];
    default: return ['home'];
  }
}

/**
 * Formats the capture components produce. The stored extension and Content-Type
 * come from this map — never from the client's filename — so an upload can't
 * place e.g. an .html page in the public bucket.
 */
const ALLOWED_MEDIA_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'audio/webm': 'webm',
  'audio/mp4': 'm4a',
  'audio/mpeg': 'mp3',
  'audio/ogg': 'ogg',
  'video/webm': 'webm',
  'video/mp4': 'mp4',
  'video/quicktime': 'mov',
};

const MAX_MEDIA_BYTES = 200 * 1024 * 1024; // ~ a few minutes of phone video
const MAX_THUMBNAIL_BYTES = 5 * 1024 * 1024;
// Media + thumbnail + form fields; checked before buffering the body.
const MAX_REQUEST_BYTES = MAX_MEDIA_BYTES + MAX_THUMBNAIL_BYTES + 1024 * 1024;

/** 'video/webm;codecs=vp9,opus' → 'video/webm' */
function baseMimeType(mimeType: string): string {
  return mimeType.split(';')[0].trim().toLowerCase();
}

export async function POST(request: Request) {
  try {
    // Browsers always send Content-Length for a FormData body; without it the
    // size can't be checked before the whole request is read into memory.
    const contentLength = request.headers.get('content-length');
    if (contentLength === null) {
      return NextResponse.json({ error: 'Content-Length is required' }, { status: 411 });
    }
    if (Number(contentLength) > MAX_REQUEST_BYTES) {
      return NextResponse.json({ error: 'Upload is too large' }, { status: 413 });
    }

    const formData = await request.formData();

    const type = formData.get('type') as string;
    const title = formData.get('title') as string;
    const notes = formData.get('notes') as string;
    const mediaFile = formData.get('media') as File | null;
    const thumbnailFile = formData.get('thumbnail') as File | null;
    const rawDuration = formData.get('duration') ? Number(formData.get('duration')) : null;
    const duration = rawDuration !== null && Number.isFinite(rawDuration) && rawDuration >= 0
      ? Math.round(rawDuration)
      : null;

    if (!type || !title) {
      return NextResponse.json({ error: 'Type and title are required' }, { status: 400 });
    }

    const hasMedia = !!mediaFile && mediaFile.size > 0;
    const mimeType = hasMedia
      ? baseMimeType((formData.get('mimeType') as string) || mediaFile.type || '')
      : '';
    const mediaExt = ALLOWED_MEDIA_TYPES[mimeType];
    // Images are compressed to JPEG in the browser; the original type says
    // whether this was a drawing or a photo.
    const sourceMime = hasMedia
      ? baseMimeType((formData.get('sourceMimeType') as string) || mimeType)
      : '';

    if (hasMedia) {
      if (!mediaExt) {
        return NextResponse.json({ error: `Unsupported media type "${mimeType}"` }, { status: 415 });
      }
      if (mediaFile.size > MAX_MEDIA_BYTES) {
        return NextResponse.json({ error: 'Media file is too large' }, { status: 413 });
      }
    }
    if (thumbnailFile && thumbnailFile.size > MAX_THUMBNAIL_BYTES) {
      return NextResponse.json({ error: 'Thumbnail is too large' }, { status: 413 });
    }

    const supabase = createSupabaseAdmin();
    const contentType = contentTypeFromCapture(type);
    const id = crypto.randomUUID();
    const slug = `${slugify(title)}-${id.slice(0, 8)}`;

    let mediaPath: string | null = null;
    let thumbnailPath: string | null = null;
    let fileSize: number | null = null;

    // Upload media file
    if (hasMedia) {
      mediaPath = `${contentType}/${id}/capture.${mediaExt}`;
      fileSize = mediaFile.size;

      const buffer = Buffer.from(await mediaFile.arrayBuffer());
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(mediaPath, buffer, {
          contentType: mimeType,
          upsert: true,
        });

      if (uploadError) {
        console.error('Media upload error:', uploadError);
        return NextResponse.json({ error: 'Failed to upload media' }, { status: 500 });
      }
    }

    // Upload thumbnail
    if (thumbnailFile && thumbnailFile.size > 0) {
      thumbnailPath = `${id}/thumb.jpg`;
      const thumbBuffer = Buffer.from(await thumbnailFile.arrayBuffer());
      const { error: thumbError } = await supabase.storage
        .from('thumbnails')
        .upload(thumbnailPath, thumbBuffer, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (thumbError) {
        console.error('Thumbnail upload error:', thumbError);
        // Non-fatal — continue without thumbnail
        thumbnailPath = null;
      }
    } else if (hasMedia && mimeType.startsWith('image/')) {
      // For images, use the media file as thumbnail too
      thumbnailPath = `${id}/thumb.jpg`;
      const thumbBuffer = Buffer.from(await mediaFile.arrayBuffer());
      const { error: thumbError } = await supabase.storage
        .from('thumbnails')
        .upload(thumbnailPath, thumbBuffer, {
          contentType: mimeType,
          upsert: true,
        });
      if (thumbError) {
        console.error('Thumbnail upload error:', thumbError);
        thumbnailPath = null;
      }
    }

    // Insert content record — status is review_needed (parent must approve)
    const { data, error: dbError } = await supabase
      .from('content')
      .insert({
        id,
        type: contentType,
        title,
        slug,
        description: notes,
        story: '',
        notes,
        category: categoryFromType(type, sourceMime),
        medium: mediumFromType(type, sourceMime),
        status: 'review_needed',
        visibility: 'private',
        sections: sectionsFromType(type),
        media_path: mediaPath,
        thumbnail_path: thumbnailPath,
        media_type: mimeType || null,
        file_size_bytes: fileSize,
        duration_ms: duration,
      })
      .select()
      .single();

    if (dbError) {
      console.error('DB insert error:', dbError);
      return NextResponse.json({ error: 'Failed to save content' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('Upload route error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
