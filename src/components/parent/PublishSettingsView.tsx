'use client';

import { useState, useEffect } from 'react';
import {
  Settings, Wifi, WifiOff, ToggleLeft, ToggleRight,
  Eye, EyeOff, ChevronDown, ChevronUp, Check, KeyRound, Globe, Lock,
} from 'lucide-react';
import type { Theme } from '@/lib/theme';

export function PublishSettingsView({ t }: { t: Theme }) {
  const [settings, setSettings] = useState<Record<string, unknown> | null>(null);
  const [saving, setSaving] = useState(false);

  // Credentials form state
  const [credExpanded, setCredExpanded] = useState(false);
  const [credForm, setCredForm] = useState({
    facebook_app_id: '',
    facebook_app_secret: '',
    google_client_id: '',
    google_client_secret: '',
    google_redirect_uri: '',
    site_url: '',
  });
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [credSaving, setCredSaving] = useState(false);
  const [credSaved, setCredSaved] = useState(false);
  const [editingSecrets, setEditingSecrets] = useState<Record<string, boolean>>({});

  // PIN state
  const [pinExpanded, setPinExpanded] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [pinSaving, setPinSaving] = useState(false);
  const [pinSaved, setPinSaved] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setSettings(data);
          setCredForm({
            facebook_app_id: data.facebook_app_id || '',
            facebook_app_secret: data.facebook_app_secret || '',
            google_client_id: data.google_client_id || '',
            google_client_secret: data.google_client_secret || '',
            google_redirect_uri: data.google_redirect_uri || '',
            site_url: data.site_url || '',
          });
          // Auto-expand credentials if nothing is configured
          if (!data.facebook_app_id && !data.google_client_id) {
            setCredExpanded(true);
          }
        }
      })
      .catch(() => {});
  }, []);

  const toggle = async (key: string) => {
    if (!settings) return;
    const newVal = !settings[key];
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: newVal }),
      });
      if (res.ok) setSettings({ ...settings, [key]: newVal });
    } finally {
      setSaving(false);
    }
  };

  const saveCredentials = async () => {
    setCredSaving(true);
    setCredSaved(false);
    try {
      const updates: Record<string, string> = {};
      for (const [key, val] of Object.entries(credForm)) {
        if (val && !val.includes('***')) {
          updates[key] = val;
        }
      }

      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        setCredSaved(true);
        setEditingSecrets({});
        // Refresh settings
        const refreshRes = await fetch('/api/settings');
        if (refreshRes.ok) {
          const data = await refreshRes.json();
          setSettings(data);
          setCredForm({
            facebook_app_id: data.facebook_app_id || '',
            facebook_app_secret: data.facebook_app_secret || '',
            google_client_id: data.google_client_id || '',
            google_client_secret: data.google_client_secret || '',
            google_redirect_uri: data.google_redirect_uri || '',
            site_url: data.site_url || '',
          });
        }
        setTimeout(() => setCredSaved(false), 3000);
      }
    } finally {
      setCredSaving(false);
    }
  };

  const savePin = async () => {
    if (newPin.length < 4) return;
    setPinSaving(true);
    setPinSaved(false);
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_pin: newPin }),
      });
      if (res.ok) {
        setPinSaved(true);
        setNewPin('');
        if (settings) setSettings({ ...settings, admin_pin_configured: true });
        setTimeout(() => setPinSaved(false), 3000);
      }
    } finally {
      setPinSaving(false);
    }
  };

  const hasFbCreds = !!credForm.facebook_app_id && (!!credForm.facebook_app_secret || editingSecrets.facebook_app_secret);
  const hasGoogleCreds = !!credForm.google_client_id && (!!credForm.google_client_secret || editingSecrets.google_client_secret);

  const ToggleButton = ({ enabled, onToggle, label }: { enabled: boolean; onToggle: () => void; label: string }) => (
    <button onClick={onToggle} disabled={saving} className="flex items-center justify-between w-full py-4">
      <span className={`text-sm font-bold ${t.text}`}>{label}</span>
      {enabled ? <ToggleRight className="w-8 h-8 text-emerald-500" /> : <ToggleLeft className="w-8 h-8 text-slate-300" />}
    </button>
  );

  const SecretField = ({ label, name, value }: { label: string; name: string; value: string }) => {
    const isEditing = editingSecrets[name];
    const isVisible = showSecrets[name];

    return (
      <div>
        <label className={`text-xs font-bold uppercase tracking-widest ${t.muted} mb-2 block`}>{label}</label>
        <div className="relative">
          <input
            type={isVisible ? 'text' : 'password'}
            value={isEditing ? credForm[name as keyof typeof credForm] : value}
            onChange={(e) => {
              setCredForm({ ...credForm, [name]: e.target.value });
              if (!isEditing) setEditingSecrets({ ...editingSecrets, [name]: true });
            }}
            onFocus={() => {
              if (!isEditing && value.includes('***')) {
                setEditingSecrets({ ...editingSecrets, [name]: true });
                setCredForm({ ...credForm, [name]: '' });
              }
            }}
            placeholder={isEditing ? `Enter new ${label.toLowerCase()}` : 'Not set'}
            className={`w-full pr-20 pl-4 py-3 rounded-xl ${t.glass} ${t.text} text-sm font-medium
              focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition placeholder:${t.muted}`}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setShowSecrets({ ...showSecrets, [name]: !isVisible })}
              className={`p-1.5 rounded-lg ${t.muted} hover:bg-black/5 transition`}
            >
              {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={() => {
                  setEditingSecrets({ ...editingSecrets, [name]: false });
                  setCredForm({ ...credForm, [name]: value });
                }}
                className="text-[10px] font-bold text-rose-400 hover:text-rose-500 px-1"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const TextField = ({ label, name, placeholder }: { label: string; name: string; placeholder: string }) => (
    <div>
      <label className={`text-xs font-bold uppercase tracking-widest ${t.muted} mb-2 block`}>{label}</label>
      <input
        type="text"
        value={credForm[name as keyof typeof credForm]}
        onChange={(e) => setCredForm({ ...credForm, [name]: e.target.value })}
        placeholder={placeholder}
        className={`w-full px-4 py-3 rounded-xl ${t.glass} ${t.text} text-sm font-medium
          focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition placeholder:${t.muted}`}
      />
    </div>
  );

  return (
    <>
      <header className="mb-12">
        <h2 className="text-4xl font-black italic mb-2 tracking-tight">Publish Settings</h2>
        <p className={`${t.muted} font-medium`}>Configure social media connections and auto-publishing behavior.</p>
      </header>

      {/* App Credentials Card */}
      <div className={`${t.card} border ${t.border} rounded-[2.5rem] shadow-sm backdrop-blur-md mb-8 overflow-hidden`}>
        <button
          onClick={() => setCredExpanded(!credExpanded)}
          className="w-full flex items-center justify-between p-6 lg:p-8"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-violet-600" />
            </div>
            <div className="text-left">
              <h3 className={`font-bold ${t.text}`}>App Credentials</h3>
              <p className={`text-xs ${t.muted}`}>
                {hasFbCreds || hasGoogleCreds
                  ? `${[hasFbCreds && 'Facebook', hasGoogleCreds && 'Google'].filter(Boolean).join(' & ')} configured`
                  : 'Configure API keys for social platform connections'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {credSaved && (
              <span className="text-emerald-500 text-xs font-bold flex items-center gap-1 animate-pulse">
                <Check className="w-4 h-4" /> Saved
              </span>
            )}
            {credExpanded ? <ChevronUp className={`w-5 h-5 ${t.muted}`} /> : <ChevronDown className={`w-5 h-5 ${t.muted}`} />}
          </div>
        </button>

        {credExpanded && (
          <div className="px-6 lg:px-8 pb-8 space-y-8">
            {/* Facebook */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-black text-[10px]">FB</span>
                </div>
                <span className={`text-sm font-bold ${t.text}`}>Facebook / Instagram</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-11">
                <TextField label="App ID" name="facebook_app_id" placeholder="e.g. 1234567890" />
                <SecretField label="App Secret" name="facebook_app_secret" value={credForm.facebook_app_secret} />
              </div>
            </div>

            {/* Google */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                  <span className="text-red-600 font-black text-[10px]">G</span>
                </div>
                <span className={`text-sm font-bold ${t.text}`}>Google / YouTube</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-11">
                <TextField label="Client ID" name="google_client_id" placeholder="e.g. 123456.apps.googleusercontent.com" />
                <SecretField label="Client Secret" name="google_client_secret" value={credForm.google_client_secret} />
                <div className="md:col-span-2">
                  <TextField label="Redirect URI" name="google_redirect_uri" placeholder="https://your-app.repl.co/api/settings/oauth/callback" />
                </div>
              </div>
            </div>

            {/* Site URL */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
                  <Globe className="w-4 h-4 text-teal-600" />
                </div>
                <span className={`text-sm font-bold ${t.text}`}>Site Configuration</span>
              </div>
              <div className="pl-11">
                <TextField label="Site URL" name="site_url" placeholder="https://your-app.repl.co" />
                <p className={`text-[10px] ${t.muted} mt-2`}>Used for OAuth redirects. Must match the URL configured in Facebook/Google developer consoles.</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={saveCredentials}
                disabled={credSaving}
                className={`bg-gradient-to-r ${t.gradient} text-white px-8 py-3 rounded-2xl font-bold shadow-lg
                  hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]
                  disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2`}
              >
                {credSaving ? 'Saving...' : credSaved ? <><Check className="w-4 h-4" /> Saved</> : 'Save Credentials'}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Platform Connections */}
        <div className="xl:col-span-7 space-y-6">
          <div className={`${t.card} border ${t.border} rounded-[2.5rem] p-6 lg:p-8 shadow-sm backdrop-blur-md`}>
            <h3 className={`font-bold mb-6 ${t.text}`}>Connected Platforms</h3>
            <div className="space-y-4">
              {/* Facebook */}
              <div className="flex items-center justify-between p-4 bg-black/5 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-black text-xs">FB</span>
                  </div>
                  <div>
                    <p className={`font-bold text-sm ${t.text}`}>Facebook Page</p>
                    <p className={`text-xs ${t.muted}`}>
                      {settings?.facebook_connected ? (
                        <span className="text-emerald-600 flex items-center gap-1"><Wifi className="w-3 h-3" /> Connected</span>
                      ) : (
                        <span className="text-slate-400 flex items-center gap-1"><WifiOff className="w-3 h-3" /> Not connected</span>
                      )}
                    </p>
                  </div>
                </div>
                {hasFbCreds ? (
                  <a
                    href="/api/settings/oauth/facebook"
                    className="px-4 py-2 rounded-xl bg-blue-500 text-white text-xs font-bold hover:bg-blue-600 transition"
                  >
                    {settings?.facebook_connected ? 'Reconnect' : 'Connect'}
                  </a>
                ) : (
                  <span className="px-4 py-2 rounded-xl bg-slate-100 text-slate-400 text-xs font-bold cursor-not-allowed" title="Configure Facebook credentials first">
                    Set credentials first
                  </span>
                )}
              </div>

              {/* Instagram */}
              <div className="flex items-center justify-between p-4 bg-black/5 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center">
                    <span className="text-pink-600 font-black text-xs">IG</span>
                  </div>
                  <div>
                    <p className={`font-bold text-sm ${t.text}`}>Instagram Business</p>
                    <p className={`text-xs ${t.muted}`}>
                      {settings?.instagram_connected ? (
                        <span className="text-emerald-600 flex items-center gap-1"><Wifi className="w-3 h-3" /> Connected</span>
                      ) : (
                        <span className="text-slate-400 flex items-center gap-1"><WifiOff className="w-3 h-3" /> Connects via Facebook</span>
                      )}
                    </p>
                  </div>
                </div>
                <span className={`px-4 py-2 rounded-xl text-xs font-bold ${
                  settings?.instagram_connected ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
                }`}>
                  {settings?.instagram_connected ? 'Active' : 'Connect FB first'}
                </span>
              </div>

              {/* YouTube */}
              <div className="flex items-center justify-between p-4 bg-black/5 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                    <span className="text-red-600 font-black text-xs">YT</span>
                  </div>
                  <div>
                    <p className={`font-bold text-sm ${t.text}`}>YouTube Channel</p>
                    <p className={`text-xs ${t.muted}`}>
                      {settings?.youtube_connected ? (
                        <span className="text-emerald-600 flex items-center gap-1"><Wifi className="w-3 h-3" /> Connected</span>
                      ) : (
                        <span className="text-slate-400 flex items-center gap-1"><WifiOff className="w-3 h-3" /> Not connected</span>
                      )}
                    </p>
                  </div>
                </div>
                {hasGoogleCreds ? (
                  <a
                    href="/api/settings/oauth/google"
                    className="px-4 py-2 rounded-xl bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition"
                  >
                    {settings?.youtube_connected ? 'Reconnect' : 'Connect'}
                  </a>
                ) : (
                  <span className="px-4 py-2 rounded-xl bg-slate-100 text-slate-400 text-xs font-bold cursor-not-allowed" title="Configure Google credentials first">
                    Set credentials first
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Publishing Toggles */}
        <div className="xl:col-span-5 space-y-6">
          <div className={`${t.card} border ${t.border} rounded-[2.5rem] p-6 lg:p-8 shadow-sm backdrop-blur-md`}>
            <h3 className={`font-bold mb-2 ${t.text}`}>Publishing Rules</h3>
            <p className={`text-xs ${t.muted} mb-4`}>Control how Ahana&apos;s captures get published.</p>

            {settings && (
              <div className="divide-y divide-black/5">
                <ToggleButton enabled={!!settings.require_review} onToggle={() => toggle('require_review')} label="Require parent review" />
                <ToggleButton enabled={!!settings.facebook_enabled} onToggle={() => toggle('facebook_enabled')} label="Publish to Facebook" />
                <ToggleButton enabled={!!settings.instagram_enabled} onToggle={() => toggle('instagram_enabled')} label="Publish to Instagram" />
                <ToggleButton enabled={!!settings.youtube_enabled} onToggle={() => toggle('youtube_enabled')} label="Publish to YouTube" />
              </div>
            )}

            {!settings && (
              <p className={`text-sm ${t.muted} py-4`}>Loading settings...</p>
            )}
          </div>

          <div className={`p-8 rounded-[2.5rem] bg-gradient-to-br ${t.gradient} text-white shadow-2xl`}>
            <Settings className="w-8 h-8 mb-4 opacity-80" />
            <h4 className="font-bold text-lg mb-2">How it Works</h4>
            <p className="text-white/90 text-sm leading-relaxed font-medium">
              When Ahana captures content from her Hub, it goes to your review queue. Once you approve, it auto-publishes to your connected platforms.
            </p>
          </div>
        </div>
      </div>

      {/* Security / PIN Card */}
      <div className={`${t.card} border ${t.border} rounded-[2.5rem] shadow-sm backdrop-blur-md mt-8 overflow-hidden`}>
        <button
          onClick={() => setPinExpanded(!pinExpanded)}
          className="w-full flex items-center justify-between p-6 lg:p-8"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Lock className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-left">
              <h3 className={`font-bold ${t.text}`}>Security</h3>
              <p className={`text-xs ${t.muted}`}>
                {settings?.admin_pin_configured ? 'Admin PIN is configured' : 'Set up an admin PIN to protect your dashboard'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {pinSaved && (
              <span className="text-emerald-500 text-xs font-bold flex items-center gap-1 animate-pulse">
                <Check className="w-4 h-4" /> Updated
              </span>
            )}
            {pinExpanded ? <ChevronUp className={`w-5 h-5 ${t.muted}`} /> : <ChevronDown className={`w-5 h-5 ${t.muted}`} />}
          </div>
        </button>

        {pinExpanded && (
          <div className="px-6 lg:px-8 pb-8">
            <div className="flex items-end gap-4 max-w-sm">
              <div className="flex-1">
                <label className={`text-xs font-bold uppercase tracking-widest ${t.muted} mb-2 block`}>
                  {settings?.admin_pin_configured ? 'New PIN' : 'Set PIN'}
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={newPin}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, '');
                    if (v.length <= 8) setNewPin(v);
                  }}
                  placeholder="4-8 digit PIN"
                  className={`w-full px-4 py-3 rounded-xl ${t.glass} ${t.text} text-sm font-medium
                    focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition`}
                />
              </div>
              <button
                onClick={savePin}
                disabled={pinSaving || newPin.length < 4}
                className={`bg-gradient-to-r ${t.gradient} text-white px-6 py-3 rounded-xl font-bold text-sm
                  disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
              >
                {pinSaving ? 'Saving...' : settings?.admin_pin_configured ? 'Update PIN' : 'Set PIN'}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
