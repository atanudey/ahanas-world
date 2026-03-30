'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, Square, Play, Pause, RotateCcw, Wand2, X } from 'lucide-react';
import type { CaptureResult } from '@/lib/types/capture';

interface AudioCaptureProps {
  onComplete: (result: CaptureResult, title: string, notes: string) => void;
  onCancel: () => void;
}

type RecordingState = 'idle' | 'recording' | 'preview';

const MAX_DURATION_MS = 120_000; // 2 minutes

function getSupportedMimeType(): string {
  const types = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/ogg',
  ];
  for (const type of types) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) return type;
  }
  return 'audio/webm';
}

export function AudioCapture({ onComplete, onCancel }: AudioCaptureProps) {
  const [state, setState] = useState<RecordingState>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const blobRef = useRef<Blob | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);

  const cleanup = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  const drawWaveform = useCallback(() => {
    const analyser = analyserRef.current;
    const canvas = canvasRef.current;
    if (!analyser || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufLen = analyser.frequencyBinCount;
    const data = new Uint8Array(bufLen);

    const draw = () => {
      animFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(data);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 2;
      ctx.strokeStyle = '#14b8a6';
      ctx.beginPath();

      const sliceWidth = canvas.width / bufLen;
      let x = 0;
      for (let i = 0; i < bufLen; i++) {
        const v = data[i] / 128.0;
        const y = (v * canvas.height) / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };
    draw();
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Set up analyser for waveform
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const mimeType = getSupportedMimeType();
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        blobRef.current = blob;

        if (audioRef.current) {
          audioRef.current.src = URL.createObjectURL(blob);
        }
        setState('preview');
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      };

      recorder.start(250);
      setState('recording');
      setElapsed(0);

      timerRef.current = setInterval(() => {
        setElapsed((prev) => {
          if (prev + 100 >= MAX_DURATION_MS) {
            recorder.stop();
            if (timerRef.current) clearInterval(timerRef.current);
            stream.getTracks().forEach((t) => t.stop());
            return MAX_DURATION_MS;
          }
          return prev + 100;
        });
      }, 100);

      drawWaveform();
    } catch {
      setError('Could not access microphone. Please allow microphone access and try again.');
    }
  }, [drawWaveform]);

  const stopRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    mediaRecorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }, []);

  const reRecord = useCallback(() => {
    blobRef.current = null;
    setIsPlaying(false);
    setState('idle');
    setElapsed(0);
  }, []);

  const togglePlayback = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleSubmit = useCallback(() => {
    if (!blobRef.current || !title.trim()) return;
    onComplete(
      {
        blob: blobRef.current,
        mimeType: blobRef.current.type,
        duration: elapsed,
      },
      title.trim(),
      notes.trim(),
    );
  }, [title, notes, elapsed, onComplete]);

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    return `${m}:${String(s % 60).padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-6 lg:p-8 shadow-2xl max-w-md w-full mx-4 relative">
      <button
        onClick={onCancel}
        className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition"
      >
        <X className="w-4 h-4 text-slate-500" />
      </button>

      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white mb-5 shadow-lg">
        <Mic className="w-7 h-7" />
      </div>

      <h3 className="text-2xl font-black text-slate-800 mb-1">Record a Melody</h3>
      <p className="text-slate-500 text-sm mb-5 font-medium">
        Sing, hum, or play something magical.
      </p>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl mb-4 font-medium">{error}</div>
      )}

      {/* Waveform Canvas */}
      {state === 'recording' && (
        <canvas
          ref={canvasRef}
          width={320}
          height={80}
          className="w-full h-20 rounded-xl bg-slate-50 mb-4"
        />
      )}

      {/* Recording Controls */}
      {state === 'idle' && (
        <button
          onClick={startRecording}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold shadow-lg hover:shadow-xl active:scale-[0.98] transition flex items-center justify-center gap-2 mb-5"
        >
          <Mic className="w-5 h-5" /> Start Recording
        </button>
      )}

      {state === 'recording' && (
        <div className="flex items-center gap-4 mb-5">
          <button
            onClick={stopRecording}
            className="flex-1 py-4 rounded-2xl bg-red-500 text-white font-bold shadow-lg active:scale-[0.98] transition flex items-center justify-center gap-2"
          >
            <Square className="w-4 h-4" /> Stop
          </button>
          <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            {formatTime(elapsed)}
          </div>
        </div>
      )}

      {state === 'preview' && (
        <>
          <div className="flex items-center gap-3 mb-5 bg-slate-50 p-4 rounded-2xl">
            <button
              onClick={togglePlayback}
              className="w-10 h-10 rounded-full bg-teal-500 text-white flex items-center justify-center hover:bg-teal-600 transition"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
            <div className="flex-1">
              <div className="text-sm font-bold text-slate-700">Recording Preview</div>
              <div className="text-xs text-slate-500">{formatTime(elapsed)}</div>
            </div>
            <button
              onClick={reRecord}
              className="p-2 rounded-xl hover:bg-slate-200 transition text-slate-500"
              title="Re-record"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <audio ref={audioRef} onEnded={() => setIsPlaying(false)} className="hidden" />

          <input
            type="text"
            placeholder="Give your melody a name..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition mb-3"
          />
          <textarea
            placeholder="What inspired this? Tell the story..."
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium resize-none focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition mb-4"
          />
          <button
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold shadow-lg hover:shadow-xl active:scale-[0.98] transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Wand2 className="w-4 h-4" /> Capture It!
          </button>
        </>
      )}
    </div>
  );
}
