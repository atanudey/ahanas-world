import { describe, it, expect } from 'vitest';

/**
 * Tests for social media publishing logic — platform routing and media categorization.
 */

type SocialPlatform = 'facebook' | 'instagram' | 'youtube';

function getPlatformsForContentType(contentType: string, mediaType: string): SocialPlatform[] {
  if (mediaType.startsWith('video/') || contentType === 'video') {
    return ['facebook', 'instagram', 'youtube'];
  }
  if (mediaType.startsWith('audio/') || contentType === 'song') {
    return ['facebook', 'instagram', 'youtube'];
  }
  return ['facebook', 'instagram'];
}

function getMediaCategory(mimeType: string): 'image' | 'audio' | 'video' {
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  return 'image';
}

describe('getPlatformsForContentType', () => {
  it('routes images to Facebook + Instagram only', () => {
    expect(getPlatformsForContentType('art', 'image/jpeg')).toEqual(['facebook', 'instagram']);
    expect(getPlatformsForContentType('art', 'image/png')).toEqual(['facebook', 'instagram']);
  });

  it('routes videos to all 3 platforms', () => {
    expect(getPlatformsForContentType('video', 'video/mp4')).toEqual(['facebook', 'instagram', 'youtube']);
    expect(getPlatformsForContentType('art', 'video/webm')).toEqual(['facebook', 'instagram', 'youtube']);
  });

  it('routes audio/songs to all 3 platforms', () => {
    expect(getPlatformsForContentType('song', 'audio/mp3')).toEqual(['facebook', 'instagram', 'youtube']);
    expect(getPlatformsForContentType('song', 'audio/webm')).toEqual(['facebook', 'instagram', 'youtube']);
  });

  it('song content type goes to all 3 even with image mime', () => {
    expect(getPlatformsForContentType('song', 'image/jpeg')).toEqual(['facebook', 'instagram', 'youtube']);
  });

  it('video content type goes to all 3 even with image mime', () => {
    expect(getPlatformsForContentType('video', 'image/jpeg')).toEqual(['facebook', 'instagram', 'youtube']);
  });

  it('reading type with image goes to FB + IG', () => {
    expect(getPlatformsForContentType('reading', 'image/jpeg')).toEqual(['facebook', 'instagram']);
  });
});

describe('getMediaCategory', () => {
  it('categorizes video types', () => {
    expect(getMediaCategory('video/mp4')).toBe('video');
    expect(getMediaCategory('video/webm')).toBe('video');
    expect(getMediaCategory('video/quicktime')).toBe('video');
  });

  it('categorizes audio types', () => {
    expect(getMediaCategory('audio/mp3')).toBe('audio');
    expect(getMediaCategory('audio/webm')).toBe('audio');
    expect(getMediaCategory('audio/wav')).toBe('audio');
  });

  it('defaults to image for everything else', () => {
    expect(getMediaCategory('image/jpeg')).toBe('image');
    expect(getMediaCategory('image/png')).toBe('image');
    expect(getMediaCategory('application/octet-stream')).toBe('image');
  });
});
