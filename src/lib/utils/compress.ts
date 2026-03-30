/**
 * Client-side media compression utilities.
 * Uses native browser APIs — no external dependencies.
 */

/**
 * Compress an image blob by resizing and reducing quality.
 * Uses Canvas API.
 */
export async function compressImage(
  blob: Blob,
  maxWidth = 1920,
  quality = 0.8,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(blob); return; }

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (result) => resolve(result || blob),
        'image/jpeg',
        quality,
      );
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(blob);
  });
}

/**
 * Extract a thumbnail frame from a video blob at a given time (seconds).
 * Returns a JPEG blob.
 */
export async function extractVideoThumbnail(
  videoBlob: Blob,
  timeSeconds = 1,
  maxWidth = 640,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';

    video.onloadeddata = () => {
      video.currentTime = Math.min(timeSeconds, video.duration * 0.1);
    };

    video.onseeked = () => {
      const canvas = document.createElement('canvas');
      let { videoWidth: width, videoHeight: height } = video;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(null); return; }

      ctx.drawImage(video, 0, 0, width, height);
      canvas.toBlob(
        (result) => {
          URL.revokeObjectURL(video.src);
          resolve(result);
        },
        'image/jpeg',
        0.8,
      );
    };

    video.onerror = () => resolve(null);
    video.src = URL.createObjectURL(videoBlob);
  });
}
