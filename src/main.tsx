import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import App from '../administrasi_guru_min_4_magelang';
import './index.css';

const DEFAULT_SUPABASE_URL = 'https://mqgnwzgyrckdwpysfbgn.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'sb_publishable_032N2HjrA1o26xfa8A1V1g_X2lIuXos';
const ADMIN_EMAIL = 'lailiya@min4.sch.id';

const supabaseUrl =
  (import.meta as any).env?.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey =
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
  DEFAULT_SUPABASE_ANON_KEY;

function ensurePermanentSupabaseConfig() {
  try {
    const keysToSeed = [
      'min4_supabase_url',
      'supabase_url',
      'SUPABASE_URL',
      'VITE_SUPABASE_URL',
    ];
    const anonKeysToSeed = [
      'min4_supabase_anon_key',
      'min4_supabase_key',
      'supabase_anon_key',
      'SUPABASE_ANON_KEY',
      'VITE_SUPABASE_ANON_KEY',
    ];

    keysToSeed.forEach((k) => {
      if (!window.localStorage.getItem(k)) {
        window.localStorage.setItem(k, supabaseUrl);
      }
    });

    anonKeysToSeed.forEach((k) => {
      if (!window.localStorage.getItem(k)) {
        window.localStorage.setItem(k, supabaseAnonKey);
      }
    });

    const configObjectKeys = [
      'min4_supabase_config',
      'min4_app_supabase_config',
      'supabase_config',
    ];
    const configPayload = JSON.stringify({
      url: supabaseUrl,
      supabaseUrl,
      anonKey: supabaseAnonKey,
      supabaseAnonKey,
      autoSync: true,
    });

    configObjectKeys.forEach((k) => {
      if (!window.localStorage.getItem(k)) {
        window.localStorage.setItem(k, configPayload);
      }
    });
  } catch {
    // Abaikan jika akses storage dibatasi browser
  }
}

function hideManualSupabasePrompts() {
  try {
    const root = document.getElementById('root');
    if (!root) return;

    const candidates = root.querySelectorAll('button, a, div');
    candidates.forEach((el) => {
      const htmlEl = el as HTMLElement;
      if (htmlEl.dataset.min4PortalBar === 'true') return;

      const text = (htmlEl.textContent || '').replace(/\s+/g, ' ').trim();
      const isDirectAction =
        text === 'Mode Lokal • Hubungkan Supabase' ||
        text.startsWith('Koneksi Supabase') ||
        text.includes('Status Cloud: Penyimpanan Lokal');

      if (isDirectAction && htmlEl.offsetHeight > 0 && htmlEl.offsetHeight < 140) {
        htmlEl.style.display = 'none';
      }
    });
  } catch {
    // Abaikan jika DOM belum siap
  }
}

ensurePermanentSupabaseConfig();

const supabase = createClient(supabaseUrl, supabaseAnonKey);

type SelectedRole = 'admin' | 'guru';

function PortalAuthGate() {
  const [session, setSession] = useState<any>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [selectedRole, setSelectedRole] = useState<SelectedRole>('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    ensurePermanentSupabaseConfig();
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
        ensurePermanentSupabaseConfig();
        setSession(nextSession ?? null);
        setCheckingSession(false);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session) return;
    hideManualSupabasePrompts();

    const observer = new MutationObserver(() => {
      hideManualSupabasePrompts();
    });

    const root = document.getElementById('root');
    if (root) {
      observer.observe(root, { childList: true, subtree: true });
    }

    const timer = window.setTimeout(hideManualSupabasePrompts, 400);

    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, [session]);

  const handleSelectRole = (role: SelectedRole) => {
    setSelectedRole(role);
    setErrorMsg('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    ensurePermanentSupabaseConfig();

    try {
      const rawInput = email.trim().toLowerCase();
      const normalizedEmail = rawInput.includes('@')
        ? rawInput
        : `${rawInput}@min4.sch.id`;

      if (selectedRole === 'admin' && normalizedEmail !== ADMIN_EMAIL) {
        setErrorMsg(
          `Akses Admin hanya untuk akun ${ADMIN_EMAIL}. Silakan pilih peran Guru atau gunakan email admin.`
        );
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error || !data.user) {
        setErrorMsg(
          'Username/email atau password belum sesuai. Silakan periksa kembali.'
        );
        return;
      }

      const assignedRole: SelectedRole =
        data.user.email?.toLowerCase() === ADMIN_EMAIL ? 'admin' : 'guru';

      if (data.user.user_metadata?.role !== assignedRole) {
        await supabase.auth.updateUser({
          data: {
            ...data.user.user_metadata,
            role: assignedRole,
          },
        });
      }
    } catch {
      setErrorMsg('Gagal terhubung ke layanan autentikasi Supabase.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    ensurePermanentSupabaseConfig();
    setEmail('');
    setPassword('');
    setErrorMsg('');
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl px-8 py-6 text-center border border-emerald-100">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-700">
            Menyiapkan halaman masuk MIN 4 Magelang...
          </p>
        </div>
      </div>
    );
  }

  if (session) {
    const activeRole =
      session.user?.email?.toLowerCase() === ADMIN_EMAIL
        ? 'ADMIN'
        : (session.user?.user_metadata?.role || 'GURU').toString().toUpperCase();

    return (
      <div className="min-h-screen bg-slate-50">
        <div
          data-min4-portal-bar="true"
          className="bg-emerald-950 text-white px-4 py-2.5 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-emerald-800 shadow-sm"
        >
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 font-semibold tracking-wide">
              {activeRole}
            </span>
            <span className="text-emerald-100 font-medium">
              {session.user?.email}
            </span>
            <span className="hidden sm:inline text-emerald-300/80">
              • MIN 4 Magelang
            </span>
          </div>
          <button
            type="button"
            data-min4-portal-bar="true"
            onClick={handleLogout}
            className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold transition cursor-pointer"
          >
            Log Out
          </button>
        </div>
        <App />
      </div>
    );
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
            MIN 4 Magelang • Pilih Peran Masuk
          </p>
        </div>

        <form onSubmit={handleLogin} autoComplete="off" className="p-7 space-y-5">
          <div>
            <span className="block text-sm font-semibold text-slate-700 mb-2">
              Masuk Sebagai
            </span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSelectRole('admin')}
                className={`py-2.5 px-4 rounded-xl text-sm font-semibold border transition cursor-pointer ${
                  selectedRole === 'admin'
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-emerald-50'
                }`}
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleSelectRole('guru')}
                className={`py-2.5 px-4 rounded-xl text-sm font-semibold border transition cursor-pointer ${
                  selectedRole === 'guru'
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-emerald-50'
                }`}
              >
                Guru
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="login-user"
              className="block text-sm font-semibold text-slate-700 mb-1.5"
            >
              Username / Email {selectedRole === 'admin' ? 'Admin' : 'Guru'}
            </label>
            <input
              id="login-user"
              name="portal_login_user"
              type="text"
              required
              autoComplete="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition"
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
                name="portal_login_pass"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-20 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition"
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
            {loading
              ? 'Memeriksa Akun...'
              : `Masuk Sebagai ${selectedRole === 'admin' ? 'Admin' : 'Guru'}`}
          </button>
        </form>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PortalAuthGate />
  </React.StrictMode>
);
