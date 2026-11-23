import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import App from '../administrasi_guru_min_4_magelang';
import './index.css';

const DEFAULT_SUPABASE_URL = 'https://mqgnwzgyrckdwpysfbgn.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'sb_publishable_032N2HjrA1o26xfa8A1V1g_X2lIuXos';

const supabaseUrl =
  (import.meta as any).env?.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey =
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
  DEFAULT_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

function LoginGate() {
  const [session, setSession] = useState<any>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (active) {
        setSession(data.session ?? null);
        setCheckingSession(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (active) {
        setSession(nextSession ?? null);
        setCheckingSession(false);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      // Mendukung input email penuh maupun username singkat (otomatis ke @min4.sch.id)
      const normalizedEmail = email.trim().includes('@')
        ? email.trim()
        : `${email.trim()}@min4.sch.id`;

      const { error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error) {
        setErrorMsg(
          'Email/username atau kata sandi belum sesuai. Silakan periksa kembali.'
        );
      }
    } catch {
      setErrorMsg('Gagal terhubung ke layanan autentikasi Supabase.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-800 flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl px-8 py-6 text-center border border-emerald-100">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-700">
            Menyiapkan portal login MIN 4 Magelang...
          </p>
        </div>
      </div>
    );
  }

  if (session) {
    return <App />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden">
        <div className="bg-emerald-800 px-7 py-7 text-center text-white">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center text-xl font-bold tracking-wide">
            M4
          </div>
          <h1 className="text-xl font-bold tracking-tight">
            Aplikasi Administrasi Guru
          </h1>
          <p className="text-emerald-100 text-sm mt-1">
            MIN 4 Magelang • Sistem Terintegrasi
          </p>
        </div>

        <form onSubmit={handleLogin} className="p-7 space-y-5">
          <div>
            <label
              htmlFor="login-user"
              className="block text-sm font-semibold text-slate-700 mb-1.5"
            >
              Username / Email Guru
            </label>
            <input
              id="login-user"
              type="text"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="lailiya@min4.sch.id"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition"
            />
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="block text-sm font-semibold text-slate-700 mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi"
                className="w-full px-4 py-3 pr-20 rounded-xl border border-slate-300 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-emerald-700 hover:text-emerald-900 px-2 py-1 rounded-lg hover:bg-emerald-50 transition"
              >
                {showPassword ? 'Sembunyi' : 'Lihat'}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-xs font-medium text-red-700">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-400 text-white font-semibold shadow-md shadow-emerald-900/15 transition cursor-pointer"
          >
            {loading ? 'Memeriksa Akun...' : 'Masuk ke Aplikasi'}
          </button>

          <p className="text-center text-xs text-slate-400 pt-1">
            Akses khusus guru terdaftar • MIN 4 Magelang
          </p>
        </form>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LoginGate />
  </React.StrictMode>
);
