'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { GradientBlobs } from '@/components/shared/GradientBlobs';

export default function ParentLoginPage() {
  const { theme: t } = useTheme();
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'enter' | 'confirm'>('enter');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/auth/verify-pin')
      .then((r) => r.json())
      .then((data) => setIsFirstTime(!data.pinConfigured))
      .catch(() => {});
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (pin.length < 4) {
      setError('PIN must be at least 4 digits');
      return;
    }

    // First-time setup: confirm step
    if (isFirstTime && step === 'enter') {
      setConfirmPin(pin);
      setPin('');
      setStep('confirm');
      setTimeout(() => inputRef.current?.focus(), 50);
      return;
    }

    if (isFirstTime && step === 'confirm') {
      if (pin !== confirmPin) {
        setError('PINs do not match. Try again.');
        setPin('');
        setStep('enter');
        setConfirmPin('');
        setTimeout(() => inputRef.current?.focus(), 50);
        return;
      }
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin: isFirstTime ? confirmPin : pin,
          action: isFirstTime ? 'set' : undefined,
        }),
      });
      const data = await res.json();

      if (data.success) {
        router.push('/parent');
      } else {
        setError(data.error || 'Incorrect PIN');
        setPin('');
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${t.bg} flex items-center justify-center relative overflow-hidden`}>
      <GradientBlobs />

      <div className="relative z-10 w-full max-w-md px-6">
        <div className={`${t.card} rounded-[2.5rem] p-10 text-center`}>
          {/* Logo / Icon */}
          <div className={`w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br ${t.gradient} flex items-center justify-center shadow-2xl`}>
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>

          <h1 className={`text-3xl font-black italic mb-2 ${t.text}`}>
            Parent Studio
          </h1>
          <p className={`${t.muted} text-sm mb-8 font-medium`}>
            {isFirstTime
              ? step === 'confirm'
                ? 'Confirm your new PIN'
                : 'Set up a PIN to protect your dashboard'
              : 'Enter your PIN to continue'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <Lock className={`w-5 h-5 ${t.muted}`} />
              </div>
              <input
                ref={inputRef}
                type={showPin ? 'text' : 'password'}
                inputMode="numeric"
                pattern="[0-9]*"
                value={pin}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, '');
                  if (v.length <= 8) setPin(v);
                }}
                placeholder={isFirstTime && step === 'confirm' ? 'Re-enter PIN' : 'Enter PIN'}
                className={`w-full pl-12 pr-12 py-4 rounded-2xl text-center text-2xl tracking-[0.5em] font-bold
                  ${t.glass} ${t.text} placeholder:text-sm placeholder:tracking-normal placeholder:font-medium
                  focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all`}
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className={`absolute right-4 top-1/2 -translate-y-1/2 ${t.muted} hover:${t.text} transition`}
              >
                {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {error && (
              <p className="text-rose-400 text-sm font-medium animate-pulse">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || pin.length < 4}
              className={`w-full py-4 rounded-2xl font-bold text-white text-lg
                bg-gradient-to-r ${t.gradient} shadow-xl
                hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                transition-all duration-200`}
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Sparkles className="w-5 h-5 animate-spin" />
                  {isFirstTime ? 'Setting up...' : 'Verifying...'}
                </span>
              ) : isFirstTime ? (
                step === 'confirm' ? 'Confirm & Enter Studio' : 'Set PIN'
              ) : (
                'Enter Studio'
              )}
            </button>
          </form>

          <p className={`mt-8 text-xs ${t.muted}`}>
            {isFirstTime
              ? 'This PIN protects your parent dashboard.'
              : 'Forgot your PIN? Reset via database.'}
          </p>
        </div>
      </div>
    </div>
  );
}
