'use client';

import { useState, useRef, useCallback } from 'react';
import { Book, Camera, X, Wand2, Image as ImageIcon } from 'lucide-react';
import type { CaptureResult } from '@/lib/types/capture';

interface ReadingCaptureProps {
  onComplete: (result: CaptureResult | null, title: string, notes: string) => void;
  onCancel: () => void;
}

export function ReadingCapture({ onComplete, onCancel }: ReadingCaptureProps) {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoBlob(file);
    setPhotoUrl(URL.createObjectURL(file));
  }, []);

  const removePhoto = useCallback(() => {
    setPhotoBlob(null);
    if (photoUrl) URL.revokeObjectURL(photoUrl);
    setPhotoUrl(null);
  }, [photoUrl]);

  const handleSubmit = useCallback(() => {
    if (!title.trim()) return;

    if (photoBlob) {
      onComplete(
        { blob: photoBlob, mimeType: photoBlob.type, thumbnail: photoBlob },
        title.trim(),
        notes.trim(),
      );
    } else {
      onComplete(null, title.trim(), notes.trim());
    }
  }, [title, notes, photoBlob, onComplete]);

  return (
    <div className="bg-white rounded-[2.5rem] p-6 lg:p-8 shadow-2xl max-w-md w-full mx-4 relative">
      <button
        onClick={onCancel}
        className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition"
      >
        <X className="w-4 h-4 text-slate-500" />
      </button>

      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-400 to-orange-400 flex items-center justify-center text-white mb-5 shadow-lg">
        <Book className="w-7 h-7" />
      </div>

      <h3 className="text-2xl font-black text-slate-800 mb-1">Log a Reading</h3>
      <p className="text-slate-500 text-sm mb-5 font-medium">
        What book sparked your imagination today?
      </p>

      <input
        type="text"
        placeholder="Book title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition mb-3"
      />

      <textarea
        placeholder="What did you love about it? What surprised you? How did it make you feel?"
        rows={4}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium resize-none focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition mb-4"
      />

      {/* Photo of book cover (optional) */}
      {!photoUrl ? (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 font-bold text-sm flex items-center justify-center gap-2 hover:border-orange-300 hover:text-orange-500 transition mb-4"
        >
          <Camera className="w-4 h-4" /> Add a photo of the book (optional)
        </button>
      ) : (
        <div className="relative mb-4 rounded-2xl overflow-hidden border border-slate-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photoUrl} alt="Book cover" className="w-full h-40 object-cover" />
          <button
            onClick={removePhoto}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition"
          >
            <X className="w-3 h-3" />
          </button>
          <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/50 text-white text-[10px] font-bold px-2 py-1 rounded-lg">
            <ImageIcon className="w-3 h-3" /> Book cover
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handlePhotoSelect}
      />

      <button
        onClick={handleSubmit}
        disabled={!title.trim()}
        className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-400 to-orange-400 text-white font-bold shadow-lg hover:shadow-xl active:scale-[0.98] transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Wand2 className="w-4 h-4" /> Capture It!
      </button>
    </div>
  );
}
