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

type TemplateCategory =
  | 'data_siswa'
  | 'data_kelas'
  | 'mata_pelajaran'
  | 'jurnal_kbm'
  | 'buku_nilai';

const TEMPLATE_CONFIGS: Record<
  TemplateCategory,
  {
    label: string;
    filePrefix: string;
    headers: string[];
    sampleRows: string[][];
  }
> = {
  data_siswa: {
    label: 'Data Siswa',
    filePrefix: 'Template_Data_Siswa_MIN4',
    headers: [
      'NIS',
      'NAMA LENGKAP',
      'KELAS',
      'JENIS KELAMIN',
      'TANGGAL LAHIR',
      'NAMA ORANG TUA',
      'KONTAK ORANG TUA',
      'ALAMAT',
    ],
    sampleRows: [
      [
        '2026001',
        'MUHAMMAD DAFA KHOIRUL ULUM',
        '6C',
        'Laki-laki (L)',
        '15/05/2015',
        'Bapak Suryanto',
        '081234567890',
        'Krasak, Salaman, Magelang',
      ],
      [
        '2026002',
        'AISYAH RAHMA',
        '6C',
        'Perempuan (P)',
        '22/08/2015',
        'Ibu Nurul Huda',
        '081298765432',
        'Salaman, Magelang',
      ],
    ],
  },
  data_kelas: {
    label: 'Data Kelas',
    filePrefix: 'Template_Data_Kelas_MIN4',
    headers: ['KODE KELAS', 'NAMA KELAS', 'TINGKAT', 'WALI KELAS'],
    sampleRows: [
      ['KLS-6C', 'Kelas 6C', '6', 'Lailiya Hikmawati, S.Pd.I'],
      ['KLS-6A', 'Kelas 6A', '6', 'Guru Kelas 6A'],
    ],
  },
  mata_pelajaran: {
    label: 'Mata Pelajaran',
    filePrefix: 'Template_Mata_Pelajaran_MIN4',
    headers: ['KODE MAPEL', 'NAMA MAPEL', 'KELOMPOK', 'KKM / KKMTP'],
    sampleRows: [
      ['FIQ-MI', 'Fiqih', 'PAI & Bahasa Arab', '75'],
      ['QH-MI', 'Al-Quran Hadis', 'PAI & Bahasa Arab', '75'],
    ],
  },
  jurnal_kbm: {
    label: 'Jurnal & Presensi',
    filePrefix: 'Template_Jurnal_Presensi_MIN4',
    headers: ['TANGGAL', 'KELAS', 'MATA PELAJARAN', 'MATERI POKOK', 'CATATAN KEHADIRAN'],
    sampleRows: [
      ['24/11/2026', '6C', 'Fiqih', 'Zakat Fitrah & Zakat Mal', 'Hadir semua'],
      ['25/11/2026', '6C', 'Al-Quran Hadis', 'Hukum Bacaan Mad', '1 siswa izin'],
    ],
  },
  buku_nilai: {
    label: 'Buku Nilai Siswa',
    filePrefix: 'Template_Buku_Nilai_MIN4',
    headers: ['NIS', 'NAMA LENGKAP', 'KELAS', 'MATA PELAJARAN', 'NILAI FORMATIF', 'NILAI SUMATIF'],
    sampleRows: [
      ['2026001', 'MUHAMMAD DAFA KHOIRUL ULUM', '6C', 'Fiqih', '88', '90'],
      ['2026002', 'AISYAH RAHMA', '6C', 'Fiqih', '92', '94'],
    ],
  },
};

function normalizeHeaderKey(h: string): string {
  return h
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function mapStudentRowForApp(raw: Record<string, string>) {
  const indexed: Record<string, string> = {};
  Object.entries(raw).forEach(([k, v]) => {
    indexed[normalizeHeaderKey(k)] = String(v ?? '').trim();
  });

  const rawJk = (indexed['JENIS_KELAMIN'] || indexed['JK'] || '').toUpperCase();
  const jenisKelamin =
    rawJk === 'P' || rawJk.includes('PEREMPUAN') ? 'Perempuan (P)' : 'Laki-laki (L)';

  return {
    nis: indexed['NIS'] || '',
    nama_lengkap: indexed['NAMA_LENGKAP'] || indexed['NAMA_SISWA'] || indexed['FULL_NAME'] || '',
    kelas: indexed['KELAS'] || indexed['CLASS_ID'] || '',
    jenis_kelamin: jenisKelamin,
    tanggal_lahir: indexed['TANGGAL_LAHIR'] || '',
    nama_orang_tua: indexed['NAMA_ORANG_TUA'] || indexed['NAMA_ORANG_TUA_WALI'] || '',
    kontak_orang_tua: indexed['KONTAK_ORANG_TUA'] || indexed['NO_KONTAK_ORANG_TUA'] || '',
    alamat: indexed['ALAMAT'] || '',
  };
}

function escapeCsvCell(val: string): string {
  const str = String(val ?? '');
  if (str.includes(',') || str.includes(';') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function buildCsvContent(headers: string[], rows: string[][]): string {
  const headerLine = headers.map(escapeCsvCell).join(',');
  const bodyLines = rows.map((row) => row.map(escapeCsvCell).join(','));
  return '\uFEFF' + [headerLine, ...bodyLines].join('\n');
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

function parseUploadedSpreadsheetText(
  rawText: string
): { headers: string[]; records: Record<string, string>[] } {
  const cleaned = rawText.replace(/^\uFEFF/, '').trim();
  if (!cleaned) {
    return { headers: [], records: [] };
  }

  if (cleaned.toLowerCase().includes('<table') && cleaned.toLowerCase().includes('<tr')) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(cleaned, 'text/html');
    const trList = Array.from(doc.querySelectorAll('tr'));
    const matrix = trList
      .map((tr) =>
        Array.from(tr.querySelectorAll('th, td')).map((cell) =>
          (cell.textContent || '').trim()
        )
      )
      .filter((r) => r.some((c) => c.length > 0));

    if (matrix.length === 0) return { headers: [], records: [] };
    const headers = matrix[0];
    const records = matrix.slice(1).map((vals) => {
      const obj: Record<string, string> = {};
      headers.forEach((h, idx) => {
        obj[h] = vals[idx] ?? '';
      });
      return obj;
    });
    return { headers, records };
  }

  const lines = cleaned
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) {
    return { headers: [], records: [] };
  }

  const delimiter = detectDelimiter(lines[0]);
  const headers = parseDelimitedLine(lines[0], delimiter);
  const records: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseDelimitedLine(lines[i], delimiter);
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
}: {
  open: boolean;
  onClose: () => void;
  user: any;
}) {
  const [category, setCategory] = useState<TemplateCategory>('data_siswa');
  const [importedRows, setImportedRows] = useState<Record<string, string>[]>([]);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [savingCloud, setSavingCloud] = useState(false);

  if (!open) return null;

  const activeCfg = TEMPLATE_CONFIGS[category];

  const handleDownloadTemplate = () => {
    const csv = buildCsvContent(activeCfg.headers, activeCfg.sampleRows);
    downloadFile(
      `${activeCfg.filePrefix}.csv`,
      csv,
      'text/csv;charset=utf-8;'
    );
    setStatusMsg(
      `Template "${activeCfg.filePrefix}.csv" berhasil didownload dengan kolom: ${activeCfg.headers.join(', ')}.`
    );
  };

  const processUploadedFile = (file: File) => {
    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || '');
      const parsed = parseUploadedSpreadsheetText(text);
      if (parsed.records.length === 0) {
        setImportedRows([]);
        setStatusMsg(
          'Tidak ada baris data yang terbaca. Pastikan file memiliki baris header dan baris data terisi (jika memakai .xlsx, simpan dulu sebagai .csv di Excel).'
        );
        return;
      }

      const normalizedRecords =
        category === 'data_siswa'
          ? parsed.records.map((rec) => {
              const mapped = mapStudentRowForApp(rec);
              return {
                NIS: mapped.nis,
                'NAMA LENGKAP': mapped.nama_lengkap,
                KELAS: mapped.kelas,
                'JENIS KELAMIN': mapped.jenis_kelamin,
                'TANGGAL LAHIR': mapped.tanggal_lahir,
                'NAMA ORANG TUA': mapped.nama_orang_tua,
                'KONTAK ORANG TUA': mapped.kontak_orang_tua,
                ALAMAT: mapped.alamat,
              };
            })
          : parsed.records;

      setImportedRows(normalizedRecords);
      setStatusMsg(
        `Berhasil mengupload ${normalizedRecords.length} baris data dari "${file.name}". Klik "Simpan Hasil Upload ke Supabase" atau "Ekspor ke CSV".`
      );
    };
    reader.readAsText(file, 'utf-8');
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
    e.target.value = '';
  };

  const handleDropFile = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
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
      `${activeCfg.filePrefix}_Terisi.csv`,
      csv,
      'text/csv;charset=utf-8;'
    );
    setStatusMsg(`Berhasil mengekspor ${rowsToExport.length} baris ke file CSV.`);
  };

  const handleSaveToSupabase = async () => {
    if (!user?.id) {
      setStatusMsg('Sesi pengguna tidak ditemukan.');
      return;
    }
    if (importedRows.length === 0) {
      setStatusMsg('Silakan upload file template yang sudah diisi terlebih dahulu.');
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

      const mappedStudents =
        category === 'data_siswa'
          ? importedRows.map((rec) => mapStudentRowForApp(rec))
          : undefined;

      const nextPayload = {
        ...currentPayload,
        [`template_${category}`]: importedRows,
        ...(mappedStudents ? { data_siswa_master: mappedStudents } : {}),
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
        `Berhasil! ${importedRows.length} baris data tersimpan ke Supabase Cloud.`
      );
    } catch {
      setStatusMsg('Terjadi kesalahan saat menyimpan ke Supabase.');
    } finally {
      setSavingCloud(false);
    }
  };

  const displayHeaders = activeCfg.headers;

  return (
    <div
      data-min4-portal-bar="true"
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="bg-emerald-800 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold">
              Download &amp; Upload Template • MIN 4 Magelang
            </h2>
            <p className="text-xs text-emerald-100">
              1. Download template → 2. Isi di Excel/WPS → 3. Upload kembali ke aplikasi
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
              Pilih Jenis Template Data
            </label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value as TemplateCategory);
                setImportedRows([]);
                setUploadedFileName('');
                setStatusMsg('');
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="data_siswa">
                {TEMPLATE_CONFIGS.data_siswa.label}
              </option>
              <option value="data_kelas">
                {TEMPLATE_CONFIGS.data_kelas.label}
              </option>
              <option value="mata_pelajaran">
                {TEMPLATE_CONFIGS.mata_pelajaran.label}
              </option>
              <option value="jurnal_kbm">
                {TEMPLATE_CONFIGS.jurnal_kbm.label}
              </option>
              <option value="buku_nilai">
                {TEMPLATE_CONFIGS.buku_nilai.label}
              </option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 flex flex-col justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-emerald-900">
                  Langkah 1: Download Template
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Kolom template: <strong>{activeCfg.headers.join(', ')}</strong>.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold cursor-pointer"
              >
                Download Template ({activeCfg.filePrefix}.csv)
              </button>
            </div>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDropFile}
              className={`rounded-xl border-2 border-dashed p-4 flex flex-col justify-between gap-3 transition ${
                isDragging
                  ? 'border-emerald-600 bg-emerald-50'
                  : 'border-slate-300 bg-slate-50'
              }`}
            >
              <div>
                <div className="text-xs font-bold text-slate-800">
                  Langkah 2: Upload Template Terisi
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  {uploadedFileName
                    ? `File dipilih: ${uploadedFileName}`
                    : 'Klik tombol di bawah atau seret (drag & drop) file template (.csv) yang sudah selesai diisi.'}
                </p>
              </div>
              <label className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-400 text-xs font-semibold text-center cursor-pointer">
                Upload File Template (.csv)
                <input
                  type="file"
                  accept=".csv,.txt,text/csv"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={savingCloud || importedRows.length === 0}
              onClick={handleSaveToSupabase}
              className="px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:bg-slate-300 text-white text-xs font-semibold cursor-pointer"
            >
              {savingCloud ? 'Menyimpan...' : 'Simpan Hasil Upload ke Supabase'}
            </button>

            <button
              type="button"
              onClick={handleExportCsv}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold cursor-pointer"
            >
              Ekspor Data ke CSV (Excel)
            </button>
          </div>

          {statusMsg && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-xs font-medium text-emerald-900">
              {statusMsg}
            </div>
          )}

          <div>
            <div className="text-xs font-semibold text-slate-700 mb-2">
              Pratinjau Data (
              {importedRows.length > 0
                ? `${importedRows.length} baris siap diproses dari "${uploadedFileName}"`
                : 'Contoh Isi Template'}
              )
            </div>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700">
                    {displayHeaders.map((h) => (
                      <th
                        key={h}
                        className="px-3 py-2 border-b border-slate-200 font-semibold whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(importedRows.length > 0
                    ? importedRows
                        .slice(0, 10)
                        .map((r) => displayHeaders.map((h) => r[h] ?? ''))
                    : activeCfg.sampleRows
                  ).map((row, rIdx) => (
                    <tr key={rIdx} className="border-b border-slate-100">
                      {row.map((cell, cIdx) => (
                        <td
                          key={cIdx}
                          className="px-3 py-2 text-slate-700 whitespace-nowrap"
                        >
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
  const [ioModalOpen, setIoModalOpen] = useState(false);

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
              onClick={() => setIoModalOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-semibold transition cursor-pointer"
            >
              Download &amp; Upload Template
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

        <TemplateIoModal
          open={ioModalOpen}
          onClose={() => setIoModalOpen(false)}
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
