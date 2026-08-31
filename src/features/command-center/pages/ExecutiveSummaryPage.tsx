import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Shield,
  Activity,
  MapPin,
  AlertTriangle,
  FileText,
  Printer,
  Lock,
  Clock,
  Info,
  Download,
  FileSpreadsheet,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { DocBadge } from '../../../components/common/DocBadge';
import { CompletenessBanner } from '../components/CompletenessBanner';
import {
  populationQualificationService,
  CountyCompletenessSummary,
} from '../../../services/populationQualificationService';
import { impactIndexService, ImpactIndexSummary } from '../../../services/impactIndexService';
import { populationCascadeService } from '../../../services/populationCascadeService';
import { commandCenterExportService } from '../../../services/commandCenterExportService';
import { CascadeAggregation } from '../../../types';

interface ExecutiveSummaryPageProps {
  onNavigate?: (navId: string) => void;
}

export const ExecutiveSummaryPage: React.FC<ExecutiveSummaryPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [completeness, setCompleteness] = useState<CountyCompletenessSummary | null>(null);
  const [impact, setImpact] = useState<ImpactIndexSummary | null>(null);
  const [cascade, setCascade] = useState<CascadeAggregation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExportingPDF, setIsExportingPDF] = useState<boolean>(false);
  const [isExportingExcel, setIsExportingExcel] = useState<boolean>(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [compData, impactData, cascadeData] = await Promise.all([
        populationQualificationService.getCountyCompleteness(),
        impactIndexService.getImpactIndex(),
        populationCascadeService.getCascadeAggregation(),
      ]);
      setCompleteness(compData);
      setImpact(impactData);
      setCascade(cascadeData);
    } catch (err) {
      console.error('Failed to load executive summary:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!user) return;
    setIsExportingPDF(true);
    try {
      await commandCenterExportService.exportExecutivePDF(user);
      addToast('Laporan PDF Eksekutif berhasil diunduh', 'success');
    } catch (err) {
      console.error('PDF Export error:', err);
      addToast('Gagal menghasilkan berkas PDF', 'error');
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleExportExcel = async () => {
    if (!user) return;
    setIsExportingExcel(true);
    try {
      await commandCenterExportService.exportCommandCenterExcel(user);
      addToast('Workbook Excel (.xlsx) 5-Tab berhasil diunduh', 'success');
    } catch (err) {
      console.error('Excel Export error:', err);
      addToast('Gagal menghasilkan berkas Excel', 'error');
    } finally {
      setIsExportingExcel(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (isLoading || !completeness || !impact || !cascade) {
    return (
      <div className="p-8 text-center text-gray-600 space-y-3">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs">Memuat Tampilan Eksekutif Kepala Daerah...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#faf9f6] border border-stone-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-800 font-bold uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4 text-amber-700" />
            RINGKASAN EKSEKUTIF PEMERINTAH DAERAH
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-black text-black tracking-tight">Status Kesehatan Populasi CKG</h1>
            <DocBadge code="SCR-DNK-B08" size="sm" />
          </div>
          <p className="text-xs text-stone-600 mt-1 max-w-2xl">
            Tampilan agregat berintegritas tinggi untuk pengambilan keputusan strategis, alokasi anggaran operasional faskes, dan subsidi bantuan warga kepulauan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
          <button
            onClick={handleExportPDF}
            disabled={isExportingPDF}
            className="px-4 py-2.5 text-xs font-bold rounded-xl bg-amber-700 hover:bg-amber-800 text-white shadow-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            title="Unduh Laporan Eksekutif dalam Format PDF"
          >
            {isExportingPDF ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>{isExportingPDF ? 'Menyusun PDF...' : 'Ekspor PDF Eksekutif'}</span>
          </button>
          <button
            onClick={handleExportExcel}
            disabled={isExportingExcel}
            className="px-3.5 py-2.5 text-xs font-semibold rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white border border-emerald-700 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Unduh Data Eksekutif Format Excel (.xlsx)"
          >
            {isExportingExcel ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-200" />
            )}
            <span>{isExportingExcel ? 'Menyusun Excel...' : 'Ekspor Excel'}</span>
          </button>
          <button
            onClick={() => onNavigate?.('dinkes-laporan')}
            className="px-3.5 py-2.5 text-xs font-medium rounded-xl bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 transition flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-teal-700" />
            <span>Pusat Laporan</span>
          </button>
        </div>
      </div>

      {/* Strict Privacy Boundary Notice */}
      <div className="p-3.5 rounded-xl bg-[#faf9f6] border border-stone-200/90 text-stone-700 text-xs flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-teal-700" />
          <span>
            Mode Privasi S0 Aktif: Tampilan ini secara ketat <strong>hanya menyajikan data agregat terstandarisasi</strong> tanpa memuat data identitas individual/NIK warga.
          </span>
        </div>
        <span className="text-[11px] font-mono text-stone-500 font-semibold">ISO-27701 Governed</span>
      </div>

      <CompletenessBanner completeness={completeness} onRefresh={loadData} />

      {/* Key Executive Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cascade Funnel Summary */}
        <div className="p-6 rounded-2xl bg-[#faf9f6] border border-stone-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <h3 className="text-sm font-bold text-black flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-700" />
              Perjalanan Warga dalam Program CKG
            </h3>
            <span className="text-xs text-stone-600 font-medium">Total: {cascade.stages[0]?.count} Warga Diperiksa</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-stone-200">
              <span className="text-stone-700 font-medium">Warga Terdeteksi Berisiko (Kuning/Merah/Kritis):</span>
              <span className="font-bold text-amber-800 text-sm">{cascade.stages[1]?.count} orang</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-stone-200">
              <span className="text-stone-700 font-medium">Warga Berhasil Hadir Kontrol di Puskesmas:</span>
              <span className="font-bold text-emerald-800 text-sm">{cascade.stages[3]?.count} orang</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-stone-200">
              <span className="text-stone-700 font-medium">Warga Aktif Minum Obat & Pemantauan Rutin:</span>
              <span className="font-bold text-teal-800 text-sm">{cascade.stages[5]?.count} orang</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 font-medium">
              <span>Warga Tertahan / Butuh Bantuan Transportasi:</span>
              <span className="font-bold text-rose-700 text-sm">
                {(cascade.stages[1]?.count || 0) - (cascade.stages[3]?.count || 0)} orang
              </span>
            </div>
          </div>
        </div>

        {/* Priority Strategic Action Areas */}
        <div className="p-6 rounded-2xl bg-[#faf9f6] border border-stone-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <h3 className="text-sm font-bold text-black flex items-center gap-2">
              <MapPin className="w-4 h-4 text-teal-700" />
              Rekomendasi Kebijakan Daerah Prioritas
            </h3>
            <span className="text-xs text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">Tindakan Strategis</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-white border border-stone-200 space-y-1">
              <div className="font-bold text-black flex items-center gap-1.5">
                <span className="text-teal-700 font-mono">1.</span>
                <span>Dukungan Anggaran Transportasi Laut Pasien Pesisir</span>
              </div>
              <p className="text-stone-600 leading-relaxed">
                Kendala biaya perahu motor tempel di wilayah Taliabu Selatan (Pancado) dan Taliabu Utara (Gela) menjadi penghambat 52% kehadiran kontrol rutin warga.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-stone-200 space-y-1">
              <div className="font-bold text-black flex items-center gap-1.5">
                <span className="text-teal-700 font-mono">2.</span>
                <span>Buffer Stok Logistik Obat Anti-Hipertensi di Jaringan Pustu</span>
              </div>
              <p className="text-stone-600 leading-relaxed">
                Penyediaan stok obat 3 bulan di Pustu-Pustu terpencil menjelang musim gelombang timur untuk mencegah putus obat kronis.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-stone-200 space-y-1">
              <div className="font-bold text-black flex items-center gap-1.5">
                <span className="text-teal-700 font-mono">3.</span>
                <span>Perbaikan Menara Komunikasi BTS di Taliabu Selatan</span>
              </div>
              <p className="text-stone-600 leading-relaxed">
                Puskesmas Pancado mengalami keterlambatan pelaporan (stale data) akibat gangguan BTS telekomunikasi lokal.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
