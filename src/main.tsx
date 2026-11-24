import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import App from '../administrasi_guru_min_4_magelang';
import './index.css';

const DEFAULT_SUPABASE_URL = 'https://mqgnwzgyrckdwpysfbgn.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'sb_publishable_032N2HjrA1o26xfa8A1V1g_X2lIuXos';
const ADMIN_EMAIL = 'lailiya@min4.sch.id';
const STORE_TABLE = 'min4_app_store';

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

    const candidates = root.querySelectorAll('button, a, div, span, p');
    candidates.forEach((el) => {
      const htmlEl = el as HTMLElement;
      if (htmlEl.dataset.min4PortalBar === 'true') return;

      const text = (htmlEl.textContent || '').replace(/\s+/g, ' ').trim();
      const isDirectAction =
        text === 'Mode Lokal • Hubungkan Supabase' ||
        text.startsWith('Koneksi Supabase') ||
        text.includes('Status Cloud: Penyimpanan Lokal') ||
        text.includes('Penyimpanan: Lokal Browser') ||
        text === 'Penyimpanan:' ||
        text === 'Lokal Browser';

      if (isDirectAction && htmlEl.offsetHeight > 0 && htmlEl.offsetHeight < 140) {
        htmlEl.style.display = 'none';
      }
    });
  } catch {
    // Abaikan jika DOM belum siap
  }
}

function unlockAllControls() {
  try {
    const root = document.getElementById('root');
    if (!root) return;
    root.querySelectorAll('[data-min4-locked="true"]').forEach((el) => {
      const h = el as HTMLElement;
      (h as any).disabled = false;
      h.removeAttribute('disabled');
      h.removeAttribute('data-min4-locked');
      h.style.pointerEvents = '';
      h.style.opacity = '';
    });
  } catch {
    // Abaikan jika DOM belum siap
  }
}

export interface SiswaRecord {
  id: string;
  nis: string;
  nisn: string;
  namaLengkap: string;
  kelas: string;
  username: string;
  password: string;
}

const INITIAL_SISWA: SiswaRecord[] = [
  {
    id: '1',
    nis: '111133080001210001',
    nisn: '',
    namaLengkap: 'ABDILLAH DESPA JAYASRI',
    kelas: '6A',
    username: '111133080001210001',
    password: '12345.',
  },
  {
    id: '2',
    nis: '111133080001210002',
    nisn: '',
    namaLengkap: 'ACHMAD SYAHRIZAL CHOERUMAN',
    kelas: '6A',
    username: '111133080001210002',
    password: '12345.',
  },
  {
    id: '3',
    nis: '111133080001210003',
    nisn: '',
    namaLengkap: 'AFLAH RAFA SAKA PUTRA',
    kelas: '6A',
    username: '111133080001210003',
    password: '12345.',
  },
];

function escapeCsvCell(val: string): string {
  const str = String(val ?? '');
  if (str.includes(',') || str.includes(';') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function buildSpreadsheetCsv(rows: SiswaRecord[]): string {
  const headers = ['nis', 'nisn', 'full_name', 'class_id', 'username', 'password'];
  const lines = [
    headers.join(','),
    ...rows.map((r) =>
      [r.nis, r.nisn, r.namaLengkap, r.kelas, r.username, r.password]
        .map(escapeCsvCell)
        .join(',')
    ),
  ];
  return '\uFEFF' + lines.join('\n');
}

function detectDelimiter(line: string): string {
  if (line.includes('\t')) return '\t';
  const commas = (line.match(/,/g) || []).length;
  const semis = (line.match(/;/g) || []).length;
  return semis > commas ? ';' : ',';
}

function parseDelimitedLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function parseImportedSiswa(rawText: string): SiswaRecord[] {
  const cleaned = rawText.replace(/^\uFEFF/, '').trim();
  if (!cleaned) return [];

  let matrix: string[][] = [];
  if (cleaned.toLowerCase().includes('<table') && cleaned.toLowerCase().includes('<tr')) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(cleaned, 'text/html');
    matrix = Array.from(doc.querySelectorAll('tr'))
      .map((tr) =>
        Array.from(tr.querySelectorAll('th, td')).map((cell) =>
          (cell.textContent || '').trim()
        )
      )
      .filter((r) => r.some((c) => c.length > 0));
  } else {
    const lines = cleaned
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    if (lines.length === 0) return [];
    const delimiter = detectDelimiter(lines[0]);
    matrix = lines.map((l) => parseDelimitedLine(l, delimiter));
  }

  if (matrix.length < 2) return [];

  const headerMap = matrix[0].map((h) =>
    h.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
  );

  const findCol = (keys: string[]) =>
    headerMap.findIndex((h) => keys.includes(h));

  const idxNis = findCol(['nis', 'nomor_induk']);
  const idxNisn = findCol(['nisn']);
  const idxNama = findCol(['full_name', 'nama_lengkap', 'nama_lengkap_siswa', 'nama_siswa', 'nama']);
  const idxKelas = findCol(['class_id', 'kelas']);
  const idxUser = findCol(['username', 'username_login']);
  const idxPass = findCol(['password', 'password_login']);

  return matrix
    .slice(1)
    .map((cols, i) => {
      const nis = idxNis >= 0 ? (cols[idxNis] || '').trim() : '';
      const nisn = idxNisn >= 0 ? (cols[idxNisn] || '').trim() : '';
      const namaLengkap = idxNama >= 0 ? (cols[idxNama] || '').trim() : '';
      const kelas = idxKelas >= 0 ? (cols[idxKelas] || '').trim() : '6A';
      const rawUser = idxUser >= 0 ? (cols[idxUser] || '').trim() : '';
      const rawPass = idxPass >= 0 ? (cols[idxPass] || '').trim() : '';

      return {
        id: `${Date.now()}_${i}`,
        nis,
        nisn,
        namaLengkap,
        kelas: kelas || '6A',
        username: rawUser || nisn || nis,
        password: rawPass || '12345.',
      };
    })
    .filter((item) => item.nis || item.namaLengkap);
}

function downloadFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

ensurePermanentSupabaseConfig();

const supabase = createClient(supabaseUrl, supabaseAnonKey);

type SelectedRole = 'admin' | 'guru';

function SiswaTemplatePanelModal({
  open,
  onClose,
  user,
}: {
  open: boolean;
  onClose: () => void;
  user: any;
}) {
  const [siswaList, setSiswaList] = useState<SiswaRecord[]>(INITIAL_SISWA);
  const [nis, setNis] = useState('');
  const [nisn, setNisn] = useState('');
  const [namaLengkap, setNamaLengkap] = useState('');
  const [kelas, setKelas] = useState('');
  const [usernameLogin, setUsernameLogin] = useState('');
  const [passwordLogin, setPasswordLogin] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterKelas, setFilterKelas] = useState('Semua Kelas');
  const [infoMsg, setInfoMsg] = useState('');

  useEffect(() => {
    if (!open || !user?.id) return;
    let active = true;

    supabase
      .from(STORE_TABLE)
      .select('payload')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!active) return;
        const saved = (data?.payload as any)?.data_siswa_records;
        if (Array.isArray(saved) && saved.length > 0) {
          setSiswaList(saved);
        }
      });

    return () => {
      active = false;
    };
  }, [open, user?.id]);

  if (!open) return null;

  const persistToSupabase = async (nextList: SiswaRecord[], message?: string) => {
    setSiswaList(nextList);
    if (message) setInfoMsg(message);
    if (!user?.id) return;

    try {
      const { data: existing } = await supabase
        .from(STORE_TABLE)
        .select('payload')
        .eq('user_id', user.id)
        .maybeSingle();

      const currentPayload =
        existing?.payload && typeof existing.payload === 'object'
          ? (existing.payload as Record<string, any>)
          : {};

      await supabase.from(STORE_TABLE).upsert(
        {
          user_id: user.id,
          payload: {
            ...currentPayload,
            data_siswa_records: nextList,
            updated_at_siswa: new Date().toISOString(),
          },
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );
    } catch {
      // Abaikan jika sedang offline sementara
    }
  };

  const handleAddSiswa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nis.trim() || !namaLengkap.trim()) {
      setInfoMsg('Mohon isi minimal NIS dan Nama Lengkap Siswa.');
      return;
    }

    const finalKelas = kelas.trim() || '6A';
    const finalUsername =
      usernameLogin.trim() || nisn.trim() || nis.trim();
    const finalPassword = passwordLogin.trim() || '12345.';

    const newItem: SiswaRecord = {
      id: `${Date.now()}`,
      nis: nis.trim(),
      nisn: nisn.trim(),
      namaLengkap: namaLengkap.trim().toUpperCase(),
      kelas: finalKelas,
      username: finalUsername,
      password: finalPassword,
    };

    const nextList = [newItem, ...siswaList];
    setNis('');
    setNisn('');
    setNamaLengkap('');
    setKelas('');
    setUsernameLogin('');
    setPasswordLogin('');
    await persistToSupabase(nextList, 'Data siswa tersimpan.');
  };

  const handleDeleteSiswa = async (id: string) => {
    const nextList = siswaList.filter((item) => item.id !== id);
    await persistToSupabase(nextList, 'Data siswa dihapus.');
  };

  const handleDownloadTemplate = () => {
    const templateSample: SiswaRecord[] = [
      {
        id: 'sample-1',
        nis: '111133080001210001',
        nisn: '',
        namaLengkap: 'ABDILLAH DESPA JAYASRI',
        kelas: '6A',
        username: '111133080001210001',
        password: '12345.',
      },
    ];
    const csv = buildSpreadsheetCsv(templateSample);
    downloadFile('Template_Data_Siswa_MIN4.csv', csv, 'text/csv;charset=utf-8;');
    setInfoMsg(
      'Template berhasil diunduh. Isi di Excel/WPS lalu klik "Upload / Import (.csv / .xlsx)".'
    );
  };

  const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const parsed = parseImportedSiswa(String(reader.result || ''));
      if (parsed.length === 0) {
        setInfoMsg(
          'Tidak ada data siswa yang terbaca dari file. Pastikan format sesuai template.'
        );
        return;
      }
      const merged = [...parsed, ...siswaList];
      await persistToSupabase(
        merged,
        `Berhasil mengimpor ${parsed.length} data siswa dari "${file.name}".`
      );
    };
    reader.readAsText(file, 'utf-8');
    e.target.value = '';
  };

  const kelasOptions = Array.from(
    new Set(['6A', '6B', '6C', ...siswaList.map((s) => s.kelas).filter(Boolean)])
  );

  const filteredList = siswaList.filter((item) => {
    const matchesKelas =
      filterKelas === 'Semua Kelas' || item.kelas === filterKelas;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      item.nis.toLowerCase().includes(q) ||
      item.nisn.toLowerCase().includes(q) ||
      item.namaLengkap.toLowerCase().includes(q) ||
      item.username.toLowerCase().includes(q);
    return matchesKelas && matchesSearch;
  });

  return (
    <div
      data-min4-portal-bar="true"
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        <div className="bg-emerald-800 text-white px-6 py-3.5 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold">
              Data Siswa &amp; Template Excel/CSV • MIN 4 Magelang
            </h2>
            <p className="text-xs text-emerald-100">
              Input manual atau unduh template, isi di Excel/WPS, lalu upload kembali
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-xs font-semibold cursor-pointer"
          >
            Tutup
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto bg-slate-50/70">
          {/* Baris Form Input + Tombol + Simpan */}
          <form
            onSubmit={handleAddSiswa}
            className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 items-end">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  NIS
                </label>
                <input
                  type="text"
                  value={nis}
                  onChange={(e) => setNis(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  NISN
                </label>
                <input
                  type="text"
                  value={nisn}
                  onChange={(e) => setNisn(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Nama Lengkap Siswa
                </label>
                <input
                  type="text"
                  value={namaLengkap}
                  onChange={(e) => setNamaLengkap(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Kelas
                </label>
                <select
                  value={kelas}
                  onChange={(e) => setKelas(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white focus:outline-none focus:border-emerald-600"
                >
                  <option value="">-- Pilih Kelas --</option>
                  {kelasOptions.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Username Login
                </label>
                <input
                  type="text"
                  value={usernameLogin}
                  onChange={(e) => setUsernameLogin(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Password Login
                </label>
                <input
                  type="text"
                  value={passwordLogin}
                  onChange={(e) => setPasswordLogin(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full py-2 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-2xs transition cursor-pointer"
                >
                  + Simpan
                </button>
              </div>
            </div>
          </form>

          {/* Baris Pencarian, Filter Kelas, Unduh Template & Upload/Import */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama, NIS, NISN, atau username"
                  className="px-3.5 py-2 rounded-lg border border-slate-300 text-xs text-slate-700 w-64 focus:outline-none focus:border-emerald-600"
                />
                <select
                  value={filterKelas}
                  onChange={(e) => setFilterKelas(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-700 bg-white focus:outline-none focus:border-emerald-600"
                >
                  <option value="Semua Kelas">Semua Kelas</option>
                  {kelasOptions.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <span>↓ Unduh Template (.xlsx)</span>
                </button>

                <label className="px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer">
                  <span>↑ Upload / Import (.csv / .xlsx)</span>
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls,.txt,text/csv"
                    onChange={handleUploadFile}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {infoMsg && (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3.5 py-2 text-xs font-medium text-emerald-900">
                {infoMsg}
              </div>
            )}

            {/* Tabel Data Siswa */}
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    <th className="py-3 px-4">NIS</th>
                    <th className="py-3 px-4">NISN</th>
                    <th className="py-3 px-4">Nama Lengkap</th>
                    <th className="py-3 px-4">Kelas</th>
                    <th className="py-3 px-4">Username</th>
                    <th className="py-3 px-4">Password</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredList.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-mono text-slate-700">
                        {row.nis}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {row.nisn || '-'}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {row.namaLengkap}
                      </td>
                      <td className="py-3 px-4 text-slate-700">{row.kelas}</td>
                      <td className="py-3 px-4 font-mono text-emerald-700">
                        {row.username}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700">
                        {row.password}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteSiswa(row.id)}
                          title="Hapus data siswa"
                          className="text-red-500 hover:text-red-700 font-semibold px-2 py-1 rounded hover:bg-red-50 transition cursor-pointer"
                        >
                          🗑
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredList.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-6 px-4 text-center text-slate-400"
                      >
                        Belum ada data siswa yang cocok dengan pencarian.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PortalAuthGate() {
  const [session, setSession] = useState<any>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [selectedRole, setSelectedRole] = useState<SelectedRole>('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [siswaModalOpen, setSiswaModalOpen] = useState(false);

  useEffect(() => {
    ensurePermanentSupabaseConfig();
    unlockAllControls();
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

    unlockAllControls();
    hideManualSupabasePrompts();

    const observer = new MutationObserver(() => {
      unlockAllControls();
      hideManualSupabasePrompts();
    });

    const root = document.getElementById('root');
    if (root) {
      observer.observe(root, {
        childList: true,
        subtree: true,
      });
    }

    const timer = window.setTimeout(() => {
      unlockAllControls();
      hideManualSupabasePrompts();
    }, 300);

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
    unlockAllControls();
    await supabase.auth.signOut();
    ensurePermanentSupabaseConfig();
    setEmail('');
    setPassword('');
    setErrorMsg('');
    setSiswaModalOpen(false);
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
    const isCurrentAdmin =
      session.user?.email?.toLowerCase() === ADMIN_EMAIL;
    const activeRole = isCurrentAdmin ? 'ADMIN' : 'GURU';

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
          <div className="flex items-center gap-2">
            <button
              type="button"
              data-min4-portal-bar="true"
              onClick={() => setSiswaModalOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-semibold transition cursor-pointer"
            >
              Unduh &amp; Upload Template Siswa
            </button>
            <button
              type="button"
              data-min4-portal-bar="true"
              onClick={handleLogout}
              className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold transition cursor-pointer"
            >
              Log Out
            </button>
          </div>
        </div>

        <App />

        <SiswaTemplatePanelModal
          open={siswaModalOpen}
          onClose={() => setSiswaModalOpen(false)}
          user={session.user}
        />
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
