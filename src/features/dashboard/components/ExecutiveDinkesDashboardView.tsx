import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Building2,
  MapPin,
  TrendingUp,
  Activity,
  Layers,
  AlertTriangle,
  FileText,
  Clock,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  ArrowRight,
  Sliders,
  Users,
  Compass,
  PieChart,
  HeartPulse,
  Navigation,
  Pill,
  GitBranch,
  History,
  Info,
  ChevronRight,
  Printer,
  ExternalLink,
  Eye,
} from 'lucide-react';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { ActionIconButton } from '../../../components/common/ActionIconButton';
import { Tooltip } from '../../../components/common/Tooltip';
import { Badge } from '../../../components/common/Badge';
import { DocBadge } from '../../../components/common/DocBadge';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { facilityPerformanceService } from '../../../services/facilityPerformanceService';
import { impactIndexService, ImpactIndexSummary } from '../../../services/impactIndexService';
import { populationCascadeService } from '../../../services/populationCascadeService';
import { commandCenterExportService } from '../../../services/commandCenterExportService';
import { ruleVersionService } from '../../../services/ruleVersionService';
import { ExecutiveKPIRechartsSection } from './ExecutiveKPIRechartsSection';
import { FacilityPerformanceSummary, CascadeAggregation } from '../../../types';

interface ExecutiveDinkesDashboardViewProps {
  onNavigate: (navId: string) => void;
}

export const ExecutiveDinkesDashboardView: React.FC<ExecutiveDinkesDashboardViewProps> = ({
  onNavigate,
}) => {
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const [facilities, setFacilities] = useState<FacilityPerformanceSummary[]>([]);
  const [impact, setImpact] = useState<ImpactIndexSummary | null>(null);
  const [cascade, setCascade] = useState<CascadeAggregation | null>(null);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'FACILITIES' | 'OUTCOME'>('OVERVIEW');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExportingPDF, setIsExportingPDF] = useState<boolean>(false);
  const [isExportingExcel, setIsExportingExcel] = useState<boolean>(false);

  useEffect(() => {
    loadExecutiveData();
  }, []);

  const loadExecutiveData = async () => {
    setIsLoading(true);
    try {
      const [facSummaries, impactData, cascadeData] = await Promise.all([
        facilityPerformanceService.getFacilitySummaries(),
        impactIndexService.getImpactIndex(),
        populationCascadeService.getCascadeAggregation(),
      ]);
      setFacilities(facSummaries);
      setImpact(impactData);
      setCascade(cascadeData);
    } catch (err) {
      console.error('Failed to load executive dinkes dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!currentUser) return;
    setIsExportingPDF(true);
    try {
      await commandCenterExportService.exportExecutivePDF(currentUser);
      addToast('Laporan Eksekutif Resmi Kadinkes (.pdf) berhasil diunduh', 'success');
    } catch (err) {
      console.error('PDF export error:', err);
      addToast('Gagal membuat berkas PDF eksekutif', 'error');
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleExportExcel = async () => {
    if (!currentUser) return;
    setIsExportingExcel(true);
    try {
      await commandCenterExportService.exportCommandCenterExcel(currentUser);
      addToast('Workbook Rekapitulasi Eksekutif (.xlsx) berhasil diunduh', 'success');
    } catch (err) {
      console.error('Excel export error:', err);
      addToast('Gagal membuat berkas Excel eksekutif', 'error');
    } finally {
      setIsExportingExcel(false);
    }
  };

  // Aggregations
  const totalScreened = cascade?.totalScreened || 1250;
  const totalFollowedUp = cascade?.attendedFollowUp || 780;
  const followUpRate = totalScreened > 0 ? Math.round((totalFollowedUp / totalScreened) * 100) : 62;
  const totalPuskesmas = facilities.length || 8;
  const meetingTargetCount = facilities.filter((f) => f.continuityRate >= 50).length || 6;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Executive Strategic Hero Banner */}
      <div className="bg-gradient-to-br from-[#00201C] via-[#00332D] to-[#0D443C] rounded-2xl p-6 text-white shadow-sm border border-emerald-900/40">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> Pusat Kendali Manajemen Kesehatan
              </span>
              <span className="text-[11px] text-teal-200/90 font-medium">
                Dinas Kesehatan Kabupaten Pulau Taliabu
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white">
                Executive Dashboard — {currentUser?.name || 'H. Ahmad Yani, SKM., M.Kes'}
              </h1>
              <DocBadge code="SCR-DNK-A01" size="sm" />
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Pemantauan strategis capaian Cek Kesehatan Gratis (CKG), evaluasi kinerja 8 Puskesmas, mitigasi hambatan geografis maritim, serta pengambilan kebijakan berbasis data terpadu se-Kabupaten Pulau Taliabu.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap gap-2 shrink-0">
            <ActionIconButton
              variant="teal"
              size="sm"
              onClick={() => onNavigate('dinkes-ringkasan')}
              icon={<Sparkles className="w-4 h-4 text-white" />}
              tooltip="Buka Ringkasan Eksekutif Wilayah Dinas Kesehatan (SCR-DNK-A01)"
              tooltipPosition="bottom"
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold border-0 shadow-sm"
            />
            <ActionIconButton
              variant="outline"
              size="sm"
              onClick={handleExportPDF}
              isLoading={isExportingPDF}
              icon={<Download className="w-4 h-4 text-emerald-300" />}
              tooltip="Unduh Dokumen Laporan Eksekutif Resmi Kadinkes (.pdf)"
              tooltipPosition="bottom"
              className="text-white bg-white/10 hover:bg-white/20 border-white/25 font-semibold"
            />
            <ActionIconButton
              variant="outline"
              size="sm"
              onClick={handleExportExcel}
              isLoading={isExportingExcel}
              icon={<FileSpreadsheet className="w-4 h-4 text-emerald-300" />}
              tooltip="Unduh Rekapitulasi Data Kinerja 8 Puskesmas (.xlsx)"
              tooltipPosition="bottom"
              className="text-white bg-white/10 hover:bg-white/20 border-white/25 font-semibold"
            />
          </div>
        </div>
      </div>

      {/* 2. Top Executive Management Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5">
        <div
          onClick={() => onNavigate('dinkes-ringkasan')}
          className="bg-white p-4 rounded-xl border border-[#D8E5E2] shadow-2xs hover:border-[#00201C] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#60716D] mb-1.5">
            <span className="text-[11px] font-semibold">Total Warga Diperiksa</span>
            <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700 group-hover:bg-teal-700 group-hover:text-white transition-colors">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-black tracking-tight">{totalScreened.toLocaleString('id-ID')}</p>
          <p className="text-[10px] text-teal-700 font-medium mt-0.5">8 Kecamatan (100% Wilayah)</p>
        </div>

        <div
          onClick={() => onNavigate('dinkes-kaskade')}
          className="bg-white p-4 rounded-xl border border-[#D8E5E2] shadow-2xs hover:border-[#00201C] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#60716D] mb-1.5">
            <span className="text-[11px] font-semibold">Warga Sudah Ditangani</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 group-hover:bg-emerald-700 group-hover:text-white transition-colors">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-black tracking-tight">{followUpRate}%</p>
          <p className="text-[10px] text-emerald-700 font-medium mt-0.5">{totalFollowedUp} Warga Tertangani</p>
        </div>

        <div
          onClick={() => onNavigate('dinkes-impact-index')}
          className="bg-white p-4 rounded-xl border border-[#D8E5E2] shadow-2xs hover:border-[#00201C] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#60716D] mb-1.5">
            <span className="text-[11px] font-semibold">Penurunan Risiko Sakit</span>
            <div className="p-1.5 rounded-lg bg-sky-50 text-sky-700 group-hover:bg-sky-700 group-hover:text-white transition-colors">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-sky-800 tracking-tight">-18.4%</p>
          <p className="text-[10px] text-sky-700 font-medium mt-0.5">Pencegahan Komplikasi</p>
        </div>

        <div
          onClick={() => onNavigate('dinkes-kinerja-pkm')}
          className="bg-white p-4 rounded-xl border border-[#D8E5E2] shadow-2xs hover:border-[#00201C] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#60716D] mb-1.5">
            <span className="text-[11px] font-semibold">Puskesmas Capai Target</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 group-hover:bg-indigo-700 group-hover:text-white transition-colors">
              <Building2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-black tracking-tight">{meetingTargetCount} / {totalPuskesmas}</p>
          <p className="text-[10px] text-indigo-700 font-medium mt-0.5">Mencapai Standar Pelayanan</p>
        </div>

        <div
          onClick={() => onNavigate('dinkes-gap')}
          className="bg-white p-4 rounded-xl border border-[#D8E5E2] shadow-2xs hover:border-[#00201C] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#60716D] mb-1.5">
            <span className="text-[11px] font-semibold">Kesenjangan Rujukan</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700 group-hover:bg-amber-700 group-hover:text-white transition-colors">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-amber-800 tracking-tight">38.2%</p>
          <p className="text-[10px] text-amber-700 font-medium mt-0.5">Taliabu Selatan & Barat</p>
        </div>

        <div
          onClick={() => onNavigate('tren-outcome')}
          className="bg-white p-4 rounded-xl border border-[#D8E5E2] shadow-2xs hover:border-[#00201C] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#60716D] mb-1.5">
            <span className="text-[11px] font-semibold">Kondisi Kesehatan Terkontrol</span>
            <div className="p-1.5 rounded-lg bg-[#EBF7F2] text-[#2E7D5B] group-hover:bg-[#2E7D5B] group-hover:text-white transition-colors">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-[#2E7D5B] tracking-tight">72.4%</p>
          <p className="text-[10px] text-[#2E7D5B] font-medium mt-0.5">Tensi & Gula Darah Aman</p>
        </div>
      </div>

      {/* 3. Executive KPI Recharts Analytics (Grafik Batang & Grafik Area 6 KPI) */}
      <ExecutiveKPIRechartsSection onNavigate={onNavigate} />

      {/* 4. Curated Management Feature Hub */}
      <div className="bg-white p-5 rounded-2xl border border-[#D8E5E2] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#D8E5E2]">
          <div>
            <h2 className="text-sm font-bold text-black uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#2E7D5B]" />
              Katalog Fitur Khusus Manajemen Dinas Kesehatan
            </h2>
            <p className="text-xs text-[#60716D] mt-0.5">
              Akses cepat instrumen pengambil keputusan, evaluasi 8 puskesmas wilayah, dan pemantauan outcome kesehatan.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-[#F0F5F4] p-1 rounded-xl border border-[#D8E5E2] text-xs">
            <button
              onClick={() => setActiveTab('OVERVIEW')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeTab === 'OVERVIEW' ? 'bg-[#00201C] text-white shadow-2xs' : 'text-[#60716D] hover:text-black'
              }`}
            >
              Semua Modul
            </button>
            <button
              onClick={() => setActiveTab('FACILITIES')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeTab === 'FACILITIES' ? 'bg-[#00201C] text-white shadow-2xs' : 'text-[#60716D] hover:text-black'
              }`}
            >
              Puskesmas & Wilayah
            </button>
            <button
              onClick={() => setActiveTab('OUTCOME')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeTab === 'OUTCOME' ? 'bg-[#00201C] text-white shadow-2xs' : 'text-[#60716D] hover:text-black'
              }`}
            >
              Pemantauan & Outcome
            </button>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
          {/* Pilar 1: Komando & Pengambilan Keputusan */}
          {(activeTab === 'OVERVIEW' || activeTab === 'FACILITIES') && (
            <div className="bg-[#F8FBFA] p-4 rounded-xl border border-[#D8E5E2] flex flex-col justify-between space-y-3 hover:border-[#00201C] transition-all">
              <div>
                <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center mb-2.5 font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-black">Executive Command Center</h3>
                <p className="text-[11px] text-[#60716D] mt-1 leading-relaxed">
                  Ringkasan populasi, visualisasi kaskade CKG, indeks dampak risiko, dan generator dokumen resmi untuk Kepala Daerah.
                </p>
              </div>
              <div className="space-y-1.5 pt-2 border-t border-[#D8E5E2]/80">
                <button
                  onClick={() => onNavigate('dinkes-ringkasan')}
                  className="w-full text-left text-[11px] font-semibold text-teal-800 hover:text-teal-950 hover:underline flex items-center justify-between cursor-pointer"
                >
                  <span>• Ringkasan Wilayah Dinas Kesehatan</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onNavigate('dinkes-impact-index')}
                  className="w-full text-left text-[11px] font-semibold text-teal-800 hover:text-teal-950 hover:underline flex items-center justify-between cursor-pointer"
                >
                  <span>• CKG Impact Index & Reduksi</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onNavigate('dinkes-laporan')}
                  className="w-full text-left text-[11px] font-semibold text-teal-800 hover:text-teal-950 hover:underline flex items-center justify-between cursor-pointer"
                >
                  <span>• Laporan Resmi & Ekspor PDF</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Pilar 2: Evaluasi Kinerja Puskesmas & Wilayah */}
          {(activeTab === 'OVERVIEW' || activeTab === 'FACILITIES') && (
            <div className="bg-[#F8FBFA] p-4 rounded-xl border border-[#D8E5E2] flex flex-col justify-between space-y-3 hover:border-[#00201C] transition-all">
              <div>
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center mb-2.5 font-bold">
                  <Building2 className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-black">Kinerja 8 Puskesmas & Wilayah</h3>
                <p className="text-[11px] text-[#60716D] mt-1 leading-relaxed">
                  Analisis disparitas 8 kecamatan, rujukan tertunda, audit penyebab kendala maritim, dan komparasi tren antar periode.
                </p>
              </div>
              <div className="space-y-1.5 pt-2 border-t border-[#D8E5E2]/80">
                <button
                  onClick={() => onNavigate('dinkes-kinerja-pkm')}
                  className="w-full text-left text-[11px] font-semibold text-indigo-800 hover:text-indigo-950 hover:underline flex items-center justify-between cursor-pointer"
                >
                  <span>• Evaluasi Kinerja 8 Puskesmas</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onNavigate('dinkes-wilayah')}
                  className="w-full text-left text-[11px] font-semibold text-indigo-800 hover:text-indigo-950 hover:underline flex items-center justify-between cursor-pointer"
                >
                  <span>• Analisis 8 Wilayah Kecamatan</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onNavigate('dinkes-penyebab-kendala')}
                  className="w-full text-left text-[11px] font-semibold text-indigo-800 hover:text-indigo-950 hover:underline flex items-center justify-between cursor-pointer"
                >
                  <span>• Kendala Transportasi & Logistik</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Pilar 3: Kaskade & Intervensi Sasaran */}
          {(activeTab === 'OVERVIEW' || activeTab === 'FACILITIES' || activeTab === 'OUTCOME') && (
            <div className="bg-[#F8FBFA] p-4 rounded-xl border border-[#D8E5E2] flex flex-col justify-between space-y-3 hover:border-[#00201C] transition-all">
              <div>
                <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center mb-2.5 font-bold">
                  <Layers className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-black">Kaskade & Intervensi Terpadu</h3>
                <p className="text-[11px] text-[#60716D] mt-1 leading-relaxed">
                  Monitoring konversi skrining, analisis rujukan tertunda, dan intervensi sasaran berbasis kelompok prioritas.
                </p>
              </div>
              <div className="space-y-1.5 pt-2 border-t border-[#D8E5E2]/80">
                <button
                  onClick={() => onNavigate('dinkes-kaskade')}
                  className="w-full text-left text-[11px] font-semibold text-sky-800 hover:text-sky-950 hover:underline flex items-center justify-between cursor-pointer"
                >
                  <span>• Kaskade Tindak Lanjut CKG</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onNavigate('dinkes-gap')}
                  className="w-full text-left text-[11px] font-semibold text-sky-800 hover:text-sky-950 hover:underline flex items-center justify-between cursor-pointer"
                >
                  <span>• Disparitas Akses & Rujukan</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onNavigate('dinkes-intervensi-populasi')}
                  className="w-full text-left text-[11px] font-semibold text-sky-800 hover:text-sky-950 hover:underline flex items-center justify-between cursor-pointer"
                >
                  <span>• Rencana Intervensi Sasaran</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Pilar 4: Pemantauan Pasien & Outcome Jangka Panjang */}
          {(activeTab === 'OVERVIEW' || activeTab === 'OUTCOME') && (
            <div className="bg-[#F8FBFA] p-4 rounded-xl border border-[#D8E5E2] flex flex-col justify-between space-y-3 hover:border-[#00201C] transition-all">
              <div>
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center mb-2.5 font-bold">
                  <Activity className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-black">Pemantauan & Outcome</h3>
                <p className="text-[11px] text-[#60716D] mt-1 leading-relaxed">
                  Pemantauan kohort PTM aktif, evaluasi tekanan darah/gula darah terkontrol, dan mitigasi risiko putus pengobatan.
                </p>
              </div>
              <div className="space-y-1.5 pt-2 border-t border-[#D8E5E2]/80">
                <button
                  onClick={() => onNavigate('pemantauan-aktif')}
                  className="w-full text-left text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 hover:underline flex items-center justify-between cursor-pointer"
                >
                  <span>• Pasien Pemantauan Aktif</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onNavigate('integritas-monitoring')}
                  className="w-full text-left text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 hover:underline flex items-center justify-between cursor-pointer"
                >
                  <span>• Integritas Monitoring</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onNavigate('tren-outcome')}
                  className="w-full text-left text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 hover:underline flex items-center justify-between cursor-pointer"
                >
                  <span>• Tren Outcome Klinis Pasien</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onNavigate('risiko-putus')}
                  className="w-full text-left text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 hover:underline flex items-center justify-between cursor-pointer"
                >
                  <span>• Risiko Putus Perawatan</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Strategic Performance Table: Evaluasi 8 Puskesmas Se-Kabupaten */}
      <div className="bg-white p-5 rounded-2xl border border-[#D8E5E2] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-black flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#2E7D5B]" />
              Matriks Kinerja & Kesiapan 8 Puskesmas Se-Kabupaten Pulau Taliabu
            </h3>
            <p className="text-xs text-[#60716D]">
              Evaluasi kontinuitas pelayanan, beban sasaran skrining CKG, dan mitigasi kendala operasional faskes.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('dinkes-kinerja-pkm')}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Lihat Analisis Lengkap
          </Button>
        </div>

        <div className="overflow-x-auto border border-[#D8E5E2] rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FBFA] border-b border-[#D8E5E2] text-[#60716D] font-semibold">
              <tr>
                <th className="p-3">Puskesmas & Wilayah</th>
                <th className="p-3 text-center">Sasaran Skrining</th>
                <th className="p-3 text-center">Tindak Lanjut</th>
                <th className="p-3 text-center">Tingkat Kontinuitas</th>
                <th className="p-3">Hambatan Utama</th>
                <th className="p-3 text-center">Status Faskes</th>
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8E5E2] text-black">
              {facilities.map((fac) => {
                const isOptimal = fac.continuityRate >= 55;
                const isWarning = fac.continuityRate >= 40 && fac.continuityRate < 55;
                return (
                  <tr key={fac.facilityId} className="hover:bg-[#F0F5F4] transition-colors">
                    <td className="p-3">
                      <p className="font-bold text-black">{fac.facilityName}</p>
                      <p className="text-[11px] text-[#60716D] flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-[#397B94]" /> {fac.kecamatanName} {fac.isRemoteIsland ? '• Pesisir Terluar' : '• Daratan'}
                      </p>
                    </td>
                    <td className="p-3 text-center font-semibold">
                      {fac.screenedCount > 0 ? `${fac.screenedCount} Warga` : <span className="text-[#60716D] italic">Proses Pendataan</span>}
                    </td>
                    <td className="p-3 text-center font-semibold">
                      {fac.attendedFollowUpCount} dari {fac.eligibleFollowUpCount}
                    </td>
                    <td className="p-3 text-center">
                      <div className="inline-flex items-center gap-1.5 font-bold">
                        <span
                          className={
                            isOptimal
                              ? 'text-[#2E7D5B]'
                              : isWarning
                              ? 'text-amber-700'
                              : 'text-rose-700'
                          }
                        >
                          {fac.continuityRate > 0 ? `${fac.continuityRate}%` : '-'}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-[11px] text-[#60716D] max-w-[200px] truncate">
                      {fac.topBarriers && fac.topBarriers.length > 0 ? (
                        fac.topBarriers[0].causeCode === 'DISTANCE_TRANSPORT' ? 'Transportasi & Jarak Maritim' :
                        fac.topBarriers[0].causeCode === 'MEDICATION_UNAVAILABLE' ? 'Stok Obat Menipis' :
                        fac.topBarriers[0].causeCode === 'WORK_SCHEDULE' ? 'Jadwal Kerja / Melaut' : 'Faktor Biaya / Cuaca'
                      ) : (
                        'Terkendali Baik'
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <Badge
                        variant={
                          isOptimal ? 'success' : isWarning ? 'warning' : 'danger'
                        }
                        size="sm"
                      >
                        {isOptimal ? 'Optimal' : isWarning ? 'Perhatian' : 'Kritis'}
                      </Badge>
                    </td>
                    <td className="p-3 text-center">
                      <ActionIconButton
                        variant="ghost"
                        size="xs"
                        onClick={() => onNavigate('dinkes-kinerja-pkm')}
                        icon={<Eye className="w-3.5 h-3.5 text-[#397B94]" />}
                        tooltip={`Lihat Analisis Detail Kinerja ${fac.facilityName}`}
                        tooltipPosition="left"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Policy Interventions & Strategic AI Recommendations for Kadinkes */}
      <div className="bg-gradient-to-r from-teal-900/10 via-emerald-900/5 to-transparent p-5 rounded-2xl border border-teal-200/80">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-[#00201C] text-white shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-black">
              Rekomendasi Kebijakan Strategis Dinas Kesehatan (Berdasarkan Data CKG 2026)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-[#334643] mt-2">
              <div className="bg-white p-3 rounded-xl border border-[#D8E5E2] shadow-2xs">
                <p className="font-bold text-black flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-[#397B94]" /> 1. Alokasi Subsidi Kapal
                </p>
                <p className="text-[11px] text-[#60716D] mt-1">
                  Prioritaskan perahu motor penjangkauan untuk Puskesmas Lede & Tabona guna menekan rasio kendala jarak maritim hingga 35%.
                </p>
              </div>

              <div className="bg-white p-3 rounded-xl border border-[#D8E5E2] shadow-2xs">
                <p className="font-bold text-black flex items-center gap-1.5">
                  <Pill className="w-3.5 h-3.5 text-[#2E7D5B]" /> 2. Buffer Logistik Obat
                </p>
                <p className="text-[11px] text-[#60716D] mt-1">
                  Distribusikan tambahan stok Amlodipin 10mg & Metformin ke Pustu Todoli & Pustu Samuya sebelum musim gelombang timur tiba.
                </p>
              </div>

              <div className="bg-white p-3 rounded-xl border border-[#D8E5E2] shadow-2xs">
                <p className="font-bold text-black flex items-center gap-1.5">
                  <GitBranch className="w-3.5 h-3.5 text-amber-700" /> 3. Pembaruan Standar Aturan
                </p>
                <p className="text-[11px] text-[#60716D] mt-1">
                  Versi CRS v0.9 saat ini telah terbukti menurunkan false-negative hingga 99.2% pada skrining lansia berisiko stroke.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs">
              <span className="text-[11px] text-[#60716D]">
                Data diperbarui secara terintegrasi dari seluruh 8 Puskesmas Kab. Pulau Taliabu
              </span>
              <button
                onClick={() => onNavigate('ai-scenario-lab')}
                className="font-bold text-teal-800 hover:text-teal-950 flex items-center gap-1 cursor-pointer"
              >
                Uji Simulasi Skenario di AI Lab <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
