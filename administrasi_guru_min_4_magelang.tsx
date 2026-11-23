import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  LayoutDashboard, Database, Calendar, BookOpen, ClipboardCheck,
  FileSpreadsheet, BarChart3, RefreshCw, HelpCircle, FolderOpen,
  Briefcase, Clock, Target, Award, Users, Archive, Settings,
  Plus, Edit2, Trash2, Search, Download, Upload, Printer,
  CheckCircle2, AlertTriangle, Info, X, Menu, ChevronRight,
  ChevronLeft, Save, FileText, Eye, ShieldCheck, KeyRound,
  Lock, Unlock, Layers, ArrowUp, ArrowDown, Copy, ExternalLink,
  Cloud, CloudOff, LogIn, LogOut, UserCheck, Package, Building2
} from 'lucide-react';

// ============================================================================
// 1. SKEMA TIPE DATA RELASIONAL (15 TAHAP + SUPABASE CLOUD SYNC)
// ============================================================================

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  bucketName: string;
  autoSync: boolean;
}

export interface SupabaseAuthUser {
  id: string;
  email: string;
}

export interface MadrasahProfile {
  name: string;
  npsn: string;
  nsm: string;
  address: string;
  village: string;
  district: string;
  regency: string;
  province: string;
  postalCode: string;
  phone: string;
  email: string;
  headmaster: string;
  headmasterNip: string;
  logoDataUrl: string;
  kemenagLogoDataUrl: string;
  letterheadExtra: string;
}

export interface LetterheadSettings {
  fontFamily: 'serif' | 'sans';
  fontSizePt: number;
  logoPosition: 'left-right' | 'left-only';
  borderStyle: 'double' | 'solid' | 'thick-thin';
  marginMm: number;
}

export interface TeacherProfile {
  name: string;
  nip: string;
  nuptk: string;
  employmentStatus: string;
  rank: string;
  grade: string;
  position: string;
  subjectsTaught: string;
  teachingLoadJp: string;
  additionalDuties: string;
  photoDataUrl: string;
}

export interface AcademicYear {
  id: string;
  startYear: string;
  endYear: string;
  label: string;
  isActive: boolean;
}

export interface Semester {
  id: string;
  academicYearId: string;
  name: 'Ganjil' | 'Genap';
  isActive: boolean;
}

export interface ClassRoom {
  id: string;
  academicYearId: string;
  name: string;
  gradeLevel: string;
  homeroomTeacher: string;
}

export interface Student {
  id: string;
  classId: string;
  nis: string;
  nisn?: string;
  name: string;
  gender: 'L' | 'P';
  birthDate: string;
  address: string;
  parentName: string;
  parentPhone: string;
  notes: string;
  educationHistory?: string;
  supportingDocName?: string;
  supportingDocDataUrl?: string;
}

export interface Subject {
  id: string;
  classId: string;
  name: string;
  phase: 'A' | 'B' | 'C';
  timeAllocationJp: number;
  curriculum: string;
}

export interface CalendarSemesterConfig {
  id: string;
  academicYearId: string;
  semesterId: string;
  startDate: string;
  endDate: string;
  learningDaysPerWeek: 5 | 6;
  minEffectiveDaysPerWeek: number;
  madrasahEventIsEffective: boolean;
  specialEventIsEffective: boolean;
}

export interface CalendarEvent {
  id: string;
  academicYearId: string;
  semesterId: string;
  title: string;
  category: 'libur_nasional' | 'libur_madrasah' | 'kegiatan_madrasah' | 'kegiatan_khusus';
  startDate: string;
  endDate: string;
  reducesEffectiveDays: boolean;
  description: string;
}

export interface EffectiveWeekOverride {
  weekKey: string;
  isEffective: boolean;
  note: string;
}

export interface AtpItem {
  id: string;
  academicYearId: string;
  semesterId: string;
  subjectId: string;
  classId: string;
  phase: string;
  element: string;
  cp: string;
  tp: string;
  material: string;
  order: number;
  jp: number;
  dimensiProfilLulusan: string[];
  integrasiKBC: string[];
  notes: string;
}

export interface ProtaItem {
  id: string;
  academicYearId: string;
  subjectId: string;
  classId: string;
  atpId?: string;
  phase: string;
  cp: string;
  tp: string;
  material: string;
  jp: number;
  semesterNumber: 1 | 2;
  notes: string;
}

export interface ProsemItem {
  id: string;
  academicYearId: string;
  semesterId: string;
  subjectId: string;
  classId: string;
  atpId?: string;
  protaId?: string;
  tp: string;
  material: string;
  jp: number;
  weekAllocations: Record<string, number>;
  assessmentType: string;
  notes: string;
}

export interface KktpItem {
  id: string;
  academicYearId: string;
  semesterId: string;
  classId: string;
  subjectId: string;
  atpId: string;
  tpText: string;
  method: 'deskripsi_kriteria' | 'rubrik' | 'interval' | 'kustom';
  indicators: { id: string; text: string; reached: boolean }[];
  minReachedCount: number;
  rubricRows: { id: string; aspect: string; levels: string[]; passingLevelIndex: number }[];
  intervals: { id: string; min: number; max: number; predicate: string; isPassing: boolean }[];
  customScaleDescription: string;
  achievementDescription: string;
  assessmentMethod: string;
  followUpGeneral: string;
  remedialPlan: string;
  enrichmentPlan: string;
}

export interface LessonPlanModule {
  id: string;
  templateType: 'modul_ajar' | 'rpp_ringkas';
  academicYearId: string;
  semesterId: string;
  classId: string;
  subjectId: string;
  atpId?: string;
  kktpId?: string;
  phase: string;
  material: string;
  jp: number;
  meetingCount: number;
  cp: string;
  tp: string;
  kktpSummary: string;
  dimensiProfilLulusan: string[];
  deepLearningPrinciples: string[];
  deepLearningStages: { memahami: string; mengaplikasi: string; merefleksi: string };
  kbcValues: { value: string; integration: string }[];
  meaningfulUnderstanding: string;
  triggerQuestions: string;
  openingActivity: string;
  coreActivity: string;
  closingActivity: string;
  differentiation: string;
  initialAssessment: string;
  formativeAssessment: string;
  summativeAssessment: string;
  rubricText: string;
  remedialText: string;
  enrichmentText: string;
  media: string;
  learningResources: string;
  teacherReflection: string;
  studentReflection: string;
  isAiDraft: boolean;
}

export interface TeachingJournal {
  id: string;
  academicYearId: string;
  semesterId: string;
  date: string;
  dayName: string;
  period: string;
  classId: string;
  subjectId: string;
  lessonPlanId?: string;
  prosemId?: string;
  material: string;
  learningObjective: string;
  activities: string;
  notes: string;
  obstacles: string;
  followUp: string;
}

export interface AttendanceSession {
  id: string;
  academicYearId: string;
  semesterId: string;
  date: string;
  classId: string;
  subjectId: string;
  meetingNumber: number;
  records: Record<string, string>;
  notes: string;
}

export interface AssessmentTypeConfig {
  id: string;
  name: string;
  code: string;
}

export interface AssessmentRecord {
  id: string;
  academicYearId: string;
  semesterId: string;
  classId: string;
  subjectId: string;
  atpId?: string;
  kktpId?: string;
  title: string;
  assessmentTypeId: string;
  material: string;
  date: string;
  maxScore: number;
  weight: number;
  notes: string;
  entries: Record<string, { rawScore: number | null; notes: string }>;
}

export interface RemedialRecord {
  id: string;
  academicYearId: string;
  semesterId: string;
  classId: string;
  subjectId: string;
  studentId: string;
  assessmentId: string;
  tpText: string;
  material: string;
  originalScore: number;
  cause: string;
  method: string;
  scheduleDate: string;
  status: 'Direncanakan' | 'Terlaksana';
  remedialScore: number | null;
  followUp: string;
}

export interface EnrichmentRecord {
  id: string;
  academicYearId: string;
  semesterId: string;
  classId: string;
  subjectId: string;
  studentId: string;
  assessmentId: string;
  tpText: string;
  material: string;
  originalScore: number;
  activity: string;
  scheduleDate: string;
  status: 'Direncanakan' | 'Terlaksana';
  result: string;
  notes: string;
}

export interface BankQuestionItem {
  id: string;
  academicYearId: string;
  semesterId: string;
  classId: string;
  subjectId: string;
  atpId?: string;
  category: string;
  material: string;
  learningObjective: string;
  indicator: string;
  cognitiveLevel: 'L1' | 'L2' | 'L3';
  questionType:
    | 'Pilihan Ganda'
    | 'Pilihan Ganda Kompleks'
    | 'Benar-Salah'
    | 'Tepat-Tidak Tepat'
    | 'Menjodohkan'
    | 'Isian'
    | 'Uraian';
  questionNumber: number;
  score: number;
  questionText: string;
  options: string[];
  answerKey: string;
  scoringRubric: string;
  notes: string;
  isAiDraft?: boolean;
}

export interface TeachingMaterialItem {
  id: string;
  academicYearId: string;
  semesterId: string;
  classId: string;
  subjectId: string;
  atpId?: string;
  title: string;
  category: string;
  material: string;
  learningObjective: string;
  date: string;
  source: string;
  externalUrl: string;
  fileName: string;
  fileMimeType: string;
  fileSize: number;
  fileDataUrl: string;
  notes: string;
  isArchived: boolean;
}

export interface SkPembagianTugasRecord {
  id: string;
  academicYearId: string;
  semesterId: string;
  skNumber: string;
  skDate: string;
  skType: string;
  headmasterName: string;
  teacherName: string;
  mainDuty: string;
  subjectSummary: string;
  classSummary: string;
  totalJp: number;
  additionalDuties: string;
  notes: string;
  status: 'DRAF' | 'DITETAPKAN';
  fileName?: string;
  fileDataUrl?: string;
}

export interface TeachingScheduleSlot {
  id: string;
  academicYearId: string;
  semesterId: string;
  dayName: string;
  period: string;
  startTime: string;
  endTime: string;
  classId: string;
  subjectId: string;
  teacherName: string;
  room: string;
}

export interface InventoryItem {
  id: string;
  code: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  condition: 'Baik' | 'Rusak Ringan' | 'Rusak Berat';
  location: string;
  acquisitionDate: string;
  source: string;
  notes: string;
  linkedMaterialId?: string;
}

export interface SkpActivityRecord {
  id: string;
  academicYearId: string;
  semesterId: string;
  year: string;
  month: string;
  date: string;
  category: string;
  targetTitle: string;
  activityTitle: string;
  description: string;
  realization: string;
  evidenceTitle: string;
  evidenceFileName?: string;
  evidenceFileDataUrl?: string;
  status: 'DRAF' | 'TERVERIFIKASI';
  notes: string;
}

export interface PkbActivityRecord {
  id: string;
  year: string;
  activityName: string;
  category: string;
  date: string;
  organizer: string;
  duration: string;
  hours: number | null;
  outcome: string;
  description: string;
  certificateNumber: string;
  certificateFileName?: string;
  certificateFileDataUrl?: string;
  evidenceFileName?: string;
  evidenceFileDataUrl?: string;
  notes: string;
}

export interface SeatingChartConfig {
  classId: string;
  rows: number;
  cols: number;
  assignments: Record<string, string>;
}

export interface ClassOrgMember {
  id: string;
  classId: string;
  role: string;
  studentId: string;
  notes: string;
}

export interface GuidanceRecord {
  id: string;
  classId: string;
  studentId: string;
  date: string;
  recordType: string;
  developmentNote: string;
  issueNote: string;
  actionTaken: string;
  followUp: string;
  parentCommunication: string;
  teacherNote: string;
}

export interface StudentMutationRecord {
  id: string;
  classId: string;
  type: 'Masuk' | 'Keluar';
  studentName: string;
  nis: string;
  date: string;
  origin: string;
  destination: string;
  reason: string;
  docNumber: string;
  notes: string;
}

export interface ReportCardSummaryRecord {
  id: string;
  academicYearId: string;
  semesterId: string;
  classId: string;
  studentId: string;
  homeroomNote: string;
  achievements: string;
  followUp: string;
}

export interface ArchiveDocumentItem {
  id: string;
  academicYearId: string;
  semesterId: string;
  classId: string;
  subjectId: string;
  docGroup: string;
  title: string;
  date: string;
  fileName: string;
  fileMimeType: string;
  fileDataUrl: string;
  notes: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  module: string;
  action: string;
  detail: string;
}

export interface AppDatabase {
  schemaVersion: number;
  updatedAt: string;
  activeAcademicYearId: string;
  activeSemesterId: string;
  homeroomEnabled: boolean;
  homeroomClassId: string;
  guidancePin: string;
  letterhead: LetterheadSettings;
  madrasah: MadrasahProfile;
  teacher: TeacherProfile;
  academicYears: AcademicYear[];
  semesters: Semester[];
  classes: ClassRoom[];
  students: Student[];
  subjects: Subject[];
  calendarConfigs: CalendarSemesterConfig[];
  calendarEvents: CalendarEvent[];
  weekOverrides: EffectiveWeekOverride[];
  atpItems: AtpItem[];
  protaItems: ProtaItem[];
  prosemItems: ProsemItem[];
  kktpItems: KktpItem[];
  lessonPlans: LessonPlanModule[];
  teachingJournals: TeachingJournal[];
  attendanceSessions: AttendanceSession[];
  assessmentTypes: AssessmentTypeConfig[];
  useGradeWeighting: boolean;
  assessments: AssessmentRecord[];
  remedialRecords: RemedialRecord[];
  enrichmentRecords: EnrichmentRecord[];
  questionBank: BankQuestionItem[];
  teachingMaterials: TeachingMaterialItem[];
  skPembagianTugas: SkPembagianTugasRecord[];
  teachingSchedules: TeachingScheduleSlot[];
  inventoryItems: InventoryItem[];
  skpActivities: SkpActivityRecord[];
  pkbActivities: PkbActivityRecord[];
  seatingCharts: SeatingChartConfig[];
  classOrganizations: ClassOrgMember[];
  guidanceRecords: GuidanceRecord[];
  mutationRecords: StudentMutationRecord[];
  reportCardSummaries: ReportCardSummaryRecord[];
  archiveDocuments: ArchiveDocumentItem[];
  activityLogs: ActivityLog[];
}

// ============================================================================
// 2. KONSTANTA, UTILITAS SUPABASE REST/AUTH & EXCEL/CSV NATIVE
// ============================================================================

const LOCAL_DB_KEY = 'min4_magelang_db_v15_supabase';
const LOCAL_SB_CFG_KEY = 'min4_magelang_supabase_cfg_v1';
const LOCAL_SB_SESSION_KEY = 'min4_magelang_supabase_session_v1';

const DIMENSI_PROFIL_LULUSAN = [
  'Keimanan dan Ketakwaan terhadap Tuhan YME',
  'Kewargaan',
  'Penalaran Kritis',
  'Kreativitas',
  'Kolaborasi',
  'Kemandirian',
  'Kesehatan',
  'Komunikasi'
];

const PANCA_CINTA_KBC = [
  'Cinta kepada Allah dan Rasul',
  'Cinta diri dan sesama',
  'Cinta ilmu',
  'Cinta lingkungan',
  'Cinta tanah air'
];

const MATERIAL_CATEGORIES = [
  'Modul pembelajaran',
  'LKPD',
  'PPT',
  'Video',
  'Kuis',
  'Media digital',
  'Alat peraga',
  'PDF',
  'Word',
  'Gambar',
  'Link',
  'Bahan ajar lainnya'
];

const PKB_CATEGORIES = [
  'Diklat',
  'MOOC',
  'Pelatihan',
  'Webinar',
  'Seminar',
  'KKG',
  'MGMP',
  'Karya ilmiah',
  'PTK',
  'Media inovatif',
  'Publikasi',
  'Kegiatan profesional lainnya'
];

const ARCHIVE_GROUPS = [
  '1. Kalender pendidikan',
  '2. Analisis minggu efektif',
  '3. Prota',
  '4. Prosem',
  '5. ATP',
  '6. KKTP',
  '7. Modul Ajar',
  '8. RPP',
  '9. Jurnal',
  '10. Presensi',
  '11. Buku nilai',
  '12. Analisis penilaian',
  '13. Remedial',
  '14. Pengayaan',
  '15. Kisi-kisi',
  '16. Kartu soal',
  '17. Bank soal',
  '18. Bahan ajar',
  '19. LKPD',
  '20. Media',
  '21. SK pembagian tugas',
  '22. Jadwal',
  '23. Inventaris',
  '24. SKP',
  '25. Laporan kinerja',
  '26. PKB',
  '27. Buku induk',
  '28. Denah',
  '29. Struktur kelas',
  '30. Buku bimbingan',
  '31. Mutasi',
  '32. Rapor',
  '33. Dokumen lainnya'
];

const SUPABASE_SQL_SCHEMA = `-- Jalankan skrip ini di SQL Editor proyek Supabase Anda
create table if not exists public.min4_app_store (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.min4_app_store enable row level security;

drop policy if exists "Guru hanya akses data sendiri" on public.min4_app_store;
create policy "Guru hanya akses data sendiri"
  on public.min4_app_store
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Opsional: Bucket Storage untuk file lampiran besar
insert into storage.buckets (id, name, public)
values ('min4-berkas', 'min4-berkas', false)
on conflict (id) do nothing;`;

function uid(prefix = 'id'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function createEmptyDatabase(): AppDatabase {
  return {
    schemaVersion: 15,
    updatedAt: new Date().toISOString(),
    activeAcademicYearId: '',
    activeSemesterId: '',
    homeroomEnabled: true,
    homeroomClassId: '',
    guidancePin: '1234',
    letterhead: {
      fontFamily: 'serif',
      fontSizePt: 11,
      logoPosition: 'left-right',
      borderStyle: 'double',
      marginMm: 15
    },
    madrasah: {
      name: 'MIN 4 Magelang',
      npsn: '',
      nsm: '',
      address: '',
      village: '',
      district: '',
      regency: 'Kabupaten Magelang',
      province: 'Jawa Tengah',
      postalCode: '',
      phone: '',
      email: '',
      headmaster: '',
      headmasterNip: '',
      logoDataUrl: '',
      kemenagLogoDataUrl: '',
      letterheadExtra: 'KEMENTERIAN AGAMA REPUBLIK INDONESIA\nKANTOR KEMENTERIAN AGAMA KABUPATEN MAGELANG'
    },
    teacher: {
      name: '',
      nip: '',
      nuptk: '',
      employmentStatus: '',
      rank: '',
      grade: '',
      position: 'Guru Kelas / Guru Mata Pelajaran',
      subjectsTaught: '',
      teachingLoadJp: '',
      additionalDuties: '',
      photoDataUrl: ''
    },
    academicYears: [],
    semesters: [],
    classes: [],
    students: [],
    subjects: [],
    calendarConfigs: [],
    calendarEvents: [],
    weekOverrides: [],
    atpItems: [],
    protaItems: [],
    prosemItems: [],
    kktpItems: [],
    lessonPlans: [],
    teachingJournals: [],
    attendanceSessions: [],
    assessmentTypes: [
      { id: 'at_form', name: 'Asesmen Formatif', code: 'AF' },
      { id: 'at_tugas', name: 'Tugas', code: 'TGS' },
      { id: 'at_praktik', name: 'Praktik', code: 'PRK' },
      { id: 'at_proyek', name: 'Proyek', code: 'PRY' },
      { id: 'at_lm', name: 'Asesmen Lingkup Materi', code: 'ALM' },
      { id: 'at_sts', name: 'Sumatif Tengah Semester (STS)', code: 'STS' },
      { id: 'at_sas', name: 'Sumatif Akhir Semester (SAS)', code: 'SAS' }
    ],
    useGradeWeighting: false,
    assessments: [],
    remedialRecords: [],
    enrichmentRecords: [],
    questionBank: [],
    teachingMaterials: [],
    skPembagianTugas: [],
    teachingSchedules: [],
    inventoryItems: [],
    skpActivities: [],
    pkbActivities: [],
    seatingCharts: [],
    classOrganizations: [],
    guidanceRecords: [],
    mutationRecords: [],
    reportCardSummaries: [],
    archiveDocuments: [],
    activityLogs: []
  };
}

function migrateDatabase(raw: unknown): AppDatabase {
  const base = createEmptyDatabase();
  if (!raw || typeof raw !== 'object') return base;
  const obj = raw as Partial<AppDatabase>;
  return {
    ...base,
    ...obj,
    letterhead: { ...base.letterhead, ...(obj.letterhead || {}) },
    madrasah: { ...base.madrasah, ...(obj.madrasah || {}) },
    teacher: { ...base.teacher, ...(obj.teacher || {}) },
    academicYears: Array.isArray(obj.academicYears) ? obj.academicYears : [],
    semesters: Array.isArray(obj.semesters) ? obj.semesters : [],
    classes: Array.isArray(obj.classes) ? obj.classes : [],
    students: Array.isArray(obj.students) ? obj.students : [],
    subjects: Array.isArray(obj.subjects) ? obj.subjects : [],
    calendarConfigs: Array.isArray(obj.calendarConfigs) ? obj.calendarConfigs : [],
    calendarEvents: Array.isArray(obj.calendarEvents) ? obj.calendarEvents : [],
    weekOverrides: Array.isArray(obj.weekOverrides) ? obj.weekOverrides : [],
    atpItems: Array.isArray(obj.atpItems) ? obj.atpItems : [],
    protaItems: Array.isArray(obj.protaItems) ? obj.protaItems : [],
    prosemItems: Array.isArray(obj.prosemItems) ? obj.prosemItems : [],
    kktpItems: Array.isArray(obj.kktpItems) ? obj.kktpItems : [],
    lessonPlans: Array.isArray(obj.lessonPlans) ? obj.lessonPlans : [],
    teachingJournals: Array.isArray(obj.teachingJournals) ? obj.teachingJournals : [],
    attendanceSessions: Array.isArray(obj.attendanceSessions) ? obj.attendanceSessions : [],
    assessmentTypes: Array.isArray(obj.assessmentTypes) && obj.assessmentTypes.length > 0 ? obj.assessmentTypes : base.assessmentTypes,
    assessments: Array.isArray(obj.assessments) ? obj.assessments : [],
    remedialRecords: Array.isArray(obj.remedialRecords) ? obj.remedialRecords : [],
    enrichmentRecords: Array.isArray(obj.enrichmentRecords) ? obj.enrichmentRecords : [],
    questionBank: Array.isArray(obj.questionBank) ? obj.questionBank : [],
    teachingMaterials: Array.isArray(obj.teachingMaterials) ? obj.teachingMaterials : [],
    skPembagianTugas: Array.isArray(obj.skPembagianTugas) ? obj.skPembagianTugas : [],
    teachingSchedules: Array.isArray(obj.teachingSchedules) ? obj.teachingSchedules : [],
    inventoryItems: Array.isArray(obj.inventoryItems) ? obj.inventoryItems : [],
    skpActivities: Array.isArray(obj.skpActivities) ? obj.skpActivities : [],
    pkbActivities: Array.isArray(obj.pkbActivities) ? obj.pkbActivities : [],
    seatingCharts: Array.isArray(obj.seatingCharts) ? obj.seatingCharts : [],
    classOrganizations: Array.isArray(obj.classOrganizations) ? obj.classOrganizations : [],
    guidanceRecords: Array.isArray(obj.guidanceRecords) ? obj.guidanceRecords : [],
    mutationRecords: Array.isArray(obj.mutationRecords) ? obj.mutationRecords : [],
    reportCardSummaries: Array.isArray(obj.reportCardSummaries) ? obj.reportCardSummaries : [],
    archiveDocuments: Array.isArray(obj.archiveDocuments) ? obj.archiveDocuments : [],
    activityLogs: Array.isArray(obj.activityLogs) ? obj.activityLogs : []
  };
}

// ============================================================================
// 3. EKSPOR & IMPOR EXCEL (XML SPREADSHEETML & CSV TANPA BUNDLER EKSTERNAL)
// ============================================================================

function escapeXml(val: unknown): string {
  return String(val ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function downloadExcelXml(filename: string, sheetName: string, rows: Record<string, unknown>[]) {
  const safeName = filename.endsWith('.xls') || filename.endsWith('.xlsx') ? filename.replace(/\.xlsx$/i, '.xls') : `${filename}.xls`;
  const headers = rows.length > 0 ? Object.keys(rows[0]) : ['Keterangan'];
  const effectiveRows = rows.length > 0 ? rows : [{ Keterangan: 'Belum ada data' }];

  const headerCells = headers
    .map((h) => `<Cell ss:StyleID="sHeader"><Data ss:Type="String">${escapeXml(h)}</Data></Cell>`)
    .join('');

  const dataRowsXml = effectiveRows
    .map((row) => {
      const cells = headers
        .map((h) => {
          const raw = row[h];
          const isNum = typeof raw === 'number' && !Number.isNaN(raw);
          return `<Cell><Data ss:Type="${isNum ? 'Number' : 'String'}">${escapeXml(raw ?? '')}</Data></Cell>`;
        })
        .join('');
      return `<Row>${cells}</Row>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="sHeader">
   <Font ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#065F46" ss:Pattern="Solid"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="${escapeXml(sheetName.slice(0, 30) || 'Data')}">
  <Table>
   <Row>${headerCells}</Row>
   ${dataRowsXml}
  </Table>
 </Worksheet>
</Workbook>`;

  const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = safeName;
  a.click();
  URL.revokeObjectURL(url);
}

function parseDelimitedText(text: string): Record<string, string>[] {
  const lines = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];
  const delimiter = lines[0].includes(';') && !lines[0].includes(',') ? ';' : lines[0].includes('\t') ? '\t' : ',';
  const splitLine = (line: string) => {
    const out: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === delimiter && !inQuotes) {
        out.push(cur.trim());
        cur = '';
      } else {
        cur += ch;
      }
    }
    out.push(cur.trim());
    return out;
  };
  const headers = splitLine(lines[0]);
  return lines.slice(1).map((line) => {
    const cols = splitLine(line);
    const rec: Record<string, string> = {};
    headers.forEach((h, idx) => {
      rec[h] = cols[idx] ?? '';
    });
    return rec;
  });
}

function downloadWordDoc(filename: string, htmlBody: string) {
  const safeName = filename.endsWith('.doc') ? filename : `${filename}.doc`;
  const docHtml = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head><meta charset='utf-8'><title>${escapeXml(filename)}</title>
<style>
  body { font-family: 'Times New Roman', serif; font-size: 11pt; color: #111; }
  table { border-collapse: collapse; width: 100%; margin-top: 8px; }
  th, td { border: 1px solid #333; padding: 5px 7px; vertical-align: top; }
  th { background-color: #ecfdf5; font-weight: bold; }
</style>
</head><body>${htmlBody}</body></html>`;
  const blob = new Blob(['\ufeff', docHtml], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = safeName;
  a.click();
  URL.revokeObjectURL(url);
}

// ============================================================================
// 4. GENERATOR KOP & DOKUMEN TERPUSAT MIN 4 MAGELANG
// ============================================================================

function buildKopHtml(db: AppDatabase): string {
  const m = db.madrasah;
  const lh = db.letterhead;
  const fontCss = lh.fontFamily === 'serif' ? "'Times New Roman', Times, serif" : "Arial, Helvetica, sans-serif";
  const borderCss =
    lh.borderStyle === 'double'
      ? '3px double #111827'
      : lh.borderStyle === 'thick-thin'
      ? '3px solid #111827'
      : '1.5px solid #111827';

  const leftLogo = m.kemenagLogoDataUrl
    ? `<img src="${m.kemenagLogoDataUrl}" style="width:68px;height:68px;object-fit:contain;" />`
    : `<div style="width:64px;height:64px;border:1px dashed #9ca3af;font-size:9px;display:flex;align-items:center;justify-content:center;color:#6b7280;text-align:center;">Logo<br/>Kemenag</div>`;

  const rightLogo =
    lh.logoPosition === 'left-right'
      ? m.logoDataUrl
        ? `<img src="${m.logoDataUrl}" style="width:68px;height:68px;object-fit:contain;" />`
        : `<div style="width:64px;height:64px;border:1px dashed #9ca3af;font-size:9px;display:flex;align-items:center;justify-content:center;color:#6b7280;text-align:center;">Logo<br/>Madrasah</div>`
      : '';

  const extraLines = (m.letterheadExtra || '')
    .split('\n')
    .filter(Boolean)
    .map((line) => `<div style="font-weight:700;font-size:${lh.fontSizePt + 1}pt;line-height:1.25;">${escapeXml(line)}</div>`)
    .join('');

  const addressParts = [
    m.address,
    m.village ? `Desa/Kel. ${m.village}` : '',
    m.district ? `Kec. ${m.district}` : '',
    m.regency,
    m.province,
    m.postalCode
  ].filter(Boolean);

  return `
    <div style="font-family:${fontCss};border-bottom:${borderCss};padding-bottom:10px;margin-bottom:14px;">
      <table style="width:100%;border:none;margin:0;">
        <tr>
          <td style="border:none;width:80px;text-align:center;vertical-align:middle;">${leftLogo}</td>
          <td style="border:none;text-align:center;vertical-align:middle;">
            ${extraLines}
            <div style="font-weight:800;font-size:${lh.fontSizePt + 4}pt;letter-spacing:0.4px;margin-top:2px;">
              ${escapeXml((m.name || 'MIN 4 MAGELANG').toUpperCase())}
            </div>
            <div style="font-size:${Math.max(8, lh.fontSizePt - 2)}pt;color:#374151;margin-top:2px;">
              ${escapeXml(addressParts.join(', ') || 'Alamat madrasah belum dilengkapi pada Profil Madrasah')}
            </div>
            <div style="font-size:${Math.max(8, lh.fontSizePt - 2)}pt;color:#374151;">
              ${[
                m.npsn ? `NPSN: ${m.npsn}` : '',
                m.nsm ? `NSM: ${m.nsm}` : '',
                m.phone ? `Telp: ${m.phone}` : '',
                m.email ? `Email: ${m.email}` : ''
              ]
                .filter(Boolean)
                .map(escapeXml)
                .join(' • ')}
            </div>
          </td>
          ${lh.logoPosition === 'left-right' ? `<td style="border:none;width:80px;text-align:center;vertical-align:middle;">${rightLogo}</td>` : ''}
        </tr>
      </table>
    </div>
  `;
}

function buildSignatureBlockHtml(db: AppDatabase, customDate?: string): string {
  const m = db.madrasah;
  const t = db.teacher;
  const dateText = customDate || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  return `
    <table style="width:100%;border:none;margin-top:24px;page-break-inside:avoid;">
      <tr>
        <td style="border:none;width:50%;vertical-align:top;padding:4px 12px;">
          <div>Mengetahui,</div>
          <div>Kepala Madrasah</div>
          <div style="height:58px;"></div>
          <div style="font-weight:bold;text-decoration:underline;">${escapeXml(m.headmaster || '........................................')}</div>
          <div>NIP. ${escapeXml(m.headmasterNip || '........................................')}</div>
        </td>
        <td style="border:none;width:50%;vertical-align:top;padding:4px 12px;">
          <div>${escapeXml(m.regency || 'Magelang')}, ${escapeXml(dateText)}</div>
          <div>Guru Kelas / Mata Pelajaran</div>
          <div style="height:58px;"></div>
          <div style="font-weight:bold;text-decoration:underline;">${escapeXml(t.name || '........................................')}</div>
          <div>NIP. ${escapeXml(t.nip || '........................................')}</div>
        </td>
      </tr>
    </table>
  `;
}

// ============================================================================
// 5. KOMPONEN DASHBOARD FINAL
// ============================================================================

interface DashboardViewProps {
  db: AppDatabase;
  activeYear: AcademicYear | null;
  activeSemester: Semester | null;
  sbSyncStatus: 'local' | 'connecting' | 'connected' | 'syncing' | 'error';
  sbUser: SupabaseAuthUser | null;
  onNavigate: (id: string) => void;
}

function DashboardView({
  db,
  activeYear,
  activeSemester,
  sbSyncStatus,
  sbUser,
  onNavigate
}: DashboardViewProps) {
  const activeClasses = db.classes.filter((c) => !db.activeAcademicYearId || c.academicYearId === db.activeAcademicYearId);
  const activeStudents = db.students.filter((s) => activeClasses.some((c) => c.id === s.classId));
  const activeSubjects = db.subjects.filter((sub) => activeClasses.some((c) => c.id === sub.classId));
  const activeJournals = db.teachingJournals.filter(
    (j) =>
      (!db.activeAcademicYearId || j.academicYearId === db.activeAcademicYearId) &&
      (!db.activeSemesterId || j.semesterId === db.activeSemesterId)
  );
  const activeAssessments = db.assessments.filter(
    (a) =>
      (!db.activeAcademicYearId || a.academicYearId === db.activeAcademicYearId) &&
      (!db.activeSemesterId || a.semesterId === db.activeSemesterId)
  );

  const totalDocs =
    db.atpItems.length +
    db.protaItems.length +
    db.prosemItems.length +
    db.kktpItems.length +
    db.lessonPlans.length +
    db.questionBank.length +
    db.teachingMaterials.length +
    db.skPembagianTugas.length +
    db.pkbActivities.length +
    db.archiveDocuments.length;

  const readinessChecks = [
    { label: 'Profil Madrasah & Kop', done: Boolean(db.madrasah.name && db.madrasah.headmaster) },
    { label: 'Profil Guru', done: Boolean(db.teacher.name) },
    { label: 'Tahun Pelajaran & Semester Aktif', done: Boolean(activeYear && activeSemester) },
    { label: 'Data Kelas, Siswa & Mapel', done: activeClasses.length > 0 && activeStudents.length > 0 && activeSubjects.length > 0 },
    { label: 'Kalender Pendidikan Semester', done: db.calendarConfigs.length > 0 },
    { label: 'Perencanaan (ATP/Prota/Prosem/KKTP/Modul)', done: db.atpItems.length > 0 || db.lessonPlans.length > 0 },
    { label: 'Pelaksanaan (Jurnal & Presensi)', done: activeJournals.length > 0 || db.attendanceSessions.length > 0 },
    { label: 'Asesmen & Buku Nilai', done: activeAssessments.length > 0 }
  ];
  const completedCount = readinessChecks.filter((c) => c.done).length;
  const readinessPct = Math.round((completedCount / readinessChecks.length) * 100);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-900 to-emerald-700 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-white/15 text-emerald-100 text-xs font-semibold mb-2">
            Sistem Administrasi Guru Terintegrasi • 15 Modul
          </span>
          <h2 className="text-xl md:text-2xl font-bold">
            Selamat Datang{db.teacher.name ? `, ${db.teacher.name}` : ''}
          </h2>
          <p className="text-sm text-emerald-100 mt-1">
            {db.madrasah.name || 'MIN 4 Magelang'} • {activeYear ? activeYear.label : 'Tahun Pelajaran Belum Diatur'} (
            {activeSemester ? activeSemester.name : 'Semester Belum Diatur'})
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 min-w-[210px]">
          <div className="text-xs text-emerald-200">Kelengkapan Administrasi</div>
          <div className="text-2xl font-extrabold mt-0.5">{readinessPct}%</div>
          <div className="w-full bg-emerald-950/50 rounded-full h-2 mt-2">
            <div className="bg-emerald-300 h-2 rounded-full transition-all" style={{ width: `${readinessPct}%` }} />
          </div>
          <div className="text-[11px] text-emerald-100 mt-1.5">
            {completedCount} dari {readinessChecks.length} komponen terisi
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Jumlah Kelas</div>
          <div className="text-2xl font-bold text-emerald-900 mt-1">{activeClasses.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Rombongan belajar aktif</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Jumlah Siswa</div>
          <div className="text-2xl font-bold text-emerald-900 mt-1">{activeStudents.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Terdaftar pada kelas aktif</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Mata Pelajaran</div>
          <div className="text-2xl font-bold text-emerald-900 mt-1">{activeSubjects.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Mapel diampu periode aktif</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Total Dokumen & Perangkat</div>
          <div className="text-2xl font-bold text-emerald-900 mt-1">{totalDocs}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            {activeJournals.length} jurnal • {activeAssessments.length} asesmen
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Akses Cepat Modul Utama</h3>
            <span className="text-xs text-slate-500">
              Status Cloud: {sbSyncStatus === 'connected' ? `Terhubung (${sbUser?.email})` : 'Penyimpanan Lokal'}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { id: 'master', title: 'Data Master', desc: 'Profil, Kelas, Siswa, Mapel' },
              { id: 'kalender', title: 'Kalender Pendidikan', desc: 'Hari Libur & Minggu Efektif' },
              { id: 'perencanaan', title: 'Perencanaan', desc: 'ATP, Prota, Prosem, KKTP, Modul' },
              { id: 'pelaksanaan', title: 'Jurnal & Presensi', desc: 'Catatan KBM & Kehadiran' },
              { id: 'asesmen', title: 'Buku Nilai', desc: 'Input Skor & Rekap Asesmen' },
              { id: 'pengaturan', title: 'Koneksi Supabase', desc: 'Sync Cloud & Backup Data' }
            ].map((card) => (
              <button
                key={card.id}
                onClick={() => onNavigate(card.id)}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-left transition"
              >
                <div className="font-bold text-xs text-emerald-900">{card.title}</div>
                <div className="text-[11px] text-slate-500 mt-1">{card.desc}</div>
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100">
            <h4 className="font-semibold text-xs text-slate-700 mb-2">Pengingat Kelengkapan Administrasi</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {readinessChecks.map((item, idx) => (
                <div
                  key={idx}
                  className={`px-3 py-2 rounded-lg text-xs flex items-center justify-between ${
                    item.done ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
                  }`}
                >
                  <span>{item.label}</span>
                  <span className="font-bold">{item.done ? 'Tersedia' : 'Belum Diisi'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="font-bold text-slate-900 text-sm mb-3">Aktivitas Terakhir</h3>
          {db.activityLogs.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-center p-6 border border-dashed border-slate-200 rounded-xl text-xs text-slate-400">
              Belum ada aktivitas tercatat. Mulai dengan melengkapi Data Master.
            </div>
          ) : (
            <div className="space-y-2.5 overflow-y-auto max-h-80 pr-1">
              {db.activityLogs.slice(0, 10).map((log) => (
                <div key={log.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <div className="font-semibold text-slate-800">{log.action}</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">{log.detail}</div>
                  <div className="text-slate-400 text-[10px] mt-1">{log.timestamp}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 6. KOMPONEN DATA MASTER (7 TAB)
// ============================================================================

interface DataMasterViewProps {
  db: AppDatabase;
  setDb: React.Dispatch<React.SetStateAction<AppDatabase>>;
  notify: (type: 'success' | 'error' | 'warning' | 'info', text: string) => void;
  askConfirm: (title: string, message: string, onConfirm: () => void) => void;
  exportToExcel: (filename: string, sheetName: string, rows: Record<string, unknown>[]) => void;
}

function DataMasterView({ db, setDb, notify, askConfirm, exportToExcel }: DataMasterViewProps) {
  const [tab, setTab] = useState<'madrasah' | 'guru' | 'kelas' | 'siswa' | 'mapel' | 'tahun' | 'semester'>('madrasah');
  const [madrasahForm, setMadrasahForm] = useState<MadrasahProfile>(db.madrasah);
  const [teacherForm, setTeacherForm] = useState<TeacherProfile>(db.teacher);

  const [yearStart, setYearStart] = useState('');
  const [yearEnd, setYearEnd] = useState('');
  const [editingYearId, setEditingYearId] = useState<string | null>(null);

  const [semYearId, setSemYearId] = useState(db.activeAcademicYearId || '');
  const [semName, setSemName] = useState<'Ganjil' | 'Genap'>('Ganjil');

  const [className, setClassName] = useState('');
  const [classGrade, setClassGrade] = useState('1');
  const [classYearId, setClassYearId] = useState(db.activeAcademicYearId || '');
  const [classHomeroom, setClassHomeroom] = useState('');
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [classSearch, setClassSearch] = useState('');

  const [studentForm, setStudentForm] = useState({
    nis: '',
    name: '',
    classId: '',
    gender: 'L' as 'L' | 'P',
    birthDate: '',
    address: '',
    parentName: '',
    parentPhone: '',
    notes: ''
  });
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [studentSearch, setStudentSearch] = useState('');
  const [studentFilterClass, setStudentFilterClass] = useState('');

  const [subjectForm, setSubjectForm] = useState({
    name: '',
    classId: '',
    phase: 'A' as 'A' | 'B' | 'C',
    timeAllocationJp: 4,
    curriculum: 'Kurikulum Merdeka (KMA 450/2024)'
  });
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [subjectSearch, setSubjectSearch] = useState('');

  useEffect(() => {
    setMadrasahForm(db.madrasah);
    setTeacherForm(db.teacher);
    if (!classYearId && db.activeAcademicYearId) setClassYearId(db.activeAcademicYearId);
    if (!semYearId && db.activeAcademicYearId) setSemYearId(db.activeAcademicYearId);
  }, [db.madrasah, db.teacher, db.activeAcademicYearId, classYearId, semYearId]);

  const handleImageUpload = (file: File | undefined, cb: (dataUrl: string) => void) => {
    if (!file) return;
    if (file.size > 1.5 * 1024 * 1024) {
      notify('warning', 'Ukuran gambar maksimal 1.5 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => cb(String(reader.result || ''));
    reader.readAsDataURL(file);
  };

  const saveYear = () => {
    if (!yearStart.trim() || !yearEnd.trim()) {
      notify('error', 'Tahun awal dan tahun akhir wajib diisi.');
      return;
    }
    const label = `${yearStart.trim()}/${yearEnd.trim()}`;
    if (editingYearId) {
      setDb((prev) => ({
        ...prev,
        academicYears: prev.academicYears.map((y) =>
          y.id === editingYearId ? { ...y, startYear: yearStart.trim(), endYear: yearEnd.trim(), label } : y
        )
      }));
      setEditingYearId(null);
      notify('success', 'Tahun pelajaran diperbarui.');
    } else {
      const id = uid('ay');
      const isFirst = db.academicYears.length === 0;
      setDb((prev) => ({
        ...prev,
        activeAcademicYearId: isFirst ? id : prev.activeAcademicYearId,
        academicYears: [
          ...prev.academicYears,
          { id, startYear: yearStart.trim(), endYear: yearEnd.trim(), label, isActive: isFirst }
        ]
      }));
      notify('success', 'Tahun pelajaran ditambahkan.');
    }
    setYearStart('');
    setYearEnd('');
  };

  const activateYear = (id: string) => {
    setDb((prev) => ({
      ...prev,
      activeAcademicYearId: id,
      academicYears: prev.academicYears.map((y) => ({ ...y, isActive: y.id === id }))
    }));
    notify('success', 'Tahun pelajaran aktif diubah.');
  };

  const saveSemester = () => {
    const targetYear = semYearId || db.activeAcademicYearId;
    if (!targetYear) {
      notify('error', 'Pilih atau buat Tahun Pelajaran terlebih dahulu.');
      return;
    }
    const exists = db.semesters.some((s) => s.academicYearId === targetYear && s.name === semName);
    if (exists) {
      notify('warning', `Semester ${semName} sudah terdaftar pada tahun pelajaran tersebut.`);
      return;
    }
    const id = uid('sem');
    const isFirst = db.semesters.length === 0;
    setDb((prev) => ({
      ...prev,
      activeSemesterId: isFirst ? id : prev.activeSemesterId,
      semesters: [...prev.semesters, { id, academicYearId: targetYear, name: semName, isActive: isFirst }]
    }));
    notify('success', `Semester ${semName} ditambahkan.`);
  };

  const saveClass = () => {
    if (!className.trim()) {
      notify('error', 'Nama kelas wajib diisi.');
      return;
    }
    const yearId = classYearId || db.activeAcademicYearId;
    if (!yearId) {
      notify('error', 'Pilih Tahun Pelajaran terlebih dahulu.');
      return;
    }
    if (editingClassId) {
      setDb((prev) => ({
        ...prev,
        classes: prev.classes.map((c) =>
          c.id === editingClassId
            ? { ...c, name: className.trim(), gradeLevel: classGrade, academicYearId: yearId, homeroomTeacher: classHomeroom.trim() }
            : c
        )
      }));
      setEditingClassId(null);
      notify('success', 'Data kelas diperbarui.');
    } else {
      const id = uid('cls');
      setDb((prev) => ({
        ...prev,
        homeroomClassId: prev.homeroomClassId || id,
        classes: [
          ...prev.classes,
          { id, academicYearId: yearId, name: className.trim(), gradeLevel: classGrade, homeroomTeacher: classHomeroom.trim() }
        ]
      }));
      notify('success', 'Kelas baru ditambahkan.');
    }
    setClassName('');
    setClassHomeroom('');
  };

  const saveStudent = () => {
    if (!studentForm.nis.trim() || !studentForm.name.trim() || !studentForm.classId) {
      notify('error', 'Nomor Induk, Nama Siswa, dan Kelas wajib diisi.');
      return;
    }
    if (editingStudentId) {
      setDb((prev) => ({
        ...prev,
        students: prev.students.map((s) => (s.id === editingStudentId ? { ...s, ...studentForm } : s))
      }));
      setEditingStudentId(null);
      notify('success', 'Data siswa diperbarui.');
    } else {
      setDb((prev) => ({
        ...prev,
        students: [...prev.students, { id: uid('std'), ...studentForm }]
      }));
      notify('success', 'Siswa baru berhasil ditambahkan.');
    }
    setStudentForm({
      nis: '',
      name: '',
      classId: studentForm.classId,
      gender: 'L',
      birthDate: '',
      address: '',
      parentName: '',
      parentPhone: '',
      notes: ''
    });
  };

  const handleImportStudentsCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const rows = parseDelimitedText(String(reader.result || ''));
      if (rows.length === 0) {
        notify('error', 'File kosong atau format kolom tidak terbaca. Gunakan CSV dengan header: NIS, Nama, Kelas, JK.');
        return;
      }
      let added = 0;
      const newStudents: Student[] = [];
      rows.forEach((r) => {
        const nis = r['NIS'] || r['Nomor Induk'] || r['nis'] || '';
        const name = r['Nama'] || r['Nama Siswa'] || r['name'] || '';
        const clsName = r['Kelas'] || r['kelas'] || '';
        const matchedClass =
          db.classes.find((c) => c.name.toLowerCase() === clsName.toLowerCase()) ||
          db.classes.find((c) => c.id === studentFilterClass) ||
          db.classes[0];
        if (nis && name && matchedClass) {
          const rawJk = (r['JK'] || r['Jenis Kelamin'] || 'L').toUpperCase();
          newStudents.push({
            id: uid('std'),
            classId: matchedClass.id,
            nis,
            name,
            gender: rawJk.startsWith('P') ? 'P' : 'L',
            birthDate: r['Tanggal Lahir'] || '',
            address: r['Alamat'] || '',
            parentName: r['Nama Orang Tua'] || r['Orang Tua'] || '',
            parentPhone: r['Kontak'] || r['No HP'] || '',
            notes: r['Keterangan'] || ''
          });
          added++;
        }
      });
      if (added > 0) {
        setDb((prev) => ({ ...prev, students: [...prev.students, ...newStudents] }));
        notify('success', `Berhasil mengimpor ${added} data siswa.`);
      } else {
        notify('warning', 'Tidak ada baris valid yang diimpor. Pastikan Data Kelas sudah tersedia.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const saveSubject = () => {
    if (!subjectForm.name.trim() || !subjectForm.classId) {
      notify('error', 'Nama Mata Pelajaran dan Kelas wajib diisi.');
      return;
    }
    if (editingSubjectId) {
      setDb((prev) => ({
        ...prev,
        subjects: prev.subjects.map((sub) => (sub.id === editingSubjectId ? { ...sub, ...subjectForm } : sub))
      }));
      setEditingSubjectId(null);
      notify('success', 'Mata pelajaran diperbarui.');
    } else {
      setDb((prev) => ({
        ...prev,
        subjects: [...prev.subjects, { id: uid('sub'), ...subjectForm }]
      }));
      notify('success', 'Mata pelajaran ditambahkan.');
    }
    setSubjectForm({ ...subjectForm, name: '' });
  };

  const filteredClasses = db.classes.filter((c) => c.name.toLowerCase().includes(classSearch.toLowerCase()));
  const filteredStudents = db.students.filter((s) => {
    const matchText = s.name.toLowerCase().includes(studentSearch.toLowerCase()) || s.nis.toLowerCase().includes(studentSearch.toLowerCase());
    const matchClass = !studentFilterClass || s.classId === studentFilterClass;
    return matchText && matchClass;
  });
  const filteredSubjects = db.subjects.filter((sub) => sub.name.toLowerCase().includes(subjectSearch.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
        {[
          { id: 'madrasah', label: 'A. Profil Madrasah' },
          { id: 'guru', label: 'B. Profil Guru' },
          { id: 'tahun', label: 'F. Tahun Pelajaran' },
          { id: 'semester', label: 'G. Semester' },
          { id: 'kelas', label: 'C. Data Kelas' },
          { id: 'siswa', label: 'D. Data Siswa' },
          { id: 'mapel', label: 'E. Mata Pelajaran' }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as typeof tab)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
              tab === t.id ? 'bg-emerald-800 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'madrasah' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <h3 className="font-bold text-slate-900">Profil Madrasah & Identitas Kop</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Nama Madrasah *</label>
              <input
                value={madrasahForm.name}
                onChange={(e) => setMadrasahForm({ ...madrasahForm, name: e.target.value })}
                className="w-full border border-slate-300 rounded-xl px-3 py-2"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">NPSN</label>
              <input
                value={madrasahForm.npsn}
                onChange={(e) => setMadrasahForm({ ...madrasahForm, npsn: e.target.value })}
                className="w-full border border-slate-300 rounded-xl px-3 py-2"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">NSM</label>
              <input
                value={madrasahForm.nsm}
                onChange={(e) => setMadrasahForm({ ...madrasahForm, nsm: e.target.value })}
                className="w-full border border-slate-300 rounded-xl px-3 py-2"
              />
            </div>
            <div className="md:col-span-2">
              <label className="font-semibold text-slate-700 block mb-1">Alamat Jalan / Dusun</label>
              <input
                value={madrasahForm.address}
                onChange={(e) => setMadrasahForm({ ...madrasahForm, address: e.target.value })}
                className="w-full border border-slate-300 rounded-xl px-3 py-2"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Desa / Kelurahan</label>
              <input
                value={madrasahForm.village}
                onChange={(e) => setMadrasahForm({ ...madrasahForm, village: e.target.value })}
                className="w-full border border-slate-300 rounded-xl px-3 py-2"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Kecamatan</label>
              <input
                value={madrasahForm.district}
                onChange={(e) => setMadrasahForm({ ...madrasahForm, district: e.target.value })}
                className="w-full border border-slate-300 rounded-xl px-3 py-2"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Kabupaten / Kota</label>
              <input
                value={madrasahForm.regency}
                onChange={(e) => setMadrasahForm({ ...madrasahForm, regency: e.target.value })}
                className="w-full border border-slate-300 rounded-xl px-3 py-2"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Provinsi & Kode Pos</label>
              <div className="flex gap-2">
                <input
                  value={madrasahForm.province}
                  onChange={(e) => setMadrasahForm({ ...madrasahForm, province: e.target.value })}
                  placeholder="Provinsi"
                  className="w-2/3 border border-slate-300 rounded-xl px-3 py-2"
                />
                <input
                  value={madrasahForm.postalCode}
                  onChange={(e) => setMadrasahForm({ ...madrasahForm, postalCode: e.target.value })}
                  placeholder="Kode Pos"
                  className="w-1/3 border border-slate-300 rounded-xl px-3 py-2"
                />
              </div>
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Telepon</label>
              <input
                value={madrasahForm.phone}
                onChange={(e) => setMadrasahForm({ ...madrasahForm, phone: e.target.value })}
                className="w-full border border-slate-300 rounded-xl px-3 py-2"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Email Madrasah</label>
              <input
                value={madrasahForm.email}
                onChange={(e) => setMadrasahForm({ ...madrasahForm, email: e.target.value })}
                className="w-full border border-slate-300 rounded-xl px-3 py-2"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Nama Kepala Madrasah</label>
              <input
                value={madrasahForm.headmaster}
                onChange={(e) => setMadrasahForm({ ...madrasahForm, headmaster: e.target.value })}
                className="w-full border border-slate-300 rounded-xl px-3 py-2"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">NIP Kepala Madrasah (jika tersedia)</label>
              <input
                value={madrasahForm.headmasterNip}
                onChange={(e) => setMadrasahForm({ ...madrasahForm, headmasterNip: e.target.value })}
                className="w-full border border-slate-300 rounded-xl px-3 py-2"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Unggah Logo Kementerian Agama</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  handleImageUpload(e.target.files?.[0], (url) => setMadrasahForm({ ...madrasahForm, kemenagLogoDataUrl: url }))
                }
                className="w-full border border-slate-300 rounded-xl px-2 py-1.5"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Unggah Logo Madrasah</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  handleImageUpload(e.target.files?.[0], (url) => setMadrasahForm({ ...madrasahForm, logoDataUrl: url }))
                }
                className="w-full border border-slate-300 rounded-xl px-2 py-1.5"
              />
            </div>
            <div className="md:col-span-3">
              <label className="font-semibold text-slate-700 block mb-1">Baris Instansi Kop Surat</label>
              <textarea
                rows={2}
                value={madrasahForm.letterheadExtra}
                onChange={(e) => setMadrasahForm({ ...madrasahForm, letterheadExtra: e.target.value })}
                className="w-full border border-slate-300 rounded-xl px-3 py-2"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => {
                setDb((prev) => ({ ...prev, madrasah: madrasahForm }));
                notify('success', 'Profil Madrasah & Kop Surat berhasil disimpan.');
              }}
              className="px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Simpan Profil Madrasah
            </button>
          </div>
        </div>
      )}

      {tab === 'guru' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <h3 className="font-bold text-slate-900">Profil Guru (Semua Field Dapat Kosong Jika Belum Tersedia)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {[
              { key: 'name', label: 'Nama Lengkap & Gelar' },
              { key: 'nip', label: 'NIP' },
              { key: 'nuptk', label: 'NUPTK' },
              { key: 'employmentStatus', label: 'Status Kepegawaian (PNS/PPPK/GTY/GTT)' },
              { key: 'rank', label: 'Pangkat' },
              { key: 'grade', label: 'Golongan' },
              { key: 'position', label: 'Jabatan' },
              { key: 'subjectsTaught', label: 'Mata Pelajaran Diampu' },
              { key: 'teachingLoadJp', label: 'Beban Mengajar (JP)' },
              { key: 'additionalDuties', label: 'Tugas Tambahan' }
            ].map((f) => (
              <div key={f.key}>
                <label className="font-semibold text-slate-700 block mb-1">{f.label}</label>
                <input
                  value={(teacherForm as unknown as Record<string, string>)[f.key] || ''}
                  onChange={(e) => setTeacherForm({ ...teacherForm, [f.key]: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2"
                />
              </div>
            ))}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Foto Profil Guru</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  handleImageUpload(e.target.files?.[0], (url) => setTeacherForm({ ...teacherForm, photoDataUrl: url }))
                }
                className="w-full border border-slate-300 rounded-xl px-2 py-1.5"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => {
                setDb((prev) => ({ ...prev, teacher: teacherForm }));
                notify('success', 'Profil Guru berhasil disimpan.');
              }}
              className="px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Simpan Profil Guru
            </button>
          </div>
        </div>
      )}

      {tab === 'tahun' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <h3 className="font-bold text-slate-900">Pengaturan Tahun Pelajaran</h3>
          <div className="flex flex-wrap gap-3 items-end text-xs">
            <div>
              <label className="font-semibold block mb-1">Tahun Awal</label>
              <input
                value={yearStart}
                onChange={(e) => setYearStart(e.target.value)}
                placeholder="2025"
                className="border border-slate-300 rounded-xl px-3 py-2 w-32"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">Tahun Akhir</label>
              <input
                value={yearEnd}
                onChange={(e) => setYearEnd(e.target.value)}
                placeholder="2026"
                className="border border-slate-300 rounded-xl px-3 py-2 w-32"
              />
            </div>
            <button
              onClick={saveYear}
              className="px-4 py-2 rounded-xl bg-emerald-800 text-white font-semibold"
            >
              {editingYearId ? 'Simpan Perubahan' : 'Tambah Tahun Pelajaran'}
            </button>
          </div>
          <table className="w-full text-xs border border-slate-200 rounded-xl overflow-hidden">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="p-2.5 text-left">Tahun Pelajaran</th>
                <th className="p-2.5 text-left">Status</th>
                <th className="p-2.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {db.academicYears.map((y) => (
                <tr key={y.id} className="border-t border-slate-200">
                  <td className="p-2.5 font-semibold">{y.label}</td>
                  <td className="p-2.5">
                    {y.id === db.activeAcademicYearId ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">Aktif</span>
                    ) : (
                      <button onClick={() => activateYear(y.id)} className="text-emerald-700 underline">
                        Aktifkan
                      </button>
                    )}
                  </td>
                  <td className="p-2.5 text-right space-x-2">
                    <button
                      onClick={() => {
                        setEditingYearId(y.id);
                        setYearStart(y.startYear);
                        setYearEnd(y.endYear);
                      }}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() =>
                        askConfirm('Hapus Tahun Pelajaran', `Hapus tahun pelajaran ${y.label}?`, () =>
                          setDb((prev) => ({
                            ...prev,
                            academicYears: prev.academicYears.filter((item) => item.id !== y.id)
                          }))
                        )
                      }
                      className="text-red-600 hover:underline"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
              {db.academicYears.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-4 text-center text-slate-400">
                    Belum ada tahun pelajaran.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'semester' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <h3 className="font-bold text-slate-900">Pengaturan Semester</h3>
          <div className="flex flex-wrap gap-3 items-end text-xs">
            <div>
              <label className="font-semibold block mb-1">Tahun Pelajaran</label>
              <select
                value={semYearId}
                onChange={(e) => setSemYearId(e.target.value)}
                className="border border-slate-300 rounded-xl px-3 py-2"
              >
                <option value="">-- Pilih Tahun Pelajaran --</option>
                {db.academicYears.map((y) => (
                  <option key={y.id} value={y.id}>
                    {y.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-semibold block mb-1">Semester</label>
              <select
                value={semName}
                onChange={(e) => setSemName(e.target.value as 'Ganjil' | 'Genap')}
                className="border border-slate-300 rounded-xl px-3 py-2"
              >
                <option value="Ganjil">Ganjil (1)</option>
                <option value="Genap">Genap (2)</option>
              </select>
            </div>
            <button onClick={saveSemester} className="px-4 py-2 rounded-xl bg-emerald-800 text-white font-semibold">
              Tambah Semester
            </button>
          </div>
          <table className="w-full text-xs border border-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-2.5 text-left">Tahun Pelajaran</th>
                <th className="p-2.5 text-left">Semester</th>
                <th className="p-2.5 text-left">Status</th>
                <th className="p-2.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {db.semesters.map((s) => {
                const yr = db.academicYears.find((y) => y.id === s.academicYearId);
                return (
                  <tr key={s.id} className="border-t border-slate-200">
                    <td className="p-2.5">{yr?.label || '-'}</td>
                    <td className="p-2.5 font-semibold">{s.name}</td>
                    <td className="p-2.5">
                      {s.id === db.activeSemesterId ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">Aktif</span>
                      ) : (
                        <button
                          onClick={() => {
                            setDb((prev) => ({
                              ...prev,
                              activeSemesterId: s.id,
                              activeAcademicYearId: s.academicYearId
                            }));
                            notify('success', `Semester ${s.name} diaktifkan.`);
                          }}
                          className="text-emerald-700 underline"
                        >
                          Aktifkan
                        </button>
                      )}
                    </td>
                    <td className="p-2.5 text-right">
                      <button
                        onClick={() =>
                          askConfirm('Hapus Semester', `Hapus semester ${s.name}?`, () =>
                            setDb((prev) => ({ ...prev, semesters: prev.semesters.filter((item) => item.id !== s.id) }))
                          )
                        }
                        className="text-red-600 hover:underline"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                );
              })}
              {db.semesters.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-slate-400">
                    Belum ada data semester.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'kelas' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-bold text-slate-900">Data Kelas / Rombongan Belajar</h3>
            <button
              onClick={() =>
                exportToExcel(
                  'Data_Kelas_MIN4_Magelang',
                  'Data Kelas',
                  db.classes.map((c) => ({
                    'Nama Kelas': c.name,
                    Tingkat: c.gradeLevel,
                    'Tahun Pelajaran': db.academicYears.find((y) => y.id === c.academicYearId)?.label || '',
                    'Wali Kelas': c.homeroomTeacher
                  }))
                )
              }
              className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Export Excel
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
            <input
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="Nama Kelas (misal: IV-A)"
              className="border border-slate-300 rounded-xl px-3 py-2"
            />
            <select
              value={classGrade}
              onChange={(e) => setClassGrade(e.target.value)}
              className="border border-slate-300 rounded-xl px-3 py-2"
            >
              {['1', '2', '3', '4', '5', '6'].map((g) => (
                <option key={g} value={g}>
                  Tingkat Kelas {g}
                </option>
              ))}
            </select>
            <select
              value={classYearId}
              onChange={(e) => setClassYearId(e.target.value)}
              className="border border-slate-300 rounded-xl px-3 py-2"
            >
              <option value="">-- Tahun Pelajaran --</option>
              {db.academicYears.map((y) => (
                <option key={y.id} value={y.id}>
                  {y.label}
                </option>
              ))}
            </select>
            <input
              value={classHomeroom}
              onChange={(e) => setClassHomeroom(e.target.value)}
              placeholder="Nama Wali Kelas"
              className="border border-slate-300 rounded-xl px-3 py-2"
            />
            <button onClick={saveClass} className="px-4 py-2 rounded-xl bg-emerald-800 text-white font-semibold">
              {editingClassId ? 'Simpan Perubahan' : 'Tambah Kelas'}
            </button>
          </div>
          <input
            value={classSearch}
            onChange={(e) => setClassSearch(e.target.value)}
            placeholder="Cari kelas..."
            className="border border-slate-300 rounded-xl px-3 py-2 text-xs w-full md:w-64"
          />
          <table className="w-full text-xs border border-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-2.5 text-left">Nama Kelas</th>
                <th className="p-2.5 text-left">Tingkat</th>
                <th className="p-2.5 text-left">Tahun Pelajaran</th>
                <th className="p-2.5 text-left">Wali Kelas</th>
                <th className="p-2.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredClasses.map((c) => (
                <tr key={c.id} className="border-t border-slate-200">
                  <td className="p-2.5 font-semibold">{c.name}</td>
                  <td className="p-2.5">Kelas {c.gradeLevel}</td>
                  <td className="p-2.5">{db.academicYears.find((y) => y.id === c.academicYearId)?.label || '-'}</td>
                  <td className="p-2.5">{c.homeroomTeacher || '-'}</td>
                  <td className="p-2.5 text-right space-x-2">
                    <button
                      onClick={() => {
                        setEditingClassId(c.id);
                        setClassName(c.name);
                        setClassGrade(c.gradeLevel);
                        setClassYearId(c.academicYearId);
                        setClassHomeroom(c.homeroomTeacher);
                      }}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        const hasStudents = db.students.some((s) => s.classId === c.id);
                        if (hasStudents) {
                          notify('error', 'Kelas tidak dapat dihapus karena masih memiliki data siswa.');
                          return;
                        }
                        askConfirm('Hapus Kelas', `Hapus kelas ${c.name}?`, () =>
                          setDb((prev) => ({ ...prev, classes: prev.classes.filter((item) => item.id !== c.id) }))
                        );
                      }}
                      className="text-red-600 hover:underline"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
              {filteredClasses.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-slate-400">
                    Belum ada data kelas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'siswa' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-bold text-slate-900">Data Siswa</h3>
            <div className="flex flex-wrap gap-2">
              <label className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
                <Upload className="w-3.5 h-3.5" /> Import CSV/Excel
                <input type="file" accept=".csv,.txt" onChange={handleImportStudentsCsv} className="hidden" />
              </label>
              <button
                onClick={() =>
                  exportToExcel(
                    'Data_Siswa_MIN4_Magelang',
                    'Data Siswa',
                    filteredStudents.map((s) => ({
                      NIS: s.nis,
                      Nama: s.name,
                      Kelas: db.classes.find((c) => c.id === s.classId)?.name || '',
                      JK: s.gender,
                      'Tanggal Lahir': s.birthDate,
                      Alamat: s.address,
                      'Nama Orang Tua': s.parentName,
                      Kontak: s.parentPhone,
                      Keterangan: s.notes
                    }))
                  )
                }
                className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Export Excel
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <input
              value={studentForm.nis}
              onChange={(e) => setStudentForm({ ...studentForm, nis: e.target.value })}
              placeholder="Nomor Induk (NIS) *"
              className="border border-slate-300 rounded-xl px-3 py-2"
            />
            <input
              value={studentForm.name}
              onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
              placeholder="Nama Lengkap Siswa *"
              className="border border-slate-300 rounded-xl px-3 py-2"
            />
            <select
              value={studentForm.classId}
              onChange={(e) => setStudentForm({ ...studentForm, classId: e.target.value })}
              className="border border-slate-300 rounded-xl px-3 py-2"
            >
              <option value="">-- Pilih Kelas * --</option>
              {db.classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              value={studentForm.gender}
              onChange={(e) => setStudentForm({ ...studentForm, gender: e.target.value as 'L' | 'P' })}
              className="border border-slate-300 rounded-xl px-3 py-2"
            >
              <option value="L">Laki-laki (L)</option>
              <option value="P">Perempuan (P)</option>
            </select>
            <input
              type="date"
              value={studentForm.birthDate}
              onChange={(e) => setStudentForm({ ...studentForm, birthDate: e.target.value })}
              className="border border-slate-300 rounded-xl px-3 py-2"
            />
            <input
              value={studentForm.parentName}
              onChange={(e) => setStudentForm({ ...studentForm, parentName: e.target.value })}
              placeholder="Nama Orang Tua / Wali"
              className="border border-slate-300 rounded-xl px-3 py-2"
            />
            <input
              value={studentForm.parentPhone}
              onChange={(e) => setStudentForm({ ...studentForm, parentPhone: e.target.value })}
              placeholder="Nomor Kontak Orang Tua"
              className="border border-slate-300 rounded-xl px-3 py-2"
            />
            <input
              value={studentForm.address}
              onChange={(e) => setStudentForm({ ...studentForm, address: e.target.value })}
              placeholder="Alamat"
              className="border border-slate-300 rounded-xl px-3 py-2"
            />
            <button onClick={saveStudent} className="px-4 py-2 rounded-xl bg-emerald-800 text-white font-semibold">
              {editingStudentId ? 'Simpan Perubahan Siswa' : 'Tambah Siswa'}
            </button>
          </div>

          <div className="flex flex-wrap gap-3 text-xs">
            <input
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              placeholder="Cari nama atau NIS..."
              className="border border-slate-300 rounded-xl px-3 py-2 w-full md:w-64"
            />
            <select
              value={studentFilterClass}
              onChange={(e) => setStudentFilterClass(e.target.value)}
              className="border border-slate-300 rounded-xl px-3 py-2"
            >
              <option value="">Semua Kelas</option>
              {db.classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs border border-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-2.5 text-left">NIS</th>
                  <th className="p-2.5 text-left">Nama Siswa</th>
                  <th className="p-2.5 text-left">Kelas</th>
                  <th className="p-2.5 text-left">JK</th>
                  <th className="p-2.5 text-left">Orang Tua & Kontak</th>
                  <th className="p-2.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s) => (
                  <tr key={s.id} className="border-t border-slate-200">
                    <td className="p-2.5">{s.nis}</td>
                    <td className="p-2.5 font-semibold">{s.name}</td>
                    <td className="p-2.5">{db.classes.find((c) => c.id === s.classId)?.name || '-'}</td>
                    <td className="p-2.5">{s.gender}</td>
                    <td className="p-2.5">
                      {s.parentName || '-'} {s.parentPhone ? `(${s.parentPhone})` : ''}
                    </td>
                    <td className="p-2.5 text-right space-x-2">
                      <button
                        onClick={() => {
                          setEditingStudentId(s.id);
                          setStudentForm({
                            nis: s.nis,
                            name: s.name,
                            classId: s.classId,
                            gender: s.gender,
                            birthDate: s.birthDate,
                            address: s.address,
                            parentName: s.parentName,
                            parentPhone: s.parentPhone,
                            notes: s.notes
                          });
                        }}
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() =>
                          askConfirm('Hapus Siswa', `Hapus data siswa ${s.name}?`, () =>
                            setDb((prev) => ({ ...prev, students: prev.students.filter((item) => item.id !== s.id) }))
                          )
                        }
                        className="text-red-600 hover:underline"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-slate-400">
                      Belum ada data siswa.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'mapel' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900">Data Mata Pelajaran</h3>
            <button
              onClick={() =>
                exportToExcel(
                  'Data_Mapel_MIN4_Magelang',
                  'Mata Pelajaran',
                  db.subjects.map((sub) => ({
                    'Mata Pelajaran': sub.name,
                    Kelas: db.classes.find((c) => c.id === sub.classId)?.name || '',
                    Fase: sub.phase,
                    'Alokasi JP': sub.timeAllocationJp,
                    Kurikulum: sub.curriculum
                  }))
                )
              }
              className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Export Excel
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
            <input
              value={subjectForm.name}
              onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
              placeholder="Nama Mata Pelajaran *"
              className="border border-slate-300 rounded-xl px-3 py-2"
            />
            <select
              value={subjectForm.classId}
              onChange={(e) => {
                const cls = db.classes.find((c) => c.id === e.target.value);
                const g = Number(cls?.gradeLevel || '1');
                const phase: 'A' | 'B' | 'C' = g <= 2 ? 'A' : g <= 4 ? 'B' : 'C';
                setSubjectForm({ ...subjectForm, classId: e.target.value, phase });
              }}
              className="border border-slate-300 rounded-xl px-3 py-2"
            >
              <option value="">-- Pilih Kelas * --</option>
              {db.classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              value={subjectForm.phase}
              onChange={(e) => setSubjectForm({ ...subjectForm, phase: e.target.value as 'A' | 'B' | 'C' })}
              className="border border-slate-300 rounded-xl px-3 py-2"
            >
              <option value="A">Fase A (Kelas 1-2)</option>
              <option value="B">Fase B (Kelas 3-4)</option>
              <option value="C">Fase C (Kelas 5-6)</option>
            </select>
            <input
              type="number"
              min={1}
              value={subjectForm.timeAllocationJp}
              onChange={(e) => setSubjectForm({ ...subjectForm, timeAllocationJp: Number(e.target.value) || 1 })}
              placeholder="Alokasi JP/Minggu"
              className="border border-slate-300 rounded-xl px-3 py-2"
            />
            <button onClick={saveSubject} className="px-4 py-2 rounded-xl bg-emerald-800 text-white font-semibold">
              {editingSubjectId ? 'Simpan Mapel' : 'Tambah Mapel'}
            </button>
          </div>
          <input
            value={subjectSearch}
            onChange={(e) => setSubjectSearch(e.target.value)}
            placeholder="Cari mata pelajaran..."
            className="border border-slate-300 rounded-xl px-3 py-2 text-xs w-full md:w-64"
          />
          <table className="w-full text-xs border border-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-2.5 text-left">Mata Pelajaran</th>
                <th className="p-2.5 text-left">Kelas</th>
                <th className="p-2.5 text-left">Fase</th>
                <th className="p-2.5 text-left">Alokasi Waktu</th>
                <th className="p-2.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubjects.map((sub) => (
                <tr key={sub.id} className="border-t border-slate-200">
                  <td className="p-2.5 font-semibold">{sub.name}</td>
                  <td className="p-2.5">{db.classes.find((c) => c.id === sub.classId)?.name || '-'}</td>
                  <td className="p-2.5">Fase {sub.phase}</td>
                  <td className="p-2.5">{sub.timeAllocationJp} JP / Minggu</td>
                  <td className="p-2.5 text-right space-x-2">
                    <button
                      onClick={() => {
                        setEditingSubjectId(sub.id);
                        setSubjectForm({
                          name: sub.name,
                          classId: sub.classId,
                          phase: sub.phase,
                          timeAllocationJp: sub.timeAllocationJp,
                          curriculum: sub.curriculum
                        });
                      }}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() =>
                        askConfirm('Hapus Mata Pelajaran', `Hapus mapel ${sub.name}?`, () =>
                          setDb((prev) => ({ ...prev, subjects: prev.subjects.filter((item) => item.id !== sub.id) }))
                        )
                      }
                      className="text-red-600 hover:underline"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
              {filteredSubjects.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-slate-400">
                    Belum ada data mata pelajaran.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 7. MODUL KALENDER PENDIDIKAN & ANALISIS MINGGU EFEKTIF (TAHAP 2)
// ============================================================================

function CalendarEffectiveView({
  db,
  setDb,
  notify,
  askConfirm,
  exportToExcel,
  openPrintPreview
}: {
  db: AppDatabase;
  setDb: React.Dispatch<React.SetStateAction<AppDatabase>>;
  notify: (type: 'success' | 'error' | 'warning' | 'info', text: string) => void;
  askConfirm: (title: string, message: string, onConfirm: () => void) => void;
  exportToExcel: (filename: string, sheetName: string, rows: Record<string, unknown>[]) => void;
  openPrintPreview: (title: string, bodyHtml: string) => void;
}) {
  const yearId = db.activeAcademicYearId;
  const semId = db.activeSemesterId;
  const existingCfg = db.calendarConfigs.find((c) => c.academicYearId === yearId && c.semesterId === semId);

  const [startDate, setStartDate] = useState(existingCfg?.startDate || '');
  const [endDate, setEndDate] = useState(existingCfg?.endDate || '');
  const [learningDays, setLearningDays] = useState<5 | 6>(existingCfg?.learningDaysPerWeek || 6);
  const [minEffDays, setMinEffDays] = useState(existingCfg?.minEffectiveDaysPerWeek || 3);

  const [evTitle, setEvTitle] = useState('');
  const [evCategory, setEvCategory] = useState<CalendarEvent['category']>('libur_nasional');
  const [evStart, setEvStart] = useState('');
  const [evEnd, setEvEnd] = useState('');
  const [evReduces, setEvReduces] = useState(true);
  const [evDesc, setEvDesc] = useState('');

  useEffect(() => {
    if (existingCfg) {
      setStartDate(existingCfg.startDate);
      setEndDate(existingCfg.endDate);
      setLearningDays(existingCfg.learningDaysPerWeek);
      setMinEffDays(existingCfg.minEffectiveDaysPerWeek);
    }
  }, [existingCfg]);

  const semesterEvents = db.calendarEvents.filter((e) => e.academicYearId === yearId && e.semesterId === semId);

  const weeklyAnalysis = useMemo(() => {
    if (!startDate || !endDate || startDate > endDate) return [];
    const s = new Date(`${startDate}T00:00:00`);
    const e = new Date(`${endDate}T00:00:00`);
    const holidaySet = new Map<string, string[]>();
    semesterEvents.forEach((ev) => {
      if (!ev.reducesEffectiveDays) return;
      const cs = new Date(`${ev.startDate}T00:00:00`);
      const ce = new Date(`${ev.endDate}T00:00:00`);
      for (let d = new Date(cs); d <= ce; d.setDate(d.getDate() + 1)) {
        const key = d.toISOString().slice(0, 10);
        const list = holidaySet.get(key) || [];
        list.push(ev.title);
        holidaySet.set(key, list);
      }
    });

    const weeks: {
      weekKey: string;
      monthLabel: string;
      weekNo: number;
      rangeText: string;
      effectiveDays: number;
      holidayDays: number;
      eventsText: string;
      isEffective: boolean;
      note: string;
    }[] = [];

    let cur = new Date(s);
    let idx = 1;
    while (cur <= e) {
      const weekStart = new Date(cur);
      const weekEnd = new Date(cur);
      const dayOfWeek = weekStart.getDay();
      const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
      weekEnd.setDate(weekStart.getDate() + daysUntilSunday);
      if (weekEnd > e) weekEnd.setTime(e.getTime());

      let effDays = 0;
      let holDays = 0;
      const evNames = new Set<string>();

      for (let d = new Date(weekStart); d <= weekEnd; d.setDate(d.getDate() + 1)) {
        const dow = d.getDay();
        const isWeekend = dow === 0 || (learningDays === 5 && dow === 6);
        const key = d.toISOString().slice(0, 10);
        if (!isWeekend) {
          if (holidaySet.has(key)) {
            holDays++;
            holidaySet.get(key)?.forEach((n) => evNames.add(n));
          } else {
            effDays++;
          }
        }
      }

      const monthLabel = weekStart.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
      const weekKey = `${yearId}_${semId}_w${idx}`;
      const override = db.weekOverrides.find((w) => w.weekKey === weekKey);
      const autoEffective = effDays >= minEffDays;
      const isEffective = override ? override.isEffective : autoEffective;

      weeks.push({
        weekKey,
        monthLabel,
        weekNo: idx,
        rangeText: `${weekStart.toISOString().slice(0, 10)} s.d. ${weekEnd.toISOString().slice(0, 10)}`,
        effectiveDays: effDays,
        holidayDays: holDays,
        eventsText: Array.from(evNames).join(', ') || '-',
        isEffective,
        note: override?.note || (autoEffective ? 'Efektif KBM' : 'Minggu tidak efektif / libur / parsial')
      });

      cur = new Date(weekEnd);
      cur.setDate(cur.getDate() + 1);
      idx++;
    }
    return weeks;
  }, [startDate, endDate, learningDays, minEffDays, semesterEvents, db.weekOverrides, yearId, semId]);

  const totalEffectiveWeeks = weeklyAnalysis.filter((w) => w.isEffective).length;
  const totalNonEffectiveWeeks = weeklyAnalysis.length - totalEffectiveWeeks;
  const totalEffectiveDays = weeklyAnalysis.reduce((acc, w) => acc + w.effectiveDays, 0);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-bold text-slate-900">Pengaturan Rentang Semester & Hari Belajar</h3>
          <div className="flex gap-2">
            <button
              onClick={() =>
                exportToExcel(
                  'Analisis_Minggu_Efektif_MIN4',
                  'Minggu Efektif',
                  weeklyAnalysis.map((w) => ({
                    Bulan: w.monthLabel,
                    Minggu: `Minggu ${w.weekNo}`,
                    Tanggal: w.rangeText,
                    'Hari Efektif': w.effectiveDays,
                    Kegiatan: w.eventsText,
                    Status: w.isEffective ? 'Efektif' : 'Tidak Efektif',
                    Catatan: w.note
                  }))
                )
              }
              className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" /> Excel
            </button>
            <button
              onClick={() => {
                const rowsHtml = weeklyAnalysis
                  .map(
                    (w) =>
                      `<tr><td>${escapeXml(w.monthLabel)}</td><td>Minggu ${w.weekNo}</td><td>${escapeXml(w.rangeText)}</td><td style="text-align:center">${w.effectiveDays}</td><td>${escapeXml(w.eventsText)}</td><td>${w.isEffective ? 'Efektif' : 'Tidak Efektif'}</td><td>${escapeXml(w.note)}</td></tr>`
                  )
                  .join('');
                openPrintPreview(
                  'ANALISIS MINGGU EFEKTIF SEMESTER',
                  `<p>Total Minggu Kalender: <b>${weeklyAnalysis.length}</b> | Minggu Efektif: <b>${totalEffectiveWeeks}</b> | Minggu Tidak Efektif: <b>${totalNonEffectiveWeeks}</b> | Total Hari Efektif: <b>${totalEffectiveDays}</b></p>
                  <table><thead><tr><th>Bulan</th><th>Minggu</th><th>Rentang Tanggal</th><th>Hari Efektif</th><th>Kegiatan/Libur</th><th>Status</th><th>Catatan</th></tr></thead><tbody>${rowsHtml}</tbody></table>`
                );
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-800 text-white text-xs font-semibold flex items-center gap-1"
            >
              <Printer className="w-3.5 h-3.5" /> Cetak / PDF
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
          <div>
            <label className="font-semibold block mb-1">Tanggal Awal Semester</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full border border-slate-300 rounded-xl px-3 py-2" />
          </div>
          <div>
            <label className="font-semibold block mb-1">Tanggal Akhir Semester</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full border border-slate-300 rounded-xl px-3 py-2" />
          </div>
          <div>
            <label className="font-semibold block mb-1">Hari Pembelajaran/Minggu</label>
            <select value={learningDays} onChange={(e) => setLearningDays(Number(e.target.value) as 5 | 6)} className="w-full border border-slate-300 rounded-xl px-3 py-2">
              <option value={6}>6 Hari (Senin - Sabtu)</option>
              <option value={5}>5 Hari (Senin - Jumat)</option>
            </select>
          </div>
          <div>
            <label className="font-semibold block mb-1">Min. Hari Minggu Parsial</label>
            <input type="number" min={1} max={6} value={minEffDays} onChange={(e) => setMinEffDays(Number(e.target.value) || 3)} className="w-full border border-slate-300 rounded-xl px-3 py-2" />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                if (!yearId || !semId) {
                  notify('error', 'Aktifkan Tahun Pelajaran & Semester di Data Master terlebih dahulu.');
                  return;
                }
                if (!startDate || !endDate || startDate > endDate) {
                  notify('error', 'Rentang tanggal semester tidak valid.');
                  return;
                }
                const cfg: CalendarSemesterConfig = {
                  id: existingCfg?.id || uid('calcfg'),
                  academicYearId: yearId,
                  semesterId: semId,
                  startDate,
                  endDate,
                  learningDaysPerWeek: learningDays,
                  minEffectiveDaysPerWeek: minEffDays,
                  madrasahEventIsEffective: false,
                  specialEventIsEffective: false
                };
                setDb((prev) => ({
                  ...prev,
                  calendarConfigs: existingCfg
                    ? prev.calendarConfigs.map((c) => (c.id === existingCfg.id ? cfg : c))
                    : [...prev.calendarConfigs, cfg]
                }));
                notify('success', 'Konfigurasi kalender semester disimpan.');
              }}
              className="w-full py-2 px-4 rounded-xl bg-emerald-800 text-white font-semibold"
            >
              Simpan Pengaturan
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-[11px] text-slate-500">Jumlah Minggu Kalender</div>
            <div className="text-lg font-bold text-slate-900">{weeklyAnalysis.length} Minggu</div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
            <div className="text-[11px] text-emerald-700">Minggu Efektif</div>
            <div className="text-lg font-bold text-emerald-900">{totalEffectiveWeeks} Minggu</div>
          </div>
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
            <div className="text-[11px] text-rose-700">Minggu Tidak Efektif</div>
            <div className="text-lg font-bold text-rose-900">{totalNonEffectiveWeeks} Minggu</div>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
            <div className="text-[11px] text-blue-700">Total Hari Efektif</div>
            <div className="text-lg font-bold text-blue-900">{totalEffectiveDays} Hari</div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900">Input Hari Libur & Kegiatan Madrasah</h3>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 text-xs">
          <input value={evTitle} onChange={(e) => setEvTitle(e.target.value)} placeholder="Nama Libur / Kegiatan *" className="md:col-span-2 border border-slate-300 rounded-xl px-3 py-2" />
          <select value={evCategory} onChange={(e) => setEvCategory(e.target.value as CalendarEvent['category'])} className="border border-slate-300 rounded-xl px-3 py-2">
            <option value="libur_nasional">Hari Libur Nasional</option>
            <option value="libur_madrasah">Hari Libur Madrasah</option>
            <option value="kegiatan_madrasah">Kegiatan Madrasah</option>
            <option value="kegiatan_khusus">Kegiatan Khusus</option>
          </select>
          <input type="date" value={evStart} onChange={(e) => setEvStart(e.target.value)} className="border border-slate-300 rounded-xl px-3 py-2" />
          <input type="date" value={evEnd} onChange={(e) => setEvEnd(e.target.value)} className="border border-slate-300 rounded-xl px-3 py-2" />
          <button
            onClick={() => {
              if (!yearId || !semId || !evTitle.trim() || !evStart) {
                notify('error', 'Lengkapi Tahun/Semester aktif, Nama Agenda, dan Tanggal.');
                return;
              }
              setDb((prev) => ({
                ...prev,
                calendarEvents: [
                  ...prev.calendarEvents,
                  {
                    id: uid('ev'),
                    academicYearId: yearId,
                    semesterId: semId,
                    title: evTitle.trim(),
                    category: evCategory,
                    startDate: evStart,
                    endDate: evEnd || evStart,
                    reducesEffectiveDays: evReduces,
                    description: evDesc
                  }
                ]
              }));
              setEvTitle('');
              setEvDesc('');
              notify('success', 'Agenda kalender ditambahkan.');
            }}
            className="px-4 py-2 rounded-xl bg-emerald-800 text-white font-semibold"
          >
            Tambah Agenda
          </button>
        </div>
        <label className="inline-flex items-center gap-2 text-xs text-slate-700">
          <input type="checkbox" checked={evReduces} onChange={(e) => setEvReduces(e.target.checked)} />
          Mengurangi hari efektif pembelajaran (centang untuk hari libur / ujian / kegiatan non-KBM)
        </label>

        {semesterEvents.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {semesterEvents.map((ev) => (
              <span key={ev.id} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-xs">
                <b>{ev.title}</b> ({ev.startDate}{ev.endDate !== ev.startDate ? ` s.d. ${ev.endDate}` : ''})
                <button
                  onClick={() =>
                    askConfirm('Hapus Agenda', `Hapus agenda "${ev.title}"?`, () =>
                      setDb((prev) => ({ ...prev, calendarEvents: prev.calendarEvents.filter((item) => item.id !== ev.id) }))
                    )
                  }
                  className="text-red-600 font-bold"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        <h3 className="font-bold text-slate-900 mb-3">Tabel Analisis Minggu Efektif (Klik Status untuk Koreksi Manual Guru)</h3>
        <table className="w-full text-xs border border-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-2.5 text-left">Bulan</th>
              <th className="p-2.5 text-left">Minggu</th>
              <th className="p-2.5 text-left">Tanggal</th>
              <th className="p-2.5 text-center">Hari Efektif</th>
              <th className="p-2.5 text-left">Kegiatan / Libur</th>
              <th className="p-2.5 text-left">Status Efektif</th>
              <th className="p-2.5 text-left">Catatan</th>
            </tr>
          </thead>
          <tbody>
            {weeklyAnalysis.map((w) => (
              <tr key={w.weekKey} className="border-t border-slate-200">
                <td className="p-2.5">{w.monthLabel}</td>
                <td className="p-2.5 font-semibold">Minggu {w.weekNo}</td>
                <td className="p-2.5">{w.rangeText}</td>
                <td className="p-2.5 text-center font-bold">{w.effectiveDays}</td>
                <td className="p-2.5">{w.eventsText}</td>
                <td className="p-2.5">
                  <button
                    onClick={() => {
                      setDb((prev) => {
                        const others = prev.weekOverrides.filter((o) => o.weekKey !== w.weekKey);
                        return {
                          ...prev,
                          weekOverrides: [
                            ...others,
                            {
                              weekKey: w.weekKey,
                              isEffective: !w.isEffective,
                              note: !w.isEffective ? 'Dikoreksi guru: Efektif' : 'Dikoreksi guru: Tidak Efektif'
                            }
                          ]
                        };
                      });
                    }}
                    className={`px-2.5 py-1 rounded-full font-bold ${
                      w.isEffective ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {w.isEffective ? 'Efektif' : 'Tidak Efektif'}
                  </button>
                </td>
                <td className="p-2.5 text-slate-600">{w.note}</td>
              </tr>
            ))}
            {weeklyAnalysis.length === 0 && (
              <tr>
                <td colSpan={7} className="p-4 text-center text-slate-400">
                  Isi Tanggal Awal dan Tanggal Akhir semester di atas untuk menghitung analisis minggu efektif.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================================
// 8. MODUL PERENCANAAN PEMBELAJARAN (ATP, PROTA, PROSEM, KKTP, MODUL AJAR)
// ============================================================================

function PerencanaanView({
  db,
  setDb,
  notify,
  askConfirm,
  exportToExcel,
  openPrintPreview
}: {
  db: AppDatabase;
  setDb: React.Dispatch<React.SetStateAction<AppDatabase>>;
  notify: (type: 'success' | 'error' | 'warning' | 'info', text: string) => void;
  askConfirm: (title: string, message: string, onConfirm: () => void) => void;
  exportToExcel: (filename: string, sheetName: string, rows: Record<string, unknown>[]) => void;
  openPrintPreview: (title: string, bodyHtml: string) => void;
}) {
  const [subTab, setSubTab] = useState<'atp' | 'prota' | 'prosem' | 'kktp' | 'modul'>('atp');
  const [selectedClassId, setSelectedClassId] = useState(db.classes[0]?.id || '');
  const [selectedSubjectId, setSelectedSubjectId] = useState(db.subjects[0]?.id || '');

  const [atpForm, setAtpForm] = useState({
    element: '',
    cp: '',
    tp: '',
    material: '',
    jp: 4,
    dimensi: [] as string[],
    kbc: [] as string[],
    notes: ''
  });

  const [kktpForm, setKktpForm] = useState({
    atpId: '',
    method: 'deskripsi_kriteria' as KktpItem['method'],
    indicatorText: '',
    achievementDescription: '',
    assessmentMethod: 'Tes Tertulis / Unjuk Kerja',
    remedialPlan: 'Bimbingan ulang per indikator yang belum tercapai',
    enrichmentPlan: 'Tugas eksplorasi pemecahan masalah kontekstual'
  });

  const [modulForm, setModulForm] = useState({
    templateType: 'modul_ajar' as 'modul_ajar' | 'rpp_ringkas',
    atpId: '',
    material: '',
    cp: '',
    tp: '',
    jp: 4,
    meetingCount: 2,
    meaningfulUnderstanding: '',
    triggerQuestions: '',
    openingActivity: '',
    coreActivity: '',
    closingActivity: '',
    differentiation: '',
    initialAssessment: '',
    formativeAssessment: '',
    summativeAssessment: '',
    media: '',
    learningResources: '',
    kbcSelected: [] as string[],
    deepLearningStages: { memahami: '', mengaplikasi: '', merefleksi: '' },
    isAiDraft: false
  });

  const classSubjects = db.subjects.filter((s) => !selectedClassId || s.classId === selectedClassId);
  const filteredAtp = db.atpItems
    .filter((a) => (!selectedClassId || a.classId === selectedClassId) && (!selectedSubjectId || a.subjectId === selectedSubjectId))
    .sort((a, b) => a.order - b.order);

  const generateDraftModulFromUserInputs = () => {
    const baseMaterial = modulForm.material.trim() || 'Materi Pokok';
    const baseTp = modulForm.tp.trim() || 'Tujuan pembelajaran yang ditetapkan guru';
    const kbcLine =
      modulForm.kbcSelected.length > 0
        ? `Integrasi Nilai KBC (${modulForm.kbcSelected.join(', ')}): menumbuhkan kepedulian dan akhlak mulia selama mempelajari ${baseMaterial}.`
        : 'Menumbuhkan sikap santun, tanggung jawab, dan rasa ingin tahu siswa.';
    setModulForm((prev) => ({
      ...prev,
      isAiDraft: true,
      meaningfulUnderstanding:
        prev.meaningfulUnderstanding ||
        `Peserta didik memahami konsep ${baseMaterial} dan menerapkannya dalam kehidupan sehari-hari di madrasah maupun keluarga.`,
      triggerQuestions:
        prev.triggerQuestions ||
        `1. Apa yang kalian ketahui tentang ${baseMaterial}?\n2. Mengapa kita perlu memahami ${baseMaterial} dalam kehidupan sehari-hari?`,
      deepLearningStages: {
        memahami: `Peserta didik mengamati fenomena/teks terkait ${baseMaterial}, berdiskusi kelompok, dan mengidentifikasi konsep inti untuk mencapai ${baseTp}.`,
        mengaplikasi: `Peserta didik mempraktikkan penyelesaian masalah atau proyek sederhana terkait ${baseMaterial}.`,
        merefleksi: `Peserta didik menyimpulkan pembelajaran dan merefleksikan pengalaman belajarnya. ${kbcLine}`
      },
      openingActivity: `1. Salam, doa bersama, dan presensi.\n2. Apersepsi dan pertanyaan pemantik terkait ${baseMaterial}.\n3. Penyampaian tujuan pembelajaran: ${baseTp}.`,
      coreActivity: `1. [Memahami] Eksplorasi konsep ${baseMaterial} melalui diskusi dan tanya jawab.\n2. [Mengaplikasi] Latihan terbimbing dan praktik kelompok.\n3. [Merefleksi] Presentasi hasil kerja dan penguatan nilai karakter.`,
      closingActivity: `1. Simpulan bersama antara guru dan peserta didik.\n2. Asesmen formatif singkat dan refleksi.\n3. Doa penutup.`,
      differentiation: `Konten: penyediaan bahan bacaan bertingkat.\nProses: pendampingan kelompok bagi siswa yang memerlukan bimbingan.\nProduk: kebebasan menyajikan hasil dalam bentuk tulisan, lisan, atau gambar.`,
      initialAssessment: `Tanya jawab lisan dan pemetaan kesiapan awal tentang ${baseMaterial}.`,
      formativeAssessment: `Observasi keaktifan diskusi dan lembar kerja selama proses pembelajaran.`,
      summativeAssessment: `Tes tertulis / unjuk kerja sesuai indikator ketercapaian pada ${baseTp}.`
    }));
    notify('info', 'Draf kerangka Modul Ajar disusun dari data Anda. Harap periksa dan sesuaikan sebelum disimpan.');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'atp', label: 'A. ATP' },
            { id: 'prota', label: 'B. Prota' },
            { id: 'prosem', label: 'C. Prosem' },
            { id: 'kktp', label: 'D. KKTP' },
            { id: 'modul', label: 'E. Modul Ajar & RPP' }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setSubTab(t.id as typeof subTab)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold ${
                subTab === t.id ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <select value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)} className="border border-slate-300 rounded-xl px-3 py-1.5">
            <option value="">Semua Kelas</option>
            {db.classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select value={selectedSubjectId} onChange={(e) => setSelectedSubjectId(e.target.value)} className="border border-slate-300 rounded-xl px-3 py-1.5">
            <option value="">Semua Mapel</option>
            {classSubjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {subTab === 'atp' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-bold text-slate-900">Alur Tujuan Pembelajaran (ATP)</h3>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  exportToExcel(
                    'ATP_MIN4_Magelang',
                    'ATP',
                    filteredAtp.map((a) => ({
                      Urutan: a.order,
                      Elemen: a.element,
                      CP: a.cp,
                      TP: a.tp,
                      Materi: a.material,
                      JP: a.jp,
                      'Dimensi Profil Lulusan': a.dimensiProfilLulusan.join('; '),
                      'Integrasi KBC': a.integrasiKBC.join('; ')
                    }))
                  )
                }
                className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" /> Excel
              </button>
              <button
                onClick={() => {
                  const rows = filteredAtp
                    .map(
                      (a) =>
                        `<tr><td>${a.order}</td><td>${escapeXml(a.element)}</td><td>${escapeXml(a.cp)}</td><td>${escapeXml(a.tp)}</td><td>${escapeXml(a.material)}</td><td style="text-align:center">${a.jp}</td><td>${escapeXml(a.dimensiProfilLulusan.join(', '))}</td><td>${escapeXml(a.integrasiKBC.join(', '))}</td></tr>`
                    )
                    .join('');
                  openPrintPreview(
                    'ALUR TUJUAN PEMBELAJARAN (ATP)',
                    `<table><thead><tr><th>No</th><th>Elemen</th><th>Capaian Pembelajaran</th><th>Tujuan Pembelajaran</th><th>Materi</th><th>JP</th><th>Dimensi Profil Lulusan</th><th>Integrasi KBC</th></tr></thead><tbody>${rows}</tbody></table>`
                  );
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 text-white text-xs font-semibold flex items-center gap-1"
              >
                <Printer className="w-3.5 h-3.5" /> Cetak / PDF
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <input value={atpForm.element} onChange={(e) => setAtpForm({ ...atpForm, element: e.target.value })} placeholder="Elemen Pembelajaran" className="border border-slate-300 rounded-xl px-3 py-2" />
            <div className="flex gap-2">
              <input value={atpForm.material} onChange={(e) => setAtpForm({ ...atpForm, material: e.target.value })} placeholder="Materi Pokok *" className="w-2/3 border border-slate-300 rounded-xl px-3 py-2" />
              <input type="number" min={1} value={atpForm.jp} onChange={(e) => setAtpForm({ ...atpForm, jp: Number(e.target.value) || 2 })} placeholder="JP" className="w-1/3 border border-slate-300 rounded-xl px-3 py-2" />
            </div>
            <textarea rows={2} value={atpForm.cp} onChange={(e) => setAtpForm({ ...atpForm, cp: e.target.value })} placeholder="Capaian Pembelajaran (CP)" className="border border-slate-300 rounded-xl px-3 py-2" />
            <textarea rows={2} value={atpForm.tp} onChange={(e) => setAtpForm({ ...atpForm, tp: e.target.value })} placeholder="Tujuan Pembelajaran (TP) *" className="border border-slate-300 rounded-xl px-3 py-2" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="font-semibold text-slate-700 mb-2">8 Dimensi Profil Lulusan yang Relevan:</div>
              <div className="flex flex-wrap gap-1.5">
                {DIMENSI_PROFIL_LULUSAN.map((d) => {
                  const active = atpForm.dimensi.includes(d);
                  return (
                    <button
                      type="button"
                      key={d}
                      onClick={() =>
                        setAtpForm({
                          ...atpForm,
                          dimensi: active ? atpForm.dimensi.filter((x) => x !== d) : [...atpForm.dimensi, d]
                        })
                      }
                      className={`px-2.5 py-1 rounded-lg border text-[11px] ${
                        active ? 'bg-emerald-800 text-white border-emerald-800' : 'bg-white text-slate-600 border-slate-300'
                      }`}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200">
              <div className="font-semibold text-emerald-900 mb-2">Integrasi Kurikulum Berbasis Cinta (Panca Cinta):</div>
              <div className="flex flex-wrap gap-1.5">
                {PANCA_CINTA_KBC.map((k) => {
                  const active = atpForm.kbc.includes(k);
                  return (
                    <button
                      type="button"
                      key={k}
                      onClick={() =>
                        setAtpForm({
                          ...atpForm,
                          kbc: active ? atpForm.kbc.filter((x) => x !== k) : [...atpForm.kbc, k]
                        })
                      }
                      className={`px-2.5 py-1 rounded-lg border text-[11px] ${
                        active ? 'bg-emerald-800 text-white border-emerald-800' : 'bg-white text-emerald-900 border-emerald-300'
                      }`}
                    >
                      {k}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              if (!selectedClassId || !selectedSubjectId || !atpForm.tp.trim()) {
                notify('error', 'Pilih Kelas, Mata Pelajaran, dan isi Tujuan Pembelajaran.');
                return;
              }
              const sub = db.subjects.find((s) => s.id === selectedSubjectId);
              setDb((prev) => ({
                ...prev,
                atpItems: [
                  ...prev.atpItems,
                  {
                    id: uid('atp'),
                    academicYearId: prev.activeAcademicYearId,
                    semesterId: prev.activeSemesterId,
                    subjectId: selectedSubjectId,
                    classId: selectedClassId,
                    phase: sub?.phase || 'A',
                    element: atpForm.element,
                    cp: atpForm.cp,
                    tp: atpForm.tp.trim(),
                    material: atpForm.material.trim(),
                    order: filteredAtp.length + 1,
                    jp: atpForm.jp,
                    dimensiProfilLulusan: atpForm.dimensi,
                    integrasiKBC: atpForm.kbc,
                    notes: atpForm.notes
                  }
                ]
              }));
              setAtpForm({ ...atpForm, tp: '', material: '' });
              notify('success', 'Tujuan Pembelajaran ditambahkan ke ATP.');
            }}
            className="px-4 py-2 rounded-xl bg-emerald-800 text-white text-xs font-semibold"
          >
            Tambah Tujuan Pembelajaran
          </button>

          <div className="overflow-x-auto">
            <table className="w-full text-xs border border-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-2.5 text-left">Urutan</th>
                  <th className="p-2.5 text-left">Tujuan Pembelajaran</th>
                  <th className="p-2.5 text-left">Materi</th>
                  <th className="p-2.5 text-center">JP</th>
                  <th className="p-2.5 text-left">Profil Lulusan & KBC</th>
                  <th className="p-2.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredAtp.map((a) => (
                  <tr key={a.id} className="border-t border-slate-200">
                    <td className="p-2.5 font-bold">{a.order}</td>
                    <td className="p-2.5">{a.tp}</td>
                    <td className="p-2.5">{a.material || '-'}</td>
                    <td className="p-2.5 text-center font-semibold">{a.jp} JP</td>
                    <td className="p-2.5 text-[11px] text-slate-600">
                      {[...a.dimensiProfilLulusan, ...a.integrasiKBC].join(', ') || '-'}
                    </td>
                    <td className="p-2.5 text-right">
                      <button
                        onClick={() =>
                          askConfirm('Hapus TP', 'Hapus tujuan pembelajaran ini dari ATP?', () =>
                            setDb((prev) => ({ ...prev, atpItems: prev.atpItems.filter((item) => item.id !== a.id) }))
                          )
                        }
                        className="text-red-600 hover:underline"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredAtp.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-slate-400">
                      Belum ada ATP untuk kelas/mapel terpilih.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {subTab === 'prota' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-bold text-slate-900">Program Tahunan (Prota)</h3>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const existingIds = new Set(db.protaItems.map((p) => p.atpId));
                  const toImport = filteredAtp.filter((a) => !existingIds.has(a.id));
                  if (toImport.length === 0) {
                    notify('info', 'Semua TP dari ATP sudah masuk ke Prota.');
                    return;
                  }
                  setDb((prev) => ({
                    ...prev,
                    protaItems: [
                      ...prev.protaItems,
                      ...toImport.map((a) => ({
                        id: uid('prota'),
                        academicYearId: a.academicYearId,
                        subjectId: a.subjectId,
                        classId: a.classId,
                        atpId: a.id,
                        phase: a.phase,
                        cp: a.cp,
                        tp: a.tp,
                        material: a.material,
                        jp: a.jp,
                        semesterNumber: 1 as 1 | 2,
                        notes: ''
                      }))
                    ]
                  }));
                  notify('success', `${toImport.length} TP ditarik dari ATP ke Prota.`);
                }}
                className="px-3 py-1.5 rounded-xl bg-emerald-800 text-white text-xs font-semibold"
              >
                Ambil Tujuan dari ATP
              </button>
              <button
                onClick={() => {
                  const rows = db.protaItems
                    .filter((p) => (!selectedClassId || p.classId === selectedClassId) && (!selectedSubjectId || p.subjectId === selectedSubjectId))
                    .map(
                      (p, i) =>
                        `<tr><td>${i + 1}</td><td>Semester ${p.semesterNumber}</td><td>${escapeXml(p.tp)}</td><td>${escapeXml(p.material)}</td><td style="text-align:center">${p.jp} JP</td></tr>`
                    )
                    .join('');
                  openPrintPreview(
                    'PROGRAM TAHUNAN (PROTA)',
                    `<table><thead><tr><th>No</th><th>Semester</th><th>Tujuan Pembelajaran</th><th>Materi Pokok</th><th>Alokasi Waktu</th></tr></thead><tbody>${rows}</tbody></table>`
                  );
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 text-white text-xs font-semibold flex items-center gap-1"
              >
                <Printer className="w-3.5 h-3.5" /> Cetak / PDF
              </button>
            </div>
          </div>

          <table className="w-full text-xs border border-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-2.5 text-left">Semester</th>
                <th className="p-2.5 text-left">Tujuan Pembelajaran</th>
                <th className="p-2.5 text-left">Materi</th>
                <th className="p-2.5 text-center">Alokasi (JP)</th>
                <th className="p-2.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {db.protaItems
                .filter((p) => (!selectedClassId || p.classId === selectedClassId) && (!selectedSubjectId || p.subjectId === selectedSubjectId))
                .map((p) => (
                  <tr key={p.id} className="border-t border-slate-200">
                    <td className="p-2.5">
                      <select
                        value={p.semesterNumber}
                        onChange={(e) =>
                          setDb((prev) => ({
                            ...prev,
                            protaItems: prev.protaItems.map((item) =>
                              item.id === p.id ? { ...item, semesterNumber: Number(e.target.value) as 1 | 2 } : item
                            )
                          }))
                        }
                        className="border border-slate-300 rounded-lg px-2 py-1"
                      >
                        <option value={1}>Semester 1 (Ganjil)</option>
                        <option value={2}>Semester 2 (Genap)</option>
                      </select>
                    </td>
                    <td className="p-2.5">{p.tp}</td>
                    <td className="p-2.5">{p.material}</td>
                    <td className="p-2.5 text-center">
                      <input
                        type="number"
                        min={1}
                        value={p.jp}
                        onChange={(e) =>
                          setDb((prev) => ({
                            ...prev,
                            protaItems: prev.protaItems.map((item) =>
                              item.id === p.id ? { ...item, jp: Number(e.target.value) || 1 } : item
                            )
                          }))
                        }
                        className="w-16 border border-slate-300 rounded-lg px-2 py-1 text-center"
                      />
                    </td>
                    <td className="p-2.5 text-right">
                      <button
                        onClick={() =>
                          setDb((prev) => ({ ...prev, protaItems: prev.protaItems.filter((item) => item.id !== p.id) }))
                        }
                        className="text-red-600 hover:underline"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {subTab === 'prosem' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-bold text-slate-900">Program Semester (Prosem)</h3>
            <button
              onClick={() => {
                const existingIds = new Set(db.prosemItems.map((p) => p.protaId));
                const toImport = db.protaItems.filter(
                  (p) =>
                    !existingIds.has(p.id) &&
                    (!selectedClassId || p.classId === selectedClassId) &&
                    (!selectedSubjectId || p.subjectId === selectedSubjectId)
                );
                if (toImport.length === 0) {
                  notify('info', 'Semua item Prota sudah tersedia di Prosem.');
                  return;
                }
                setDb((prev) => ({
                  ...prev,
                  prosemItems: [
                    ...prev.prosemItems,
                    ...toImport.map((p) => ({
                      id: uid('prosem'),
                      academicYearId: prev.activeAcademicYearId,
                      semesterId: prev.activeSemesterId,
                      subjectId: p.subjectId,
                      classId: p.classId,
                      atpId: p.atpId,
                      protaId: p.id,
                      tp: p.tp,
                      material: p.material,
                      jp: p.jp,
                      weekAllocations: {},
                      assessmentType: 'Formatif & Sumatif',
                      notes: ''
                    }))
                  ]
                }));
                notify('success', `${toImport.length} item ditarik dari Prota ke Prosem.`);
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-800 text-white text-xs font-semibold"
            >
              Ambil Data dari Prota
            </button>
          </div>
          <table className="w-full text-xs border border-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-2.5 text-left">Tujuan Pembelajaran</th>
                <th className="p-2.5 text-left">Materi</th>
                <th className="p-2.5 text-center">Alokasi JP</th>
                <th className="p-2.5 text-left">Asesmen</th>
                <th className="p-2.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {db.prosemItems
                .filter((p) => (!selectedClassId || p.classId === selectedClassId) && (!selectedSubjectId || p.subjectId === selectedSubjectId))
                .map((p) => (
                  <tr key={p.id} className="border-t border-slate-200">
                    <td className="p-2.5">{p.tp}</td>
                    <td className="p-2.5">{p.material}</td>
                    <td className="p-2.5 text-center font-bold">{p.jp} JP</td>
                    <td className="p-2.5">{p.assessmentType}</td>
                    <td className="p-2.5 text-right">
                      <button
                        onClick={() =>
                          setDb((prev) => ({ ...prev, prosemItems: prev.prosemItems.filter((item) => item.id !== p.id) }))
                        }
                        className="text-red-600 hover:underline"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {subTab === 'kktp' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900">Kriteria Ketercapaian Tujuan Pembelajaran (KKTP)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <select value={kktpForm.atpId} onChange={(e) => setKktpForm({ ...kktpForm, atpId: e.target.value })} className="border border-slate-300 rounded-xl px-3 py-2">
              <option value="">-- Ambil TP dari ATP --</option>
              {filteredAtp.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.tp}
                </option>
              ))}
            </select>
            <select value={kktpForm.method} onChange={(e) => setKktpForm({ ...kktpForm, method: e.target.value as KktpItem['method'] })} className="border border-slate-300 rounded-xl px-3 py-2">
              <option value="deskripsi_kriteria">Metode: Deskripsi Kriteria</option>
              <option value="rubrik">Metode: Rubrik Penilaian</option>
              <option value="interval">Metode: Interval Nilai</option>
              <option value="kustom">Metode: Kustom Guru</option>
            </select>
            <input value={kktpForm.assessmentMethod} onChange={(e) => setKktpForm({ ...kktpForm, assessmentMethod: e.target.value })} placeholder="Teknik Penilaian" className="border border-slate-300 rounded-xl px-3 py-2" />
            <input value={kktpForm.indicatorText} onChange={(e) => setKktpForm({ ...kktpForm, indicatorText: e.target.value })} placeholder="Indikator Ketercapaian *" className="md:col-span-2 border border-slate-300 rounded-xl px-3 py-2" />
            <button
              onClick={() => {
                const atp = db.atpItems.find((a) => a.id === kktpForm.atpId);
                if (!atp || !kktpForm.indicatorText.trim()) {
                  notify('error', 'Pilih TP dari ATP dan isi indikator ketercapaian.');
                  return;
                }
                setDb((prev) => ({
                  ...prev,
                  kktpItems: [
                    ...prev.kktpItems,
                    {
                      id: uid('kktp'),
                      academicYearId: prev.activeAcademicYearId,
                      semesterId: prev.activeSemesterId,
                      classId: atp.classId,
                      subjectId: atp.subjectId,
                      atpId: atp.id,
                      tpText: atp.tp,
                      method: kktpForm.method,
                      indicators: [{ id: uid('ind'), text: kktpForm.indicatorText.trim(), reached: false }],
                      minReachedCount: 1,
                      rubricRows: [],
                      intervals: [],
                      customScaleDescription: '',
                      achievementDescription: kktpForm.achievementDescription || kktpForm.indicatorText.trim(),
                      assessmentMethod: kktpForm.assessmentMethod,
                      followUpGeneral: 'Penguatan dan pendampingan belajar',
                      remedialPlan: kktpForm.remedialPlan,
                      enrichmentPlan: kktpForm.enrichmentPlan
                    }
                  ]
                }));
                setKktpForm({ ...kktpForm, indicatorText: '' });
                notify('success', 'KKTP berhasil disimpan.');
              }}
              className="px-4 py-2 rounded-xl bg-emerald-800 text-white font-semibold"
            >
              Simpan KKTP
            </button>
          </div>

          <table className="w-full text-xs border border-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-2.5 text-left">Tujuan Pembelajaran</th>
                <th className="p-2.5 text-left">Metode</th>
                <th className="p-2.5 text-left">Indikator</th>
                <th className="p-2.5 text-left">Tindak Lanjut (Remedial / Pengayaan)</th>
                <th className="p-2.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {db.kktpItems.map((k) => (
                <tr key={k.id} className="border-t border-slate-200">
                  <td className="p-2.5 font-semibold">{k.tpText}</td>
                  <td className="p-2.5">{k.method}</td>
                  <td className="p-2.5">{k.indicators.map((i) => i.text).join('; ')}</td>
                  <td className="p-2.5 text-[11px]">
                    R: {k.remedialPlan} | P: {k.enrichmentPlan}
                  </td>
                  <td className="p-2.5 text-right">
                    <button
                      onClick={() => setDb((prev) => ({ ...prev, kktpItems: prev.kktpItems.filter((item) => item.id !== k.id) }))}
                      className="text-red-600 hover:underline"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {subTab === 'modul' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-bold text-slate-900">Generator Modul Ajar & RPP (Pembelajaran Mendalam & KBC)</h3>
            <button
              type="button"
              onClick={generateDraftModulFromUserInputs}
              className="px-3 py-1.5 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 text-xs font-semibold"
            >
              Susun Draf Kerangka dari Data Guru
            </button>
          </div>

          {modulForm.isAiDraft && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-semibold">
              Penanda: Draf AI / Otomatis — perlu diperiksa dan disunting oleh guru sebelum dicetak atau disahkan.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <select
              value={modulForm.templateType}
              onChange={(e) => setModulForm({ ...modulForm, templateType: e.target.value as 'modul_ajar' | 'rpp_ringkas' })}
              className="border border-slate-300 rounded-xl px-3 py-2"
            >
              <option value="modul_ajar">Template: Modul Ajar Lengkap</option>
              <option value="rpp_ringkas">Template: RPP Ringkas</option>
            </select>
            <select
              value={modulForm.atpId}
              onChange={(e) => {
                const atp = db.atpItems.find((a) => a.id === e.target.value);
                setModulForm({
                  ...modulForm,
                  atpId: e.target.value,
                  cp: atp?.cp || modulForm.cp,
                  tp: atp?.tp || modulForm.tp,
                  material: atp?.material || modulForm.material,
                  jp: atp?.jp || modulForm.jp,
                  kbcSelected: atp?.integrasiKBC || modulForm.kbcSelected
                });
              }}
              className="border border-slate-300 rounded-xl px-3 py-2"
            >
              <option value="">-- Tarik dari ATP --</option>
              {filteredAtp.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.tp}
                </option>
              ))}
            </select>
            <input
              value={modulForm.material}
              onChange={(e) => setModulForm({ ...modulForm, material: e.target.value })}
              placeholder="Materi Pembelajaran *"
              className="border border-slate-300 rounded-xl px-3 py-2"
            />
            <textarea rows={2} value={modulForm.tp} onChange={(e) => setModulForm({ ...modulForm, tp: e.target.value })} placeholder="Tujuan Pembelajaran *" className="border border-slate-300 rounded-xl px-3 py-2" />
            <textarea rows={2} value={modulForm.openingActivity} onChange={(e) => setModulForm({ ...modulForm, openingActivity: e.target.value })} placeholder="Kegiatan Pendahuluan" className="border border-slate-300 rounded-xl px-3 py-2" />
            <textarea rows={2} value={modulForm.coreActivity} onChange={(e) => setModulForm({ ...modulForm, coreActivity: e.target.value })} placeholder="Kegiatan Inti (Memahami, Mengaplikasi, Merefleksi)" className="border border-slate-300 rounded-xl px-3 py-2" />
            <textarea rows={2} value={modulForm.closingActivity} onChange={(e) => setModulForm({ ...modulForm, closingActivity: e.target.value })} placeholder="Kegiatan Penutup" className="border border-slate-300 rounded-xl px-3 py-2" />
            <textarea rows={2} value={modulForm.differentiation} onChange={(e) => setModulForm({ ...modulForm, differentiation: e.target.value })} placeholder="Diferensiasi Pembelajaran" className="border border-slate-300 rounded-xl px-3 py-2" />
            <textarea rows={2} value={modulForm.formativeAssessment} onChange={(e) => setModulForm({ ...modulForm, formativeAssessment: e.target.value })} placeholder="Asesmen Formatif & Sumatif" className="border border-slate-300 rounded-xl px-3 py-2" />
          </div>

          <button
            onClick={() => {
              if (!selectedClassId || !selectedSubjectId || !modulForm.material.trim()) {
                notify('error', 'Pilih Kelas, Mata Pelajaran, dan isi Materi.');
                return;
              }
              setDb((prev) => ({
                ...prev,
                lessonPlans: [
                  ...prev.lessonPlans,
                  {
                    id: uid('mod'),
                    templateType: modulForm.templateType,
                    academicYearId: prev.activeAcademicYearId,
                    semesterId: prev.activeSemesterId,
                    classId: selectedClassId,
                    subjectId: selectedSubjectId,
                    atpId: modulForm.atpId,
                    phase: 'A',
                    material: modulForm.material,
                    jp: modulForm.jp,
                    meetingCount: modulForm.meetingCount,
                    cp: modulForm.cp,
                    tp: modulForm.tp,
                    kktpSummary: '',
                    dimensiProfilLulusan: [],
                    deepLearningPrinciples: ['Berkesadaran', 'Bermakna', 'Menggembirakan'],
                    deepLearningStages: modulForm.deepLearningStages,
                    kbcValues: modulForm.kbcSelected.map((v) => ({ value: v, integration: '' })),
                    meaningfulUnderstanding: modulForm.meaningfulUnderstanding,
                    triggerQuestions: modulForm.triggerQuestions,
                    openingActivity: modulForm.openingActivity,
                    coreActivity: modulForm.coreActivity,
                    closingActivity: modulForm.closingActivity,
                    differentiation: modulForm.differentiation,
                    initialAssessment: modulForm.initialAssessment,
                    formativeAssessment: modulForm.formativeAssessment,
                    summativeAssessment: modulForm.summativeAssessment,
                    rubricText: '',
                    remedialText: '',
                    enrichmentText: '',
                    media: modulForm.media,
                    learningResources: modulForm.learningResources,
                    teacherReflection: '',
                    studentReflection: '',
                    isAiDraft: modulForm.isAiDraft
                  }
                ]
              }));
              notify('success', 'Modul Ajar / RPP berhasil disimpan.');
            }}
            className="px-4 py-2 rounded-xl bg-emerald-800 text-white text-xs font-semibold"
          >
            Simpan Modul Ajar / RPP
          </button>

          <div className="space-y-2 pt-3 border-t border-slate-200">
            {db.lessonPlans.map((lp) => (
              <div key={lp.id} className="p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div>
                  <span className="font-bold text-emerald-900">{lp.material}</span> ({lp.templateType === 'modul_ajar' ? 'Modul Ajar' : 'RPP Ringkas'})
                  {lp.isAiDraft && <span className="ml-2 px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px]">Draf AI — perlu diperiksa guru</span>}
                  <div className="text-slate-500 mt-0.5">TP: {lp.tp || '-'}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const html = `
                        <p><b>Materi:</b> ${escapeXml(lp.material)} | <b>Alokasi:</b> ${lp.jp} JP</p>
                        <p><b>Tujuan Pembelajaran:</b> ${escapeXml(lp.tp)}</p>
                        <table>
                          <tr><th style="width:28%">Komponen</th><th>Uraian</th></tr>
                          <tr><td>Kegiatan Pendahuluan</td><td>${escapeXml(lp.openingActivity)}</td></tr>
                          <tr><td>Kegiatan Inti</td><td>${escapeXml(lp.coreActivity)}</td></tr>
                          <tr><td>Kegiatan Penutup</td><td>${escapeXml(lp.closingActivity)}</td></tr>
                          <tr><td>Diferensiasi</td><td>${escapeXml(lp.differentiation)}</td></tr>
                          <tr><td>Asesmen</td><td>${escapeXml(lp.formativeAssessment)}</td></tr>
                        </table>`;
                      openPrintPreview(lp.templateType === 'modul_ajar' ? 'MODUL AJAR' : 'RENCANA PELAKSANAAN PEMBELAJARAN (RPP)', html);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 text-white"
                  >
                    Cetak / PDF
                  </button>
                  <button
                    onClick={() => {
                      const html = `${buildKopHtml(db)}<h3 style="text-align:center;">MODUL AJAR / RPP</h3><p><b>Materi:</b> ${escapeXml(lp.material)}</p><p><b>Tujuan Pembelajaran:</b> ${escapeXml(lp.tp)}</p><p><b>Pendahuluan:</b><br/>${escapeXml(lp.openingActivity)}</p><p><b>Kegiatan Inti:</b><br/>${escapeXml(lp.coreActivity)}</p><p><b>Penutup:</b><br/>${escapeXml(lp.closingActivity)}</p>${buildSignatureBlockHtml(db)}`;
                      downloadWordDoc(`Modul_Ajar_${lp.material}`, html);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-blue-700 text-white"
                  >
                    Word (.doc)
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 9. MODUL PELAKSANAAN (JURNAL MENGAJAR & PRESENSI SISWA - TAHAP 6)
// ============================================================================

function PelaksanaanView({
  db,
  setDb,
  notify,
  askConfirm,
  exportToExcel,
  openPrintPreview
}: {
  db: AppDatabase;
  setDb: React.Dispatch<React.SetStateAction<AppDatabase>>;
  notify: (type: 'success' | 'error' | 'warning' | 'info', text: string) => void;
  askConfirm: (title: string, message: string, onConfirm: () => void) => void;
  exportToExcel: (filename: string, sheetName: string, rows: Record<string, unknown>[]) => void;
  openPrintPreview: (title: string, bodyHtml: string) => void;
}) {
  const [tab, setTab] = useState<'jurnal' | 'presensi'>('jurnal');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [period, setPeriod] = useState('1-2');
  const [classId, setClassId] = useState(db.classes[0]?.id || '');
  const [subjectId, setSubjectId] = useState(db.subjects[0]?.id || '');
  const [material, setMaterial] = useState('');
  const [tp, setTp] = useState('');
  const [activities, setActivities] = useState('');
  const [obstacles, setObstacles] = useState('');
  const [followUp, setFollowUp] = useState('');

  const [meetingNumber, setMeetingNumber] = useState(1);
  const [attRecords, setAttRecords] = useState<Record<string, string>>({});

  const classStudents = db.students.filter((s) => s.classId === classId);

  const markAllPresent = () => {
    const next: Record<string, string> = {};
    classStudents.forEach((s) => {
      next[s.id] = 'H';
    });
    setAttRecords(next);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
        <button
          onClick={() => setTab('jurnal')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold ${tab === 'jurnal' ? 'bg-emerald-800 text-white' : 'text-slate-600'}`}
        >
          A. Jurnal Mengajar
        </button>
        <button
          onClick={() => setTab('presensi')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold ${tab === 'presensi' ? 'bg-emerald-800 text-white' : 'text-slate-600'}`}
        >
          B. Presensi Siswa
        </button>
      </div>

      {tab === 'jurnal' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-bold text-slate-900">Jurnal Harian Mengajar Guru</h3>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  exportToExcel(
                    'Jurnal_Mengajar_MIN4',
                    'Jurnal Mengajar',
                    db.teachingJournals.map((j) => ({
                      Tanggal: j.date,
                      Hari: j.dayName,
                      'Jam Ke': j.period,
                      Kelas: db.classes.find((c) => c.id === j.classId)?.name || '',
                      'Mata Pelajaran': db.subjects.find((s) => s.id === j.subjectId)?.name || '',
                      Materi: j.material,
                      'Tujuan Pembelajaran': j.learningObjective,
                      Kegiatan: j.activities,
                      Kendala: j.obstacles,
                      'Tindak Lanjut': j.followUp
                    }))
                  )
                }
                className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold"
              >
                Export Excel
              </button>
              <button
                onClick={() => {
                  const rows = db.teachingJournals
                    .map(
                      (j) =>
                        `<tr><td>${j.date} (${j.dayName})</td><td>${escapeXml(j.period)}</td><td>${escapeXml(db.classes.find((c) => c.id === j.classId)?.name || '')}</td><td>${escapeXml(db.subjects.find((s) => s.id === j.subjectId)?.name || '')}</td><td>${escapeXml(j.material)}</td><td>${escapeXml(j.activities)}</td><td>${escapeXml(j.followUp)}</td></tr>`
                    )
                    .join('');
                  openPrintPreview(
                    'JURNAL PELAKSANAAN PEMBELAJARAN',
                    `<table><thead><tr><th>Tanggal</th><th>Jam</th><th>Kelas</th><th>Mapel</th><th>Materi</th><th>Kegiatan</th><th>Tindak Lanjut</th></tr></thead><tbody>${rows}</tbody></table>`
                  );
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 text-white text-xs font-semibold"
              >
                Cetak / PDF
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="border border-slate-300 rounded-xl px-3 py-2" />
            <input value={period} onChange={(e) => setPeriod(e.target.value)} placeholder="Jam ke- (misal: 1-2)" className="border border-slate-300 rounded-xl px-3 py-2" />
            <select value={classId} onChange={(e) => setClassId(e.target.value)} className="border border-slate-300 rounded-xl px-3 py-2">
              <option value="">-- Pilih Kelas --</option>
              {db.classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className="border border-slate-300 rounded-xl px-3 py-2">
              <option value="">-- Pilih Mapel --</option>
              {db.subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <input value={material} onChange={(e) => setMaterial(e.target.value)} placeholder="Materi Pokok *" className="md:col-span-2 border border-slate-300 rounded-xl px-3 py-2" />
            <input value={tp} onChange={(e) => setTp(e.target.value)} placeholder="Tujuan Pembelajaran" className="md:col-span-2 border border-slate-300 rounded-xl px-3 py-2" />
            <textarea rows={2} value={activities} onChange={(e) => setActivities(e.target.value)} placeholder="Ringkasan Kegiatan Pembelajaran *" className="md:col-span-2 border border-slate-300 rounded-xl px-3 py-2" />
            <input value={obstacles} onChange={(e) => setObstacles(e.target.value)} placeholder="Kendala (jika ada)" className="border border-slate-300 rounded-xl px-3 py-2" />
            <input value={followUp} onChange={(e) => setFollowUp(e.target.value)} placeholder="Tindak Lanjut" className="border border-slate-300 rounded-xl px-3 py-2" />
          </div>

          <button
            onClick={() => {
              if (!classId || !subjectId || !material.trim()) {
                notify('error', 'Pilih Kelas, Mapel, dan isi Materi.');
                return;
              }
              const dayName = new Date(`${date}T00:00:00`).toLocaleDateString('id-ID', { weekday: 'long' });
              setDb((prev) => ({
                ...prev,
                teachingJournals: [
                  {
                    id: uid('jrn'),
                    academicYearId: prev.activeAcademicYearId,
                    semesterId: prev.activeSemesterId,
                    date,
                    dayName,
                    period,
                    classId,
                    subjectId,
                    material: material.trim(),
                    learningObjective: tp,
                    activities,
                    notes: '',
                    obstacles,
                    followUp
                  },
                  ...prev.teachingJournals
                ]
              }));
              setMaterial('');
              setActivities('');
              notify('success', 'Jurnal mengajar disimpan.');
            }}
            className="px-4 py-2 rounded-xl bg-emerald-800 text-white text-xs font-semibold"
          >
            Simpan Jurnal Mengajar
          </button>

          <table className="w-full text-xs border border-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-2.5 text-left">Tanggal / Jam</th>
                <th className="p-2.5 text-left">Kelas & Mapel</th>
                <th className="p-2.5 text-left">Materi & Kegiatan</th>
                <th className="p-2.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {db.teachingJournals.map((j) => (
                <tr key={j.id} className="border-t border-slate-200">
                  <td className="p-2.5">
                    {j.date} ({j.dayName}) • Jam {j.period}
                  </td>
                  <td className="p-2.5 font-semibold">
                    {db.classes.find((c) => c.id === j.classId)?.name || '-'} —{' '}
                    {db.subjects.find((s) => s.id === j.subjectId)?.name || '-'}
                  </td>
                  <td className="p-2.5">
                    <b>{j.material}</b>: {j.activities}
                  </td>
                  <td className="p-2.5 text-right">
                    <button
                      onClick={() =>
                        askConfirm('Hapus Jurnal', 'Hapus catatan jurnal ini?', () =>
                          setDb((prev) => ({ ...prev, teachingJournals: prev.teachingJournals.filter((item) => item.id !== j.id) }))
                        )
                      }
                      className="text-red-600 hover:underline"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'presensi' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-bold text-slate-900">Input Cepat Presensi Siswa</h3>
            <button onClick={markAllPresent} className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-semibold">
              Tandai Semua Hadir (H)
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="border border-slate-300 rounded-xl px-3 py-2" />
            <select value={classId} onChange={(e) => setClassId(e.target.value)} className="border border-slate-300 rounded-xl px-3 py-2">
              <option value="">-- Pilih Kelas --</option>
              {db.classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className="border border-slate-300 rounded-xl px-3 py-2">
              <option value="">-- Pilih Mapel --</option>
              {db.subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <input type="number" min={1} value={meetingNumber} onChange={(e) => setMeetingNumber(Number(e.target.value) || 1)} placeholder="Pertemuan Ke-" className="border border-slate-300 rounded-xl px-3 py-2" />
          </div>

          <table className="w-full text-xs border border-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-2.5 text-left">NIS</th>
                <th className="p-2.5 text-left">Nama Siswa</th>
                <th className="p-2.5 text-left">Status Kehadiran</th>
              </tr>
            </thead>
            <tbody>
              {classStudents.map((s) => (
                <tr key={s.id} className="border-t border-slate-200">
                  <td className="p-2.5">{s.nis}</td>
                  <td className="p-2.5 font-semibold">{s.name}</td>
                  <td className="p-2.5 flex gap-1.5">
                    {[
                      { code: 'H', label: 'Hadir' },
                      { code: 'S', label: 'Sakit' },
                      { code: 'I', label: 'Izin' },
                      { code: 'A', label: 'Alpa' }
                    ].map((st) => (
                      <button
                        key={st.code}
                        onClick={() => setAttRecords({ ...attRecords, [s.id]: st.code })}
                        className={`px-2.5 py-1 rounded-lg font-semibold ${
                          (attRecords[s.id] || 'H') === st.code ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </td>
                </tr>
              ))}
              {classStudents.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-4 text-center text-slate-400">
                    Belum ada siswa pada kelas yang dipilih.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <button
            onClick={() => {
              if (!classId || classStudents.length === 0) {
                notify('error', 'Pilih kelas yang memiliki data siswa.');
                return;
              }
              const finalized: Record<string, string> = {};
              classStudents.forEach((s) => {
                finalized[s.id] = attRecords[s.id] || 'H';
              });
              setDb((prev) => ({
                ...prev,
                attendanceSessions: [
                  {
                    id: uid('att'),
                    academicYearId: prev.activeAcademicYearId,
                    semesterId: prev.activeSemesterId,
                    date,
                    classId,
                    subjectId,
                    meetingNumber,
                    records: finalized,
                    notes: ''
                  },
                  ...prev.attendanceSessions
                ]
              }));
              notify('success', `Presensi pertemuan ke-${meetingNumber} tersimpan.`);
            }}
            className="px-4 py-2 rounded-xl bg-emerald-800 text-white text-xs font-semibold"
          >
            Simpan Presensi
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 10. MODUL ASESMEN, BUKU NILAI, ANALISIS & REMEDIAL/PENGAYAAN (TAHAP 7 & 8)
// ============================================================================

function AsesmenAnalisisView({
  db,
  setDb,
  notify,
  exportToExcel,
  openPrintPreview
}: {
  db: AppDatabase;
  setDb: React.Dispatch<React.SetStateAction<AppDatabase>>;
  notify: (type: 'success' | 'error' | 'warning' | 'info', text: string) => void;
  exportToExcel: (filename: string, sheetName: string, rows: Record<string, unknown>[]) => void;
  openPrintPreview: (title: string, bodyHtml: string) => void;
}) {
  const [tab, setTab] = useState<'nilai' | 'analisis' | 'remedial'>('nilai');
  const [title, setTitle] = useState('');
  const [classId, setClassId] = useState(db.classes[0]?.id || '');
  const [subjectId, setSubjectId] = useState(db.subjects[0]?.id || '');
  const [typeId, setTypeId] = useState(db.assessmentTypes[0]?.id || 'at_form');
  const [maxScore, setMaxScore] = useState(100);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState('');

  const activeAssessment = db.assessments.find((a) => a.id === selectedAssessmentId) || db.assessments[0];
  const assessmentStudents = db.students.filter((s) => s.classId === (activeAssessment?.classId || classId));

  return (
    <div className="space-y-6">
      <div className="flex gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
        <button onClick={() => setTab('nilai')} className={`px-4 py-2 rounded-xl text-xs font-semibold ${tab === 'nilai' ? 'bg-emerald-800 text-white' : 'text-slate-600'}`}>
          A. Buku Nilai & Input Skor
        </button>
        <button onClick={() => setTab('analisis')} className={`px-4 py-2 rounded-xl text-xs font-semibold ${tab === 'analisis' ? 'bg-emerald-800 text-white' : 'text-slate-600'}`}>
          B. Analisis Hasil Penilaian
        </button>
        <button onClick={() => setTab('remedial')} className={`px-4 py-2 rounded-xl text-xs font-semibold ${tab === 'remedial' ? 'bg-emerald-800 text-white' : 'text-slate-600'}`}>
          C. Remedial & Pengayaan
        </button>
      </div>

      {tab === 'nilai' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <h3 className="font-bold text-slate-900">Buat Instrumen Asesmen Baru</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nama Asesmen (misal: Sumatif Bab 1) *" className="border border-slate-300 rounded-xl px-3 py-2" />
            <select value={classId} onChange={(e) => setClassId(e.target.value)} className="border border-slate-300 rounded-xl px-3 py-2">
              <option value="">-- Kelas --</option>
              {db.classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className="border border-slate-300 rounded-xl px-3 py-2">
              <option value="">-- Mapel --</option>
              {db.subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <select value={typeId} onChange={(e) => setTypeId(e.target.value)} className="border border-slate-300 rounded-xl px-3 py-2">
              {db.assessmentTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                if (!title.trim() || !classId || !subjectId) {
                  notify('error', 'Lengkapi Nama Asesmen, Kelas, dan Mata Pelajaran.');
                  return;
                }
                const id = uid('asm');
                setDb((prev) => ({
                  ...prev,
                  assessments: [
                    {
                      id,
                      academicYearId: prev.activeAcademicYearId,
                      semesterId: prev.activeSemesterId,
                      classId,
                      subjectId,
                      title: title.trim(),
                      assessmentTypeId: typeId,
                      material: title.trim(),
                      date: new Date().toISOString().slice(0, 10),
                      maxScore,
                      weight: 1,
                      notes: '',
                      entries: {}
                    },
                    ...prev.assessments
                  ]
                }));
                setSelectedAssessmentId(id);
                setTitle('');
                notify('success', 'Instrumen asesmen dibuat.');
              }}
              className="px-4 py-2 rounded-xl bg-emerald-800 text-white font-semibold"
            >
              Buat Asesmen
            </button>
          </div>

          {db.assessments.length > 0 && activeAssessment && (
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <select
                  value={activeAssessment.id}
                  onChange={(e) => setSelectedAssessmentId(e.target.value)}
                  className="border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                >
                  {db.assessments.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.title} ({db.classes.find((c) => c.id === a.classId)?.name || '-'})
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      exportToExcel(
                        `Nilai_${activeAssessment.title}`,
                        'Buku Nilai',
                        assessmentStudents.map((s, idx) => ({
                          No: idx + 1,
                          NIS: s.nis,
                          'Nama Siswa': s.name,
                          Nilai: activeAssessment.entries[s.id]?.rawScore ?? '',
                          Catatan: activeAssessment.entries[s.id]?.notes ?? ''
                        }))
                      )
                    }
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold"
                  >
                    Export Excel
                  </button>
                  <button
                    onClick={() => {
                      const rows = assessmentStudents
                        .map(
                          (s, i) =>
                            `<tr><td>${i + 1}</td><td>${escapeXml(s.nis)}</td><td>${escapeXml(s.name)}</td><td style="text-align:center">${activeAssessment.entries[s.id]?.rawScore ?? '-'}</td><td>${escapeXml(activeAssessment.entries[s.id]?.notes || '')}</td></tr>`
                        )
                        .join('');
                      openPrintPreview(
                        `DAFTAR NILAI: ${activeAssessment.title.toUpperCase()}`,
                        `<table><thead><tr><th>No</th><th>NIS</th><th>Nama Siswa</th><th>Nilai</th><th>Catatan</th></tr></thead><tbody>${rows}</tbody></table>`
                      );
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 text-white text-xs font-semibold"
                  >
                    Cetak / PDF
                  </button>
                </div>
              </div>

              <table className="w-full text-xs border border-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="p-2.5 text-left">No</th>
                    <th className="p-2.5 text-left">Nama Siswa</th>
                    <th className="p-2.5 text-center">Nilai (Maks {activeAssessment.maxScore})</th>
                    <th className="p-2.5 text-left">Catatan Guru</th>
                  </tr>
                </thead>
                <tbody>
                  {assessmentStudents.map((s, idx) => {
                    const entry = activeAssessment.entries[s.id] || { rawScore: null, notes: '' };
                    return (
                      <tr key={s.id} className="border-t border-slate-200">
                        <td className="p-2.5">{idx + 1}</td>
                        <td className="p-2.5 font-semibold">{s.name}</td>
                        <td className="p-2.5 text-center">
                          <input
                            type="number"
                            min={0}
                            max={activeAssessment.maxScore}
                            value={entry.rawScore ?? ''}
                            onChange={(e) => {
                              const val = e.target.value === '' ? null : Number(e.target.value);
                              setDb((prev) => ({
                                ...prev,
                                assessments: prev.assessments.map((asm) =>
                                  asm.id === activeAssessment.id
                                    ? {
                                        ...asm,
                                        entries: {
                                          ...asm.entries,
                                          [s.id]: { ...entry, rawScore: val }
                                        }
                                      }
                                    : asm
                                )
                              }));
                            }}
                            className="w-20 border border-slate-300 rounded-lg px-2 py-1 text-center font-bold"
                          />
                        </td>
                        <td className="p-2.5">
                          <input
                            value={entry.notes}
                            onChange={(e) => {
                              const txt = e.target.value;
                              setDb((prev) => ({
                                ...prev,
                                assessments: prev.assessments.map((asm) =>
                                  asm.id === activeAssessment.id
                                    ? {
                                        ...asm,
                                        entries: {
                                          ...asm.entries,
                                          [s.id]: { ...entry, notes: txt }
                                        }
                                      }
                                    : asm
                                )
                              }));
                            }}
                            placeholder="Catatan deskriptif..."
                            className="w-full border border-slate-300 rounded-lg px-2.5 py-1"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'analisis' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900">Analisis Nilai Asli & Sebaran Capaian</h3>
          {db.assessments.length === 0 ? (
            <p className="text-xs text-slate-400">Belum ada data asesmen untuk dianalisis.</p>
          ) : (
            <div className="space-y-4">
              {db.assessments.map((asm) => {
                const scores = Object.values(asm.entries)
                  .map((e) => e.rawScore)
                  .filter((v): v is number => typeof v === 'number');
                const avg = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : '-';
                const max = scores.length > 0 ? Math.max(...scores) : '-';
                const min = scores.length > 0 ? Math.min(...scores) : '-';
                return (
                  <div key={asm.id} className="p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{asm.title}</div>
                      <div className="text-slate-500">
                        Peserta Dinilai: {scores.length} siswa • Rata-rata: <b>{avg}</b> • Tertinggi: <b>{max}</b> • Terendah: <b>{min}</b>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === 'remedial' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900">Program Remedial & Pengayaan</h3>
          <p className="text-xs text-slate-500">
            Catatan program tindak lanjut berbasis hasil asesmen aktual peserta didik.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200">
              <div className="font-bold text-amber-900 mb-1">Tercatat pada Program Remedial</div>
              <div className="text-xl font-extrabold text-amber-950">{db.remedialRecords.length} Siswa</div>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200">
              <div className="font-bold text-emerald-900 mb-1">Tercatat pada Program Pengayaan</div>
              <div className="text-xl font-extrabold text-emerald-950">{db.enrichmentRecords.length} Siswa</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 11. MODUL BANK SOAL, BAHAN AJAR, KEPEGAWAIAN, JADWAL, SKP, PKB, WALI KELAS, ARSIP
// ============================================================================

function SecondaryModulesView({
  activeMenu,
  db,
  setDb,
  notify,
  askConfirm,
  exportToExcel,
  openPrintPreview
}: {
  activeMenu: string;
  db: AppDatabase;
  setDb: React.Dispatch<React.SetStateAction<AppDatabase>>;
  notify: (type: 'success' | 'error' | 'warning' | 'info', text: string) => void;
  askConfirm: (title: string, message: string, onConfirm: () => void) => void;
  exportToExcel: (filename: string, sheetName: string, rows: Record<string, unknown>[]) => void;
  openPrintPreview: (title: string, bodyHtml: string) => void;
}) {
  // Bank Soal state
  const [qText, setQText] = useState('');
  const [qType, setQType] = useState<BankQuestionItem['questionType']>('Pilihan Ganda');
  const [qLevel, setQLevel] = useState<'L1' | 'L2' | 'L3'>('L2');
  const [qKey, setQKey] = useState('');
  const [qIndicator, setQIndicator] = useState('');

  // Bahan Ajar state
  const [matTitle, setMatTitle] = useState('');
  const [matCat, setMatCat] = useState(MATERIAL_CATEGORIES[0]);
  const [matUrl, setMatUrl] = useState('');
  const [matFile, setMatFile] = useState<{ name: string; mime: string; size: number; dataUrl: string } | null>(null);

  // SK Pembagian Tugas state
  const [skNumber, setSkNumber] = useState('');
  const [skDate, setSkDate] = useState(new Date().toISOString().slice(0, 10));
  const [skDuty, setSkDuty] = useState('Guru Kelas / Guru Mata Pelajaran');
  const [skJp, setSkJp] = useState(24);
  const [skStatus, setSkStatus] = useState<'DRAF' | 'DITETAPKAN'>('DRAF');

  // Jadwal & Inventaris state
  const [schDay, setSchDay] = useState('Senin');
  const [schPeriod, setSchPeriod] = useState('1-2');
  const [schClassId, setSchClassId] = useState(db.classes[0]?.id || '');
  const [schSubjectId, setSchSubjectId] = useState(db.subjects[0]?.id || '');
  const [schRoom, setSchRoom] = useState('Ruang Kelas');

  const [invCode, setInvCode] = useState('');
  const [invName, setInvName] = useState('');
  const [invQty, setInvQty] = useState(1);
  const [invCond, setInvCond] = useState<'Baik' | 'Rusak Ringan' | 'Rusak Berat'>('Baik');

  // SKP & PKB state
  const [skpTarget, setSkpTarget] = useState('');
  const [skpActivity, setSkpActivity] = useState('');
  const [skpRealization, setSkpRealization] = useState('');

  const [pkbName, setPkbName] = useState('');
  const [pkbCat, setPkbCat] = useState(PKB_CATEGORIES[0]);
  const [pkbOrg, setPkbOrg] = useState('');
  const [pkbHours, setPkbHours] = useState<string>('');
  const [pkbCertNo, setPkbCertNo] = useState('');

  // Wali Kelas state
  const [wkTab, setWkTab] = useState<'induk' | 'denah' | 'organisasi' | 'bimbingan' | 'mutasi' | 'rapor'>('induk');
  const [pinInput, setPinInput] = useState('');
  const [guidanceUnlocked, setGuidanceUnlocked] = useState(false);
  const [guidStudentId, setGuidStudentId] = useState('');
  const [guidDev, setGuidDev] = useState('');
  const [guidFollowUp, setGuidFollowUp] = useState('');
  const [seatRows, setSeatRows] = useState(4);
  const [seatCols, setSeatCols] = useState(6);
  const [orgRole, setOrgRole] = useState('Ketua Kelas');
  const [orgStudentId, setOrgStudentId] = useState('');
  const [mutType, setMutType] = useState<'Masuk' | 'Keluar'>('Masuk');
  const [mutName, setMutName] = useState('');
  const [mutNis, setMutNis] = useState('');
  const [mutSchool, setMutSchool] = useState('');
  const [mutReason, setMutReason] = useState('');

  // Arsip Terpusat state
  const [archiveGroupFilter, setArchiveGroupFilter] = useState('');
  const [archiveSearch, setArchiveSearch] = useState('');
  const [newArcGroup, setNewArcGroup] = useState(ARCHIVE_GROUPS[0]);
  const [newArcTitle, setNewArcTitle] = useState('');
  const [newArcFile, setNewArcFile] = useState<{ name: string; mime: string; dataUrl: string } | null>(null);

  if (activeMenu === 'bank_soal') {
    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-bold text-slate-900">Bank Soal & Kisi-Kisi (7 Bentuk Soal)</h3>
          <button
            onClick={() => {
              const rows = db.questionBank
                .map(
                  (q, i) =>
                    `<tr><td>${i + 1}</td><td>${escapeXml(q.indicator)}</td><td>${q.cognitiveLevel}</td><td>${escapeXml(q.questionType)}</td><td>${escapeXml(q.questionText)}</td><td>${escapeXml(q.answerKey)}</td></tr>`
                )
                .join('');
              openPrintPreview(
                'KISI-KISI & BANK SOAL',
                `<table><thead><tr><th>No</th><th>Indikator Soal</th><th>Level</th><th>Bentuk</th><th>Butir Soal</th><th>Kunci</th></tr></thead><tbody>${rows}</tbody></table>`
              );
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-800 text-white text-xs font-semibold"
          >
            Cetak Kisi-Kisi & Kartu Soal
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <input value={qIndicator} onChange={(e) => setQIndicator(e.target.value)} placeholder="Indikator Soal" className="border border-slate-300 rounded-xl px-3 py-2" />
          <select value={qType} onChange={(e) => setQType(e.target.value as BankQuestionItem['questionType'])} className="border border-slate-300 rounded-xl px-3 py-2">
            {['Pilihan Ganda', 'Pilihan Ganda Kompleks', 'Benar-Salah', 'Tepat-Tidak Tepat', 'Menjodohkan', 'Isian', 'Uraian'].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <select value={qLevel} onChange={(e) => setQLevel(e.target.value as 'L1' | 'L2' | 'L3')} className="border border-slate-300 rounded-xl px-3 py-2">
            <option value="L1">L1 (Pemahaman)</option>
            <option value="L2">L2 (Aplikasi)</option>
            <option value="L3">L3 (Penalaran / HOTS)</option>
          </select>
          <textarea rows={2} value={qText} onChange={(e) => setQText(e.target.value)} placeholder="Teks Butir Soal *" className="md:col-span-2 border border-slate-300 rounded-xl px-3 py-2" />
          <input value={qKey} onChange={(e) => setQKey(e.target.value)} placeholder="Kunci Jawaban / Pedoman Skor *" className="border border-slate-300 rounded-xl px-3 py-2" />
        </div>
        <button
          onClick={() => {
            if (!qText.trim()) {
              notify('error', 'Teks soal wajib diisi.');
              return;
            }
            setDb((prev) => ({
              ...prev,
              questionBank: [
                ...prev.questionBank,
                {
                  id: uid('q'),
                  academicYearId: prev.activeAcademicYearId,
                  semesterId: prev.activeSemesterId,
                  classId: prev.classes[0]?.id || '',
                  subjectId: prev.subjects[0]?.id || '',
                  category: 'Sumatif',
                  material: '',
                  learningObjective: '',
                  indicator: qIndicator,
                  cognitiveLevel: qLevel,
                  questionType: qType,
                  questionNumber: prev.questionBank.length + 1,
                  score: 10,
                  questionText: qText.trim(),
                  options: [],
                  answerKey: qKey,
                  scoringRubric: qKey,
                  notes: ''
                }
              ]
            }));
            setQText('');
            setQKey('');
            notify('success', 'Butir soal ditambahkan ke Bank Soal.');
          }}
          className="px-4 py-2 rounded-xl bg-emerald-800 text-white text-xs font-semibold"
        >
          Simpan ke Bank Soal
        </button>

        <table className="w-full text-xs border border-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-2.5 text-left">No</th>
              <th className="p-2.5 text-left">Bentuk & Level</th>
              <th className="p-2.5 text-left">Butir Soal</th>
              <th className="p-2.5 text-left">Kunci</th>
              <th className="p-2.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {db.questionBank.map((q, idx) => (
              <tr key={q.id} className="border-t border-slate-200">
                <td className="p-2.5">{idx + 1}</td>
                <td className="p-2.5">
                  {q.questionType} ({q.cognitiveLevel})
                </td>
                <td className="p-2.5">{q.questionText}</td>
                <td className="p-2.5 font-semibold">{q.answerKey}</td>
                <td className="p-2.5 text-right">
                  <button
                    onClick={() => setDb((prev) => ({ ...prev, questionBank: prev.questionBank.filter((item) => item.id !== q.id) }))}
                    className="text-red-600 hover:underline"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (activeMenu === 'bahan_ajar') {
    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
        <h3 className="font-bold text-slate-900">Pengelolaan Bahan Ajar & Media Pembelajaran (12 Kategori)</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <input value={matTitle} onChange={(e) => setMatTitle(e.target.value)} placeholder="Judul Bahan Ajar *" className="border border-slate-300 rounded-xl px-3 py-2" />
          <select value={matCat} onChange={(e) => setMatCat(e.target.value)} className="border border-slate-300 rounded-xl px-3 py-2">
            {MATERIAL_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input value={matUrl} onChange={(e) => setMatUrl(e.target.value)} placeholder="Tautan URL / YouTube (opsional)" className="border border-slate-300 rounded-xl px-3 py-2" />
          <input
            type="file"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              if (f.size > 2 * 1024 * 1024) {
                notify('warning', 'Ukuran file lokal dibatasi maksimal 2 MB.');
                return;
              }
              const r = new FileReader();
              r.onload = () => setMatFile({ name: f.name, mime: f.type, size: f.size, dataUrl: String(r.result || '') });
              r.readAsDataURL(f);
            }}
            className="border border-slate-300 rounded-xl px-2 py-1.5"
          />
        </div>
        <button
          onClick={() => {
            if (!matTitle.trim()) {
              notify('error', 'Judul bahan ajar wajib diisi.');
              return;
            }
            setDb((prev) => ({
              ...prev,
              teachingMaterials: [
                ...prev.teachingMaterials,
                {
                  id: uid('mat'),
                  academicYearId: prev.activeAcademicYearId,
                  semesterId: prev.activeSemesterId,
                  classId: prev.classes[0]?.id || '',
                  subjectId: prev.subjects[0]?.id || '',
                  title: matTitle.trim(),
                  category: matCat,
                  material: matTitle.trim(),
                  learningObjective: '',
                  date: new Date().toISOString().slice(0, 10),
                  source: 'Guru MIN 4 Magelang',
                  externalUrl: matUrl.trim(),
                  fileName: matFile?.name || '',
                  fileMimeType: matFile?.mime || '',
                  fileSize: matFile?.size || 0,
                  fileDataUrl: matFile?.dataUrl || '',
                  notes: '',
                  isArchived: false
                }
              ]
            }));
            setMatTitle('');
            setMatUrl('');
            setMatFile(null);
            notify('success', 'Bahan ajar berhasil disimpan.');
          }}
          className="px-4 py-2 rounded-xl bg-emerald-800 text-white text-xs font-semibold"
        >
          Simpan Bahan Ajar
        </button>

        <table className="w-full text-xs border border-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-2.5 text-left">Judul</th>
              <th className="p-2.5 text-left">Kategori</th>
              <th className="p-2.5 text-left">Berkas / Tautan</th>
              <th className="p-2.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {db.teachingMaterials.map((m) => (
              <tr key={m.id} className="border-t border-slate-200">
                <td className="p-2.5 font-semibold">{m.title}</td>
                <td className="p-2.5">{m.category}</td>
                <td className="p-2.5 space-x-2">
                  {m.fileDataUrl && (
                    <a href={m.fileDataUrl} download={m.fileName} className="text-emerald-700 underline">
                      Unduh ({m.fileName})
                    </a>
                  )}
                  {m.externalUrl && (
                    <a href={m.externalUrl} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">
                      Buka Link
                    </a>
                  )}
                </td>
                <td className="p-2.5 text-right">
                  <button
                    onClick={() => setDb((prev) => ({ ...prev, teachingMaterials: prev.teachingMaterials.filter((item) => item.id !== m.id) }))}
                    className="text-red-600 hover:underline"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (activeMenu === 'kepegawaian') {
    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
        <h3 className="font-bold text-slate-900">Administrasi Kepegawaian & Generator SK Pembagian Tugas</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
          <input value={skNumber} onChange={(e) => setSkNumber(e.target.value)} placeholder="Nomor SK (kosongkan jika draf)" className="border border-slate-300 rounded-xl px-3 py-2" />
          <input type="date" value={skDate} onChange={(e) => setSkDate(e.target.value)} className="border border-slate-300 rounded-xl px-3 py-2" />
          <input value={skDuty} onChange={(e) => setSkDuty(e.target.value)} placeholder="Uraian Tugas" className="border border-slate-300 rounded-xl px-3 py-2" />
          <input type="number" min={1} value={skJp} onChange={(e) => setSkJp(Number(e.target.value) || 24)} placeholder="Total JP" className="border border-slate-300 rounded-xl px-3 py-2" />
          <select value={skStatus} onChange={(e) => setSkStatus(e.target.value as 'DRAF' | 'DITETAPKAN')} className="border border-slate-300 rounded-xl px-3 py-2">
            <option value="DRAF">Status: DRAF</option>
            <option value="DITETAPKAN">Status: DITETAPKAN</option>
          </select>
        </div>
        <button
          onClick={() => {
            setDb((prev) => ({
              ...prev,
              skPembagianTugas: [
                ...prev.skPembagianTugas,
                {
                  id: uid('sk'),
                  academicYearId: prev.activeAcademicYearId,
                  semesterId: prev.activeSemesterId,
                  skNumber: skNumber.trim() || 'BELUM BERNOMOR (DRAF)',
                  skDate,
                  skType: 'SK Pembagian Tugas Mengajar & Tugas Tambahan',
                  headmasterName: prev.madrasah.headmaster,
                  teacherName: prev.teacher.name,
                  mainDuty: skDuty,
                  subjectSummary: prev.teacher.subjectsTaught,
                  classSummary: prev.classes.map((c) => c.name).join(', '),
                  totalJp: skJp,
                  additionalDuties: prev.teacher.additionalDuties,
                  notes: '',
                  status: skStatus
                }
              ]
            }));
            notify('success', 'Data SK Pembagian Tugas disimpan.');
          }}
          className="px-4 py-2 rounded-xl bg-emerald-800 text-white text-xs font-semibold"
        >
          Simpan SK Pembagian Tugas
        </button>

        <table className="w-full text-xs border border-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-2.5 text-left">Nomor & Tanggal SK</th>
              <th className="p-2.5 text-left">Guru & Tugas</th>
              <th className="p-2.5 text-center">Beban JP</th>
              <th className="p-2.5 text-left">Status</th>
              <th className="p-2.5 text-right">Dokumen</th>
            </tr>
          </thead>
          <tbody>
            {db.skPembagianTugas.map((sk) => (
              <tr key={sk.id} className="border-t border-slate-200">
                <td className="p-2.5 font-semibold">
                  {sk.skNumber} ({sk.skDate})
                </td>
                <td className="p-2.5">
                  {sk.teacherName || db.teacher.name || '-'} — {sk.mainDuty}
                </td>
                <td className="p-2.5 text-center font-bold">{sk.totalJp} JP</td>
                <td className="p-2.5">
                  <span className={`px-2 py-0.5 rounded-full font-bold ${sk.status === 'DITETAPKAN' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {sk.status}
                  </span>
                </td>
                <td className="p-2.5 text-right space-x-2">
                  <button
                    onClick={() => {
                      const draftBanner =
                        sk.status === 'DRAF'
                          ? `<div style="border:2px solid #b45309;color:#b45309;padding:6px;text-align:center;font-weight:bold;margin-bottom:10px;">DOKUMEN STATUS DRAF — BELUM DITETAPKAN</div>`
                          : '';
                      openPrintPreview(
                        `SURAT KEPUTUSAN PEMBAGIAN TUGAS (${sk.status})`,
                        `${draftBanner}<p style="text-align:center;"><b>Nomor: ${escapeXml(sk.skNumber)}</b></p>
                        <p>Kepala ${escapeXml(db.madrasah.name || 'MIN 4 Magelang')} menetapkan pembagian tugas kepada:</p>
                        <table>
                          <tr><th style="width:30%">Nama Guru</th><td>${escapeXml(sk.teacherName || db.teacher.name || '-')}</td></tr>
                          <tr><th>NIP</th><td>${escapeXml(db.teacher.nip || '-')}</td></tr>
                          <tr><th>Tugas Pokok</th><td>${escapeXml(sk.mainDuty)}</td></tr>
                          <tr><th>Kelas / Rombel</th><td>${escapeXml(sk.classSummary || '-')}</td></tr>
                          <tr><th>Beban Mengajar</th><td>${sk.totalJp} Jam Pelajaran</td></tr>
                          <tr><th>Tugas Tambahan</th><td>${escapeXml(sk.additionalDuties || '-')}</td></tr>
                        </table>`
                      );
                    }}
                    className="text-emerald-800 font-semibold underline"
                  >
                    Cetak SK
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (activeMenu === 'jadwal_inventaris') {
    const hasConflict = db.teachingSchedules.some(
      (s) => s.dayName === schDay && s.period === schPeriod && (s.classId === schClassId || s.room === schRoom)
    );
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900">Jadwal Pelajaran & Deteksi Benturan</h3>
          {hasConflict && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-semibold">
              Peringatan Benturan: Slot hari {schDay} jam ke-{schPeriod} sudah terisi untuk kelas atau ruang tersebut!
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
            <select value={schDay} onChange={(e) => setSchDay(e.target.value)} className="border border-slate-300 rounded-xl px-3 py-2">
              {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <input value={schPeriod} onChange={(e) => setSchPeriod(e.target.value)} placeholder="Jam ke- (1-2)" className="border border-slate-300 rounded-xl px-3 py-2" />
            <select value={schClassId} onChange={(e) => setSchClassId(e.target.value)} className="border border-slate-300 rounded-xl px-3 py-2">
              <option value="">-- Kelas --</option>
              {db.classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select value={schSubjectId} onChange={(e) => setSchSubjectId(e.target.value)} className="border border-slate-300 rounded-xl px-3 py-2">
              <option value="">-- Mapel --</option>
              {db.subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                if (!schClassId || !schSubjectId) {
                  notify('error', 'Pilih Kelas dan Mata Pelajaran.');
                  return;
                }
                setDb((prev) => ({
                  ...prev,
                  teachingSchedules: [
                    ...prev.teachingSchedules,
                    {
                      id: uid('sch'),
                      academicYearId: prev.activeAcademicYearId,
                      semesterId: prev.activeSemesterId,
                      dayName: schDay,
                      period: schPeriod,
                      startTime: '',
                      endTime: '',
                      classId: schClassId,
                      subjectId: schSubjectId,
                      teacherName: prev.teacher.name,
                      room: schRoom
                    }
                  ]
                }));
                notify('success', 'Slot jadwal ditambahkan.');
              }}
              className="px-4 py-2 rounded-xl bg-emerald-800 text-white font-semibold"
            >
              Tambah Jadwal
            </button>
          </div>
          <table className="w-full text-xs border border-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-2.5 text-left">Hari</th>
                <th className="p-2.5 text-left">Jam</th>
                <th className="p-2.5 text-left">Kelas</th>
                <th className="p-2.5 text-left">Mata Pelajaran</th>
                <th className="p-2.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {db.teachingSchedules.map((s) => (
                <tr key={s.id} className="border-t border-slate-200">
                  <td className="p-2.5 font-semibold">{s.dayName}</td>
                  <td className="p-2.5">{s.period}</td>
                  <td className="p-2.5">{db.classes.find((c) => c.id === s.classId)?.name || '-'}</td>
                  <td className="p-2.5">{db.subjects.find((sub) => sub.id === s.subjectId)?.name || '-'}</td>
                  <td className="p-2.5 text-right">
                    <button
                      onClick={() => setDb((prev) => ({ ...prev, teachingSchedules: prev.teachingSchedules.filter((item) => item.id !== s.id) }))}
                      className="text-red-600 hover:underline"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900">Inventaris Kelas & Alat Peraga</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
            <input value={invCode} onChange={(e) => setInvCode(e.target.value)} placeholder="Kode Barang" className="border border-slate-300 rounded-xl px-3 py-2" />
            <input value={invName} onChange={(e) => setInvName(e.target.value)} placeholder="Nama Barang *" className="border border-slate-300 rounded-xl px-3 py-2" />
            <input type="number" min={1} value={invQty} onChange={(e) => setInvQty(Number(e.target.value) || 1)} className="border border-slate-300 rounded-xl px-3 py-2" />
            <select value={invCond} onChange={(e) => setInvCond(e.target.value as InventoryItem['condition'])} className="border border-slate-300 rounded-xl px-3 py-2">
              <option value="Baik">Baik</option>
              <option value="Rusak Ringan">Rusak Ringan</option>
              <option value="Rusak Berat">Rusak Berat</option>
            </select>
            <button
              onClick={() => {
                if (!invName.trim()) {
                  notify('error', 'Nama barang wajib diisi.');
                  return;
                }
                setDb((prev) => ({
                  ...prev,
                  inventoryItems: [
                    ...prev.inventoryItems,
                    {
                      id: uid('inv'),
                      code: invCode || `INV-${prev.inventoryItems.length + 1}`,
                      name: invName.trim(),
                      category: 'Sarana Kelas',
                      quantity: invQty,
                      unit: 'Unit',
                      condition: invCond,
                      location: 'Ruang Kelas',
                      acquisitionDate: new Date().toISOString().slice(0, 10),
                      source: 'BOS / Madrasah',
                      notes: ''
                    }
                  ]
                }));
                setInvName('');
                notify('success', 'Barang inventaris ditambahkan.');
              }}
              className="px-4 py-2 rounded-xl bg-emerald-800 text-white font-semibold"
            >
              Tambah Barang
            </button>
          </div>
          <table className="w-full text-xs border border-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-2.5 text-left">Kode</th>
                <th className="p-2.5 text-left">Nama Barang</th>
                <th className="p-2.5 text-center">Jumlah</th>
                <th className="p-2.5 text-left">Kondisi</th>
              </tr>
            </thead>
            <tbody>
              {db.inventoryItems.map((i) => (
                <tr key={i.id} className="border-t border-slate-200">
                  <td className="p-2.5">{i.code}</td>
                  <td className="p-2.5 font-semibold">{i.name}</td>
                  <td className="p-2.5 text-center">{i.quantity}</td>
                  <td className="p-2.5">{i.condition}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (activeMenu === 'skp') {
    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-slate-900">Sasaran Kinerja Pegawai (SKP) & Log Kinerja</h3>
            <p className="text-[11px] text-slate-500">Alat bantu pencatatan bukti kinerja harian/bulanan (bukan pengganti portal resmi e-Kinerja BKN).</p>
          </div>
          <button
            onClick={() => {
              const rows = db.skpActivities
                .map(
                  (a, i) =>
                    `<tr><td>${i + 1}</td><td>${a.date}</td><td>${escapeXml(a.targetTitle)}</td><td>${escapeXml(a.activityTitle)}</td><td>${escapeXml(a.realization)}</td><td>${a.status}</td></tr>`
                )
                .join('');
              openPrintPreview(
                'LAPORAN CAPAIAN KINERJA GURU (SKP)',
                `<table><thead><tr><th>No</th><th>Tanggal</th><th>Target</th><th>Aktivitas</th><th>Realisasi</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table>`
              );
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-800 text-white text-xs font-semibold"
          >
            Cetak Laporan Kinerja
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <input value={skpTarget} onChange={(e) => setSkpTarget(e.target.value)} placeholder="Target Rencana Hasil Kerja *" className="border border-slate-300 rounded-xl px-3 py-2" />
          <input value={skpActivity} onChange={(e) => setSkpActivity(e.target.value)} placeholder="Aktivitas Kinerja *" className="border border-slate-300 rounded-xl px-3 py-2" />
          <input value={skpRealization} onChange={(e) => setSkpRealization(e.target.value)} placeholder="Realisasi (misal: 1 Dokumen)" className="border border-slate-300 rounded-xl px-3 py-2" />
          <button
            onClick={() => {
              if (!skpTarget.trim() || !skpActivity.trim()) {
                notify('error', 'Target dan Aktivitas kinerja wajib diisi.');
                return;
              }
              const today = new Date().toISOString().slice(0, 10);
              setDb((prev) => ({
                ...prev,
                skpActivities: [
                  ...prev.skpActivities,
                  {
                    id: uid('skp'),
                    academicYearId: prev.activeAcademicYearId,
                    semesterId: prev.activeSemesterId,
                    year: today.slice(0, 4),
                    month: today.slice(0, 7),
                    date: today,
                    category: 'Pembelajaran',
                    targetTitle: skpTarget.trim(),
                    activityTitle: skpActivity.trim(),
                    description: '',
                    realization: skpRealization || '1 Kegiatan',
                    evidenceTitle: 'Catatan Aplikasi',
                    status: 'DRAF',
                    notes: ''
                  }
                ]
              }));
              setSkpActivity('');
              notify('success', 'Aktivitas SKP dicatat (status DRAF).');
            }}
            className="px-4 py-2 rounded-xl bg-emerald-800 text-white font-semibold"
          >
            Catat Kinerja
          </button>
        </div>

        <table className="w-full text-xs border border-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-2.5 text-left">Tanggal</th>
              <th className="p-2.5 text-left">Target & Aktivitas</th>
              <th className="p-2.5 text-left">Realisasi</th>
              <th className="p-2.5 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {db.skpActivities.map((a) => (
              <tr key={a.id} className="border-t border-slate-200">
                <td className="p-2.5">{a.date}</td>
                <td className="p-2.5">
                  <b>{a.targetTitle}</b>: {a.activityTitle}
                </td>
                <td className="p-2.5">{a.realization}</td>
                <td className="p-2.5">
                  <button
                    onClick={() =>
                      setDb((prev) => ({
                        ...prev,
                        skpActivities: prev.skpActivities.map((item) =>
                          item.id === a.id ? { ...item, status: item.status === 'DRAF' ? 'TERVERIFIKASI' : 'DRAF' } : item
                        )
                      }))
                    }
                    className={`px-2 py-0.5 rounded-full font-bold ${
                      a.status === 'TERVERIFIKASI' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {a.status}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (activeMenu === 'pkb') {
    const totalPkbHours = db.pkbActivities.reduce((sum, p) => sum + (p.hours || 0), 0);
    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-bold text-slate-900">Pengembangan Keprofesian Berkelanjutan (PKB)</h3>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-900">
            Total Kegiatan: {db.pkbActivities.length} • Total JP Tercatat: {totalPkbHours} JP
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
          <input value={pkbName} onChange={(e) => setPkbName(e.target.value)} placeholder="Nama Kegiatan / Diklat *" className="border border-slate-300 rounded-xl px-3 py-2" />
          <select value={pkbCat} onChange={(e) => setPkbCat(e.target.value)} className="border border-slate-300 rounded-xl px-3 py-2">
            {PKB_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input value={pkbOrg} onChange={(e) => setPkbOrg(e.target.value)} placeholder="Penyelenggara" className="border border-slate-300 rounded-xl px-3 py-2" />
          <input type="number" min={0} value={pkbHours} onChange={(e) => setPkbHours(e.target.value)} placeholder="Jumlah Jam (JP)" className="border border-slate-300 rounded-xl px-3 py-2" />
          <input value={pkbCertNo} onChange={(e) => setPkbCertNo(e.target.value)} placeholder="Nomor Sertifikat" className="border border-slate-300 rounded-xl px-3 py-2" />
        </div>
        <button
          onClick={() => {
            if (!pkbName.trim()) {
              notify('error', 'Nama kegiatan PKB wajib diisi.');
              return;
            }
            const today = new Date().toISOString().slice(0, 10);
            setDb((prev) => ({
              ...prev,
              pkbActivities: [
                ...prev.pkbActivities,
                {
                  id: uid('pkb'),
                  year: today.slice(0, 4),
                  activityName: pkbName.trim(),
                  category: pkbCat,
                  date: today,
                  organizer: pkbOrg,
                  duration: pkbHours ? `${pkbHours} JP` : '',
                  hours: pkbHours ? Number(pkbHours) : null,
                  outcome: 'Sertifikat / Laporan',
                  description: '',
                  certificateNumber: pkbCertNo,
                  notes: ''
                }
              ]
            }));
            setPkbName('');
            setPkbCertNo('');
            notify('success', 'Portofolio PKB ditambahkan.');
          }}
          className="px-4 py-2 rounded-xl bg-emerald-800 text-white text-xs font-semibold"
        >
          Simpan Kegiatan PKB
        </button>

        <table className="w-full text-xs border border-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-2.5 text-left">Nama Kegiatan</th>
              <th className="p-2.5 text-left">Kategori</th>
              <th className="p-2.5 text-left">Penyelenggara</th>
              <th className="p-2.5 text-center">JP</th>
              <th className="p-2.5 text-left">No. Sertifikat</th>
            </tr>
          </thead>
          <tbody>
            {db.pkbActivities.map((p) => (
              <tr key={p.id} className="border-t border-slate-200">
                <td className="p-2.5 font-semibold">{p.activityName}</td>
                <td className="p-2.5">{p.category}</td>
                <td className="p-2.5">{p.organizer || '-'}</td>
                <td className="p-2.5 text-center">{p.hours ?? '-'}</td>
                <td className="p-2.5">{p.certificateNumber || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (activeMenu === 'wali_kelas') {
    if (!db.homeroomEnabled) {
      return (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
          <h3 className="font-bold text-slate-900">Modul Wali Kelas Dinonaktifkan</h3>
          <p className="text-xs text-slate-500">Anda dapat mengaktifkan modul Wali Kelas melalui menu Pengaturan jika mendapat tugas tambahan sebagai Wali Kelas.</p>
        </div>
      );
    }

    const activeWkClassId = db.homeroomClassId || db.classes[0]?.id || '';
    const wkStudents = db.students.filter((s) => s.classId === activeWkClassId);
    const currentSeating = db.seatingCharts.find((sc) => sc.classId === activeWkClassId) || {
      classId: activeWkClassId,
      rows: seatRows,
      cols: seatCols,
      assignments: {}
    };

    return (
      <div className="space-y-6">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'induk', label: '1. Buku Induk' },
              { id: 'denah', label: '2. Denah Duduk' },
              { id: 'organisasi', label: '3. Struktur Kelas' },
              { id: 'bimbingan', label: '4. Buku Bimbingan (Terbatas)' },
              { id: 'mutasi', label: '5. Buku Mutasi' },
              { id: 'rapor', label: '6. Rekap Rapor' }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setWkTab(t.id as typeof wkTab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                  wkTab === t.id ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <select
            value={activeWkClassId}
            onChange={(e) => setDb((prev) => ({ ...prev, homeroomClassId: e.target.value }))}
            className="border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold"
          >
            {db.classes.map((c) => (
              <option key={c.id} value={c.id}>
                Kelas Binaan: {c.name}
              </option>
            ))}
          </select>
        </div>

        {wkTab === 'induk' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900">Buku Induk Siswa Kelas</h3>
            <table className="w-full text-xs border border-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-2.5 text-left">NIS</th>
                  <th className="p-2.5 text-left">Nama Lengkap</th>
                  <th className="p-2.5 text-left">JK / Tgl Lahir</th>
                  <th className="p-2.5 text-left">Orang Tua & Kontak</th>
                  <th className="p-2.5 text-left">Alamat</th>
                </tr>
              </thead>
              <tbody>
                {wkStudents.map((s) => (
                  <tr key={s.id} className="border-t border-slate-200">
                    <td className="p-2.5">{s.nis}</td>
                    <td className="p-2.5 font-semibold">{s.name}</td>
                    <td className="p-2.5">
                      {s.gender} • {s.birthDate || '-'}
                    </td>
                    <td className="p-2.5">
                      {s.parentName || '-'} ({s.parentPhone || '-'})
                    </td>
                    <td className="p-2.5">{s.address || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {wkTab === 'denah' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-bold text-slate-900">Denah Tempat Duduk Siswa</h3>
              <div className="flex items-center gap-2 text-xs">
                <span>Baris:</span>
                <input type="number" min={1} max={10} value={currentSeating.rows} onChange={(e) => setSeatRows(Number(e.target.value) || 4)} className="w-14 border border-slate-300 rounded-lg px-2 py-1" />
                <span>Kolom:</span>
                <input type="number" min={1} max={10} value={currentSeating.cols} onChange={(e) => setSeatCols(Number(e.target.value) || 6)} className="w-14 border border-slate-300 rounded-lg px-2 py-1" />
              </div>
            </div>
            <div className="p-2 text-center bg-emerald-900 text-white text-xs font-bold rounded-xl">PAPAN TULIS / MEJA GURU</div>
            <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${seatCols}, minmax(0, 1fr))` }}>
              {Array.from({ length: seatRows * seatCols }).map((_, idx) => {
                const key = `seat_${idx}`;
                return (
                  <div key={key} className="p-2 rounded-xl border border-slate-300 bg-slate-50 text-[11px]">
                    <div className="text-slate-400 mb-1">Meja {idx + 1}</div>
                    <select
                      value={currentSeating.assignments[key] || ''}
                      onChange={(e) => {
                        const updated: SeatingChartConfig = {
                          classId: activeWkClassId,
                          rows: seatRows,
                          cols: seatCols,
                          assignments: { ...currentSeating.assignments, [key]: e.target.value }
                        };
                        setDb((prev) => ({
                          ...prev,
                          seatingCharts: [...prev.seatingCharts.filter((sc) => sc.classId !== activeWkClassId), updated]
                        }));
                      }}
                      className="w-full border border-slate-300 rounded-lg px-1.5 py-1 bg-white"
                    >
                      <option value="">- Kosong -</option>
                      {wkStudents.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {wkTab === 'organisasi' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900">Struktur Organisasi Kelas</h3>
            <div className="flex flex-wrap gap-3 text-xs">
              <select value={orgRole} onChange={(e) => setOrgRole(e.target.value)} className="border border-slate-300 rounded-xl px-3 py-2">
                {['Ketua Kelas', 'Wakil Ketua', 'Sekretaris', 'Bendahara', 'Seksi Kebersihan', 'Seksi Keagamaan', 'Anggota'].map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <select value={orgStudentId} onChange={(e) => setOrgStudentId(e.target.value)} className="border border-slate-300 rounded-xl px-3 py-2">
                <option value="">-- Pilih Siswa --</option>
                {wkStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => {
                  if (!orgStudentId) return;
                  setDb((prev) => ({
                    ...prev,
                    classOrganizations: [
                      ...prev.classOrganizations,
                      { id: uid('org'), classId: activeWkClassId, role: orgRole, studentId: orgStudentId, notes: '' }
                    ]
                  }));
                  notify('success', 'Pengurus kelas ditambahkan.');
                }}
                className="px-4 py-2 rounded-xl bg-emerald-800 text-white font-semibold"
              >
                Simpan Pengurus
              </button>
            </div>
            <table className="w-full text-xs border border-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-2.5 text-left">Jabatan</th>
                  <th className="p-2.5 text-left">Nama Siswa</th>
                </tr>
              </thead>
              <tbody>
                {db.classOrganizations
                  .filter((o) => o.classId === activeWkClassId)
                  .map((o) => (
                    <tr key={o.id} className="border-t border-slate-200">
                      <td className="p-2.5 font-semibold">{o.role}</td>
                      <td className="p-2.5">{db.students.find((s) => s.id === o.studentId)?.name || '-'}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {wkTab === 'bimbingan' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-600" /> Buku Bimbingan Wali Kelas (Akses Terbatas)
              </h3>
              {guidanceUnlocked && (
                <button onClick={() => setGuidanceUnlocked(false)} className="text-xs text-slate-600 underline">
                  Kunci Kembali
                </button>
              )}
            </div>
            {!guidanceUnlocked ? (
              <div className="p-6 rounded-xl bg-amber-50 border border-amber-200 max-w-md space-y-3 text-xs">
                <p className="text-amber-900">
                  Catatan bimbingan bersifat rahasia dan tidak ditampilkan pada Dashboard umum. Masukkan PIN Wali Kelas (default: <b>1234</b>, dapat diubah di Pengaturan).
                </p>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    placeholder="Masukkan PIN..."
                    className="border border-amber-300 rounded-xl px-3 py-2 bg-white"
                  />
                  <button
                    onClick={() => {
                      if (pinInput === db.guidancePin) {
                        setGuidanceUnlocked(true);
                        setPinInput('');
                      } else {
                        notify('error', 'PIN Buku Bimbingan salah.');
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-800 text-white font-semibold"
                  >
                    Buka Akses
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <p className="text-slate-500">
                  Gunakan bahasa profesional, objektif, dan berorientasi pendampingan tanpa memberikan label diagnosis klinis kepada siswa.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <select value={guidStudentId} onChange={(e) => setGuidStudentId(e.target.value)} className="border border-slate-300 rounded-xl px-3 py-2">
                    <option value="">-- Pilih Siswa --</option>
                    {wkStudents.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <input value={guidDev} onChange={(e) => setGuidDev(e.target.value)} placeholder="Catatan Perkembangan Objektif *" className="border border-slate-300 rounded-xl px-3 py-2" />
                  <input value={guidFollowUp} onChange={(e) => setGuidFollowUp(e.target.value)} placeholder="Tindakan / Komunikasi Orang Tua" className="border border-slate-300 rounded-xl px-3 py-2" />
                </div>
                <button
                  onClick={() => {
                    if (!guidStudentId || !guidDev.trim()) return;
                    setDb((prev) => ({
                      ...prev,
                      guidanceRecords: [
                        ...prev.guidanceRecords,
                        {
                          id: uid('guid'),
                          classId: activeWkClassId,
                          studentId: guidStudentId,
                          date: new Date().toISOString().slice(0, 10),
                          recordType: 'Pendampingan',
                          developmentNote: guidDev.trim(),
                          issueNote: '',
                          actionTaken: guidFollowUp,
                          followUp: guidFollowUp,
                          parentCommunication: guidFollowUp,
                          teacherNote: ''
                        }
                      ]
                    }));
                    setGuidDev('');
                    notify('success', 'Catatan bimbingan tersimpan.');
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-800 text-white font-semibold"
                >
                  Simpan Catatan Bimbingan
                </button>
                <table className="w-full border border-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="p-2.5 text-left">Tanggal</th>
                      <th className="p-2.5 text-left">Siswa</th>
                      <th className="p-2.5 text-left">Catatan Perkembangan</th>
                      <th className="p-2.5 text-left">Tindak Lanjut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {db.guidanceRecords
                      .filter((g) => g.classId === activeWkClassId)
                      .map((g) => (
                        <tr key={g.id} className="border-t border-slate-200">
                          <td className="p-2.5">{g.date}</td>
                          <td className="p-2.5 font-semibold">{db.students.find((s) => s.id === g.studentId)?.name || '-'}</td>
                          <td className="p-2.5">{g.developmentNote}</td>
                          <td className="p-2.5">{g.followUp}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {wkTab === 'mutasi' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900">Buku Mutasi Siswa (Masuk / Keluar)</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
              <select value={mutType} onChange={(e) => setMutType(e.target.value as 'Masuk' | 'Keluar')} className="border border-slate-300 rounded-xl px-3 py-2">
                <option value="Masuk">Siswa Masuk</option>
                <option value="Keluar">Siswa Keluar</option>
              </select>
              <input value={mutName} onChange={(e) => setMutName(e.target.value)} placeholder="Nama Siswa *" className="border border-slate-300 rounded-xl px-3 py-2" />
              <input value={mutNis} onChange={(e) => setMutNis(e.target.value)} placeholder="NIS" className="border border-slate-300 rounded-xl px-3 py-2" />
              <input value={mutSchool} onChange={(e) => setMutSchool(e.target.value)} placeholder="Madrasah Asal / Tujuan" className="border border-slate-300 rounded-xl px-3 py-2" />
              <button
                onClick={() => {
                  if (!mutName.trim()) return;
                  setDb((prev) => ({
                    ...prev,
                    mutationRecords: [
                      ...prev.mutationRecords,
                      {
                        id: uid('mut'),
                        classId: activeWkClassId,
                        type: mutType,
                        studentName: mutName.trim(),
                        nis: mutNis,
                        date: new Date().toISOString().slice(0, 10),
                        origin: mutType === 'Masuk' ? mutSchool : db.madrasah.name,
                        destination: mutType === 'Keluar' ? mutSchool : db.madrasah.name,
                        reason: mutReason,
                        docNumber: '',
                        notes: ''
                      }
                    ]
                  }));
                  setMutName('');
                  notify('success', 'Catatan mutasi dicatat.');
                }}
                className="px-4 py-2 rounded-xl bg-emerald-800 text-white font-semibold"
              >
                Catat Mutasi
              </button>
            </div>
            <table className="w-full text-xs border border-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-2.5 text-left">Jenis</th>
                  <th className="p-2.5 text-left">Nama Siswa</th>
                  <th className="p-2.5 text-left">Tanggal</th>
                  <th className="p-2.5 text-left">Asal / Tujuan</th>
                </tr>
              </thead>
              <tbody>
                {db.mutationRecords.map((m) => (
                  <tr key={m.id} className="border-t border-slate-200">
                    <td className="p-2.5 font-bold">{m.type}</td>
                    <td className="p-2.5">{m.studentName}</td>
                    <td className="p-2.5">{m.date}</td>
                    <td className="p-2.5">
                      {m.origin} → {m.destination}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {wkTab === 'rapor' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900">Rekap Nilai & Kehadiran Rapor (Berbasis Data Aktual)</h3>
            <table className="w-full text-xs border border-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-2.5 text-left">NIS</th>
                  <th className="p-2.5 text-left">Nama Siswa</th>
                  <th className="p-2.5 text-center">Rata-rata Nilai Tercatat</th>
                  <th className="p-2.5 text-center">Kehadiran (H / S / I / A)</th>
                </tr>
              </thead>
              <tbody>
                {wkStudents.map((s) => {
                  const scores = db.assessments
                    .filter((a) => a.classId === activeWkClassId)
                    .map((a) => a.entries[s.id]?.rawScore)
                    .filter((v): v is number => typeof v === 'number');
                  const avg = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : 'Belum ada nilai';

                  let h = 0,
                    sakit = 0,
                    izin = 0,
                    alpa = 0;
                  db.attendanceSessions
                    .filter((ses) => ses.classId === activeWkClassId)
                    .forEach((ses) => {
                      const st = ses.records[s.id];
                      if (st === 'H') h++;
                      else if (st === 'S') sakit++;
                      else if (st === 'I') izin++;
                      else if (st === 'A') alpa++;
                    });

                  return (
                    <tr key={s.id} className="border-t border-slate-200">
                      <td className="p-2.5">{s.nis}</td>
                      <td className="p-2.5 font-semibold">{s.name}</td>
                      <td className="p-2.5 text-center font-bold">{avg}</td>
                      <td className="p-2.5 text-center">
                        {h} / {sakit} / {izin} / {alpa}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  // Pusat Arsip Administrasi (33 Kelompok)
  const autoArchiveEntries = useMemo(() => {
    const list: { id: string; group: string; title: string; date: string; source: string; fileDataUrl?: string; fileName?: string }[] = [];
    db.calendarConfigs.forEach((c) =>
      list.push({ id: c.id, group: '1. Kalender pendidikan', title: `Kalender Semester (${c.startDate} s.d. ${c.endDate})`, date: c.startDate, source: 'Kalender' })
    );
    db.protaItems.forEach((p) =>
      list.push({ id: p.id, group: '3. Prota', title: `Prota: ${p.material || p.tp}`, date: db.updatedAt.slice(0, 10), source: 'Perencanaan' })
    );
    db.prosemItems.forEach((p) =>
      list.push({ id: p.id, group: '4. Prosem', title: `Prosem: ${p.material || p.tp}`, date: db.updatedAt.slice(0, 10), source: 'Perencanaan' })
    );
    db.atpItems.forEach((a) =>
      list.push({ id: a.id, group: '5. ATP', title: `ATP: ${a.tp}`, date: db.updatedAt.slice(0, 10), source: 'Perencanaan' })
    );
    db.kktpItems.forEach((k) =>
      list.push({ id: k.id, group: '6. KKTP', title: `KKTP: ${k.tpText}`, date: db.updatedAt.slice(0, 10), source: 'Perencanaan' })
    );
    db.lessonPlans.forEach((m) =>
      list.push({
        id: m.id,
        group: m.templateType === 'modul_ajar' ? '7. Modul Ajar' : '8. RPP',
        title: `${m.templateType === 'modul_ajar' ? 'Modul Ajar' : 'RPP'}: ${m.material}`,
        date: db.updatedAt.slice(0, 10),
        source: 'Perencanaan'
      })
    );
    db.teachingJournals.forEach((j) =>
      list.push({ id: j.id, group: '9. Jurnal', title: `Jurnal ${j.date}: ${j.material}`, date: j.date, source: 'Pelaksanaan' })
    );
    db.attendanceSessions.forEach((a) =>
      list.push({ id: a.id, group: '10. Presensi', title: `Presensi Pertemuan ${a.meetingNumber} (${a.date})`, date: a.date, source: 'Pelaksanaan' })
    );
    db.assessments.forEach((a) =>
      list.push({ id: a.id, group: '11. Buku nilai', title: `Asesmen: ${a.title}`, date: a.date, source: 'Asesmen' })
    );
    db.questionBank.forEach((q) =>
      list.push({ id: q.id, group: '17. Bank soal', title: `Soal (${q.questionType}): ${q.questionText.slice(0, 60)}`, date: db.updatedAt.slice(0, 10), source: 'Bank Soal' })
    );
    db.teachingMaterials.forEach((m) =>
      list.push({
        id: m.id,
        group: m.category === 'LKPD' ? '19. LKPD' : '18. Bahan ajar',
        title: m.title,
        date: m.date,
        source: 'Bahan Ajar',
        fileDataUrl: m.fileDataUrl,
        fileName: m.fileName
      })
    );
    db.skPembagianTugas.forEach((sk) =>
      list.push({ id: sk.id, group: '21. SK pembagian tugas', title: `SK ${sk.skNumber} (${sk.status})`, date: sk.skDate, source: 'Kepegawaian' })
    );
    db.teachingSchedules.forEach((s) =>
      list.push({ id: s.id, group: '22. Jadwal', title: `Jadwal ${s.dayName} Jam ${s.period}`, date: db.updatedAt.slice(0, 10), source: 'Jadwal' })
    );
    db.inventoryItems.forEach((i) =>
      list.push({ id: i.id, group: '23. Inventaris', title: `${i.code} - ${i.name} (${i.quantity} ${i.unit})`, date: i.acquisitionDate, source: 'Inventaris' })
    );
    db.skpActivities.forEach((s) =>
      list.push({ id: s.id, group: '24. SKP', title: `${s.targetTitle} - ${s.activityTitle}`, date: s.date, source: 'SKP' })
    );
    db.pkbActivities.forEach((p) =>
      list.push({ id: p.id, group: '26. PKB', title: `${p.category}: ${p.activityName}`, date: p.date, source: 'PKB' })
    );
    db.archiveDocuments.forEach((d) =>
      list.push({
        id: d.id,
        group: d.docGroup,
        title: d.title,
        date: d.date,
        source: 'Unggahan Mandiri',
        fileDataUrl: d.fileDataUrl,
        fileName: d.fileName
      })
    );
    return list;
  }, [db]);

  const filteredArchives = autoArchiveEntries.filter((item) => {
    const matchGroup = !archiveGroupFilter || item.group === archiveGroupFilter;
    const matchText = item.title.toLowerCase().includes(archiveSearch.toLowerCase());
    return matchGroup && matchText;
  });

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-bold text-slate-900">Pusat Arsip Administrasi Terintegrasi (33 Kelompok Dokumen)</h3>
          <p className="text-xs text-slate-500">Menghimpun otomatis seluruh dokumen dari setiap modul ditambah berkas arsip unggahan Anda.</p>
        </div>
        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 text-xs font-bold">
          Total Terarsip: {autoArchiveEntries.length} Dokumen
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
        <select value={newArcGroup} onChange={(e) => setNewArcGroup(e.target.value)} className="border border-slate-300 rounded-xl px-3 py-2 bg-white">
          {ARCHIVE_GROUPS.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
        <input value={newArcTitle} onChange={(e) => setNewArcTitle(e.target.value)} placeholder="Judul Dokumen Arsip *" className="border border-slate-300 rounded-xl px-3 py-2 bg-white" />
        <input
          type="file"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            if (f.size > 2 * 1024 * 1024) {
              notify('warning', 'Ukuran berkas maksimal 2 MB.');
              return;
            }
            const r = new FileReader();
            r.onload = () => setNewArcFile({ name: f.name, mime: f.type, dataUrl: String(r.result || '') });
            r.readAsDataURL(f);
          }}
          className="border border-slate-300 rounded-xl px-2 py-1.5 bg-white"
        />
        <button
          onClick={() => {
            if (!newArcTitle.trim()) {
              notify('error', 'Judul dokumen wajib diisi.');
              return;
            }
            setDb((prev) => ({
              ...prev,
              archiveDocuments: [
                ...prev.archiveDocuments,
                {
                  id: uid('arc'),
                  academicYearId: prev.activeAcademicYearId,
                  semesterId: prev.activeSemesterId,
                  classId: '',
                  subjectId: '',
                  docGroup: newArcGroup,
                  title: newArcTitle.trim(),
                  date: new Date().toISOString().slice(0, 10),
                  fileName: newArcFile?.name || '',
                  fileMimeType: newArcFile?.mime || '',
                  fileDataUrl: newArcFile?.dataUrl || '',
                  notes: ''
                }
              ]
            }));
            setNewArcTitle('');
            setNewArcFile(null);
            notify('success', 'Dokumen ditambahkan ke Pusat Arsip.');
          }}
          className="px-4 py-2 rounded-xl bg-emerald-800 text-white font-semibold"
        >
          Simpan ke Arsip
        </button>
      </div>

      <div className="flex flex-wrap gap-3 text-xs">
        <input value={archiveSearch} onChange={(e) => setArchiveSearch(e.target.value)} placeholder="Cari judul dokumen arsip..." className="border border-slate-300 rounded-xl px-3 py-2 w-full md:w-64" />
        <select value={archiveGroupFilter} onChange={(e) => setArchiveGroupFilter(e.target.value)} className="border border-slate-300 rounded-xl px-3 py-2">
          <option value="">Semua 33 Kelompok Dokumen</option>
          {ARCHIVE_GROUPS.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>

      <table className="w-full text-xs border border-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="p-2.5 text-left">Kelompok Dokumen</th>
            <th className="p-2.5 text-left">Judul / Uraian</th>
            <th className="p-2.5 text-left">Sumber Modul</th>
            <th className="p-2.5 text-left">Tanggal</th>
            <th className="p-2.5 text-right">Berkas</th>
          </tr>
        </thead>
        <tbody>
          {filteredArchives.map((item) => (
            <tr key={`${item.group}_${item.id}`} className="border-t border-slate-200">
              <td className="p-2.5 font-semibold text-emerald-900">{item.group}</td>
              <td className="p-2.5">{item.title}</td>
              <td className="p-2.5">{item.source}</td>
              <td className="p-2.5">{item.date}</td>
              <td className="p-2.5 text-right">
                {item.fileDataUrl ? (
                  <a href={item.fileDataUrl} download={item.fileName || 'dokumen'} className="text-emerald-700 font-semibold underline">
                    Unduh
                  </a>
                ) : (
                  <span className="text-slate-400">Terintegrasi</span>
                )}
              </td>
            </tr>
          ))}
          {filteredArchives.length === 0 && (
            <tr>
              <td colSpan={5} className="p-4 text-center text-slate-400">
                Belum ada dokumen arsip yang sesuai filter.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================================
// 12. MODUL PENGATURAN, SUPABASE CLOUD SYNC, KOP TERPUSAT, BACKUP & KEAMANAN
// ============================================================================

interface SettingsViewProps {
  db: AppDatabase;
  setDb: React.Dispatch<React.SetStateAction<AppDatabase>>;
  sbConfig: SupabaseConfig;
  setSbConfig: React.Dispatch<React.SetStateAction<SupabaseConfig>>;
  sbUser: SupabaseAuthUser | null;
  sbSyncStatus: 'local' | 'connecting' | 'connected' | 'syncing' | 'error';
  sbLastError: string;
  onSupabaseLogin: (email: string, password: string, mode: 'login' | 'signup') => Promise<void>;
  onSupabaseLogout: () => void;
  onSupabasePush: () => Promise<void>;
  onSupabasePull: () => Promise<void>;
  notify: (type: 'success' | 'error' | 'warning' | 'info', text: string) => void;
  askConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

function SettingsView({
  db,
  setDb,
  sbConfig,
  setSbConfig,
  sbUser,
  sbSyncStatus,
  sbLastError,
  onSupabaseLogin,
  onSupabaseLogout,
  onSupabasePush,
  onSupabasePull,
  notify,
  askConfirm
}: SettingsViewProps) {
  const [tab, setTab] = useState<'supabase' | 'kop' | 'backup' | 'keamanan'>('supabase');
  const [urlInput, setUrlInput] = useState(sbConfig.url);
  const [keyInput, setKeyInput] = useState(sbConfig.anonKey);
  const [autoSyncInput, setAutoSyncInput] = useState(sbConfig.autoSync);

  const [authEmail, setAuthEmail] = useState('');
  const [authPass, setAuthPass] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const [lhForm, setLhForm] = useState<LetterheadSettings>(db.letterhead);
  const [newPin, setNewPin] = useState(db.guidancePin);

  useEffect(() => {
    setUrlInput(sbConfig.url);
    setKeyInput(sbConfig.anonKey);
    setAutoSyncInput(sbConfig.autoSync);
  }, [sbConfig]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
        {[
          { id: 'supabase', label: 'A. Koneksi & Auth Supabase' },
          { id: 'kop', label: 'B. Generator Kop Terpusat & Wali Kelas' },
          { id: 'backup', label: 'C. Backup & Pemulihan Data' },
          { id: 'keamanan', label: 'D. Audit Keamanan & RLS' }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as typeof tab)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold ${
              tab === t.id ? 'bg-emerald-800 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'supabase' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">1. Konfigurasi Proyek Supabase</h3>
              <span
                className={`px-2.5 py-1 rounded-full font-bold ${
                  sbSyncStatus === 'connected'
                    ? 'bg-emerald-100 text-emerald-800'
                    : sbSyncStatus === 'error'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                Status: {sbSyncStatus.toUpperCase()}
              </span>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Supabase Project URL</label>
              <input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://xyzcompany.supabase.co"
                className="w-full border border-slate-300 rounded-xl px-3 py-2 font-mono"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Supabase Anon Public Key</label>
              <input
                type="password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full border border-slate-300 rounded-xl px-3 py-2 font-mono"
              />
            </div>
            <label className="inline-flex items-center gap-2 text-slate-700">
              <input type="checkbox" checked={autoSyncInput} onChange={(e) => setAutoSyncInput(e.target.checked)} />
              Aktifkan Auto-Sync otomatis ke Supabase setiap perubahan data (setelah login)
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setSbConfig({
                    url: urlInput.trim().replace(/\/$/, ''),
                    anonKey: keyInput.trim(),
                    bucketName: 'min4-berkas',
                    autoSync: autoSyncInput
                  });
                  notify('success', 'Konfigurasi Supabase disimpan. Silakan login akun guru di panel kanan.');
                }}
                className="px-4 py-2 rounded-xl bg-emerald-800 text-white font-semibold"
              >
                Simpan Konfigurasi Supabase
              </button>
              {sbConfig.url && (
                <button
                  onClick={() => {
                    setSbConfig({ url: '', anonKey: '', bucketName: 'min4-berkas', autoSync: false });
                    onSupabaseLogout();
                    notify('info', 'Koneksi Supabase diputus; aplikasi kembali ke mode lokal.');
                  }}
                  className="px-3 py-2 rounded-xl border border-slate-300 text-slate-700"
                >
                  Putuskan Koneksi
                </button>
              )}
            </div>

            {sbLastError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800">
                <b>Catatan Koneksi:</b> {sbLastError}
              </div>
            )}

            <div className="pt-3 border-t border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">Skrip SQL Tabel & Row Level Security (RLS)</span>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(SUPABASE_SQL_SCHEMA);
                    notify('success', 'Skrip SQL Supabase disalin ke clipboard.');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 text-white text-[11px] flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" /> Salin SQL
                </button>
              </div>
              <pre className="p-3 rounded-xl bg-slate-900 text-emerald-300 text-[10px] overflow-x-auto leading-relaxed">
                {SUPABASE_SQL_SCHEMA}
              </pre>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 text-sm">2. Autentikasi Guru & Sinkronisasi Cloud</h3>
            {!sbConfig.url || !sbConfig.anonKey ? (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                Isi <b>Supabase Project URL</b> dan <b>Anon Key</b> pada formulir di samping terlebih dahulu untuk mengaktifkan login guru dan sinkronisasi database PostgreSQL.
              </div>
            ) : sbUser ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1">
                  <div className="font-bold">Terautentikasi sebagai Guru:</div>
                  <div className="font-mono">{sbUser.email}</div>
                  <div className="text-[11px] text-emerald-700">User ID: {sbUser.id}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={onSupabasePush}
                    className="px-4 py-2 rounded-xl bg-emerald-800 text-white font-semibold flex items-center gap-1.5"
                  >
                    <Cloud className="w-4 h-4" /> Dorong Data Lokal ke Supabase (Push)
                  </button>
                  <button
                    onClick={onSupabasePull}
                    className="px-4 py-2 rounded-xl bg-blue-700 text-white font-semibold flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-4 h-4" /> Tarik Data dari Supabase (Pull)
                  </button>
                  <button
                    onClick={onSupabaseLogout}
                    className="px-4 py-2 rounded-xl border border-rose-300 text-rose-700 font-semibold flex items-center gap-1.5"
                  >
                    <LogOut className="w-4 h-4" /> Keluar Akun
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => setAuthMode('login')}
                    className={`px-3 py-1.5 rounded-lg font-semibold ${
                      authMode === 'login' ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    Masuk (Login)
                  </button>
                  <button
                    onClick={() => setAuthMode('signup')}
                    className={`px-3 py-1.5 rounded-lg font-semibold ${
                      authMode === 'signup' ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    Daftar Akun Guru Baru
                  </button>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Email Guru</label>
                  <input
                    type="email"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="guru@min4magelang.sch.id"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Kata Sandi (Password)</label>
                  <input
                    type="password"
                    value={authPass}
                    onChange={(e) => setAuthPass(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2"
                  />
                </div>
                <button
                  onClick={() => onSupabaseLogin(authEmail.trim(), authPass, authMode)}
                  className="px-4 py-2.5 rounded-xl bg-emerald-800 text-white font-semibold flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" /> {authMode === 'login' ? 'Masuk & Sinkronkan' : 'Daftar Akun Supabase'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'kop' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5 text-xs">
          <h3 className="font-bold text-slate-900 text-sm">Pengaturan Kop Dokumen Terpusat & Modul Wali Kelas</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="font-semibold block mb-1">Jenis Huruf Kop</label>
              <select
                value={lhForm.fontFamily}
                onChange={(e) => setLhForm({ ...lhForm, fontFamily: e.target.value as 'serif' | 'sans' })}
                className="w-full border border-slate-300 rounded-xl px-3 py-2"
              >
                <option value="serif">Times New Roman (Resmi Kemenag)</option>
                <option value="sans">Arial / Sans-Serif</option>
              </select>
            </div>
            <div>
              <label className="font-semibold block mb-1">Ukuran Font Dasar (pt)</label>
              <input
                type="number"
                min={9}
                max={14}
                value={lhForm.fontSizePt}
                onChange={(e) => setLhForm({ ...lhForm, fontSizePt: Number(e.target.value) || 11 })}
                className="w-full border border-slate-300 rounded-xl px-3 py-2"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">Posisi Logo</label>
              <select
                value={lhForm.logoPosition}
                onChange={(e) => setLhForm({ ...lhForm, logoPosition: e.target.value as 'left-right' | 'left-only' })}
                className="w-full border border-slate-300 rounded-xl px-3 py-2"
              >
                <option value="left-right">Kiri (Kemenag) & Kanan (Madrasah)</option>
                <option value="left-only">Kiri Saja</option>
              </select>
            </div>
            <div>
              <label className="font-semibold block mb-1">Garis Bawah Kop</label>
              <select
                value={lhForm.borderStyle}
                onChange={(e) => setLhForm({ ...lhForm, borderStyle: e.target.value as LetterheadSettings['borderStyle'] })}
                className="w-full border border-slate-300 rounded-xl px-3 py-2"
              >
                <option value="double">Garis Ganda (Double)</option>
                <option value="thick-thin">Garis Tebal</option>
                <option value="solid">Garis Tunggal</option>
              </select>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
            <div className="font-semibold text-slate-500 mb-2">Pratinjau Kop Surat Terpusat:</div>
            <div className="bg-white p-4 rounded-lg border border-slate-200" dangerouslySetInnerHTML={{ __html: buildKopHtml({ ...db, letterhead: lhForm }) }} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-200">
            <label className="flex items-center gap-2 font-semibold text-slate-800">
              <input
                type="checkbox"
                checked={db.homeroomEnabled}
                onChange={(e) => setDb((prev) => ({ ...prev, homeroomEnabled: e.target.checked }))}
              />
              Aktifkan Modul Wali Kelas pada Sidebar
            </label>
            <div className="flex items-center gap-2">
              <span className="font-semibold">PIN Akses Buku Bimbingan:</span>
              <input
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                className="border border-slate-300 rounded-xl px-3 py-1.5 w-32"
              />
            </div>
          </div>

          <button
            onClick={() => {
              setDb((prev) => ({ ...prev, letterhead: lhForm, guidancePin: newPin || '1234' }));
              notify('success', 'Pengaturan Kop Terpusat dan Wali Kelas disimpan.');
            }}
            className="px-4 py-2 rounded-xl bg-emerald-800 text-white font-semibold"
          >
            Simpan Pengaturan
          </button>
        </div>
      )}

      {tab === 'backup' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
          <h3 className="font-bold text-slate-900 text-sm">Backup & Pemulihan Data (Tanpa Menyertakan Secret Key)</h3>
          <p className="text-slate-600">
            Unduh salinan seluruh database administrasi Anda ke format berkas JSON yang aman (kredensial Supabase tidak disertakan dalam berkas backup).
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                const payload = JSON.stringify(db, null, 2);
                const blob = new Blob([payload], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Backup_Administrasi_MIN4_Magelang_${new Date().toISOString().slice(0, 10)}.json`;
                a.click();
                URL.revokeObjectURL(url);
                notify('success', 'Berkas Backup JSON berhasil diunduh.');
              }}
              className="px-4 py-2.5 rounded-xl bg-emerald-800 text-white font-semibold flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Unduh Backup Lengkap (.JSON)
            </button>

            <label className="px-4 py-2.5 rounded-xl bg-blue-700 text-white font-semibold flex items-center gap-2 cursor-pointer">
              <Upload className="w-4 h-4" /> Pulihkan dari Berkas Backup (.JSON)
              <input
                type="file"
                accept=".json"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    try {
                      const parsed = JSON.parse(String(reader.result || '{}'));
                      const migrated = migrateDatabase(parsed);
                      askConfirm(
                        'Konfirmasi Pemulihan Data',
                        'Menimpa data saat ini dengan data dari berkas backup JSON? Pastikan Anda sudah mencadangkan data terbaru.',
                        () => {
                          setDb(migrated);
                          notify('success', 'Database berhasil dipulihkan dari berkas backup.');
                        }
                      );
                    } catch {
                      notify('error', 'Berkas JSON tidak valid atau rusak.');
                    }
                  };
                  reader.readAsText(file);
                  e.target.value = '';
                }}
                className="hidden"
              />
            </label>
          </div>
        </div>
      )}

      {tab === 'keamanan' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
          <h3 className="font-bold text-slate-900 text-sm">Checklist Audit Keamanan & Perlindungan Data</h3>
          <div className="space-y-2">
            {[
              {
                title: '1. Autentikasi Pengguna (Supabase Auth)',
                ok: Boolean(sbUser),
                desc: sbUser ? `Aktif login sebagai ${sbUser.email}` : 'Belum login; data saat ini tersimpan di penyimpanan lokal peramban.'
              },
              {
                title: '2. Row Level Security (RLS) PostgreSQL',
                ok: Boolean(sbConfig.url && sbUser),
                desc: 'Kebijakan auth.uid() = user_id memastikan setiap guru hanya dapat membaca dan mengubah datanya sendiri.'
              },
              {
                title: '3. Isolasi Data Sensitif Buku Bimbingan',
                ok: true,
                desc: 'Catatan Buku Bimbingan Wali Kelas dikunci dengan PIN khusus dan tidak ditampilkan pada Dashboard umum.'
              },
              {
                title: '4. Perlindungan Kredensial pada Ekspor Backup',
                ok: true,
                desc: 'Supabase Anon Key dan token sesi disimpan terpisah dan tidak pernah ditulis ke dalam file Backup JSON.'
              }
            ].map((item, idx) => (
              <div key={idx} className="p-3 rounded-xl border border-slate-200 flex items-start justify-between gap-3">
                <div>
                  <div className="font-bold text-slate-800">{item.title}</div>
                  <div className="text-slate-500 mt-0.5">{item.desc}</div>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full font-bold ${item.ok ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  {item.ok ? 'Aktif' : 'Perlu Konfigurasi'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 13. KOMPONEN UTAMA APLIKASI (SHELL, SIDEBAR 15 MODUL & KLIEN SUPABASE)
// ============================================================================

export default function App() {
  const [db, setDb] = useState<AppDatabase>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_DB_KEY);
      return saved ? migrateDatabase(JSON.parse(saved)) : createEmptyDatabase();
    } catch {
      return createEmptyDatabase();
    }
  });

  const [sbConfig, setSbConfig] = useState<SupabaseConfig>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_SB_CFG_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    const winEnv =
      typeof window !== 'undefined'
        ? ((window as unknown as { __ENV__?: Record<string, string> }).__ENV__ || {})
        : {};
    return {
      url: winEnv.VITE_SUPABASE_URL || '',
      anonKey: winEnv.VITE_SUPABASE_ANON_KEY || '',
      bucketName: 'min4-berkas',
      autoSync: true
    };
  });

  const [sbSession, setSbSession] = useState<{ accessToken: string; user: SupabaseAuthUser } | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_SB_SESSION_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [sbSyncStatus, setSbSyncStatus] = useState<'local' | 'connecting' | 'connected' | 'syncing' | 'error'>(
    sbSession ? 'connected' : 'local'
  );
  const [sbLastError, setSbLastError] = useState('');

  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'warning' | 'info'; text: string } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);
  const [printModal, setPrintModal] = useState<{ title: string; html: string } | null>(null);

  const notify = useCallback((type: 'success' | 'error' | 'warning' | 'info', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast((cur) => (cur?.text === text ? null : cur)), 4000);
  }, []);

  const askConfirm = useCallback((title: string, message: string, onConfirm: () => void) => {
    setConfirmModal({ title, message, onConfirm });
  }, []);

  // Persistensi lokal otomatis
  useEffect(() => {
    try {
      const stamped: AppDatabase = { ...db, updatedAt: new Date().toISOString() };
      localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(stamped));
    } catch {
      // Kuota penuh
    }
  }, [db]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_SB_CFG_KEY, JSON.stringify(sbConfig));
    } catch {
      // ignore
    }
  }, [sbConfig]);

  useEffect(() => {
    try {
      if (sbSession) localStorage.setItem(LOCAL_SB_SESSION_KEY, JSON.stringify(sbSession));
      else localStorage.removeItem(LOCAL_SB_SESSION_KEY);
    } catch {
      // ignore
    }
  }, [sbSession]);

  // Fungsi Supabase REST & Auth
  const pushToSupabase = useCallback(
    async (silent = false) => {
      if (!sbConfig.url || !sbConfig.anonKey || !sbSession) return;
      setSbSyncStatus('syncing');
      try {
        const res = await fetch(`${sbConfig.url}/rest/v1/min4_app_store`, {
          method: 'POST',
          headers: {
            apikey: sbConfig.anonKey,
            Authorization: `Bearer ${sbSession.accessToken}`,
            'Content-Type': 'application/json',
            Prefer: 'resolution=merge-duplicates'
          },
          body: JSON.stringify({
            user_id: sbSession.user.id,
            payload: db,
            updated_at: new Date().toISOString()
          })
        });
        if (!res.ok) {
          const errTxt = await res.text();
          throw new Error(errTxt || `HTTP ${res.status}`);
        }
        setSbSyncStatus('connected');
        setSbLastError('');
        if (!silent) notify('success', 'Data berhasil disinkronkan ke Supabase PostgreSQL.');
      } catch (err) {
        setSbSyncStatus('error');
        const msg = err instanceof Error ? err.message : 'Gagal mengirim data ke Supabase.';
        setSbLastError(msg);
        if (!silent) notify('error', `Gagal sinkronisasi Supabase: ${msg}`);
      }
    },
    [sbConfig, sbSession, db, notify]
  );

  const pullFromSupabase = useCallback(async () => {
    if (!sbConfig.url || !sbConfig.anonKey || !sbSession) return;
    setSbSyncStatus('syncing');
    try {
      const res = await fetch(
        `${sbConfig.url}/rest/v1/min4_app_store?user_id=eq.${encodeURIComponent(sbSession.user.id)}&select=payload,updated_at`,
        {
          headers: {
            apikey: sbConfig.anonKey,
            Authorization: `Bearer ${sbSession.accessToken}`
          }
        }
      );
      if (!res.ok) {
        const errTxt = await res.text();
        throw new Error(errTxt || `HTTP ${res.status}`);
      }
      const rows = await res.json();
      if (Array.isArray(rows) && rows.length > 0 && rows[0].payload) {
        setDb(migrateDatabase(rows[0].payload));
        notify('success', 'Data cloud berhasil ditarik dari Supabase.');
      } else {
        notify('info', 'Belum ada data tersimpan di cloud Supabase untuk akun ini.');
      }
      setSbSyncStatus('connected');
      setSbLastError('');
    } catch (err) {
      setSbSyncStatus('error');
      const msg = err instanceof Error ? err.message : 'Gagal menarik data dari Supabase.';
      setSbLastError(msg);
      notify('error', `Gagal menarik data Supabase: ${msg}`);
    }
  }, [sbConfig, sbSession, notify]);

  const handleSupabaseLogin = async (email: string, password: string, mode: 'login' | 'signup') => {
    if (!sbConfig.url || !sbConfig.anonKey) {
      notify('error', 'Simpan URL dan Anon Key Supabase terlebih dahulu.');
      return;
    }
    if (!email || !password) {
      notify('error', 'Email dan kata sandi wajib diisi.');
      return;
    }
    setSbSyncStatus('connecting');
    try {
      const endpoint = mode === 'login' ? 'token?grant_type=password' : 'signup';
      const res = await fetch(`${sbConfig.url}/auth/v1/${endpoint}`, {
        method: 'POST',
        headers: {
          apikey: sbConfig.anonKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error_description || data.msg || 'Autentikasi gagal.');
      }
      if (data.access_token && data.user) {
        setSbSession({
          accessToken: data.access_token,
          user: { id: data.user.id, email: data.user.email || email }
        });
        setSbSyncStatus('connected');
        setSbLastError('');
        notify('success', `Berhasil masuk sebagai ${data.user.email || email}.`);
      } else {
        setSbSyncStatus('local');
        notify('info', 'Pendaftaran berhasil. Silakan cek email konfirmasi atau langsung masuk.');
      }
    } catch (err) {
      setSbSyncStatus('error');
      const msg = err instanceof Error ? err.message : 'Gagal terhubung ke Supabase Auth.';
      setSbLastError(msg);
      notify('error', msg);
    }
  };

  // Auto-sync debounced ke Supabase saat online & login
  const syncTimerRef = useRef<number | null>(null);
  useEffect(() => {
    if (!sbConfig.autoSync || !sbConfig.url || !sbConfig.anonKey || !sbSession) return;
    if (syncTimerRef.current) window.clearTimeout(syncTimerRef.current);
    syncTimerRef.current = window.setTimeout(() => {
      pushToSupabase(true);
    }, 2000);
    return () => {
      if (syncTimerRef.current) window.clearTimeout(syncTimerRef.current);
    };
  }, [db, sbConfig, sbSession, pushToSupabase]);

  const openPrintPreview = useCallback(
    (title: string, bodyHtml: string) => {
      const fullHtml = `${buildKopHtml(db)}<h3 style="text-align:center;margin:8px 0 12px 0;text-transform:uppercase;">${escapeXml(title)}</h3>${bodyHtml}${buildSignatureBlockHtml(db)}`;
      setPrintModal({ title, html: fullHtml });
    },
    [db]
  );

  const activeYear = db.academicYears.find((y) => y.id === db.activeAcademicYearId) || null;
  const activeSemester = db.semesters.find((s) => s.id === db.activeSemesterId) || null;

  const menuItems = [
    { id: 'dashboard', label: '1. Dashboard', icon: LayoutDashboard },
    { id: 'master', label: '2. Data Master', icon: Database },
    { id: 'kalender', label: '3. Kalender Pendidikan', icon: Calendar },
    { id: 'perencanaan', label: '4. Perencanaan Pembelajaran', icon: BookOpen },
    { id: 'pelaksanaan', label: '5. Pelaksanaan (Jurnal & Presensi)', icon: ClipboardCheck },
    { id: 'asesmen', label: '6. Asesmen & Buku Nilai', icon: FileSpreadsheet },
    { id: 'analisis', label: '7. Analisis Penilaian', icon: BarChart3 },
    { id: 'remedial', label: '8. Remedial & Pengayaan', icon: RefreshCw },
    { id: 'bank_soal', label: '9. Bank Soal & Kisi-Kisi', icon: HelpCircle },
    { id: 'bahan_ajar', label: '10. Bahan Ajar & Media', icon: FolderOpen },
    { id: 'kepegawaian', label: '11. Administrasi Kepegawaian', icon: Briefcase },
    { id: 'jadwal_inventaris', label: '12. Jadwal & Inventaris', icon: Clock },
    { id: 'skp', label: '13. SKP & Laporan Kinerja', icon: Target },
    { id: 'pkb', label: '14. PKB Guru', icon: Award },
    { id: 'wali_kelas', label: '15A. Administrasi Wali Kelas', icon: Users },
    { id: 'arsip', label: '15B. Pusat Arsip Terintegrasi', icon: Archive },
    { id: 'pengaturan', label: '15C. Pengaturan & Supabase', icon: Settings }
  ];

  const handleMenuNavigation = (id: string) => {
    if (id === 'analisis' || id === 'remedial') {
      setActiveMenu('asesmen');
    } else {
      setActiveMenu(id);
    }
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col lg:flex-row font-sans">
      {/* Sidebar Kiri */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-emerald-950 text-emerald-50 flex flex-col transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-emerald-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center font-extrabold text-white shadow">
              M4
            </div>
            <div>
              <div className="font-bold text-sm leading-tight text-white">Administrasi Guru</div>
              <div className="text-[11px] text-emerald-300 font-medium">{db.madrasah.name || 'MIN 4 Magelang'}</div>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1.5 rounded-lg hover:bg-emerald-900">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              activeMenu === item.id ||
              (activeMenu === 'asesmen' && (item.id === 'analisis' || item.id === 'remedial'));
            return (
              <button
                key={item.id}
                onClick={() => handleMenuNavigation(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition text-left ${
                  isActive
                    ? 'bg-emerald-700 text-white font-semibold shadow-sm'
                    : 'text-emerald-200 hover:bg-emerald-900/70 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-emerald-900 text-[11px] text-emerald-300">
          <div className="flex items-center justify-between">
            <span>Penyimpanan:</span>
            <span className="font-bold text-white">
              {sbSyncStatus === 'connected' ? 'Supabase Cloud' : 'Lokal Browser'}
            </span>
          </div>
        </div>
      </aside>

      {/* Konten Utama */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-700"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-bold text-sm md:text-base text-emerald-950">
                Aplikasi Administrasi Guru MIN 4 Magelang
              </h1>
              <div className="text-[11px] text-slate-500">
                Periode Aktif: <b>{activeYear?.label || 'Belum Diatur'}</b> • Semester:{' '}
                <b>{activeSemester?.name || 'Belum Diatur'}</b>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveMenu('pengaturan')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border ${
                sbSyncStatus === 'connected'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-900 border-amber-200'
              }`}
            >
              {sbSyncStatus === 'connected' ? <Cloud className="w-3.5 h-3.5" /> : <CloudOff className="w-3.5 h-3.5" />}
              {sbSyncStatus === 'connected'
                ? `Supabase Terhubung (${sbSession?.user.email})`
                : 'Mode Lokal • Hubungkan Supabase'}
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto">
          {activeMenu === 'dashboard' && (
            <DashboardView
              db={db}
              activeYear={activeYear}
              activeSemester={activeSemester}
              sbSyncStatus={sbSyncStatus}
              sbUser={sbSession?.user || null}
              onNavigate={handleMenuNavigation}
            />
          )}
          {activeMenu === 'master' && (
            <DataMasterView
              db={db}
              setDb={setDb}
              notify={notify}
              askConfirm={askConfirm}
              exportToExcel={downloadExcelXml}
            />
          )}
          {activeMenu === 'kalender' && (
            <CalendarEffectiveView
              db={db}
              setDb={setDb}
              notify={notify}
              askConfirm={askConfirm}
              exportToExcel={downloadExcelXml}
              openPrintPreview={openPrintPreview}
            />
          )}
          {activeMenu === 'perencanaan' && (
            <PerencanaanView
              db={db}
              setDb={setDb}
              notify={notify}
              askConfirm={askConfirm}
              exportToExcel={downloadExcelXml}
              openPrintPreview={openPrintPreview}
            />
          )}
          {activeMenu === 'pelaksanaan' && (
            <PelaksanaanView
              db={db}
              setDb={setDb}
              notify={notify}
              askConfirm={askConfirm}
              exportToExcel={downloadExcelXml}
              openPrintPreview={openPrintPreview}
            />
          )}
          {activeMenu === 'asesmen' && (
            <AsesmenAnalisisView
              db={db}
              setDb={setDb}
              notify={notify}
              exportToExcel={downloadExcelXml}
              openPrintPreview={openPrintPreview}
            />
          )}
          {['bank_soal', 'bahan_ajar', 'kepegawaian', 'jadwal_inventaris', 'skp', 'pkb', 'wali_kelas', 'arsip'].includes(
            activeMenu
          ) && (
            <SecondaryModulesView
              activeMenu={activeMenu}
              db={db}
              setDb={setDb}
              notify={notify}
              askConfirm={askConfirm}
              exportToExcel={downloadExcelXml}
              openPrintPreview={openPrintPreview}
            />
          )}
          {activeMenu === 'pengaturan' && (
            <SettingsView
              db={db}
              setDb={setDb}
              sbConfig={sbConfig}
              setSbConfig={setSbConfig}
              sbUser={sbSession?.user || null}
              sbSyncStatus={sbSyncStatus}
              sbLastError={sbLastError}
              onSupabaseLogin={handleSupabaseLogin}
              onSupabaseLogout={() => {
                setSbSession(null);
                setSbSyncStatus('local');
              }}
              onSupabasePush={() => pushToSupabase(false)}
              onSupabasePull={pullFromSupabase}
              notify={notify}
              askConfirm={askConfirm}
            />
          )}
        </main>
      </div>

      {/* Notifikasi Toast */}
      {toast && (
        <div
          className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-lg text-xs font-semibold text-white flex items-center gap-2 ${
            toast.type === 'success'
              ? 'bg-emerald-800'
              : toast.type === 'error'
              ? 'bg-rose-700'
              : toast.type === 'warning'
              ? 'bg-amber-700'
              : 'bg-slate-800'
          }`}
        >
          <span>{toast.text}</span>
          <button onClick={() => setToast(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Modal Konfirmasi Kustom (Pengganti window.confirm) */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-slate-900 text-sm">{confirmModal.title}</h3>
            <p className="text-xs text-slate-600">{confirmModal.message}</p>
            <div className="flex justify-end gap-2 text-xs">
              <button
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-700 text-white font-semibold"
              >
                Ya, Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Print Preview Dokumen Resmi MIN 4 Magelang */}
      {printModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <span className="font-bold text-xs text-slate-800">Pratinjau Cetak / PDF: {printModal.title}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const win = window.open('', '_blank');
                    if (win) {
                      win.document.write(
                        `<html><head><title>${escapeXml(printModal.title)}</title><style>body{font-family:'Times New Roman',serif;font-size:11pt;padding:15mm;}table{width:100%;border-collapse:collapse;margin-top:8px;}th,td{border:1px solid #333;padding:5px 7px;vertical-align:top;}th{background:#ecfdf5;}</style></head><body>${printModal.html}<script>window.onload=function(){window.print();}</script></body></html>`
                      );
                      win.document.close();
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-800 text-white text-xs font-semibold flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" /> Cetak / Simpan PDF
                </button>
                <button
                  onClick={() => downloadWordDoc(printModal.title.replace(/\s+/g, '_'), printModal.html)}
                  className="px-3 py-1.5 rounded-xl bg-blue-700 text-white text-xs font-semibold"
                >
                  Unduh Word (.doc)
                </button>
                <button onClick={() => setPrintModal(null)} className="p-1.5 rounded-xl border border-slate-300 text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto bg-white" dangerouslySetInnerHTML={{ __html: printModal.html }} />
          </div>
        </div>
      )}
    </div>
  );
}