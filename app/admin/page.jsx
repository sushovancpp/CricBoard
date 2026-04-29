'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const router = useRouter();
  const [pw, setPw]     = useState('');
  const [err, setErr]   = useState('');
  const [busy, setBusy] = useState(false);

  async function login(e) {
    e.preventDefault();
    setBusy(true); setErr('');
    try {
      const res  = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw }),
      });
      const data = await res.json();
      if (data.ok) {
        sessionStorage.setItem('admin_token', data.token);
        router.push('/admin/dashboard');
      } else {
        setErr('Wrong password. Try again.');
      }
    } catch {
      setErr('Server error. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-pitch-950 flex flex-col items-center justify-center px-5">
      {/* Back */}
      <a href="/" className="mb-8 flex items-center gap-1.5 text-pitch-500 hover:text-pitch-300 text-sm transition-colors">
        ← Back to Scoreboard
      </a>

      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-pitch-800 border-2 border-pitch-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
            🏏
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Login</h1>
          <p className="text-pitch-500 text-sm mt-1">Scorer &amp; Match Controller</p>
        </div>

        <form onSubmit={login} className="bg-pitch-900 border border-pitch-700 rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-pitch-400 uppercase tracking-wider mb-2">
              Password
            </label>
            <input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="Enter admin password"
              className="w-full bg-pitch-950 border border-pitch-700 focus:border-pitch-400 rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors placeholder-pitch-700"
              autoFocus
            />
          </div>

          {err && (
            <p className="text-red-400 text-xs bg-red-950/50 border border-red-900 rounded-lg px-3 py-2">
              {err}
            </p>
          )}

          <button
            type="submit"
            disabled={busy || !pw}
            className="w-full bg-pitch-400 hover:bg-pitch-300 disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold py-3 rounded-xl text-sm transition-colors"
          >
            {busy ? 'Checking…' : 'Login →'}
          </button>

          <p className="text-center text-pitch-600 text-xs">
            Default password:{' '}
            <code className="text-pitch-500">cricket@123</code>
          </p>
        </form>
      </div>
    </div>
  );
}
