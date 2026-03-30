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

function categoryFromType(type: string, mimeType: string): string {
  switch (type) {
    case 'song': return 'Audio Recording';
    case 'video': return 'Video Recording';
    case 'art': return mimeType === 'image/png' ? 'Digital Drawing' : 'Photography';
    case 'reading': return 'Book Reflection';
    default: return 'Creative Work';
  }
}

function mediumFromType(type: string, mimeType: string): string {
  switch (type) {
    case 'song': return 'Voice & Melody';
    case 'video': return 'Video Performance';
    case 'art': return mimeType === 'image/png' ? 'Digital Art' : 'Photography';
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

export async function POST(request: Request) {
  try {
    const supabase = createSupabaseAdmin();
    const formData = await request.formData();

    const type = formData.get('type') as string;
    const title = formData.get('title') as string;
    const notes = formData.get('notes') as string;
    const mediaFile = formData.get('media') as File | null;
    const thumbnailFile = formData.get('thumbnail') as File | null;
    const mimeType = (formData.get('mimeType') as string) || '';
    const duration = formData.get('duration') ? Number(formData.get('duration')) : null;

    if (!type || !title) {
      return NextResponse.json({ error: 'Type and title are required' }, { status: 400 });
    }

    const contentType = contentTypeFromCapture(type);
    const id = crypto.randomUUID();
    const slug = `${slugify(title)}-${id.slice(0, 8)}`;

    let mediaPath: string | null = null;
    let thumbnailPath: string | null = null;
    let fileSize: number | null = null;

    // Upload media file
    if (mediaFile && mediaFile.size > 0) {
      const ext = mediaFile.name.split('.').pop() || 'bin';
      mediaPath = `${contentType}/${id}/capture.${ext}`;
      fileSize = mediaFile.size;

      const buffer = Buffer.from(await mediaFile.arrayBuffer());
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(mediaPath, buffer, {
          contentType: mimeType || mediaFile.type,
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
      }
    } else if (mediaPath && (mimeType.startsWith('image/') || contentType === 'art')) {
      // For images, use the media file as thumbnail too
      thumbnailPath = `${id}/thumb.jpg`;
      if (mediaFile) {
        const thumbBuffer = Buffer.from(await mediaFile.arrayBuffer());
        await supabase.storage
          .from('thumbnails')
          .upload(thumbnailPath, thumbBuffer, {
            contentType: mimeType || 'image/jpeg',
            upsert: true,
          });
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
        category: categoryFromType(type, mimeType),
        medium: mediumFromType(type, mimeType),
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
