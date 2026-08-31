import React, { useState, useEffect, useMemo } from 'react';
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
  BarChart3,
  Filter,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ReferenceLine,
  Cell,
} from 'recharts';
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
  const [pkmViewMode, setPkmViewMode] = useState<'VOLUME' | 'CONTINUITY'>('VOLUME');
  const [pkmRegionFilter, setPkmRegionFilter] = useState<'ALL' | 'MAINLAND' | 'REMOTE'>('ALL');
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

  // Filtered facilities for matrix chart & table
  const filteredFacilities = useMemo(() => {
    return facilities.filter((f) => {
      if (pkmRegionFilter === 'MAINLAND') return !f.isRemoteIsland;
      if (pkmRegionFilter === 'REMOTE') return f.isRemoteIsland;
      return true;
    });
  }, [facilities, pkmRegionFilter]);

  // Chart data formatted for Recharts
  const pkmChartData = useMemo(() => {
    return filteredFacilities.map((f) => {
      const pendingGap = Math.max(0, f.eligibleFollowUpCount - f.attendedFollowUpCount);
      return {
        name: f.facilityName.replace('Puskesmas ', 'PKM '),
        fullName: f.facilityName,
        kecamatan: f.kecamatanName,
        isRemote: f.isRemoteIsland,
        screened: f.screenedCount,
        attended: f.attendedFollowUpCount,
        eligible: f.eligibleFollowUpCount,
        gap: pendingGap,
        continuityRate: f.continuityRate,
        targetRate: 50, // SPM target threshold
      };
    });
  }, [filteredFacilities]);

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

      {/* 2. Executive KPI Recharts Analytics (Grafik Batang & Grafik Area 6 KPI) */}
      <ExecutiveKPIRechartsSection onNavigate={onNavigate} />

      {/* 3. Strategic Performance Matrix: Evaluasi & Grafik 8 Puskesmas Se-Kabupaten */}
      <div className="bg-white p-5 rounded-2xl border border-[#D8E5E2] shadow-xs space-y-5">
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-[#D8E5E2]">
          <div>
            <h3 className="text-sm font-bold text-black flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#2E7D5B]" />
              Matriks Kinerja & Kesiapan 8 Puskesmas Se-Kabupaten Pulau Taliabu
            </h3>
            <p className="text-xs text-[#60716D] mt-0.5">
              Evaluasi kontinuitas pelayanan, beban sasaran skrining CKG, dan mitigasi kendala operasional faskes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-[#F0F5F4] p-1 rounded-xl border border-[#D8E5E2] text-xs font-semibold">
              <button
                type="button"
                onClick={() => setPkmViewMode('VOLUME')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  pkmViewMode === 'VOLUME'
                    ? 'bg-[#00201C] text-white shadow-2xs'
                    : 'text-[#60716D] hover:text-black'
                }`}
              >
                Volume Skrining & Tindak Lanjut
              </button>
              <button
                type="button"
                onClick={() => setPkmViewMode('CONTINUITY')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  pkmViewMode === 'CONTINUITY'
                    ? 'bg-[#00201C] text-white shadow-2xs'
                    : 'text-[#60716D] hover:text-black'
                }`}
              >
                Tingkat Kontinuitas (%) vs Target SPM
              </button>
            </div>

            {/* Region Filter */}
            <div className="flex items-center gap-1 bg-[#F8FBFA] px-2 py-1 rounded-xl border border-[#D8E5E2] text-xs">
              <Filter className="w-3.5 h-3.5 text-[#60716D]" />
              <select
                value={pkmRegionFilter}
                onChange={(e) => setPkmRegionFilter(e.target.value as any)}
                className="bg-transparent font-semibold text-black focus:outline-hidden cursor-pointer"
              >
                <option value="ALL">Semua Faskes ({facilities.length})</option>
                <option value="MAINLAND">Daratan Utama</option>
                <option value="REMOTE">Pesisir & Pulau Terluar</option>
              </select>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('dinkes-kinerja-pkm')}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Analisis Lengkap
            </Button>
          </div>
        </div>

        {/* RECHARTS VISUALIZATION FOR 8 PUSKESMAS */}
        <div className="bg-[#FAFDFB] p-4 rounded-xl border border-[#D8E5E2]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <h4 className="text-xs font-bold text-black uppercase tracking-wider flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-teal-700" />
                {pkmViewMode === 'VOLUME'
                  ? 'Grafik Komparasi Beban Skrining, Warga Ditangani & Kesenjangan Kasus'
                  : 'Grafik Capaian Kontinuitas Layanan Puskesmas Terhadap Standar Pelayanan Minimal (50%)'}
              </h4>
              <p className="text-[11px] text-[#60716D] mt-0.5">
                {pkmViewMode === 'VOLUME'
                  ? 'Membandingkan total skrining, rujukan tertangani, dan sisa kasus tertunda per fasilitas kesehatan.'
                  : 'Garis merah putus-putus menunjukkan batas target SPM kontinuitas pelayanan primer (50%).'}
              </p>
            </div>

            <div className="flex items-center gap-2 text-[11px]">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-100 text-teal-900 font-semibold">
                <span className="w-2 h-2 rounded-full bg-teal-700" /> Daratan
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-900 font-semibold">
                <span className="w-2 h-2 rounded-full bg-indigo-600" /> Maritim / Terluar
              </span>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {pkmViewMode === 'VOLUME' ? (
                <ComposedChart data={pkmChartData} margin={{ top: 10, right: 15, left: -10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#334643', fontSize: 11, fontWeight: 600 }}
                    axisLine={{ stroke: '#CBD5E1' }}
                    tickLine={false}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis
                    tick={{ fill: '#64748B', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    label={{ value: 'Jumlah Warga', angle: -90, position: 'insideLeft', offset: 15, style: { fontSize: 10, fill: '#64748B' } }}
                  />
                  <RechartsTooltip
                    formatter={(val: any, name: any) => {
                      if (name === 'Sasaran Skrining') return [`${val} Warga`, name];
                      if (name === 'Sudah Ditangani') return [`${val} Warga`, name];
                      if (name === 'Kesenjangan / Tertunda') return [`${val} Warga`, name];
                      return [val, name];
                    }}
                    labelFormatter={(label, payload) => {
                      const item = payload && payload[0]?.payload;
                      return item ? `${item.fullName} (${item.kecamatan}) ${item.isRemote ? '• Pesisir Terluar' : '• Daratan'}` : label;
                    }}
                    contentStyle={{
                      backgroundColor: '#00201C',
                      borderColor: '#0D443C',
                      borderRadius: '0.75rem',
                      color: '#F8FAFC',
                      fontSize: '11px',
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{ paddingBottom: '10px', fontSize: '11px' }}
                  />
                  <Bar
                    dataKey="screened"
                    name="Sasaran Skrining"
                    fill="#0F766E"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={28}
                  />
                  <Bar
                    dataKey="attended"
                    name="Sudah Ditangani"
                    fill="#10B981"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={28}
                  />
                  <Bar
                    dataKey="gap"
                    name="Kesenjangan / Tertunda"
                    fill="#F59E0B"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={28}
                  />
                </ComposedChart>
              ) : (
                <ComposedChart data={pkmChartData} margin={{ top: 10, right: 15, left: -10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#334643', fontSize: 11, fontWeight: 600 }}
                    axisLine={{ stroke: '#CBD5E1' }}
                    tickLine={false}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: '#64748B', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    unit="%"
                  />
                  <RechartsTooltip
                    formatter={(val: any, name: any) => {
                      if (name === 'Tingkat Kontinuitas') return [`${val}%`, name];
                      if (name === 'Target SPM') return [`${val}%`, name];
                      return [val, name];
                    }}
                    labelFormatter={(label, payload) => {
                      const item = payload && payload[0]?.payload;
                      return item ? `${item.fullName} (${item.kecamatan})` : label;
                    }}
                    contentStyle={{
                      backgroundColor: '#00201C',
                      borderColor: '#0D443C',
                      borderRadius: '0.75rem',
                      color: '#F8FAFC',
                      fontSize: '11px',
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{ paddingBottom: '10px', fontSize: '11px' }}
                  />
                  <ReferenceLine
                    y={50}
                    stroke="#EF4444"
                    strokeDasharray="4 4"
                    strokeWidth={2}
                    label={{ value: 'Target SPM 50%', fill: '#DC2626', position: 'insideTopRight', fontSize: 10, fontWeight: 'bold' }}
                  />
                  <Bar
                    dataKey="continuityRate"
                    name="Tingkat Kontinuitas"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={36}
                  >
                    {pkmChartData.map((entry, index) => {
                      const color = entry.continuityRate >= 50 ? '#059669' : '#D97706';
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Bar>
                </ComposedChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detail Table */}
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
              {filteredFacilities.map((fac) => {
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

      {/* 4. Policy Interventions & Strategic AI Recommendations for Kadinkes */}
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

