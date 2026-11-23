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

function isDataMasterActive(): boolean {
  try {
    const root = document.getElementById('root');
    if (!root) return false;

    const headings = Array.from(
      root.querySelectorAll('h1, h2, h3, h4, p, div, span')
    );
    const hasMasterHeader = headings.some((el) => {
      const h = el as HTMLElement;
      if (h.dataset.min4PortalBar === 'true') return false;
      const t = (h.textContent || '').trim();
      return (
        (t === '2. Data Master' || t === 'Data Master') &&
        h.offsetHeight > 0 &&
        h.offsetHeight < 80
      );
    });

    const activeNavButtons = Array.from(root.querySelectorAll('button, a'));
    const isNavSelected = activeNavButtons.some((btn) => {
      const b = btn as HTMLElement;
      if (b.dataset.min4PortalBar === 'true') return false;
      const t = (b.textContent || '').trim();
      const isMasterBtn = t.includes('Data Master');
      const cls = b.className || '';
      const ariaSelected = b.getAttribute('aria-selected') === 'true';
      const ariaCurrent = b.getAttribute('aria-current') === 'page';
      return (
        isMasterBtn &&
        (ariaSelected ||
          ariaCurrent ||
          cls.includes('active') ||
          cls.includes('bg-emerald-700') ||
          cls.includes('bg-emerald-600') ||
          cls.includes('bg-white/15'))
      );
    });

    return hasMasterHeader || isNavSelected;
  } catch {
    return false;
  }
}

function lockDataMasterForNonAdmin(isAdmin: boolean): boolean {
  try {
    const root = document.getElementById('root');
    if (!root) return false;

    if (isAdmin) {
      root.querySelectorAll('[data-min4-locked="true"]').forEach((el) => {
        const h = el as HTMLElement;
        h.removeAttribute('disabled');
        h.removeAttribute('data-min4-locked');
        h.style.pointerEvents = '';
        h.style.opacity = '';
      });
      return false;
    }

    const inDataMaster = isDataMasterActive();
    if (!inDataMaster) return false;

    const controls = root.querySelectorAll('button, input, select, textarea');
    controls.forEach((el) => {
      const h = el as HTMLElement;
      if (h.dataset.min4PortalBar === 'true') return;
      if (h.closest('[data-min4-portal-bar="true"]')) return;

      const label = (h.textContent || '').trim().toLowerCase();
      const isNavigationButton =
        h.tagName === 'BUTTON' &&
        /^\d+[a-z]?\.\s/i.test(label) &&
        !label.includes('simpan') &&
        !label.includes('tambah') &&
        !label.includes('edit') &&
        !label.includes('hapus') &&
        !label.includes('reset') &&
        !label.includes('import') &&
        !label.includes('impor');

      if (isNavigationButton) return;

      if (
        h.tagName === 'INPUT' ||
        h.tagName === 'SELECT' ||
        h.tagName === 'TEXTAREA'
      ) {
        (h as HTMLInputElement).disabled = true;
        h.dataset.min4Locked = 'true';
        h.style.opacity = '0.65';
      } else if (h.tagName === 'BUTTON') {
        (h as HTMLButtonElement).disabled = true;
        h.dataset.min4Locked = 'true';
        h.style.pointerEvents = 'none';
        h.style.opacity = '0.45';
      }
    });

    return true;
  } catch {
    return false;
  }
}

type TemplateCategory = 'data_master_siswa' | 'jurnal_kbm' | 'penilaian_siswa';

const TEMPLATE_CONFIGS: Record<
  TemplateCategory,
  {
    label: string;
    adminOnly: boolean;
    headers: string[];
    sampleRows: string[][];
  }
> = {
  data_master_siswa: {
    label: 'Data Master Siswa & Kelas (Khusus Admin)',
    adminOnly: true,
    headers: ['nisn', 'nama_siswa', 'kelas', 'jenis_kelamin', 'keterangan'],
    sampleRows: [
      ['1234567890', 'Ahmad Fauzi', '6A', 'L', 'Siswa aktif MIN 4 Magelang'],
      ['1234567891', 'Aisyah Rahma', '6A', 'P', 'Siswa aktif MIN 4 Magelang'],
    ],
  },
  jurnal_kbm: {
    label: 'Jurnal Pembelajaran & Kehadiran',
    adminOnly: false,
    headers: ['tanggal', 'kelas', 'mapel', 'materi', 'catatan_kehadiran'],
    sampleRows: [
      ['2026-11-23', '6A', 'Fiqih', 'Zakat Fitrah & Zakat Mal', 'Hadir semua'],
      ['2026-11-24', '6A', 'Bahasa Indonesia', 'Teks Eksplanasi', '1 siswa izin'],
    ],
  },
  penilaian_siswa: {
    label: 'Buku Nilai & Skor Asesmen',
    adminOnly: false,
    headers: ['nisn', 'nama_siswa', 'kelas', 'mapel', 'nilai_tugas', 'nilai_ujian'],
    sampleRows: [
      ['1234567890', 'Ahmad Fauzi', '6A', 'Fiqih', '88', '90'],
      ['1234567891', 'Aisyah Rahma', '6A', 'Fiqih', '92', '94'],
    ],
  },
};

function escapeCsvCell(val: string): string {
  const str = String(val ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function buildCsvContent(headers: string[], rows: string[][]): string {
  const headerLine = headers.map(escapeCsvCell).join(',');
  const bodyLines = rows.map((row) => row.map(escapeCsvCell).join(','));
  return '\uFEFF' + [headerLine, ...bodyLines].join('\n');
}

function parseCsvLine(line: string): string[] {
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
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function parseCsvRows(csvText: string): { headers: string[]; records: Record<string, string>[] } {
  const cleaned = csvText.replace(/^\uFEFF/, '').trim();
  if (!cleaned) {
    return { headers: [], records: [] };
  }
  const lines = cleaned
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) {
    return { headers: [], records: [] };
  }

  const headers = parseCsvLine(lines[0]);
  const records: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    const rowObj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      rowObj[h] = values[idx] ?? '';
    });
    records.push(rowObj);
  }

  return { headers, records };
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

function TemplateIoModal({
  open,
  onClose,
  user,
  isAdmin,
}: {
  open: boolean;
  onClose: () => void;
  user: any;
  isAdmin: boolean;
}) {
  const [category, setCategory] = useState<TemplateCategory>(
    isAdmin ? 'data_master_siswa' : 'jurnal_kbm'
  );
  const [importedRows, setImportedRows] = useState<Record<string, string>[]>([]);
  const [statusMsg, setStatusMsg] = useState('');
  const [savingCloud, setSavingCloud] = useState(false);

  useEffect(() => {
    if (!isAdmin && category === 'data_master_siswa') {
      setCategory('jurnal_kbm');
    }
  }, [isAdmin, category]);

  if (!open) return null;

  const activeCfg = TEMPLATE_CONFIGS[category];
  const isBlockedByRole = activeCfg.adminOnly && !isAdmin;

  const handleDownloadTemplate = () => {
    const csv = buildCsvContent(activeCfg.headers, activeCfg.sampleRows);
    downloadFile(
      `template_${category}_min4_magelang.csv`,
      csv,
      'text/csv;charset=utf-8;'
    );
    setStatusMsg('Template CSV berhasil diunduh. Silakan isi data di Excel/Sheets lalu impor kembali.');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isBlockedByRole) {
      setStatusMsg('Hanya Admin yang dapat mengimpor template Data Master.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || '');
      const parsed = parseCsvRows(text);
      if (parsed.records.length === 0) {
        setStatusMsg('File kosong atau belum memiliki baris data.');
        return;
      }
      setImportedRows(parsed.records);
      setStatusMsg(`Berhasil membaca ${parsed.records.length} baris data dari ${file.name}.`);
    };
    reader.readAsText(file, 'utf-8');
    e.target.value = '';
  };

  const handleExportCsv = () => {
    const rowsToExport =
      importedRows.length > 0
        ? importedRows.map((rec) =>
            activeCfg.headers.map((h) => rec[h] ?? '')
          )
        : activeCfg.sampleRows;

    const csv = buildCsvContent(activeCfg.headers, rowsToExport);
    downloadFile(
      `ekspor_${category}_min4_magelang.csv`,
      csv,
      'text/csv;charset=utf-8;'
    );
    setStatusMsg(`Berhasil mengekspor ${rowsToExport.length} baris ke file CSV.`);
  };

  const handleSaveToSupabase = async () => {
    if (isBlockedByRole) {
      setStatusMsg('Hanya Admin yang dapat menyimpan Data Master.');
      return;
    }
    if (!user?.id) {
      setStatusMsg('Sesi pengguna tidak ditemukan.');
      return;
    }
    if (importedRows.length === 0) {
      setStatusMsg('Silakan impor file CSV terlebih dahulu sebelum menyimpan ke Supabase.');
      return;
    }

    setSavingCloud(true);
    setStatusMsg('');

    try {
      const { data: existing, error: fetchErr } = await supabase
        .from(STORE_TABLE)
        .select('payload')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchErr) {
        setStatusMsg(`Gagal membaca data lama: ${fetchErr.message}`);
        return;
      }

      const currentPayload =
        existing?.payload && typeof existing.payload === 'object'
          ? (existing.payload as Record<string, any>)
          : {};

      const nextPayload = {
        ...currentPayload,
        [`template_${category}`]: importedRows,
        last_template_import_at: new Date().toISOString(),
      };

      const { error: upsertErr } = await supabase.from(STORE_TABLE).upsert(
        {
          user_id: user.id,
          payload: nextPayload,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

      if (upsertErr) {
        setStatusMsg(`Gagal menyimpan ke Supabase: ${upsertErr.message}`);
        return;
      }

      setStatusMsg(
        `Sukses! ${importedRows.length} baris data (${activeCfg.label}) tersimpan ke Supabase Cloud.`
      );
    } catch {
      setStatusMsg('Terjadi kesalahan saat menyimpan ke Supabase.');
    } finally {
      setSavingCloud(false);
    }
  };

  return (
    <div
      data-min4-portal-bar="true"
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="bg-emerald-800 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold">
              Impor Template &amp; Ekspor Data • MIN 4 Magelang
            </h2>
            <p className="text-xs text-emerald-100">
              Isi massal lewat CSV/Excel lalu ekspor atau simpan ke Supabase
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

        <div className="p-6 space-y-5 overflow-y-auto text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Pilih Jenis Data / Template
            </label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value as TemplateCategory);
                setImportedRows([]);
                setStatusMsg('');
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              {isAdmin && (
                <option value="data_master_siswa">
                  {TEMPLATE_CONFIGS.data_master_siswa.label}
                </option>
              )}
              <option value="jurnal_kbm">
                {TEMPLATE_CONFIGS.jurnal_kbm.label}
              </option>
              <option value="penilaian_siswa">
                {TEMPLATE_CONFIGS.penilaian_siswa.label}
              </option>
            </select>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold cursor-pointer"
            >
              1. Unduh Template CSV
            </button>

            <label
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold border ${
                isBlockedByRole
                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-300 cursor-pointer'
              }`}
            >
              2. Impor File CSV Terisi
              <input
                type="file"
                accept=".csv,text/csv"
                disabled={isBlockedByRole}
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={handleExportCsv}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold cursor-pointer"
            >
              3. Ekspor ke CSV (Excel)
            </button>

            <button
              type="button"
              disabled={savingCloud || isBlockedByRole || importedRows.length === 0}
              onClick={handleSaveToSupabase}
              className="px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:bg-slate-300 text-white text-xs font-semibold cursor-pointer"
            >
              {savingCloud ? 'Menyimpan...' : '4. Simpan ke Supabase'}
            </button>
          </div>

          {statusMsg && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-xs font-medium text-emerald-900">
              {statusMsg}
            </div>
          )}

          <div>
            <div className="text-xs font-semibold text-slate-700 mb-2">
              Pratinjau Data ({importedRows.length > 0 ? `${importedRows.length} baris diimpor` : 'Contoh Template'})
            </div>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700">
                    {activeCfg.headers.map((h) => (
                      <th key={h} className="px-3 py-2 border-b border-slate-200 font-semibold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(importedRows.length > 0
                    ? importedRows.slice(0, 8).map((r) => activeCfg.headers.map((h) => r[h] ?? ''))
                    : activeCfg.sampleRows
                  ).map((row, rIdx) => (
                    <tr key={rIdx} className="border-b border-slate-100">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="px-3 py-2 text-slate-700">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
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
  const [masterReadOnlyNotice, setMasterReadOnlyNotice] = useState(false);
  const [ioModalOpen, setIoModalOpen] = useState(false);

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

  const isCurrentAdmin =
    session?.user?.email?.toLowerCase() === ADMIN_EMAIL;

  useEffect(() => {
    if (!session) return;

    const runGuards = () => {
      hideManualSupabasePrompts();
      const locked = lockDataMasterForNonAdmin(isCurrentAdmin);
      setMasterReadOnlyNotice(!isCurrentAdmin && locked);
    };

    runGuards();

    const observer = new MutationObserver(() => {
      runGuards();
    });

    const root = document.getElementById('root');
    if (root) {
      observer.observe(root, {
        childList: true,
        subtree: true,
        attributes: true,
      });
    }

    const interval = window.setInterval(runGuards, 300);

    return () => {
      observer.disconnect();
      window.clearInterval(interval);
    };
  }, [session, isCurrentAdmin]);

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
    setMasterReadOnlyNotice(false);
    setIoModalOpen(false);
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
              onClick={() => setIoModalOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-semibold transition cursor-pointer"
            >
              Impor &amp; Ekspor Template
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

        {masterReadOnlyNotice && (
          <div
            data-min4-portal-bar="true"
            className="bg-amber-50 border-b border-amber-300 text-amber-950 px-4 py-2.5 text-xs font-medium flex items-center justify-between gap-2"
          >
            <span>
              <strong>Mode Lihat Saja (Data Master):</strong> Pengubahan Data Master hanya dapat dilakukan oleh akun <strong>Admin</strong> (<code>{ADMIN_EMAIL}</code>).
            </span>
          </div>
        )}

        <App />

        <TemplateIoModal
          open={ioModalOpen}
          onClose={() => setIoModalOpen(false)}
          user={session.user}
          isAdmin={isCurrentAdmin}
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
