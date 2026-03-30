'use client';

import { useState, useCallback } from 'react';
import {
  X, Check, AlertTriangle, RotateCcw, Trash2,
  Eye, EyeOff, ExternalLink, Clock, Play, Pause,
} from 'lucide-react';
import { getMediaUrl, getThumbnailUrl } from '@/lib/utils/storage';

interface SocialPost {
  id: string;
  platform: string;
  status: string;
  platform_url?: string;
  error_message?: string;
  published_at?: string;
}

interface ContentRecord {
  id: string;
  type: string;
  title: string;
  description: string;
  story: string;
  notes: string;
  status: string;
  visibility: string;
  media_path?: string;
  thumbnail_path?: string;
  media_type?: string;
  duration_ms?: number;
  created_at: string;
  published_at?: string;
  social_posts?: SocialPost[];
}

interface ContentDetailPanelProps {
  content: ContentRecord;
  onClose: () => void;
  onUpdate: () => void;
}

export function ContentDetailPanel({ content, onClose, onUpdate }: ContentDetailPanelProps) {
  const [title, setTitle] = useState(content.title);
  const [description, setDescription] = useState(content.description);
  const [story, setStory] = useState(content.story);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaUrl = content.media_path ? getMediaUrl(content.media_path) : null;
  const thumbUrl = content.thumbnail_path ? getThumbnailUrl(content.thumbnail_path) : null;

  const saveChanges = useCallback(async () => {
    setSaving(true);
    try {
      await fetch(`/api/content/${content.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, story }),
      });
      onUpdate();
    } finally {
      setSaving(false);
    }
  }, [content.id, title, description, story, onUpdate]);

  const approve = useCallback(async () => {
    setPublishing(true);
    try {
      await fetch(`/api/content/${content.id}/publish`, { method: 'POST' });
      onUpdate();
    } finally {
      setPublishing(false);
    }
  }, [content.id, onUpdate]);

  const toggleVisibility = useCallback(async () => {
    await fetch(`/api/content/${content.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visibility: content.visibility === 'public' ? 'private' : 'public',
      }),
    });
    onUpdate();
  }, [content.id, content.visibility, onUpdate]);

  const retryPlatform = useCallback(async () => {
    await fetch(`/api/content/${content.id}/publish`, { method: 'POST' });
    onUpdate();
  }, [content.id, onUpdate]);

  const deleteContent = useCallback(async () => {
    setDeleting(true);
    try {
      await fetch(`/api/content/${content.id}`, { method: 'DELETE' });
      onUpdate();
      onClose();
    } finally {
      setDeleting(false);
    }
  }, [content.id, onUpdate, onClose]);

  const platformIcon = (platform: string) => {
    switch (platform) {
      case 'facebook': return 'FB';
      case 'instagram': return 'IG';
      case 'youtube': return 'YT';
      default: return platform;
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'published': return 'text-emerald-600 bg-emerald-50';
      case 'failed': return 'text-red-600 bg-red-50';
      case 'publishing': return 'text-amber-600 bg-amber-50';
      case 'skipped': return 'text-slate-500 bg-slate-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-white h-full overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 p-5 flex items-center justify-between z-10">
          <h3 className="font-black text-lg text-slate-800">Content Details</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Media Preview */}
          {mediaUrl && (
            <div className="rounded-2xl overflow-hidden bg-slate-100 relative">
              {content.media_type?.startsWith('image/') && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={mediaUrl} alt={content.title} className="w-full h-56 object-cover" />
              )}
              {content.media_type?.startsWith('video/') && (
                <video src={mediaUrl} controls playsInline className="w-full h-56 object-cover" />
              )}
              {content.media_type?.startsWith('audio/') && (
                <div className="p-6 flex items-center gap-4">
                  <button
                    onClick={() => {
                      const audio = document.getElementById('detail-audio') as HTMLAudioElement;
                      if (isPlaying) audio?.pause(); else audio?.play();
                      setIsPlaying(!isPlaying);
                    }}
                    className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white flex items-center justify-center shadow-lg"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                  </button>
                  <div className="flex-1">
                    <p className="font-bold text-sm text-slate-700">{content.title}</p>
                    <p className="text-xs text-slate-500">{content.duration_ms ? `${Math.round(content.duration_ms / 1000)}s` : 'Audio'}</p>
                  </div>
                  <audio id="detail-audio" src={mediaUrl} onEnded={() => setIsPlaying(false)} />
                </div>
              )}
            </div>
          )}

          {/* Status Badge */}
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColor(content.status)}`}>
              {content.status.replace('_', ' ')}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              content.visibility === 'public' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500 bg-slate-50'
            }`}>
              {content.visibility}
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(content.created_at).toLocaleDateString()}
            </span>
          </div>

          {/* Editable Fields */}
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-300 transition"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium resize-none focus:outline-none focus:ring-2 focus:ring-violet-300 transition"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Story (public-facing)</label>
              <textarea
                value={story}
                onChange={(e) => setStory(e.target.value)}
                rows={2}
                placeholder="Write the story behind this creation..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium resize-none focus:outline-none focus:ring-2 focus:ring-violet-300 transition"
              />
            </div>
            <button
              onClick={saveChanges}
              disabled={saving}
              className="w-full py-2.5 rounded-xl bg-slate-800 text-white text-sm font-bold hover:bg-slate-700 transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          {/* Approve / Publish */}
          {content.status === 'review_needed' && (
            <button
              onClick={approve}
              disabled={publishing}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold shadow-lg hover:shadow-xl active:scale-[0.98] transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Check className="w-5 h-5" />
              {publishing ? 'Approving & Publishing...' : 'Approve & Publish to Social Media'}
            </button>
          )}

          {/* Social Media Status */}
          {content.social_posts && content.social_posts.length > 0 && (
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Social Media Status</h4>
              <div className="space-y-2">
                {content.social_posts.map((post) => (
                  <div key={post.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-600">
                        {platformIcon(post.platform)}
                      </span>
                      <div>
                        <p className="text-xs font-bold text-slate-700 capitalize">{post.platform}</p>
                        <p className={`text-[10px] font-medium ${post.status === 'failed' ? 'text-red-500' : 'text-slate-400'}`}>
                          {post.status === 'failed' ? post.error_message || 'Failed' : post.status}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {post.status === 'published' && post.platform_url && (
                        <a href={post.platform_url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-slate-200 transition">
                          <ExternalLink className="w-3 h-3 text-slate-500" />
                        </a>
                      )}
                      {post.status === 'failed' && (
                        <button onClick={retryPlatform} className="p-1.5 rounded-lg hover:bg-slate-200 transition text-amber-600">
                          <RotateCcw className="w-3 h-3" />
                        </button>
                      )}
                      <span className={`w-2 h-2 rounded-full ${
                        post.status === 'published' ? 'bg-emerald-500' :
                        post.status === 'failed' ? 'bg-red-500' :
                        post.status === 'skipped' ? 'bg-slate-300' :
                        'bg-amber-400 animate-pulse'
                      }`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={toggleVisibility}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition flex items-center justify-center gap-2"
            >
              {content.visibility === 'public' ? (
                <><EyeOff className="w-4 h-4" /> Make Private</>
              ) : (
                <><Eye className="w-4 h-4" /> Make Public</>
              )}
            </button>
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="py-2.5 px-4 rounded-xl border border-red-200 text-sm font-bold text-red-500 hover:bg-red-50 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={deleteContent}
                disabled={deleting}
                className="py-2.5 px-4 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition disabled:opacity-50"
              >
                {deleting ? '...' : 'Confirm Delete'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
