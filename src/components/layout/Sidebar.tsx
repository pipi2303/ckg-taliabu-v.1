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
  Lock,
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
import { useModal } from '../../context/ModalContext';
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
  isFuture?: boolean;
  futureMvp?: string;
  futureDescription?: string;
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
  const { openModal } = useModal();
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
          docSpec: roleId === 'KEPALA_DINAS' ? 'Command Center Kabupaten · F1 · Plafon S3 Agregat · UC DNK-01' : 'Beranda Puskesmas · F1 · Plafon S3 · UC PKM-21, PKM-06',
          badgeColor: 'bg-teal-950/90 text-teal-300 border-teal-700/60',
        },
      ],
    },
    {
      title: 'CARE ORCHESTRATION',
      items: [
        { id: 'prioritas-harian', label: 'Prioritas Hari Ini', icon: <Sparkles className="w-4 h-4 text-emerald-400" />, badge: 'SCR-PKM-B01', docSpec: 'Prioritas Hari Ini (Antrean Kapasitas Layanan) · F1 · Plafon S4 · UC PKM-06, PKM-07', badgeColor: 'bg-teal-950/90 text-teal-300 border-teal-700/60' },
        { id: 'care-task', label: 'Papan Tenggat & SLA', icon: <ListTodo className="w-4 h-4" />, badge: 'SCR-PKM-B05', docSpec: 'Papan Tenggat & Jenjang Pengingat · F1 · Plafon S2 · UC PKM-09', badgeColor: 'bg-teal-950/90 text-teal-300 border-teal-700/60' },
        { id: 'clinical-followup', label: 'Layanan Klinis & FKTP', icon: <Stethoscope className="w-4 h-4 text-teal-400" />, badge: 'SCR-PKM-D01', docSpec: 'Layanan Klinis & Konfirmasi FKTP (D01-D07) · F1 · Plafon S4 · UC PKM-12-16', badgeColor: 'bg-teal-950/90 text-teal-300 border-teal-700/60' },
        { id: 'outreach', label: 'Hasil Kontak & Outreach', icon: <MessageSquare className="w-4 h-4" />, badge: 'SCR-PKM-B03', docSpec: 'Hasil Kontak & Eskalasi Outreach · F1 ⚠ UX-OI-03 · Plafon S2 · UC PKM-09/10', badgeColor: 'bg-amber-950/90 text-amber-300 border-amber-700/60' },
        { id: 'penugasan-lapangan', label: 'Penugasan Outreach', icon: <MapPin className="w-4 h-4" />, badge: 'SCR-PKM-B02', docSpec: 'Penugasan Outreach Kader Posyandu/Pustu · F1 · Plafon S2 · UC PKM-08', badgeColor: 'bg-teal-950/90 text-teal-300 border-teal-700/60' },
        { id: 'kader-app', label: 'Kader Field App', icon: <Smartphone className="w-4 h-4 text-emerald-400" />, badge: 'SCR-KDR-B01', docSpec: 'Aplikasi Lapangan Kader Posyandu (SCR-KDR-A01 s.d E02) · F1 · Plafon S2', badgeColor: 'bg-emerald-950/90 text-emerald-300 border-emerald-700/60' },
        { id: 'citizen-app', label: 'Citizen Sahabat Warga', icon: <Smartphone className="w-4 h-4 text-amber-300" />, badge: 'SCR-WRG-B01', docSpec: 'Aplikasi Sahabat Warga CKG (SCR-WRG-A01 s.d F03 · 17 Layar)', badgeColor: 'bg-amber-950/90 text-amber-300 border-amber-700/60' },
        { id: 'jadwal-kuota', label: 'Jadwal & Kuota', icon: <Calendar className="w-4 h-4" />, badge: 'SCR-PKM-G01', docSpec: 'Jadwal & Kuota Layanan FKTP · F1 · Plafon S0 · UC PKM-23', badgeColor: 'bg-teal-950/90 text-teal-300 border-teal-700/60' },
        { id: 'kandidat-putus', label: 'Kandidat Putus Perawatan', icon: <UserX className="w-4 h-4" />, badge: 'SCR-PKM-B04', docSpec: 'Drop-out & Kandidat Putus Perawatan · F1 · Plafon S3 · UC PKM-11', badgeColor: 'bg-rose-950/90 text-rose-300 border-rose-700/60' },
        { id: 'beban-kerja', label: 'Beban Kerja Tim', icon: <Briefcase className="w-4 h-4" />, badge: 'SCR-PKM-G02', docSpec: 'Distribusi Beban Kerja Petugas & Kader · F2 · Plafon S2 · UC PKM-22', badgeColor: 'bg-blue-950/90 text-blue-300 border-blue-700/60' },
        { id: 'outreach-config', label: 'Konfigurasi Jenjang', icon: <Sliders className="w-4 h-4" />, badge: 'SCR-PKM-B05', docSpec: 'Konfigurasi Jenjang Eskalasi & SLA Outreach · F1 · Plafon S2 · UC PKM-09', badgeColor: 'bg-teal-950/90 text-teal-300 border-teal-700/60' },
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
      ],
    },
    {
      title: 'DINKES COMMAND CENTER',
      items: [
        { id: 'dinkes-command-center', label: 'Command Center Eksekutif', icon: <Sparkles className="w-4 h-4 text-teal-400" />, badge: 'SCR-DNK-A03', docSpec: 'Command Center untuk Pimpinan Daerah · F1 · Plafon S3 Agregat · UC DNK-01', badgeColor: 'bg-emerald-950/90 text-emerald-300 border-emerald-700/60' },
        { id: 'dinkes-ringkasan', label: 'Ringkasan Kabupaten', icon: <Sparkles className="w-4 h-4 text-teal-400" />, badge: 'SCR-DNK-A02', docSpec: 'Command Center Kabupaten · F1 · Plafon S3 Agregat · UC DNK-01', badgeColor: 'bg-emerald-950/90 text-emerald-300 border-emerald-700/60' },
        { id: 'dinkes-impact-index', label: 'CKG Impact Index', icon: <Activity className="w-4 h-4 text-emerald-400" />, badge: 'SCR-DNK-B01', docSpec: 'CKG Impact Index (Level 1-3) · F1 (OI-08) · Plafon S3 Agregat · UC DNK-02', badgeColor: 'bg-emerald-950/90 text-emerald-300 border-emerald-700/60' },
        { id: 'dinkes-kaskade', label: 'Kaskade Tindak Lanjut', icon: <Layers className="w-4 h-4 text-sky-400" />, badge: 'SCR-DNK-B02', docSpec: 'Rel Kaskade & Analisis Drop-off · F1 · Plafon S3 Agregat · UC DNK-02/05', badgeColor: 'bg-emerald-950/90 text-emerald-300 border-emerald-700/60' },
        { id: 'dinkes-wilayah', label: 'Analisis Wilayah', icon: <MapPin className="w-4 h-4 text-teal-300" />, badge: 'SCR-DNK-C01', docSpec: 'Peta Risiko Desa & Kecamatan · F1 (DS-OI-06) · Plafon S3 Agregat · UC DNK-03', badgeColor: 'bg-emerald-950/90 text-emerald-300 border-emerald-700/60' },
        { id: 'dinkes-gap', label: 'Disparitas Tindak Lanjut', icon: <AlertTriangle className="w-4 h-4 text-rose-400" />, badge: 'SCR-DNK-C02', docSpec: 'Daftar Disparitas & Gap Wilayah · F1 · Plafon S3 Agregat · UC DNK-05', badgeColor: 'bg-emerald-950/90 text-emerald-300 border-emerald-700/60' },
        { id: 'dinkes-kinerja-pkm', label: 'Kinerja Puskesmas', icon: <Building2 className="w-4 h-4 text-indigo-400" />, badge: 'SCR-DNK-D01', docSpec: 'Kinerja Tindak Lanjut per Puskesmas · F1 · Plafon S3 Agregat · UC DNK-04', badgeColor: 'bg-emerald-950/90 text-emerald-300 border-emerald-700/60' },
        { id: 'dinkes-penyebab-kendala', label: 'Penyebab & Kendala', icon: <HeartHandshake className="w-4 h-4 text-amber-400" />, badge: 'SCR-DNK-D02', docSpec: 'Sebaran Penyebab & Kendala CMP-07 · F2 (UX-OI-03) · Plafon S3 Agregat · UC DNK-07', badgeColor: 'bg-blue-950/90 text-blue-300 border-blue-700/60' },
        { id: 'dinkes-intervensi-populasi', label: 'Intervensi Populasi', icon: <Sparkles className="w-4 h-4 text-emerald-300" />, badge: 'SCR-DNK-E01', docSpec: 'Penetapan & Pelacakan Intervensi Populasi · F2 · Plafon S3 Agregat · UC DNK-07', badgeColor: 'bg-blue-950/90 text-blue-300 border-blue-700/60' },
        { id: 'dinkes-perbandingan-periode', label: 'Perbandingan Periode', icon: <TrendingUp className="w-4 h-4 text-sky-300" />, badge: 'SCR-DNK-B03', docSpec: 'Perbandingan Metrik Antar-Periode · F3 · Plafon S3 Agregat · UC DNK-09', badgeColor: 'bg-purple-950/90 text-purple-300 border-purple-700/60' },
        { id: 'dinkes-kualitas-data', label: 'Kualitas & Integrasi', icon: <Clock className="w-4 h-4 text-slate-300" />, badge: 'SCR-DNK-F03', docSpec: 'Status Integrasi INT-01 s.d INT-06 & Kualitas Data · F1 · Plafon S0 · UC SYS-01/09', badgeColor: 'bg-emerald-950/90 text-emerald-300 border-emerald-700/60' },
        { id: 'dinkes-kepala-daerah', label: 'Tampilan Kepala Daerah', icon: <ShieldCheck className="w-4 h-4 text-amber-300" />, badge: 'SCR-DNK-F06', docSpec: 'Ringkasan Eksekutif Kepala Daerah / Bupati · F2 · Plafon S3 Agregat · UC DNK-01', badgeColor: 'bg-blue-950/90 text-blue-300 border-blue-700/60' },
        { id: 'dinkes-laporan', label: 'Laporan & Ekspor', icon: <FileText className="w-4 h-4 text-teal-400" />, badge: 'SCR-DNK-F05', docSpec: 'Ekspor Laporan Bupati & Kemenkes (PDF/Excel) · F2 · Plafon S3 Agregat · UC DNK-10', badgeColor: 'bg-blue-950/90 text-blue-300 border-blue-700/60' },
        { id: 'dinkes-audit-drilldown', label: 'Audit Penelusuran', icon: <History className="w-4 h-4 text-slate-400" />, badge: 'SCR-DNK-C03', docSpec: 'Penelusuran Agregat ke Individu Terkendali CMP-09 · F2 · Plafon S1 · UC DNK-06', badgeColor: 'bg-emerald-950/90 text-emerald-300 border-emerald-700/60' },
      ],
    },
    {
      title: 'PEMANTAUAN & OUTCOME',
      items: [
        { id: 'pemantauan-aktif', label: 'Siklus Pemantauan', icon: <Activity className="w-4 h-4 text-teal-400" />, badge: 'SCR-PKM-F01', docSpec: 'Siklus Pemantauan Berjalan · F1 · Plafon S3 · UC PKM-20', badgeColor: 'bg-teal-950/90 text-teal-300 border-teal-700/60' },
        { id: 'kontrol-harian', label: 'Kunjungan Kontrol', icon: <Calendar className="w-4 h-4 text-emerald-400" />, badge: 'SCR-PKM-F02', docSpec: 'Kunjungan Kontrol Ulang Terjadwal · F1 · Plafon S4 · UC PKM-18', badgeColor: 'bg-teal-950/90 text-teal-300 border-teal-700/60' },
        { id: 'menunggu-evaluasi', label: 'Evaluasi Status Terkendali', icon: <Clock className="w-4 h-4 text-amber-400" />, badge: 'SCR-PKM-F04', docSpec: 'Penetapan Status Terkendali · F1 ⚠ OI-08 · Plafon S4 · UC PKM-18', badgeColor: 'bg-amber-950/90 text-amber-300 border-amber-700/60' },
        { id: 'integritas-monitoring', label: 'Integritas & Audit PKM', icon: <ShieldCheck className="w-4 h-4 text-sky-400" />, badge: 'SCR-PKM-G06', docSpec: 'Jejak Audit & Integritas Puskesmas CMP-09 · F1 · Plafon S1 · UC DNK-12', badgeColor: 'bg-teal-950/90 text-teal-300 border-teal-700/60' },
        { id: 'kepatuhan-kendala', label: 'Kepatuhan & Penyebab', icon: <HeartHandshake className="w-4 h-4 text-teal-300" />, badge: 'SCR-PKM-F03', docSpec: 'Kepatuhan Minum Obat & Penyebab CMP-07 · F1 ⚠ UX-OI-03 · Plafon S4 · UC PKM-19', badgeColor: 'bg-amber-950/90 text-amber-300 border-amber-700/60' },
        { id: 'kohort-kondisi', label: 'Kohort per Penyakit', icon: <Layers className="w-4 h-4 text-indigo-400" />, badge: 'SCR-PKM-F06', docSpec: 'Kohort Penyakit Kronis (HT, DM, Dislipidemia) · F2 · Plafon S3 · UC PKM-20', badgeColor: 'bg-blue-950/90 text-blue-300 border-blue-700/60' },
        { id: 'tren-outcome', label: 'Tren Outcome Pasien', icon: <TrendingUp className="w-4 h-4 text-emerald-300" />, badge: 'SCR-PKM-F07', docSpec: 'Tren Outcome Pasien Longitudinal Bersama Terapi · F2 · Plafon S4 · UC PKM-18', badgeColor: 'bg-blue-950/90 text-blue-300 border-blue-700/60' },
        { id: 'risiko-putus', label: 'Risiko Putus Perawatan', icon: <AlertTriangle className="w-4 h-4 text-rose-400" />, badge: 'SCR-PKM-B04', docSpec: 'Deteksi Dini & Pencegahan Drop-out Perawatan · F1 · Plafon S3 · UC PKM-11', badgeColor: 'bg-rose-950/90 text-rose-300 border-rose-700/60' },
      ],
    },
    {
      title: 'REGISTRY & INGESTION',
      items: [
        { id: 'registry', label: 'Registry Wilayah Kerja', icon: <ClipboardList className="w-4 h-4" />, badge: 'SCR-PKM-C01', docSpec: 'Registry Wilayah Kerja CKG · F1 · Plafon S4 · UC PKM-02', badgeColor: 'bg-teal-950/90 text-teal-300 border-teal-700/60' },
        { id: 'data-quality', label: 'Antrean Data Bermasalah', icon: <AlertCircle className="w-4 h-4" />, badge: 'SCR-PKM-C04', docSpec: 'Antrean Data Bermasalah (NIK/Anomali) · F1 · Plafon S3 · UC PKM-05', badgeColor: 'bg-amber-950/90 text-amber-300 border-amber-700/60' },
        { id: 'duplicate-review', label: 'Peninjauan Duplikat', icon: <Users className="w-4 h-4" />, badge: 'SCR-PKM-C05', docSpec: 'Peninjauan & Resolusi Duplikasi Identitas · F2 · Plafon S3 · UC PKM-05', badgeColor: 'bg-blue-950/90 text-blue-300 border-blue-700/60' },
        { id: 'import-ckg', label: 'Import Data CKG', icon: <FileText className="w-4 h-4" />, badge: 'SCR-REG-04', docSpec: 'Ingestion & Impor Berkas CSV/Excel CKG · F1', badgeColor: 'bg-teal-950/90 text-teal-300 border-teal-700/60' },
        { id: 'ingestion-monitor', label: 'Ingestion Monitor', icon: <Activity className="w-4 h-4" />, badge: 'SCR-SYS-03', docSpec: 'Monitoring Pipeline Ingestion Realtime', badgeColor: 'bg-sky-950/90 text-sky-300 border-sky-700/60' },
        { id: 'import-history', label: 'Riwayat Import', icon: <History className="w-4 h-4" />, badge: 'SCR-REG-05', docSpec: 'Riwayat & Audit Log Impor Berkas CKG', badgeColor: 'bg-slate-900 text-slate-300 border-slate-700' },
        { id: 'source-mapping', label: 'Pemetaan Kolom', icon: <Share2 className="w-4 h-4" />, badge: 'SCR-REG-06', docSpec: 'Pemetaan Kolom & Schema Matching Ingestion', badgeColor: 'bg-slate-900 text-slate-300 border-slate-700' },
      ],
    },
    {
      title: 'STRATIFIKASI & PRIORITAS',
      items: [
        { id: 'stratifikasi', label: 'Dasar Klasifikasi CRS', icon: <Activity className="w-4 h-4" />, badge: 'SCR-PKM-C03', docSpec: 'Dasar Klasifikasi & Aturan Deterministik CRS · F1 · Plafon S4 · UC PKM-03/04', badgeColor: 'bg-teal-950/90 text-teal-300 border-teal-700/60' },
      ],
    },
    {
      title: 'ORGANIZATION',
      items: [
        { id: 'wilayah', label: 'Wilayah Binaan', icon: <MapPin className="w-4 h-4" />, badge: 'SCR-DNK-F01', docSpec: 'Master Data Wilayah & Desa Binaan · F1 · Plafon S1 · UC DNK-11', badgeColor: 'bg-emerald-950/90 text-emerald-300 border-emerald-700/60' },
        { id: 'faskes', label: 'Fasilitas & Rujukan', icon: <Building2 className="w-4 h-4" />, badge: 'SCR-PKM-E04', docSpec: 'Daftar Jejaring Fasilitas Rujukan FKTP · F2 · Plafon S0 · UC PKM-17, DNK-11', badgeColor: 'bg-blue-950/90 text-blue-300 border-blue-700/60' },
        { id: 'layanan', label: 'Layanan', icon: <Stethoscope className="w-4 h-4" />, badge: 'SCR-ADM-03', docSpec: 'Katalog Layanan & Prosedur FKTP/FKRTL', badgeColor: 'bg-slate-900 text-slate-300 border-slate-700' },
      ],
    },
    {
      title: 'ACCESS MANAGEMENT',
      items: [
        { id: 'pengguna', label: 'Akun Staf & Kader', icon: <Users className="w-4 h-4" />, badge: 'SCR-PKM-G03', docSpec: 'Akun & Peran Puskesmas · F1 · Plafon S1 · UC PKM-24', badgeColor: 'bg-teal-950/90 text-teal-300 border-teal-700/60' },
        { id: 'peran', label: 'Peran & Hak Akses', icon: <ShieldCheck className="w-4 h-4" />, badge: 'SCR-ADM-02', docSpec: 'Manajemen Peran & Kebijakan Hak Akses RBAC · F1', badgeColor: 'bg-emerald-950/90 text-emerald-300 border-emerald-700/60' },
        { id: 'cakupan', label: 'Cakupan Wilayah', icon: <Map className="w-4 h-4" />, badge: 'SCR-DNK-A01', docSpec: 'Penetapan Identitas & Cakupan Wilayah Pengguna · F1 · Plafon S0 · UC DNK-12', badgeColor: 'bg-emerald-950/90 text-emerald-300 border-emerald-700/60' },
      ],
    },
    {
      title: 'GOVERNANCE',
      items: [
        { id: 'persetujuan', label: 'Persetujuan', icon: <FileCheck2 className="w-4 h-4" />, badge: 'SCR-GOV-01', docSpec: 'Persetujuan Tindakan & Consent Medis Warga · S0', badgeColor: 'bg-slate-900 text-slate-300 border-slate-700' },
        { id: 'versi-aturan', label: 'Versi Aturan CRS', icon: <GitBranch className="w-4 h-4" />, badge: 'SCR-DNK-F02', docSpec: 'Tata Kelola Versi Aturan Klinis CRS & Simulasi Dampak · F1 · Plafon S0 · UC DNK-11', badgeColor: 'bg-emerald-950/90 text-emerald-300 border-emerald-700/60' },
        { id: 'audit-log', label: 'Jejak Audit Puskesmas', icon: <History className="w-4 h-4" />, badge: 'SCR-PKM-G06', docSpec: 'Jejak Audit Puskesmas CMP-09 · F1 · Plafon S1 · UC DNK-12 turunan', badgeColor: 'bg-teal-950/90 text-teal-300 border-teal-700/60' },
      ],
    },
    {
      title: 'SYSTEM',
      items: [
        { id: 'sinkronisasi', label: 'Sinkronisasi', icon: <RefreshCw className="w-4 h-4" />, badge: 'SCR-SYS-01', docSpec: 'Sinkronisasi Data Offline-to-Online PWA Lapangan', badgeColor: 'bg-teal-950/90 text-teal-300 border-teal-700/60' },
        { id: 'integrasi', label: 'Integrasi', icon: <Share2 className="w-4 h-4" />, badge: 'SCR-SYS-02', docSpec: 'Monitoring Konektor API & Integrasi SATUSEHAT', badgeColor: 'bg-sky-950/90 text-sky-300 border-sky-700/60' },
        { id: 'pengaturan', label: 'Pengaturan', icon: <Settings className="w-4 h-4" />, badge: 'SCR-SYS-04', docSpec: 'Pengaturan Konfigurasi Parameter Sistem', badgeColor: 'bg-slate-900 text-slate-300 border-slate-700' },
      ],
    },
    {
      title: 'ROADMAP TAHAP LANJUT',
      items: [
        {
          id: 'future-facility',
          label: 'Alokasi Logistik Faskes',
          icon: <Building2 className="w-4 h-4" />,
          isFuture: true,
          futureMvp: 'Tahap Lanjut',
          futureDescription: 'Optimasi kapasitas laboratorium, perbekalan obat antihipertensi/diabetes, dan penjadwalan tenaga medis faskes.',
        },
        {
          id: 'future-monitoring',
          label: 'Outcome & Command Center',
          icon: <Activity className="w-4 h-4" />,
          isFuture: true,
          futureMvp: 'Tahap Lanjut',
          futureDescription: 'Pemantauan kohort tekanan darah/gula darah longitudinal dan Population Health Command Center Dinkes Pulau Taliabu.',
        },
        {
          id: 'future-ai',
          label: 'Advanced AI Assistant',
          icon: <Sparkles className="w-4 h-4" />,
          isFuture: true,
          futureMvp: 'Tahap Lanjut',
          futureDescription: 'Analisis prediktif tren penyakit tidak menular (PTM) wilayah berbasis kecerdasan buatan.',
        },
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
    if (roleId === 'KEPALA_DINAS') {
      const dinkesIndex = sections.findIndex((s) => s.title === 'DINKES COMMAND CENTER');
      if (dinkesIndex > 1) {
        const [dinkesSection] = sections.splice(dinkesIndex, 1);
        sections.splice(1, 0, dinkesSection);
      }
    }

    return sections;
  }, [roleId]);

  const handleItemClick = (item: NavItem) => {
    if (item.isFuture) {
      openModal({
        title: `${item.label}`,
        subtitle: 'Fitur Tahap Berikutnya (Roadmap Terencana)',
        size: 'md',
        content: ({ closeModal }) => (
          <div className="space-y-4">
            <div className="p-4 bg-[#E1F5FE] border border-[#BDE3F5] rounded-xl text-black flex items-start gap-3">
              <Lock className="w-5 h-5 text-[#397B94] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold">Akan tersedia pada rilis modul berikutnya</h4>
                <p className="text-xs text-[#334643] mt-1 leading-relaxed">{item.futureDescription}</p>
              </div>
            </div>

            <div className="text-xs text-[#60716D] space-y-2 border-l-2 border-[#00201C] pl-3 py-1">
              <p>
                <strong>Prinsip Arsitektur:</strong> Platform terintegrasi permanen (Authentication, Tata Kelola Hak Akses, Master Data, Governance, dan Sync Infrastructure).
              </p>
              <p>
                Modul klinis & operasional di atas akan ditambahkan sebagai lapisan modular tanpa mengubah fondasi yang ada saat ini.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-[#00201C] text-white text-xs font-semibold rounded-lg hover:bg-[#00332D]"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        ),
      });
      return;
    }

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
                        : item.isFuture
                        ? 'text-slate-400 hover:text-slate-200 hover:bg-[#002B26]/60 opacity-70'
                        : 'text-slate-300 hover:text-white hover:bg-[#002D27]'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-1 truncate">
                      <span className={`shrink-0 ${isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                        {item.icon}
                      </span>
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.isFuture ? (
                      <span 
                        title={item.futureDescription || item.futureMvp}
                        className="text-[9px] font-bold px-1.5 py-0.5 bg-[#001714] text-slate-400 rounded group-hover:text-emerald-300 border border-[#003B33] shrink-0"
                      >
                        {item.futureMvp}
                      </span>
                    ) : item.badge ? (
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
