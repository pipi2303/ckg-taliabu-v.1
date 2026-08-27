import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Printer,
  ShieldCheck,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Table,
  FileSpreadsheet,
  Layers,
  Sparkles,
  RefreshCw,
  Building,
  Anchor,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { DocBadge } from '../../../components/common/DocBadge';
import {
  populationReportService,
  AggregateReportSnapshot,
} from '../../../services/populationReportService';
import { commandCenterExportService } from '../../../services/commandCenterExportService';

export const ReportExportPage: React.FC = () => {
  const { currentUser, user } = useAuth();
  const activeUser = currentUser || user;
  const { addToast } = useToast();
  const [snapshot, setSnapshot] = useState<AggregateReportSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExportingPDF, setIsExportingPDF] = useState<boolean>(false);
  const [isExportingExcel, setIsExportingExcel] = useState<boolean>(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await populationReportService.generateSnapshot(activeUser);
      setSnapshot(data);
    } catch (err) {
      console.error('Failed to generate snapshot:', err);
      addToast('Gagal memuat ringkasan laporan agregat', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeUser]);

  const handleExportPDF = async () => {
    setIsExportingPDF(true);
    try {
      await commandCenterExportService.exportExecutivePDF(activeUser);
      addToast('Laporan PDF Eksekutif Bupati & Kadinkes berhasil diunduh', 'success');
    } catch (err) {
      console.error('PDF Export failed:', err);
      addToast('Gagal menghasilkan file PDF', 'error');
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleExportExcel = async () => {
    setIsExportingExcel(true);
    try {
      await commandCenterExportService.exportCommandCenterExcel(activeUser);
      addToast('Buku Kerja Excel (.xlsx) 5-Tab berhasil diunduh', 'success');
    } catch (err) {
      console.error('Excel Export failed:', err);
      addToast('Gagal menghasilkan file Excel', 'error');
    } finally {
      setIsExportingExcel(false);
    }
  };

  const handleDownloadCSV = () => {
    if (!snapshot) return;
    const csvContent = populationReportService.exportToCSV(snapshot);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `CKG_Populasi_Taliabu_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('File CSV berhasil diunduh', 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading || !snapshot) {
    return (
      <div className="p-12 text-center text-slate-400 space-y-4">
        <div className="w-10 h-10 border-3 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-medium">Menyiapkan Laporan Eksekutif Resmi Populasi CKG Taliabu...</p>
        <p className="text-xs text-slate-500">Mengkonsolidasi data 8 faskes, matriks kepatuhan OI-08, dan token jejak audit digital.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Action Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2 text-xs text-teal-400 font-bold uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4" />
            OFFICIAL REPORTING & EXPORT ENGINE
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-black tracking-tight">Laporan Agregat Resmi Populasi & CKG</h1>
            <DocBadge code="SCR-DNK-B13" size="sm" />
          </div>
          <p className="text-xs text-gray-600 mt-1 max-w-2xl">
            Pusat ekspor laporan resmi berintegritas tinggi untuk Pemda, Bupati, Dinas Kesehatan, dan Bappeda Kab. Pulau Taliabu dengan kepatuhan S0 Aggregate Only.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportPDF}
            disabled={isExportingPDF}
            className="px-4 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white shadow-sm transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isExportingPDF ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>{isExportingPDF ? 'Menyusun PDF...' : 'Ekspor Dokumen PDF'}</span>
          </button>

          <button
            onClick={handleExportExcel}
            disabled={isExportingExcel}
            className="px-4 py-2.5 text-xs font-bold rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white border border-emerald-600/50 shadow-sm transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isExportingExcel ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
            )}
            <span>{isExportingExcel ? 'Menyusun Excel...' : 'Ekspor Excel (.xlsx)'}</span>
          </button>

          <button
            onClick={handleDownloadCSV}
            className="px-3.5 py-2.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-teal-400" />
            <span>CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak</span>
          </button>
        </div>
      </div>

      {/* Export Format Highlights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:hidden">
        <div className="p-4 rounded-xl bg-[#002B25] border border-[#004D40] text-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-teal-500/20 text-teal-300">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Dokumen PDF Eksekutif Bupati & Kadinkes</h2>
                <span className="text-[11px] text-teal-400">Siap Cetak & Presentasi Resmi (A4 Multi-Page)</span>
              </div>
            </div>
            <button
              onClick={handleExportPDF}
              disabled={isExportingPDF}
              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-teal-600 hover:bg-teal-500 text-white transition cursor-pointer"
            >
              Unduh PDF
            </button>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Format resmi Kemenkes/Pemda dilengkapi Kop Surat Dinas Kesehatan, CKG Impact Index (Level 1, 2, 3), Kaskade 8-Tahap, Capaian 8 Puskesmas, Hambatan Maritim, dan Token Digital Signature.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#002B25] border border-[#004D40] text-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Workbook Excel (.xlsx) 5-Sheet</h2>
                <span className="text-[11px] text-emerald-400">Analisis Data Komprehensif Tabular</span>
              </div>
            </div>
            <button
              onClick={handleExportExcel}
              disabled={isExportingExcel}
              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white transition cursor-pointer"
            >
              Unduh Excel
            </button>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Buku kerja Excel berisi tab terpisah: <em>Ringkasan_Eksekutif</em>, <em>Kinerja_8_Puskesmas</em>, <em>Kaskade_Kontinuitas</em>, <em>Hambatan_Maritim</em>, dan <em>Jejak_Audit_Integritas</em>.
          </p>
        </div>
      </div>

      {/* Printable Formal Snapshot Paper */}
      <div className="p-8 md:p-10 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl text-slate-200 space-y-6 print:bg-white print:text-black print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="border-b border-slate-700 print:border-black pb-6 text-center space-y-1">
          <div className="text-xs font-bold uppercase tracking-widest text-teal-400 print:text-black">
            PEMERINTAH KABUPATEN PULAU TALIABU
          </div>
          <h2 className="text-xl font-black text-white print:text-black uppercase">
            DINAS KESEHATAN KABUPATEN PULAU TALIABU
          </h2>
          <p className="text-xs text-slate-400 print:text-gray-600">
            LAPORAN EKSEKUTIF STATUS KESEHATAN POPULASI & DAMPAK PROGRAM CKG
          </p>
          <p className="text-[10px] text-slate-500 print:text-gray-500 font-mono">
            Sistem Komando CKG Smart Care Taliabu | Dokumen Berintegritas Terverifikasi
          </p>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-800/50 print:bg-gray-100 border border-slate-700 print:border-gray-300 text-xs">
          <div>
            <span className="text-slate-400 print:text-gray-600 block text-[11px]">Periode Laporan:</span>
            <strong className="text-white print:text-black">{snapshot.period}</strong>
          </div>
          <div>
            <span className="text-slate-400 print:text-gray-600 block text-[11px]">Batas Waktu Data (Cutoff):</span>
            <strong className="text-white print:text-black">
              {new Date(snapshot.dataCutoffAt).toLocaleDateString('id-ID')}
            </strong>
          </div>
          <div>
            <span className="text-slate-400 print:text-gray-600 block text-[11px]">Status Kelengkapan:</span>
            <strong className="text-emerald-400 print:text-black">{snapshot.reportingRatioText}</strong>
          </div>
          <div>
            <span className="text-slate-400 print:text-gray-600 block text-[11px]">Dicetak Oleh:</span>
            <strong className="text-white print:text-black">{snapshot.generatedBy}</strong>
          </div>
        </div>

        {/* Caveats & Integrity Notes */}
        <div className="p-4 rounded-xl bg-amber-500/10 print:bg-gray-50 border border-amber-500/30 print:border-gray-300 text-xs space-y-1 text-amber-200 print:text-gray-800">
          <div className="font-bold flex items-center gap-1.5 uppercase text-[11px]">
            <AlertTriangle className="w-3.5 h-3.5 print:hidden" />
            <span>Catatan Kepatuhan & Batasan Integritas Data:</span>
          </div>
          {snapshot.caveats.map((c, i) => (
            <p key={i} className="leading-relaxed">
              • {c}
            </p>
          ))}
        </div>

        {/* CKG Impact Index Summary */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-teal-400 print:text-black uppercase tracking-wider">
            1. CKG Impact Index (3 Tingkat Evaluasi Dampak Kemenkes)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-800/40 print:bg-white border border-slate-700 print:border-gray-300">
              <span className="text-slate-400 print:text-gray-600 font-bold block mb-1">
                Level 1: Cakupan Skrining
              </span>
              <div className="text-2xl font-black text-white print:text-black">
                {snapshot.impactIndex.level1Coverage.percentage}%
              </div>
              <p className="text-[11px] text-slate-400 print:text-gray-600 mt-1">
                {snapshot.impactIndex.level1Coverage.numerator.toLocaleString('id-ID')} /{' '}
                {snapshot.impactIndex.level1Coverage.denominator.toLocaleString('id-ID')} warga sasaran
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/40 print:bg-white border border-slate-700 print:border-gray-300">
              <span className="text-slate-400 print:text-gray-600 font-bold block mb-1">
                Level 2: Kontinuitas Layanan
              </span>
              <div className="text-2xl font-black text-emerald-400 print:text-black">
                {snapshot.impactIndex.level2Continuity.percentage}%
              </div>
              <p className="text-[11px] text-slate-400 print:text-gray-600 mt-1">
                {snapshot.impactIndex.level2Continuity.numerator.toLocaleString('id-ID')} /{' '}
                {snapshot.impactIndex.level2Continuity.denominator.toLocaleString('id-ID')} warga berisiko
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/40 print:bg-white border border-slate-700 print:border-gray-300">
              <span className="text-slate-400 print:text-gray-600 font-bold block mb-1">
                Level 3: Pengendalian Klinis
              </span>
              <div className="text-sm font-bold text-amber-400 print:text-black">
                {snapshot.impactIndex.level3Outcome.status}
              </div>
              <p className="text-[10px] text-slate-400 print:text-gray-600 mt-1">
                {snapshot.impactIndex.level3Outcome.reason}
              </p>
            </div>
          </div>
        </div>

        {/* Facility Summary Table */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-teal-400 print:text-black uppercase tracking-wider">
              2. Capaian Kontekstual 8 Fasilitas Pelayanan Kesehatan se-Kabupaten
            </h3>
            <button
              onClick={handleExportExcel}
              className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium print:hidden cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" /> Unduh Tabel Lengkap Excel
            </button>
          </div>
          <div className="border border-slate-700 print:border-gray-300 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs text-slate-300 print:text-black">
              <thead className="bg-slate-800/80 print:bg-gray-200 text-slate-400 print:text-black uppercase text-[10px] border-b border-slate-700 print:border-gray-300">
                <tr>
                  <th className="py-2.5 px-3">Puskesmas</th>
                  <th className="py-2.5 px-3">Kecamatan</th>
                  <th className="py-2.5 px-3 text-right">Skrining (Jiwa)</th>
                  <th className="py-2.5 px-3 text-right">Hadir Kontrol</th>
                  <th className="py-2.5 px-3 text-right">Kontinuitas</th>
                  <th className="py-2.5 px-3">Status Data</th>
                  <th className="py-2.5 px-3">Karakteristik Akses Wilayah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-gray-200">
                {snapshot.facilitySummaries.map((f, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 print:hover:bg-transparent">
                    <td className="py-2.5 px-3 font-semibold text-white print:text-black">{f.facilityName}</td>
                    <td className="py-2.5 px-3">{f.kecamatanName}</td>
                    <td className="py-2.5 px-3 text-right">{f.screenedCount.toLocaleString('id-ID')}</td>
                    <td className="py-2.5 px-3 text-right">{f.attendedCount.toLocaleString('id-ID')}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-400 print:text-black">{f.continuityRate}%</td>
                    <td className="py-2.5 px-3">{f.dataCompleteness}</td>
                    <td className="py-2.5 px-3 text-[11px] text-slate-400 print:text-gray-600">{f.context}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Formal Signature Footer */}
        <div className="pt-8 border-t border-slate-700 print:border-black flex justify-between text-xs text-slate-400 print:text-black">
          <div>
            <p>Divalidasi secara digital melalui</p>
            <p className="font-semibold text-white print:text-black">CKG Population Command Center</p>
            <p className="text-[10px] font-mono text-slate-500 print:text-gray-500">
              Audit Token: POP-RPT-8208-202608-AUTH
            </p>
            <p className="text-[10px] text-emerald-400 print:text-gray-600 mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> S0 Aggregate Only Compliance Verified
            </p>
          </div>

          <div className="text-center w-56">
            <p>Bobong, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p className="font-medium mt-1">Kepala Dinas Kesehatan</p>
            <div className="h-16" />
            <p className="font-bold underline text-white print:text-black">dr. Hj. Nur Aini, M.Kes</p>
            <p className="text-[10px]">NIP. 19780512 200501 2 008</p>
          </div>
        </div>
      </div>
    </div>
  );
};
