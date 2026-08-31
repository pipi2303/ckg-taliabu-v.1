import React, { useMemo } from 'react';
import {
  LayoutDashboard,
  MapPin,
  Building2,
  Stethoscope,
  Users,
  ShieldCheck,
  Map,
  FileCheck2,
  GitBranch,
  History,
  RefreshCw,
  Share2,
  Settings,
  HeartHandshake,
  ChevronRight,
  ClipboardList,
  AlertCircle,
  FileText,
  Activity,
  Sparkles,
  Smartphone,
  ListTodo,
  MessageSquare,
  Sliders,
  Calendar,
  UserX,
  Briefcase,
  Layers,
  TrendingUp,
  Clock,
  AlertTriangle,
  Navigation,
  Shield,
  Pill,
} from 'lucide-react';
import { useTour } from '../../context/TourContext';
import { useAuth } from '../../context/AuthContext';
import { permissionService } from '../../services/permissionService';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: string; // Standard documentation code (e.g. SCR-DNK-F07)
  docSpec?: string; // Specification details for tooltip
  badgeColor?: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

interface SidebarProps {
  activeNav: string;
  onNavigate: (navId: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeNav,
  onNavigate,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { startTour } = useTour();
  const { currentUser } = useAuth();
  const roleId = currentUser?.roleId || 'ADMIN_DINKES';

  const navigationSections: NavSection[] = [
    {
      title: 'OVERVIEW',
      items: [
        {
          id: 'dashboard',
          label: roleId === 'KEPALA_DINAS' ? 'Dashboard Eksekutif' : 'Beranda Puskesmas',
          icon: <LayoutDashboard className="w-4 h-4" />,
          badge: roleId === 'KEPALA_DINAS' ? 'SCR-DNK-A02' : 'SCR-PKM-A02',
          docSpec: roleId === 'KEPALA_DINAS' ? 'Command Center Dinas Kesehatan · F1 · Plafon S3 Agregat · UC DNK-01' : 'Beranda Puskesmas · F1 · Plafon S3 · UC PKM-21, PKM-06',
          badgeColor: 'bg-teal-950/90 text-teal-300 border-teal-700/60',
        },
      ],
    },
    {
      title: 'TINDAK LANJUT & PENDAMPINGAN',
      items: [
        { id: 'prioritas-harian', label: 'Tugas Prioritas Hari Ini', icon: <Sparkles className="w-4 h-4 text-emerald-400" />, badge: 'SCR-PKM-B01', docSpec: 'Daftar Tugas Penting yang Perlu Ditangani Hari Ini', badgeColor: 'bg-teal-950/90 text-teal-300 border-teal-700/60' },
        { id: 'care-task', label: 'Jadwal & Batas Waktu', icon: <ListTodo className="w-4 h-4" />, badge: 'SCR-PKM-B05', docSpec: 'Jadwal dan Batas Waktu Pelayanan Warga', badgeColor: 'bg-teal-950/90 text-teal-300 border-teal-700/60' },
        { id: 'clinical-followup', label: 'Pemeriksaan Dokter di Puskesmas', icon: <Stethoscope className="w-4 h-4 text-teal-400" />, badge: 'SCR-PKM-D01', docSpec: 'Jadwal dan Hasil Pemeriksaan Dokter di Puskesmas', badgeColor: 'bg-teal-950/90 text-teal-300 border-teal-700/60' },
        { id: 'outreach', label: 'Catatan Menghubungi Warga', icon: <MessageSquare className="w-4 h-4" />, badge: 'SCR-PKM-B03', docSpec: 'Catatan Petugas Saat Menghubungi dan Mengingatkan Warga', badgeColor: 'bg-amber-950/90 text-amber-300 border-amber-700/60' },
        { id: 'penugasan-lapangan', label: 'Tugas Kunjungan Kader', icon: <MapPin className="w-4 h-4" />, badge: 'SCR-PKM-B02', docSpec: 'Pembagian Tugas Kunjungan Rumah untuk Kader Posyandu', badgeColor: 'bg-teal-950/90 text-teal-300 border-teal-700/60' },
        { id: 'kader-app', label: 'Aplikasi Lapangan Kader', icon: <Smartphone className="w-4 h-4 text-emerald-400" />, badge: 'SCR-KDR-B01', docSpec: 'Aplikasi HP untuk Kader Mencatat Warga Tanpa Perlu Internet', badgeColor: 'bg-emerald-950/90 text-emerald-300 border-emerald-700/60' },
        { id: 'citizen-app', label: 'Aplikasi Sahabat Warga', icon: <Smartphone className="w-4 h-4 text-amber-300" />, badge: 'SCR-WRG-B01', docSpec: 'Aplikasi Pendamping Kesehatan Mandiri untuk Warga', badgeColor: 'bg-amber-950/90 text-amber-300 border-amber-700/60' },
        { id: 'jadwal-kuota', label: 'Jadwal Pelayanan Puskesmas', icon: <Calendar className="w-4 h-4" />, badge: 'SCR-PKM-G01', docSpec: 'Pengaturan Jadwal dan Kuota Harian Pasien Puskesmas', badgeColor: 'bg-teal-950/90 text-teal-300 border-teal-700/60' },
        { id: 'kandidat-putus', label: 'Warga Belum Kontrol Ulang', icon: <UserX className="w-4 h-4" />, badge: 'SCR-PKM-B04', docSpec: 'Daftar Warga yang Sudah Waktunya Periksa Ulang Namun Belum Datang', badgeColor: 'bg-rose-950/90 text-rose-300 border-rose-700/60' },
        { id: 'beban-kerja', label: 'Pembagian Beban Kerja', icon: <Briefcase className="w-4 h-4" />, badge: 'SCR-PKM-G02', docSpec: 'Pemerataan Tugas Antar Petugas Puskesmas dan Kader', badgeColor: 'bg-blue-950/90 text-blue-300 border-blue-700/60' },
        { id: 'outreach-config', label: 'Pengaturan Pesan Pengingat', icon: <Sliders className="w-4 h-4" />, badge: 'SCR-PKM-B05', docSpec: 'Aturan Waktu dan Format Pesan Pengingat untuk Warga', badgeColor: 'bg-teal-950/90 text-teal-300 border-teal-700/60' },
      ],
    },
    {
      title: 'ADVANCED AI INTELLIGENCE',
      items: [
        { id: 'ai-tata-kelola', label: 'Tata Kelola & Safety AI', icon: <ShieldCheck className="w-4 h-4 text-teal-300" />, badge: 'SCR-DNK-F07', docSpec: 'Tata Kelola Model AI & Kill Switch · F3 · Plafon S0 · UC SYS-11/12', badgeColor: 'bg-purple-950/90 text-purple-300 border-purple-700/60' },
        { id: 'ai-prediksi-dropout', label: 'Prediksi Putus Berobat', icon: <AlertTriangle className="w-4 h-4 text-amber-400" />, badge: 'SCR-AI-01', docSpec: 'Model Prediktif Risiko Drop-out Perawatan Kronis', badgeColor: 'bg-indigo-950/90 text-indigo-300 border-indigo-700/60' },
        { id: 'ai-digital-twin', label: 'Digital Twin Warga', icon: <Activity className="w-4 h-4 text-emerald-400" />, badge: 'SCR-AI-02', docSpec: 'Digital Twin Profil Kardiometabolik Warga CKG', badgeColor: 'bg-indigo-950/90 text-indigo-300 border-indigo-700/60' },
        { id: 'ai-proyeksi-beban', label: 'Proyeksi Beban & Obat', icon: <TrendingUp className="w-4 h-4 text-teal-400" />, badge: 'SCR-DNK-E03', docSpec: 'Proyeksi Beban Wilayah & Kebutuhan Obat · F3 · Plafon S3 Agregat', badgeColor: 'bg-purple-950/90 text-purple-300 border-purple-700/60' },
        { id: 'ai-scenario-lab', label: 'Simulasi Skenario Kebijakan', icon: <Sliders className="w-4 h-4 text-amber-300" />, badge: 'SCR-AI-03', docSpec: 'Laboratorium Simulasi Kebijakan & Intervensi Anggaran', badgeColor: 'bg-amber-950/90 text-amber-300 border-amber-700/60' },
        { id: 'ai-klaster-populasi', label: 'Klaster Pola Populasi', icon: <Layers className="w-4 h-4 text-indigo-400" />, badge: 'SCR-AI-04', docSpec: 'Klaster Pola Fenotipe & Faktor Risiko Populasi', badgeColor: 'bg-indigo-950/90 text-indigo-300 border-indigo-700/60' },
        { id: 'ai-kepatuhan-obat', label: 'Kepatuhan & Efektivitas', icon: <Pill className="w-4 h-4 text-rose-400" />, badge: 'SCR-AI-05', docSpec: 'Analisis Kepatuhan & Efektivitas Terapi Farmakologi', badgeColor: 'bg-indigo-950/90 text-indigo-300 border-indigo-700/60' },
        { id: 'ai-kinerja-model', label: 'Kinerja & Uji Keadilan AI', icon: <FileCheck2 className="w-4 h-4 text-teal-400" />, badge: 'SCR-DNK-F07', docSpec: 'Audit Kinerja, Drift, & Uji Keadilan Antar-Wilayah Maritim · F3', badgeColor: 'bg-purple-950/90 text-purple-300 border-purple-700/60' },
        { id: 'ai-prioritas-pencegahan', label: 'Prioritas Pencegahan Lanjut', icon: <Sparkles className="w-4 h-4 text-sky-400" />, badge: 'SCR-AI-06', docSpec: 'Prioritisasi Intervensi Pencegahan Primer & Sekunder', badgeColor: 'bg-indigo-950/90 text-indigo-300 border-indigo-700/60' },
        { id: 'ai-clinical-copilot', label: 'Clinical Decision Copilot', icon: <Stethoscope className="w-4 h-4 text-emerald-400" />, badge: 'SCR-AI-07', docSpec: 'Asisten Pendukung Keputusan Klinis Dokter FKTP', badgeColor: 'bg-emerald-950/90 text-emerald-300 border-emerald-700/60' },
        { id: 'ai-nudge-budaya', label: 'Edukasi & Nudge Budaya', icon: <MessageSquare className="w-4 h-4 text-amber-300" />, badge: 'SCR-AI-08', docSpec: 'Nudge Komunikasi & Edukasi Kontekstual Budaya Lokal', badgeColor: 'bg-amber-950/90 text-amber-300 border-amber-700/60' },
        { id: 'ai-rute-maritim', label: 'Optimasi Rute Maritim', icon: <Navigation className="w-4 h-4 text-sky-400" />, badge: 'SCR-AI-09', docSpec: 'Optimasi Rute Pusling Laut & Akses Maritim Antar-Pulau', badgeColor: 'bg-sky-950/90 text-sky-300 border-sky-700/60' },
        { id: 'future-ai', label: 'Advanced AI Assistant', icon: <Sparkles className="w-4 h-4 text-sky-400" />, badge: 'SCR-AI-10', docSpec: 'Analisis Prediktif Tren PTM per Wilayah (Hipertensi/Diabetes)', badgeColor: 'bg-indigo-950/90 text-indigo-300 border-indigo-700/60' },
      ],
    },
    {
      title: 'DINKES COMMAND CENTER',
      items: [
        { id: 'dinkes-ringkasan', label: 'Ringkasan Dinas Kesehatan', icon: <Sparkles className="w-4 h-4 text-teal-400" />, badge: 'SCR-DNK-A02', docSpec: 'Command Center Dinas Kesehatan · F1 · Plafon S3 Agregat · UC DNK-01', badgeColor: 'bg-emerald-950/90 text-emerald-300 border-emerald-700/60' },
        { id: 'dinkes-impact-index', label: 'CKG Impact Index', icon: <Activity className="w-4 h-4 text-emerald-400" />, badge: 'SCR-DNK-B01', docSpec: 'CKG Impact Index (Level 1-3) · F1 (OI-08) · Plafon S3 Agregat · UC DNK-02', badgeColor: 'bg-emerald-950/90 text-emerald-300 border-emerald-700/60' },
        { id: 'dinkes-kaskade', label: 'Kaskade Tindak Lanjut', icon: <Layers className="w-4 h-4 text-sky-400" />, badge: 'SCR-DNK-B02', docSpec: 'Rel Kaskade & Analisis Drop-off · F1 · Plafon S3 Agregat · UC DNK-02/05', badgeColor: 'bg-emerald-950/90 text-emerald-300 border-emerald-700/60' },
        { id: 'dinkes-wilayah', label: 'Analisis Wilayah', icon: <MapPin className="w-4 h-4 text-teal-300" />, badge: 'SCR-DNK-C01', docSpec: 'Peta Risiko Desa & Kecamatan · F1 (DS-OI-06) · Plafon S3 Agregat · UC DNK-03', badgeColor: 'bg-emerald-950/90 text-emerald-300 border-emerald-700/60' },
        { id: 'dinkes-gap', label: 'Disparitas Tindak Lanjut', icon: <AlertTriangle className="w-4 h-4 text-rose-400" />, badge: 'SCR-DNK-C02', docSpec: 'Daftar Disparitas & Gap Wilayah · F1 · Plafon S3 Agregat · UC DNK-05', badgeColor: 'bg-emerald-950/90 text-emerald-300 border-emerald-700/60' },
        { id: 'dinkes-kinerja-pkm', label: 'Kinerja Puskesmas', icon: <Building2 className="w-4 h-4 text-indigo-400" />, badge: 'SCR-DNK-D01', docSpec: 'Kinerja Tindak Lanjut per Puskesmas · F1 · Plafon S3 Agregat · UC DNK-04', badgeColor: 'bg-emerald-950/90 text-emerald-300 border-emerald-700/60' },
        { id: 'dinkes-penyebab-kendala', label: 'Penyebab & Kendala', icon: <HeartHandshake className="w-4 h-4 text-amber-400" />, badge: 'SCR-DNK-D02', docSpec: 'Sebaran Penyebab & Kendala CMP-07 · F2 (UX-OI-03) · Plafon S3 Agregat · UC DNK-07', badgeColor: 'bg-blue-950/90 text-blue-300 border-blue-700/60' },
        { id: 'dinkes-intervensi-populasi', label: 'Intervensi Populasi', icon: <Sparkles className="w-4 h-4 text-emerald-300" />, badge: 'SCR-DNK-E01', docSpec: 'Penetapan & Pelacakan Intervensi Populasi · F2 · Plafon S3 Agregat · UC DNK-07', badgeColor: 'bg-blue-950/90 text-blue-300 border-blue-700/60' },
        { id: 'dinkes-perbandingan-periode', label: 'Perbandingan Periode', icon: <TrendingUp className="w-4 h-4 text-sky-300" />, badge: 'SCR-DNK-B03', docSpec: 'Perbandingan Metrik Antar-Periode · F3 · Plafon S3 Agregat · UC DNK-09', badgeColor: 'bg-purple-950/90 text-purple-300 border-purple-700/60' },
        { id: 'dinkes-kualitas-data', label: 'Kualitas & Integrasi', icon: <Clock className="w-4 h-4 text-slate-300" />, badge: 'SCR-DNK-F03', docSpec: 'Status Integrasi INT-01 s.d INT-06 & Kualitas Data · F1 · Plafon S0 · UC SYS-01/09', badgeColor: 'bg-emerald-950/90 text-emerald-300 border-emerald-700/60' },
        { id: 'dinkes-laporan', label: 'Laporan & Ekspor', icon: <FileText className="w-4 h-4 text-teal-400" />, badge: 'SCR-DNK-F05', docSpec: 'Ekspor Laporan Resmi Eksekutif & Kemenkes (PDF/Excel) · F2 · Plafon S3 Agregat · UC DNK-10', badgeColor: 'bg-blue-950/90 text-blue-300 border-blue-700/60' },
      ],
    },
    {
      title: 'PEMANTAUAN KESEHATAN',
      items: [
        { id: 'pemantauan-aktif', label: 'Siklus Pemantauan', icon: <Activity className="w-4 h-4 text-teal-400" />, badge: 'SCR-PKM-F01', docSpec: 'Pemantauan Kondisi Pasien Berjalan', badgeColor: 'bg-teal-950/90 text-teal-300 border-teal-700/60' },
        { id: 'kontrol-harian', label: 'Jadwal Kontrol Ulang', icon: <Calendar className="w-4 h-4 text-emerald-400" />, badge: 'SCR-PKM-F02', docSpec: 'Warga Terjadwal Kontrol Hari Ini', badgeColor: 'bg-teal-950/90 text-teal-300 border-teal-700/60' },
        { id: 'menunggu-evaluasi', label: 'Evaluasi Status Kesehatan', icon: <Clock className="w-4 h-4 text-amber-400" />, badge: 'SCR-PKM-F04', docSpec: 'Penetapan Kondisi Terkendali / Butuh Rujukan', badgeColor: 'bg-amber-950/90 text-amber-300 border-amber-700/60' },
        { id: 'integritas-monitoring', label: 'Audit Kepatuhan Puskesmas', icon: <ShieldCheck className="w-4 h-4 text-sky-400" />, badge: 'SCR-PKM-G06', docSpec: 'Pemeriksaan Integritas & Standar Pelayanan', badgeColor: 'bg-teal-950/90 text-teal-300 border-teal-700/60' },
        { id: 'kepatuhan-kendala', label: 'Kepatuhan & Kendala Obat', icon: <HeartHandshake className="w-4 h-4 text-teal-300" />, badge: 'SCR-PKM-F03', docSpec: 'Pencatatan Kepatuhan Minum Obat & Kendala Warga', badgeColor: 'bg-amber-950/90 text-amber-300 border-amber-700/60' },
        { id: 'kohort-kondisi', label: 'Kelompok Penyakit (Hipertensi/DM)', icon: <Layers className="w-4 h-4 text-indigo-400" />, badge: 'SCR-PKM-F06', docSpec: 'Daftar Pasien per Jenis Penyakit', badgeColor: 'bg-blue-950/90 text-blue-300 border-blue-700/60' },
        { id: 'tren-outcome', label: 'Perkembangan Hasil Terapi', icon: <TrendingUp className="w-4 h-4 text-emerald-300" />, badge: 'SCR-PKM-F07', docSpec: 'Grafik Perbaikan Tekanan Darah & Gula Darah', badgeColor: 'bg-blue-950/90 text-blue-300 border-blue-700/60' },
        { id: 'risiko-putus', label: 'Cegah Putus Berobat', icon: <AlertTriangle className="w-4 h-4 text-rose-400" />, badge: 'SCR-PKM-B04', docSpec: 'Peringatan Dini Warga Berisiko Berhenti Minum Obat', badgeColor: 'bg-rose-950/90 text-rose-300 border-rose-700/60' },
      ],
    },
    {
      title: 'DATA WARGA & SKRINING',
      items: [
        { id: 'registry', label: 'Data Warga (Registry)', icon: <ClipboardList className="w-4 h-4" />, badge: 'SCR-PKM-C01', docSpec: 'Daftar Seluruh Warga Berdasarkan NIK & Wilayah', badgeColor: 'bg-teal-950/90 text-teal-300 border-teal-700/60' },
        { id: 'data-quality', label: 'Perbaikan Data', icon: <AlertCircle className="w-4 h-4" />, badge: 'SCR-PKM-C04', docSpec: 'Koreksi NIK / Data Belum Lengkap', badgeColor: 'bg-amber-950/90 text-amber-300 border-amber-700/60' },
        { id: 'duplicate-review', label: 'Pemeriksaan Data Ganda', icon: <Users className="w-4 h-4" />, badge: 'SCR-PKM-C05', docSpec: 'Penyatuan Data Warga yang Tercatat Ganda', badgeColor: 'bg-blue-950/90 text-blue-300 border-blue-700/60' },
        { id: 'import-ckg', label: 'Impor Berkas CKG', icon: <FileText className="w-4 h-4" />, badge: 'SCR-REG-04', docSpec: 'Unggah Data Excel / CSV Hasil Pemeriksaan Masal', badgeColor: 'bg-teal-950/90 text-teal-300 border-teal-700/60' },
        { id: 'ingestion-monitor', label: 'Status Perekaman', icon: <Activity className="w-4 h-4" />, badge: 'SCR-SYS-03', docSpec: 'Pemantauan Proses Masuknya Data Pemeriksaan', badgeColor: 'bg-sky-950/90 text-sky-300 border-sky-700/60' },
        { id: 'import-history', label: 'Riwayat Impor', icon: <History className="w-4 h-4" />, badge: 'SCR-REG-05', docSpec: 'Catatan Berkas yang Pernah Diunggah', badgeColor: 'bg-slate-900 text-slate-300 border-slate-700' },
        { id: 'source-mapping', label: 'Format Kolom Berkas', icon: <Share2 className="w-4 h-4" />, badge: 'SCR-REG-06', docSpec: 'Penyesuaian Kolom Excel dengan Sistem', badgeColor: 'bg-slate-900 text-slate-300 border-slate-700' },
      ],
    },
    {
      title: 'PENILAIAN RISIKO KESEHATAN',
      items: [
        { id: 'stratifikasi', label: 'Kategori Risiko (Kemenkes)', icon: <Activity className="w-4 h-4" />, badge: 'SCR-PKM-C03', docSpec: 'Kriteria Penilaian Tingkat Risiko Hijau, Kuning, Merah', badgeColor: 'bg-teal-950/90 text-teal-300 border-teal-700/60' },
      ],
    },
    {
      title: 'WILAYAH & FASKES',
      items: [
        { id: 'wilayah', label: 'Kecamatan & Desa', icon: <MapPin className="w-4 h-4" />, badge: 'SCR-DNK-F01', docSpec: 'Daftar Kecamatan, Desa, dan Dusun Binaan', badgeColor: 'bg-emerald-950/90 text-emerald-300 border-emerald-700/60' },
        { id: 'faskes', label: 'Puskesmas, Pustu & RS', icon: <Building2 className="w-4 h-4" />, badge: 'SCR-PKM-E04', docSpec: 'Daftar Fasilitas Kesehatan & Jejaring Rujukan', badgeColor: 'bg-blue-950/90 text-blue-300 border-blue-700/60' },
        { id: 'future-facility', label: 'Stok Obat & Tenaga Medis', icon: <Building2 className="w-4 h-4" />, badge: 'SCR-PKM-E05', docSpec: 'Kesiapan Obat, Laboratorium & Petugas di Faskes', badgeColor: 'bg-blue-950/90 text-blue-300 border-blue-700/60' },
        { id: 'layanan', label: 'Katalog Layanan Medis', icon: <Stethoscope className="w-4 h-4" />, badge: 'SCR-ADM-03', docSpec: 'Daftar Jenis Pemeriksaan & Tindakan Medis', badgeColor: 'bg-slate-900 text-slate-300 border-slate-700' },
      ],
    },
    {
      title: 'AKUN & HAK AKSES',
      items: [
        { id: 'pengguna', label: 'Petugas & Kader', icon: <Users className="w-4 h-4" />, badge: 'SCR-PKM-G03', docSpec: 'Daftar Akun Tenaga Kesehatan & Kader Posyandu', badgeColor: 'bg-teal-950/90 text-teal-300 border-teal-700/60' },
        { id: 'peran', label: 'Peran Pengguna', icon: <ShieldCheck className="w-4 h-4" />, badge: 'SCR-ADM-02', docSpec: 'Pengaturan Izin Akses (Dokter, Bidan, Kader, dll)', badgeColor: 'bg-emerald-950/90 text-emerald-300 border-emerald-700/60' },
        { id: 'cakupan', label: 'Wilayah Tugas', icon: <Map className="w-4 h-4" />, badge: 'SCR-DNK-A01', docSpec: 'Penugasan Lokasi Kerja Masing-Masing Petugas', badgeColor: 'bg-emerald-950/90 text-emerald-300 border-emerald-700/60' },
      ],
    },
    {
      title: 'KEAMANAN & ATURAN',
      items: [
        { id: 'persetujuan', label: 'Persetujuan Warga (Consent)', icon: <FileCheck2 className="w-4 h-4" />, badge: 'SCR-GOV-01', docSpec: 'Surat Izin Pemeriksaan & Tindak Lanjut dari Warga', badgeColor: 'bg-slate-900 text-slate-300 border-slate-700' },
        { id: 'versi-aturan', label: 'Pedoman Klinis Kemenkes', icon: <GitBranch className="w-4 h-4" />, badge: 'SCR-DNK-F02', docSpec: 'Daftar Standar Baku Penilaian Kesehatan', badgeColor: 'bg-emerald-950/90 text-emerald-300 border-emerald-700/60' },
        { id: 'audit-log', label: 'Catatan Riwayat Sistem', icon: <History className="w-4 h-4" />, badge: 'SCR-PKM-G06', docSpec: 'Riwayat Setiap Aktivitas Petugas di Dalam Sistem', badgeColor: 'bg-teal-950/90 text-teal-300 border-teal-700/60' },
      ],
    },
    {
      title: 'SISTEM & KONEKSI',
      items: [
        { id: 'sinkronisasi', label: 'Kirim Data (Sinkron)', icon: <RefreshCw className="w-4 h-4" />, badge: 'SCR-SYS-01', docSpec: 'Kirim Data dari HP / Laptop Saat Ada Sinyal', badgeColor: 'bg-teal-950/90 text-teal-300 border-teal-700/60' },
        { id: 'integrasi', label: 'Koneksi SATUSEHAT', icon: <Share2 className="w-4 h-4" />, badge: 'SCR-SYS-02', docSpec: 'Status Hubungan dengan Server Kemenkes RI', badgeColor: 'bg-sky-950/90 text-sky-300 border-sky-700/60' },
        { id: 'pengaturan', label: 'Pengaturan & Glosarium', icon: <Settings className="w-4 h-4" />, badge: 'SCR-SYS-04', docSpec: 'Pengaturan Sistem & Glosarium Istilah Medis', badgeColor: 'bg-slate-900 text-slate-300 border-slate-700' },
      ],
    },
  ];

  // Filter sections and items based on role access
  const filteredSections = useMemo(() => {
    const sections = navigationSections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => permissionService.isNavAllowed(roleId, item.id)),
      }))
      .filter((section) => section.items.length > 0);

    // Untuk Kepala Dinas Kesehatan, posisikan group DINKES COMMAND CENTER tepat di urutan ke-2 (setelah OVERVIEW)
    // serta pastikan group KEAMANAN & ATURAN tersembunyi
    if (roleId === 'KEPALA_DINAS') {
      const dinkesIndex = sections.findIndex((s) => s.title === 'DINKES COMMAND CENTER');
      if (dinkesIndex > 1) {
        const [dinkesSection] = sections.splice(dinkesIndex, 1);
        sections.splice(1, 0, dinkesSection);
      }
      return sections.filter((s) => s.title !== 'KEAMANAN & ATURAN');
    }

    // Untuk Kepala Puskesmas, sembunyikan group AKUN & HAK AKSES, KEAMANAN & ATURAN, dan SISTEM & KONEKSI
    if (roleId === 'KEPALA_PUSKESMAS') {
      const hiddenGroups = ['AKUN & HAK AKSES', 'KEAMANAN & ATURAN', 'KEAMANAN & HAK AKSES', 'SISTEM & KONEKSI', 'SISTEM & KOREKSI'];
      return sections.filter((s) => !hiddenGroups.includes(s.title));
    }

    return sections;
  }, [roleId]);

  const handleItemClick = (item: NavItem) => {
    onNavigate(item.id);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#00201C] text-slate-100 select-none">
      {/* Brand Header */}
      <div id="tour-brand-header" className="px-5 py-4 border-b border-[#00332D]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#2E7D5B] flex items-center justify-center text-white shrink-0 shadow-xs">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-bold tracking-tight text-white leading-tight truncate">
              CKG Smart Care
            </h1>
            <p className="text-[11px] text-emerald-400/90 font-medium tracking-wide">
              Intramedika Platform
            </p>
          </div>
        </div>

        {/* User Role & Scope Indicator */}
        <div className="mt-3 pt-2.5 border-t border-[#00332D]/80 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 truncate text-emerald-300">
            <Shield className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
            <span className="font-semibold truncate">{currentUser?.roleName || 'Admin System'}</span>
          </div>
          <span className="shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#00332D] text-slate-300 border border-[#004D40]">
            TERVERIFIKASI
          </span>
        </div>
      </div>

      {/* Navigation Links Scrollable Area */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {filteredSections.map((section) => (
          <div key={section.title} className="space-y-1">
            <h2 className="px-3 text-[10px] font-bold tracking-wider text-slate-400/80 uppercase">
              {section.title}
            </h2>
            <div className="space-y-0.5 pt-1">
              {section.items.map((item) => {
                const isActive = activeNav === item.id;
                const tooltipText = item.badge
                  ? `[${item.badge}] ${item.label}${item.docSpec ? `\nSpesifikasi: ${item.docSpec}` : ''}`
                  : item.docSpec
                  ? `${item.label}\nSpesifikasi: ${item.docSpec}`
                  : item.label;

                return (
                  <button
                    key={item.id}
                    data-tour={`nav-${item.id}`}
                    onClick={() => handleItemClick(item)}
                    title={tooltipText}
                    className={`w-full flex items-center justify-between px-2.5 py-2 text-xs font-medium rounded-lg transition-all group cursor-pointer relative ${
                      isActive
                        ? 'bg-[#2E7D5B] text-white shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-[#002D27]'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-1 truncate">
                      <span className={`shrink-0 ${isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                        {item.icon}
                      </span>
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge ? (
                      <span
                        title={tooltipText}
                        className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded border shrink-0 font-mono tracking-tight transition-transform ${
                          isActive
                            ? 'bg-white/20 text-white border-white/30'
                            : item.badgeColor || 'bg-[#001714] text-emerald-300 border-[#003B33]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    ) : isActive ? (
                      <ChevronRight className="w-3.5 h-3.5 text-white shrink-0" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Sidebar Footer: Kabupaten Pulau Taliabu info */}
      <div className="p-3 border-t border-[#00332D] bg-[#001714]/80 text-[11px] text-slate-400">
        <div className="flex items-center justify-between font-medium">
          <span className="text-slate-300">Kab. Pulau Taliabu</span>
          <span className="text-[10px] px-1.5 py-0.2 bg-[#00332D] text-emerald-300 rounded font-bold">Terintegrasi</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-[264px] h-screen fixed left-0 top-0 z-30 shadow-md">
        {sidebarContent}
      </aside>

      {/* Mobile / Tablet Drawer Overlay */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] lg:hidden"
          onClick={onCloseMobile}
        >
          <div
            className="w-[275px] h-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
