'use client';

import { useState, useCallback } from 'react';
import type { UploadState } from '@/lib/types/capture';
import { compressImage, extractVideoThumbnail } from '@/lib/utils/compress';

interface UploadParams {
  type: 'song' | 'art' | 'video' | 'reading';
  title: string;
  notes: string;
  mediaBlob?: Blob;
  thumbnailBlob?: Blob;
  mimeType?: string;
  duration?: number;
}

export function useUploadContent() {
  const [uploadState, setUploadState] = useState<UploadState>({
    status: 'idle',
    progress: 0,
  });

  const upload = useCallback(async (params: UploadParams) => {
    setUploadState({ status: 'uploading', progress: 5 });

    try {
      let mediaBlob = params.mediaBlob;
      let thumbnailBlob = params.thumbnailBlob;
      const mimeType = params.mimeType ?? 'application/octet-stream';

      // Compress images before upload
      if (mediaBlob && mimeType.startsWith('image/')) {
        setUploadState({ status: 'uploading', progress: 10 });
        mediaBlob = await compressImage(mediaBlob, 1920, 0.85);
      }

      // Auto-generate thumbnail for video if not provided
      if (mediaBlob && mimeType.startsWith('video/') && !thumbnailBlob) {
        setUploadState({ status: 'uploading', progress: 10 });
        const thumb = await extractVideoThumbnail(mediaBlob);
        if (thumb) thumbnailBlob = thumb;
      }

      setUploadState({ status: 'uploading', progress: 20 });

      const formData = new FormData();
      formData.append('type', params.type);
      formData.append('title', params.title);
      formData.append('notes', params.notes);

      if (mediaBlob) {
        const ext = mimeType.split('/')[1]?.split(';')[0] ?? 'bin';
        formData.append('media', mediaBlob, `capture.${ext}`);
        formData.append('mimeType', mimeType);
      }

      if (thumbnailBlob) {
        formData.append('thumbnail', thumbnailBlob, 'thumb.jpg');
      }

      if (params.duration !== undefined) {
        formData.append('duration', String(params.duration));
      }

      setUploadState({ status: 'uploading', progress: 40 });

      const res = await fetch('/api/content/upload', {
        method: 'POST',
        body: formData,
      });

      setUploadState({ status: 'processing', progress: 80 });

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(body.error || 'Upload failed');
      }

      const data = await res.json();
      setUploadState({ status: 'done', progress: 100, contentId: data.id });
      return data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      setUploadState({ status: 'error', progress: 0, error: msg });
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setUploadState({ status: 'idle', progress: 0 });
  }, []);

  return { uploadState, upload, reset };
}
