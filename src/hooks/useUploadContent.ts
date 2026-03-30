'use client';

import { useState, useCallback } from 'react';
import type { UploadState } from '@/lib/types/capture';

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
    setUploadState({ status: 'uploading', progress: 10 });

    try {
      const formData = new FormData();
      formData.append('type', params.type);
      formData.append('title', params.title);
      formData.append('notes', params.notes);

      if (params.mediaBlob) {
        const ext = params.mimeType?.split('/')[1]?.split(';')[0] ?? 'bin';
        formData.append('media', params.mediaBlob, `capture.${ext}`);
        formData.append('mimeType', params.mimeType ?? 'application/octet-stream');
      }

      if (params.thumbnailBlob) {
        formData.append('thumbnail', params.thumbnailBlob, 'thumb.jpg');
      }

      if (params.duration !== undefined) {
        formData.append('duration', String(params.duration));
      }

      setUploadState({ status: 'uploading', progress: 30 });

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
