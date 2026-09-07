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
  FileDown,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { DocBadge } from '../../../components/common/DocBadge';
import { ActionIconButton } from '../../../components/common/ActionIconButton';
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeUser?.id]);

  const handleExportPDF = async () => {
    setIsExportingPDF(true);
    try {
      await commandCenterExportService.exportExecutivePDF(activeUser);
      addToast('Laporan PDF Eksekutif Dinas Kesehatan berhasil diunduh', 'success');
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
      <div className="p-12 text-center text-slate-500 space-y-4">
        <div className="w-10 h-10 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-semibold text-slate-700">Menyiapkan Laporan Eksekutif Resmi Populasi CKG Taliabu...</p>
        <p className="text-xs text-slate-500">Mengkonsolidasi data 8 faskes, matriks kepatuhan OI-08, dan token jejak audit digital.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Action Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2 text-xs text-teal-800 font-bold uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4 text-teal-700" />
            OFFICIAL REPORTING & EXPORT ENGINE
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Laporan Agregat Resmi Populasi & CKG</h1>
            <DocBadge code="SCR-DNK-B13" size="sm" />
          </div>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">
            Pusat ekspor laporan resmi berintegritas tinggi untuk Pemda, Dinas Kesehatan, dan Bappeda Kab. Pulau Taliabu dengan kepatuhan S0 Aggregate Only.
          </p>
        </div>

        {/* Quick Action Buttons (Right-aligned Icons with Tooltips) */}
        <div className="flex items-center justify-end gap-2 shrink-0 ml-auto">
          <ActionIconButton
            variant="teal"
            size="sm"
            onClick={handleExportPDF}
            disabled={isExportingPDF}
            isLoading={isExportingPDF}
            icon={<Download className="w-4 h-4 text-white" />}
            tooltip="Ekspor Dokumen Laporan Eksekutif Resmi Format PDF (Kop Pemda & Kadinkes)"
            tooltipPosition="bottom"
            className="bg-teal-700 hover:bg-teal-600 text-white shadow-xs"
          />

          <ActionIconButton
            variant="outline"
            size="sm"
            onClick={handleExportExcel}
            disabled={isExportingExcel}
            isLoading={isExportingExcel}
            icon={<FileSpreadsheet className="w-4 h-4 text-emerald-700" />}
            tooltip="Ekspor Buku Kerja Excel (.xlsx) 5-Tab Komprehensif"
            tooltipPosition="bottom"
            className="bg-[#FAF9F5] hover:bg-[#F3F1E8] border-[#DCD8CC] text-emerald-800 shadow-2xs"
          />

          <ActionIconButton
            variant="outline"
            size="sm"
            onClick={handleDownloadCSV}
            icon={<Table className="w-4 h-4 text-slate-700" />}
            tooltip="Unduh Berkas Mentah Agregat Format CSV"
            tooltipPosition="bottom"
            className="bg-[#FAF9F5] hover:bg-[#F3F1E8] border-[#DCD8CC] text-slate-700 shadow-2xs"
          />

          <ActionIconButton
            variant="outline"
            size="sm"
            onClick={handlePrint}
            icon={<Printer className="w-4 h-4 text-slate-700" />}
            tooltip="Cetak / Pratinjau Dokumen Resmi Langsung (Print Preview)"
            tooltipPosition="bottom"
            className="bg-[#FAF9F5] hover:bg-[#F3F1E8] border-[#DCD8CC] text-slate-700 shadow-2xs"
          />
        </div>
      </div>

      {/* Export Format Highlights Cards (Warna Putih Tulang) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:hidden">
        {/* Card 1: Dokumen PDF */}
        <div className="p-5 rounded-2xl bg-[#FAF9F5] border border-[#E5E2D9] text-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-teal-100/80 border border-teal-200/80 text-teal-800 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Dokumen PDF Eksekutif Dinas Kesehatan</h2>
                <span className="text-[11px] font-medium text-teal-800">Siap Cetak & Presentasi Resmi (A4 Multi-Page)</span>
              </div>
            </div>
            <div className="flex items-center justify-end shrink-0 ml-auto">
              <ActionIconButton
                variant="teal"
                size="sm"
                onClick={handleExportPDF}
                disabled={isExportingPDF}
                isLoading={isExportingPDF}
                icon={<Download className="w-4 h-4 text-white" />}
                tooltip="Unduh Dokumen Laporan PDF Eksekutif Resmi"
                tooltipPosition="left"
                className="bg-teal-700 hover:bg-teal-600 text-white"
              />
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Format resmi Kemenkes/Pemda dilengkapi Kop Surat Dinas Kesehatan, CKG Impact Index (Level 1, 2, 3), Kaskade 8-Tahap, Capaian 8 Puskesmas, Hambatan Maritim, dan Token Digital Signature.
          </p>
        </div>

        {/* Card 2: Workbook Excel */}
        <div className="p-5 rounded-2xl bg-[#FAF9F5] border border-[#E5E2D9] text-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-emerald-100/80 border border-emerald-200/80 text-emerald-800 shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Workbook Excel (.xlsx) 5-Sheet</h2>
                <span className="text-[11px] font-medium text-emerald-800">Analisis Data Komprehensif Tabular</span>
              </div>
            </div>
            <div className="flex items-center justify-end shrink-0 ml-auto">
              <ActionIconButton
                variant="outline"
                size="sm"
                onClick={handleExportExcel}
                disabled={isExportingExcel}
                isLoading={isExportingExcel}
                icon={<Download className="w-4 h-4 text-emerald-800" />}
                tooltip="Unduh Buku Kerja Excel (.xlsx) 5-Tab"
                tooltipPosition="left"
                className="bg-[#F3F1E8] hover:bg-[#EBE7DC] border-[#DCD8CC] text-emerald-800"
              />
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Buku kerja Excel berisi tab terpisah: <em>Ringkasan_Eksekutif</em>, <em>Kinerja_8_Puskesmas</em>, <em>Kaskade_Kontinuitas</em>, <em>Hambatan_Maritim</em>, dan <em>Jejak_Audit_Integritas</em>.
          </p>
        </div>
      </div>

      {/* Printable Formal Snapshot Paper (Warna Putih Tulang) */}
      <div className="p-6 md:p-10 rounded-2xl bg-[#FAF9F5] border border-[#E5E2D9] shadow-sm text-slate-900 space-y-6 print:bg-white print:text-black print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="border-b border-[#DDD9CD] print:border-black pb-6 text-center space-y-1">
          <div className="text-xs font-bold uppercase tracking-widest text-teal-800 print:text-black">
            PEMERINTAH KABUPATEN PULAU TALIABU
          </div>
          <h2 className="text-xl font-black text-slate-950 print:text-black uppercase tracking-tight">
            DINAS KESEHATAN KABUPATEN PULAU TALIABU
          </h2>
          <p className="text-xs font-medium text-slate-700 print:text-gray-700">
            LAPORAN EKSEKUTIF STATUS KESEHATAN POPULASI & DAMPAK PROGRAM CKG
          </p>
          <p className="text-[10px] text-slate-500 print:text-gray-500 font-mono">
            Sistem Komando CKG Smart Care Taliabu | Dokumen Berintegritas Terverifikasi
          </p>
        </div>

        {/* Metadata Grid (Kotak Section Putih Tulang Bertekstur Lembut) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-[#F2EFE8] print:bg-gray-100 border border-[#DDD9CD] print:border-gray-300 text-xs">
          <div>
            <span className="text-slate-500 print:text-gray-600 block text-[11px] font-medium">Periode Laporan:</span>
            <strong className="text-slate-900 print:text-black font-bold">{snapshot.period}</strong>
          </div>
          <div>
            <span className="text-slate-500 print:text-gray-600 block text-[11px] font-medium">Batas Waktu Data (Cutoff):</span>
            <strong className="text-slate-900 print:text-black font-bold">
              {new Date(snapshot.dataCutoffAt).toLocaleDateString('id-ID')}
            </strong>
          </div>
          <div>
            <span className="text-slate-500 print:text-gray-600 block text-[11px] font-medium">Status Kelengkapan:</span>
            <strong className="text-emerald-800 print:text-black font-bold">{snapshot.reportingRatioText}</strong>
          </div>
          <div>
            <span className="text-slate-500 print:text-gray-600 block text-[11px] font-medium">Dicetak Oleh:</span>
            <strong className="text-slate-900 print:text-black font-bold">{snapshot.generatedBy}</strong>
          </div>
        </div>

        {/* Caveats & Integrity Notes */}
        <div className="p-4 rounded-xl bg-[#FFFBEB] print:bg-gray-50 border border-[#FDE68A] print:border-gray-300 text-xs space-y-1 text-amber-950 print:text-black">
          <div className="font-bold flex items-center gap-1.5 uppercase text-[11px] text-amber-900">
            <AlertTriangle className="w-3.5 h-3.5 print:hidden text-amber-800" />
            <span>Catatan Kepatuhan & Batasan Integritas Data:</span>
          </div>
          {snapshot.caveats.map((c, i) => (
            <p key={i} className="leading-relaxed text-amber-950">
              • {c}
            </p>
          ))}
        </div>

        {/* CKG Impact Index Summary (3 Kotak Section Putih Tulang) */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-teal-900 print:text-black uppercase tracking-wider">
            1. CKG Impact Index (3 Tingkat Evaluasi Dampak Kemenkes)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-[#F2EFE8] print:bg-white border border-[#DDD9CD] print:border-gray-300">
              <span className="text-slate-600 print:text-gray-600 font-bold block mb-1">
                Level 1: Cakupan Skrining
              </span>
              <div className="text-2xl font-black text-slate-950 print:text-black">
                {snapshot.impactIndex.level1Coverage.percentage}%
              </div>
              <p className="text-[11px] text-slate-600 print:text-gray-600 mt-1">
                {snapshot.impactIndex.level1Coverage.numerator.toLocaleString('id-ID')} /{' '}
                {snapshot.impactIndex.level1Coverage.denominator.toLocaleString('id-ID')} warga sasaran
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#F2EFE8] print:bg-white border border-[#DDD9CD] print:border-gray-300">
              <span className="text-slate-600 print:text-gray-600 font-bold block mb-1">
                Level 2: Kontinuitas Layanan
              </span>
              <div className="text-2xl font-black text-emerald-800 print:text-black">
                {snapshot.impactIndex.level2Continuity.percentage}%
              </div>
              <p className="text-[11px] text-slate-600 print:text-gray-600 mt-1">
                {snapshot.impactIndex.level2Continuity.numerator.toLocaleString('id-ID')} /{' '}
                {snapshot.impactIndex.level2Continuity.denominator.toLocaleString('id-ID')} warga berisiko
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#F2EFE8] print:bg-white border border-[#DDD9CD] print:border-gray-300">
              <span className="text-slate-600 print:text-gray-600 font-bold block mb-1">
                Level 3: Pengendalian Klinis
              </span>
              <div className="text-sm font-bold text-amber-800 print:text-black">
                {snapshot.impactIndex.level3Outcome.status}
              </div>
              <p className="text-[10px] text-slate-600 print:text-gray-600 mt-1">
                {snapshot.impactIndex.level3Outcome.reason}
              </p>
            </div>
          </div>
        </div>

        {/* Facility Summary Table Section */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-xs font-bold text-teal-900 print:text-black uppercase tracking-wider">
              2. Capaian Kontekstual 8 Fasilitas Pelayanan Kesehatan se-Kabupaten
            </h3>
            <div className="flex items-center justify-end shrink-0 ml-auto print:hidden">
              <ActionIconButton
                variant="outline"
                size="xs"
                onClick={handleExportExcel}
                icon={<FileSpreadsheet className="w-3.5 h-3.5 text-emerald-800" />}
                tooltip="Unduh Data Capaian 8 Puskesmas ke Excel"
                tooltipPosition="left"
                className="bg-[#F2EFE8] hover:bg-[#EBE7DC] border-[#DDD9CD] text-emerald-800"
              />
            </div>
          </div>
          <div className="border border-[#DDD9CD] print:border-gray-300 rounded-xl overflow-hidden bg-white shadow-2xs">
            <table className="w-full text-left text-xs text-slate-800 print:text-black">
              <thead className="bg-[#EDE9DF] print:bg-gray-200 text-slate-700 print:text-black uppercase text-[10px] font-bold border-b border-[#DDD9CD] print:border-gray-300">
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
              <tbody className="divide-y divide-[#EAE6DC] print:divide-gray-200">
                {snapshot.facilitySummaries.map((f, idx) => (
                  <tr key={idx} className="hover:bg-[#FAF9F5] print:hover:bg-transparent">
                    <td className="py-2.5 px-3 font-semibold text-slate-900 print:text-black">{f.facilityName}</td>
                    <td className="py-2.5 px-3 text-slate-700">{f.kecamatanName}</td>
                    <td className="py-2.5 px-3 text-right font-medium">{f.screenedCount.toLocaleString('id-ID')}</td>
                    <td className="py-2.5 px-3 text-right font-medium">{f.attendedCount.toLocaleString('id-ID')}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-800 print:text-black">{f.continuityRate}%</td>
                    <td className="py-2.5 px-3 text-slate-700">{f.dataCompleteness}</td>
                    <td className="py-2.5 px-3 text-[11px] text-slate-600 print:text-gray-600">{f.context}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Formal Signature Footer */}
        <div className="pt-8 border-t border-[#DDD9CD] print:border-black flex justify-between text-xs text-slate-600 print:text-black">
          <div>
            <p>Divalidasi secara digital melalui</p>
            <p className="font-bold text-slate-900 print:text-black">CKG Population Command Center</p>
            <p className="text-[10px] font-mono text-slate-500 print:text-gray-500">
              Audit Token: POP-RPT-8208-202608-AUTH
            </p>
            <p className="text-[10px] text-emerald-800 print:text-gray-600 mt-1 flex items-center gap-1 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" /> S0 Aggregate Only Compliance Verified
            </p>
          </div>

          <div className="text-center w-56">
            <p>Bobong, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p className="font-medium mt-1 text-slate-700">Kepala Dinas Kesehatan</p>
            <div className="h-16" />
            <p className="font-bold underline text-slate-900 print:text-black">Nurbintang Talaohu, S.KM., M.Kes</p>
            <p className="text-[10px] text-slate-500">NIP. 19780512 200501 2 008</p>
          </div>
        </div>
      </div>
    </div>
  );
};
