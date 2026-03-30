'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { PenTool, Eraser, Undo2, Trash2, Wand2, X } from 'lucide-react';
import type { CaptureResult } from '@/lib/types/capture';

interface DrawingCaptureProps {
  onComplete: (result: CaptureResult, title: string, notes: string) => void;
  onCancel: () => void;
}

const COLORS = [
  '#1e293b', // slate
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#14b8a6', // teal
];

const BRUSH_SIZES = [
  { label: 'S', size: 3 },
  { label: 'M', size: 8 },
  { label: 'L', size: 16 },
];

export function DrawingCapture({ onComplete, onCancel }: DrawingCaptureProps) {
  const [color, setColor] = useState('#1e293b');
  const [brushSize, setBrushSize] = useState(8);
  const [isEraser, setIsEraser] = useState(false);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [hasDrawn, setHasDrawn] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const historyRef = useRef<ImageData[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas dimensions to match display size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2; // 2x for retina
    canvas.height = rect.height * 2;

    const ctx = canvas.getContext('2d')!;
    ctx.scale(2, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Save initial state
    historyRef.current = [ctx.getImageData(0, 0, canvas.width, canvas.height)];
  }, []);

  const getPos = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      const touch = e.touches[0] || e.changedTouches[0];
      return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
  }, []);

  const startDraw = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    isDrawingRef.current = true;
    const pos = getPos(e);
    lastPosRef.current = pos;

    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }, [getPos]);

  const draw = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!isDrawingRef.current || !lastPosRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    const pos = getPos(e);

    ctx.strokeStyle = isEraser ? '#ffffff' : color;
    ctx.lineWidth = isEraser ? brushSize * 3 : brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    lastPosRef.current = pos;
    setHasDrawn(true);
  }, [color, brushSize, isEraser, getPos]);

  const endDraw = useCallback(() => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    lastPosRef.current = null;

    // Save to history for undo
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d')!;
      historyRef.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
      // Limit history to 20 steps
      if (historyRef.current.length > 20) historyRef.current.shift();
    }
  }, []);

  const undo = useCallback(() => {
    if (historyRef.current.length <= 1) return;
    historyRef.current.pop();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const prev = historyRef.current[historyRef.current.length - 1];
    ctx.putImageData(prev, 0, 0);
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);
    historyRef.current = [ctx.getImageData(0, 0, canvas.width, canvas.height)];
    setHasDrawn(false);
  }, []);

  const handleSubmit = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !title.trim()) return;

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        onComplete(
          { blob, mimeType: 'image/png', thumbnail: blob },
          title.trim(),
          notes.trim(),
        );
      },
      'image/png',
    );
  }, [title, notes, onComplete]);

  return (
    <div className="bg-white rounded-[2.5rem] p-5 lg:p-7 shadow-2xl max-w-lg w-full mx-4 relative">
      <button
        onClick={onCancel}
        className="absolute top-5 right-5 z-10 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition"
      >
        <X className="w-4 h-4 text-slate-500" />
      </button>

      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-pink-500 flex items-center justify-center text-white shadow-lg">
          <PenTool className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-black text-slate-800">Draw Something</h3>
          <p className="text-slate-500 text-xs font-medium">Use your finger or stylus!</p>
        </div>
      </div>

      {/* Canvas */}
      <div className="rounded-2xl overflow-hidden border border-slate-200 mb-4 bg-white">
        <canvas
          ref={canvasRef}
          className="w-full aspect-[4/3] cursor-crosshair"
          style={{ touchAction: 'none' }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        {/* Colors */}
        <div className="flex gap-1.5">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => { setColor(c); setIsEraser(false); }}
              className={`w-7 h-7 rounded-full border-2 transition ${
                color === c && !isEraser ? 'border-slate-800 scale-110' : 'border-transparent'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        <div className="w-px h-6 bg-slate-200" />

        {/* Brush Sizes */}
        <div className="flex gap-1">
          {BRUSH_SIZES.map(({ label, size }) => (
            <button
              key={label}
              onClick={() => setBrushSize(size)}
              className={`w-7 h-7 rounded-lg text-[10px] font-black transition ${
                brushSize === size && !isEraser ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="w-px h-6 bg-slate-200" />

        {/* Tools */}
        <button
          onClick={() => setIsEraser(!isEraser)}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition ${
            isEraser ? 'bg-pink-100 text-pink-600' : 'bg-slate-100 text-slate-500'
          }`}
        >
          <Eraser className="w-4 h-4" />
        </button>
        <button onClick={undo} className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition">
          <Undo2 className="w-4 h-4" />
        </button>
        <button onClick={clearCanvas} className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Submit */}
      <input
        type="text"
        placeholder="Name your masterpiece..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-fuchsia-300 focus:border-fuchsia-400 transition mb-3"
      />
      <textarea
        placeholder="What inspired this drawing?"
        rows={2}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium resize-none focus:outline-none focus:ring-2 focus:ring-fuchsia-300 focus:border-fuchsia-400 transition mb-3"
      />
      <button
        onClick={handleSubmit}
        disabled={!title.trim() || !hasDrawn}
        className="w-full py-3 rounded-2xl bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white font-bold shadow-lg hover:shadow-xl active:scale-[0.98] transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Wand2 className="w-4 h-4" /> Capture It!
      </button>
    </div>
  );
}
