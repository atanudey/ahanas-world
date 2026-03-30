'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, Video, Square, RotateCcw, Wand2, X, SwitchCamera, Play } from 'lucide-react';
import type { CaptureResult } from '@/lib/types/capture';

interface VideoCaptureProps {
  onComplete: (result: CaptureResult, title: string, notes: string) => void;
  onCancel: () => void;
}

type Mode = 'photo' | 'video';
type CaptureState = 'idle' | 'previewing' | 'recording' | 'recorded';

const MAX_DURATION_MS = 120_000;

function getSupportedVideoMime(): string {
  const types = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
    'video/mp4',
  ];
  for (const type of types) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) return type;
  }
  return 'video/webm';
}

export function VideoCapture({ onComplete, onCancel }: VideoCaptureProps) {
  const [mode, setMode] = useState<Mode>('photo');
  const [captureState, setCaptureState] = useState<CaptureState>('idle');
  const [facing, setFacing] = useState<'user' | 'environment'>('environment');
  const [elapsed, setElapsed] = useState(0);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const blobRef = useRef<Blob | null>(null);
  const thumbRef = useRef<Blob | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  const stopStream = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      stopStream();
      const constraints: MediaStreamConstraints = {
        video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: mode === 'video',
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCaptureState('previewing');
    } catch {
      setError('Could not access camera. Please allow camera access and try again.');
    }
  }, [facing, mode, stopStream]);

  useEffect(() => {
    startCamera();
    return () => stopStream();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const flipCamera = useCallback(() => {
    const next = facing === 'user' ? 'environment' : 'user';
    setFacing(next);
    // Restart camera with new facing
    setTimeout(() => {
      const doRestart = async () => {
        stopStream();
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: next, width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: mode === 'video',
          });
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
        } catch {
          setError('Could not switch camera.');
        }
      };
      doRestart();
    }, 100);
  }, [facing, mode, stopStream]);

  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        blobRef.current = blob;
        thumbRef.current = blob;
        previewUrlRef.current = URL.createObjectURL(blob);
        stopStream();
        setCaptureState('recorded');
      },
      'image/jpeg',
      0.92,
    );
  }, [stopStream]);

  const startVideoRecording = useCallback(() => {
    if (!streamRef.current) return;
    const mimeType = getSupportedVideoMime();
    const recorder = new MediaRecorder(streamRef.current, { mimeType });
    recorderRef.current = recorder;
    chunksRef.current = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      blobRef.current = blob;
      previewUrlRef.current = URL.createObjectURL(blob);

      // Generate thumbnail from first frame
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas) {
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(video, 0, 0);
        canvas.toBlob((tb) => { thumbRef.current = tb; }, 'image/jpeg', 0.8);
      }

      stopStream();
      setCaptureState('recorded');
    };

    recorder.start(250);
    setCaptureState('recording');
    setElapsed(0);

    timerRef.current = setInterval(() => {
      setElapsed((prev) => {
        if (prev + 100 >= MAX_DURATION_MS) {
          recorder.stop();
          if (timerRef.current) clearInterval(timerRef.current);
          return MAX_DURATION_MS;
        }
        return prev + 100;
      });
    }, 100);
  }, [stopStream]);

  const stopVideoRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    recorderRef.current?.stop();
  }, []);

  const retake = useCallback(() => {
    blobRef.current = null;
    thumbRef.current = null;
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;
    setElapsed(0);
    startCamera();
  }, [startCamera]);

  const handleSubmit = useCallback(() => {
    if (!blobRef.current || !title.trim()) return;
    onComplete(
      {
        blob: blobRef.current,
        mimeType: blobRef.current.type,
        duration: mode === 'video' ? elapsed : undefined,
        thumbnail: thumbRef.current ?? undefined,
      },
      title.trim(),
      notes.trim(),
    );
  }, [title, notes, elapsed, mode, onComplete]);

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    return `${m}:${String(s % 60).padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-6 lg:p-8 shadow-2xl max-w-md w-full mx-4 relative">
      <button
        onClick={onCancel}
        className="absolute top-5 right-5 z-10 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition"
      >
        <X className="w-4 h-4 text-slate-500" />
      </button>

      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white mb-5 shadow-lg">
        {mode === 'photo' ? <Camera className="w-7 h-7" /> : <Video className="w-7 h-7" />}
      </div>

      <h3 className="text-2xl font-black text-slate-800 mb-1">
        {mode === 'photo' ? 'Snap a Photo' : 'Record a Video'}
      </h3>
      <p className="text-slate-500 text-sm mb-4 font-medium">
        Show off your latest creation!
      </p>

      {/* Mode Toggle */}
      {captureState !== 'recorded' && captureState !== 'recording' && (
        <div className="flex bg-slate-100 rounded-xl p-1 mb-4">
          <button
            onClick={() => { setMode('photo'); if (captureState === 'previewing') startCamera(); }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${mode === 'photo' ? 'bg-white shadow text-violet-600' : 'text-slate-500'}`}
          >
            Photo
          </button>
          <button
            onClick={() => { setMode('video'); if (captureState === 'previewing') startCamera(); }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${mode === 'video' ? 'bg-white shadow text-violet-600' : 'text-slate-500'}`}
          >
            Video
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl mb-4 font-medium">{error}</div>
      )}

      {/* Camera Preview / Captured Preview */}
      <div className="relative rounded-2xl overflow-hidden bg-black mb-4 aspect-[4/3]">
        {captureState !== 'recorded' && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        )}
        {captureState === 'recorded' && previewUrlRef.current && (
          mode === 'photo' ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrlRef.current} alt="Captured" className="w-full h-full object-cover" />
          ) : (
            <video src={previewUrlRef.current} controls playsInline className="w-full h-full object-cover" />
          )
        )}

        {/* Camera flip */}
        {(captureState === 'previewing' || captureState === 'recording') && (
          <button
            onClick={flipCamera}
            className="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition"
          >
            <SwitchCamera className="w-4 h-4" />
          </button>
        )}

        {/* Recording indicator */}
        {captureState === 'recording' && (
          <div className="absolute top-3 right-3 flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-white text-xs font-bold">{formatTime(elapsed)}</span>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {/* Capture Buttons */}
      {captureState === 'previewing' && (
        mode === 'photo' ? (
          <button
            onClick={capturePhoto}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-500 text-white font-bold shadow-lg active:scale-[0.98] transition flex items-center justify-center gap-2"
          >
            <Camera className="w-5 h-5" /> Take Photo
          </button>
        ) : (
          <button
            onClick={startVideoRecording}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-500 text-white font-bold shadow-lg active:scale-[0.98] transition flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5" /> Start Recording
          </button>
        )
      )}

      {captureState === 'recording' && (
        <button
          onClick={stopVideoRecording}
          className="w-full py-4 rounded-2xl bg-red-500 text-white font-bold shadow-lg active:scale-[0.98] transition flex items-center justify-center gap-2"
        >
          <Square className="w-4 h-4" /> Stop Recording
        </button>
      )}

      {captureState === 'recorded' && (
        <div className="space-y-3">
          <div className="flex gap-3">
            <button
              onClick={retake}
              className="flex-1 py-3 rounded-2xl bg-slate-100 text-slate-700 font-bold transition flex items-center justify-center gap-2 hover:bg-slate-200"
            >
              <RotateCcw className="w-4 h-4" /> Retake
            </button>
          </div>

          <input
            type="text"
            placeholder="Give it a name..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400 transition"
          />
          <textarea
            placeholder="What's the story behind this?"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium resize-none focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400 transition"
          />
          <button
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-500 text-white font-bold shadow-lg hover:shadow-xl active:scale-[0.98] transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Wand2 className="w-4 h-4" /> Capture It!
          </button>
        </div>
      )}
    </div>
  );
}
