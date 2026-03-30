export interface CaptureResult {
  blob: Blob;
  mimeType: string;
  duration?: number;    // ms, for audio/video
  thumbnail?: Blob;     // auto-generated preview image
}

export interface CaptureSubmission {
  type: 'song' | 'art' | 'video' | 'reading';
  title: string;
  notes: string;
  capture?: CaptureResult; // optional for reading (text-only)
}

export type UploadStatus = 'idle' | 'uploading' | 'processing' | 'done' | 'error';

export interface UploadState {
  status: UploadStatus;
  progress: number;       // 0-100
  error?: string;
  contentId?: string;     // returned on success
}
