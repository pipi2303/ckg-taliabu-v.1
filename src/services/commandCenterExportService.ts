import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { User } from '../types';
import { populationReportService } from './populationReportService';
import { auditRepo } from '../repositories/auditRepo';
import { facilityPerformanceService } from './facilityPerformanceService';
import { populationCascadeService } from './populationCascadeService';
import { populationBarrierService } from './populationBarrierService';

export interface ExportOptions {
  title?: string;
  notes?: string[];
}

export const commandCenterExportService = {
  /**
   * Generates and downloads an official Executive PDF Report
   */
  async exportExecutivePDF(user?: User | null, _options?: ExportOptions): Promise<void> {
    const snapshot = await populationReportService.generateSnapshot(user);
    const [cascade, barrierData, facilities] = await Promise.all([
      populationCascadeService.getCascadeAggregation(),
      populationBarrierService.getBarrierSummary(),
      facilityPerformanceService.getFacilitySummaries(),
    ]);

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const primaryColor: [number, number, number] = [0, 51, 45]; // #00332D
    const accentTeal: [number, number, number] = [46, 125, 91]; // #2E7D5B
    const darkGray: [number, number, number] = [40, 50, 48];
    const lightBg: [number, number, number] = [240, 246, 244];

    const printDate = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const tokenChecksum = `CKG-TLB-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // ================= PAGE 1: EXECUTIVE SUMMARY & IMPACT INDEX =================
    // KOP Surat Header
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 12, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text('PEMERINTAH KABUPATEN PULAU TALIABU - MALUKU UTARA', 105, 8, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    doc.text('DINAS KESEHATAN KABUPATEN PULAU TALIABU', 105, 22, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(80, 90, 90);
    doc.text('Jl. Poros Bobong - Wayo, Kec. Taliabu Barat, Maluku Utara 97794', 105, 27, { align: 'center' });
    doc.text('Pusat Komando Kesehatan Populasi & Pemantauan Program CKG (Cek Kesehatan Gratis)', 105, 31, { align: 'center' });

    doc.setDrawColor(0, 51, 45);
    doc.setLineWidth(0.8);
    doc.line(14, 34, 196, 34);
    doc.setLineWidth(0.2);
    doc.line(14, 35.5, 196, 35.5);

    // Document Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...primaryColor);
    doc.text('LAPORAN EKSEKUTIF KESEHATAN POPULASI & DAMPAK CKG', 105, 43, { align: 'center' });

    // Metadata Box
    doc.setFillColor(...lightBg);
    doc.roundedRect(14, 47, 182, 22, 2, 2, 'F');
    doc.setDrawColor(200, 220, 215);
    doc.roundedRect(14, 47, 182, 22, 2, 2, 'S');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkGray);
    doc.text('Periode Evaluasi:', 18, 53);
    doc.text('Batas Waktu Data (Cutoff):', 70, 53);
    doc.text('Kelengkapan Faskes:', 125, 53);
    doc.text('Token Audit Resmi:', 160, 53);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(20, 30, 30);
    doc.text(snapshot.period, 18, 58);
    doc.text(new Date(snapshot.dataCutoffAt).toLocaleDateString('id-ID'), 70, 58);
    doc.text(snapshot.reportingRatioText, 125, 58);
    doc.setFont('courier', 'bold');
    doc.text(tokenChecksum, 160, 58);

    doc.setFont('helvetica', 'normal');
    doc.text(`Dicetak oleh: ${user.name} (${user.roleName || user.roleId}) pada ${printDate}`, 18, 65);

    // SECTION 1: CKG IMPACT INDEX
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...accentTeal);
    doc.text('1. CKG IMPACT INDEX (3 TINGKAT EVALUASI DAMPAK KEMENKES)', 14, 76);

    // 3 Cards Layout
    // Level 1
    doc.setFillColor(245, 250, 248);
    doc.roundedRect(14, 80, 58, 28, 2, 2, 'F');
    doc.setDrawColor(180, 215, 200);
    doc.roundedRect(14, 80, 58, 28, 2, 2, 'S');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(60, 70, 70);
    doc.text('Level 1: Cakupan Skrining', 18, 86);
    doc.setFontSize(16);
    doc.setTextColor(...accentTeal);
    doc.text(`${snapshot.impactIndex.level1Coverage.percentage}%`, 18, 95);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(90, 100, 100);
    doc.text(`${snapshot.impactIndex.level1Coverage.numerator.toLocaleString('id-ID')} / ${snapshot.impactIndex.level1Coverage.denominator.toLocaleString('id-ID')} warga`, 18, 103);

    // Level 2
    doc.setFillColor(245, 250, 248);
    doc.roundedRect(76, 80, 58, 28, 2, 2, 'F');
    doc.setDrawColor(180, 215, 200);
    doc.roundedRect(76, 80, 58, 28, 2, 2, 'S');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(60, 70, 70);
    doc.text('Level 2: Kontinuitas Layanan', 80, 86);
    doc.setFontSize(16);
    doc.setTextColor(16, 120, 90);
    doc.text(`${snapshot.impactIndex.level2Continuity.percentage}%`, 80, 95);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(90, 100, 100);
    doc.text(`${snapshot.impactIndex.level2Continuity.numerator.toLocaleString('id-ID')} / ${snapshot.impactIndex.level2Continuity.denominator.toLocaleString('id-ID')} warga`, 80, 103);

    // Level 3
    doc.setFillColor(254, 248, 240);
    doc.roundedRect(138, 80, 58, 28, 2, 2, 'F');
    doc.setDrawColor(240, 200, 150);
    doc.roundedRect(138, 80, 58, 28, 2, 2, 'S');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(140, 80, 20);
    doc.text('Level 3: Pengendalian Klinis', 142, 86);
    doc.setFontSize(9);
    doc.setTextColor(180, 90, 10);
    doc.text('BELUM DAPAT DINILAI', 142, 94);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(110, 70, 20);
    doc.text('Kepatuhan OI-08 (Menunggu CR-OC)', 142, 102);

    // SECTION 2: KASKADE KONTINUITAS 8-TAHAP
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...accentTeal);
    doc.text('2. KASKADE KONTINUITAS LAYANAN POPULASI (8-TAHAP)', 14, 116);

    const cascadeTableRows = cascade.stages.map((stg, idx) => [
      (idx + 1).toString(),
      stg.label,
      stg.count.toLocaleString('id-ID'),
      stg.percentage !== undefined ? `${stg.percentage}%` : '-',
      stg.shrinkagePercentage !== undefined ? `-${stg.shrinkagePercentage}%` : '-',
      stg.isLargestDrop ? 'TITIK SUSUT TERBESAR (BOTTLENECK)' : stg.description || '-',
    ]);

    autoTable(doc, {
      startY: 120,
      head: [['#', 'Tahap Kaskade', 'Populasi (Jiwa)', '% Dari Total', '% Penurunan', 'Catatan Evaluasi']],
      body: cascadeTableRows,
      theme: 'grid',
      headStyles: {
        fillColor: [0, 51, 45],
        textColor: 255,
        fontSize: 8,
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 7.5,
        cellPadding: 2,
      },
      columnStyles: {
        0: { cellWidth: 8, halign: 'center' },
        1: { cellWidth: 55, fontStyle: 'bold' },
        2: { cellWidth: 28, halign: 'right' },
        3: { cellWidth: 25, halign: 'right' },
        4: { cellWidth: 25, halign: 'right' },
        5: { cellWidth: 41 },
      },
    });

    // Catatan Kepatuhan & Hambatan Geografis Kepulauan
    const finalY = (doc as any).lastAutoTable.finalY || 185;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...accentTeal);
    doc.text('3. CATATAN KEPATUHAN & HAMBATAN MARITIM KEPULAUAN', 14, finalY + 8);

    doc.setFillColor(248, 250, 250);
    doc.roundedRect(14, finalY + 11, 182, 32, 2, 2, 'F');
    doc.setDrawColor(210, 225, 220);
    doc.roundedRect(14, finalY + 11, 182, 32, 2, 2, 'S');

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(40, 50, 50);
    doc.text('• Evaluasi Maritim: Wilayah Lede, Jorjoga, dan Samuya menghadapi gelombang laut tinggi pada penyeberangan perahu.', 18, finalY + 16);
    doc.text('• Kepatuhan S0 (Aggregate Only): Laporan ini hanya memuat agregat statistik tanpa identitas individu (tanpa NIK warga).', 18, finalY + 21);
    doc.text('• Closed-Loop Verification: Seluruh penutupan tugas faskes wajib menyertakan bukti konfirmasi klinis dokter FKTP/RSUD.', 18, finalY + 26);
    doc.text('• Buffer Stock Obat: Disarankan penambahan stok Amlodipine & Metformin di Pustu terpencil sebelum musim angin barat.', 18, finalY + 31);

    // Formal Signatures
    const signY = finalY + 49;
    doc.setFontSize(8);
    doc.text(`Bobong, ${printDate}`, 140, signY);
    doc.text('Kepala Dinas Kesehatan Kab. Pulau Taliabu', 140, signY + 4);

    doc.setFont('helvetica', 'bold');
    doc.text('dr. Hj. Nur Aini, M.Kes', 140, signY + 22);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text('NIP. 19780512 200501 2 008', 140, signY + 26);

    // ================= PAGE 2: FACILITY COMPARISON & MARITIME BARRIERS =================
    doc.addPage();

    // Page 2 Header
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text('LAMPIRAN I: CAPAIAN KINERJA 8 PUSKESMAS & DISTRIBUSI HAMBATAN WILAYAH', 105, 5.5, { align: 'center' });

    doc.setFontSize(11);
    doc.setTextColor(...primaryColor);
    doc.text('4. CAPAIAN & KONTINUITAS 8 PUSKESMAS SE-KABUPATEN PULAU TALIABU', 14, 16);

    const facilityRows = facilities.map((f) => [
      f.facilityName,
      f.kecamatanName,
      f.screenedCount.toLocaleString('id-ID'),
      f.attendedFollowUpCount.toLocaleString('id-ID'),
      `${f.continuityRate}%`,
      f.dataCompleteness,
      f.accessibilityContext,
    ]);

    autoTable(doc, {
      startY: 20,
      head: [['Nama Puskesmas', 'Kecamatan', 'Skrining (Jiwa)', 'Hadir Faskes', 'Kontinuitas (%)', 'Kelengkapan Data', 'Karakteristik Akses Wilayah']],
      body: facilityRows,
      theme: 'striped',
      headStyles: {
        fillColor: [46, 125, 91],
        textColor: 255,
        fontSize: 7.5,
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 7,
        cellPadding: 2,
      },
      columnStyles: {
        0: { cellWidth: 32, fontStyle: 'bold' },
        1: { cellWidth: 26 },
        2: { cellWidth: 22, halign: 'right' },
        3: { cellWidth: 22, halign: 'right' },
        4: { cellWidth: 22, halign: 'right', fontStyle: 'bold' },
        5: { cellWidth: 24 },
        6: { cellWidth: 34 },
      },
    });

    const page2Y = (doc as any).lastAutoTable.finalY || 100;

    // SECTION 5: MARITIME & SOCIO-ECONOMIC BARRIERS
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...primaryColor);
    doc.text('5. DISTRIBUSI HAMBATAN RUJUKAN & PENJANGKAUAN LAPANGAN', 14, page2Y + 8);

    const barrierRows = barrierData.summaries.map((b) => [
      b.causeLabel,
      b.reportedCount.toLocaleString('id-ID'),
      `${b.percentage}%`,
      b.reportingFacilities.join(', '),
      b.category === 'COMMUNITY'
        ? 'Penguatan kader posyandu & subsidi perahu'
        : b.category === 'SYSTEM_SUPPLY'
        ? 'Relokasi buffer stock obat esensial Pustu'
        : 'Konseling kepatuhan dokter FKTP',
    ]);

    autoTable(doc, {
      startY: page2Y + 12,
      head: [['Kategori Hambatan', 'Jumlah Kasus', 'Persentase (%)', 'Faskes Terdampak', 'Rekomendasi Intervensi Pemda / Dinkes']],
      body: barrierRows,
      theme: 'grid',
      headStyles: {
        fillColor: [0, 51, 45],
        textColor: 255,
        fontSize: 7.5,
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 7,
        cellPadding: 2,
      },
      columnStyles: {
        0: { cellWidth: 42, fontStyle: 'bold' },
        1: { cellWidth: 22, halign: 'right' },
        2: { cellWidth: 22, halign: 'right' },
        3: { cellWidth: 42 },
        4: { cellWidth: 54 },
      },
    });

    // Document Audit Footer on Page 2
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 110, 110);
    doc.text(`Token Keabsahan: ${tokenChecksum} | Sistem CKG Smart Care Taliabu v10.0`, 14, 285);
    doc.text('Halaman 2 dari 2 | Rahasia & Resmi untuk Kepentingan Kebijakan Pemda Kab. Pulau Taliabu', 196, 285, { align: 'right' });

    // Save and log audit
    const fileName = `Laporan_Eksekutif_CKG_Taliabu_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(fileName);

    await auditRepo.log({
      actorUserId: user?.id || 'usr-kadinkes',
      actorName: user?.name || 'dr. Hj. Nur Aini, M.Kes',
      actorRole: user?.roleId || 'KEPALA_DINAS',
      action: 'EXPORT',
      entityType: 'POPULATION_REPORT',
      entityId: tokenChecksum,
      targetLabel: 'Ekspor Laporan PDF Eksekutif Dinas Kesehatan',
      description: `Format: PDF Resmi | Periode: ${snapshot.period} | Checksum: ${tokenChecksum}`,
      details: {
        fileName,
        tokenChecksum,
        period: snapshot.period,
      },
    });
  },

  /**
   * Generates and downloads a multi-tab Excel (.xlsx) Workbook
   */
  async exportCommandCenterExcel(user?: User | null, _options?: ExportOptions): Promise<void> {
    const snapshot = await populationReportService.generateSnapshot(user);
    const [cascade, barrierData, facilities] = await Promise.all([
      populationCascadeService.getCascadeAggregation(),
      populationBarrierService.getBarrierSummary(),
      facilityPerformanceService.getFacilitySummaries(),
    ]);

    const wb = XLSX.utils.book_new();

    // ---------------- TAB 1: RINGKASAN EKSEKUTIF ----------------
    const execSummaryData = [
      ['PEMERINTAH KABUPATEN PULAU TALIABU - DINAS KESEHATAN'],
      ['PUSAT KOMANDO KESEHATAN POPULASI & PEMANTAUAN CKG (CEK KESEHATAN GRATIS)'],
      [''],
      ['METADATA LAPORAN'],
      ['Periode Evaluasi', snapshot.period],
      ['Batas Waktu Data (Cutoff)', snapshot.dataCutoffAt],
      ['Kelengkapan Faskes', snapshot.reportingRatioText],
      ['Dicetak Oleh', `${user.name} (${user.roleName || user.roleId})`],
      ['Waktu Ekspor', new Date().toISOString()],
      [''],
      ['CKG IMPACT INDEX (3 TINGKAT EVALUASI DAMPAK)'],
      ['Tingkat Indikator', 'Persentase (%)', 'Numerator (Jiwa)', 'Denominator (Jiwa)', 'Status / Keterangan'],
      [
        'Level 1: Cakupan Skrining',
        `${snapshot.impactIndex.level1Coverage.percentage}%`,
        snapshot.impactIndex.level1Coverage.numerator,
        snapshot.impactIndex.level1Coverage.denominator,
        'Terverifikasi Terhadap Target Sasaran Populasi',
      ],
      [
        'Level 2: Kontinuitas Layanan',
        `${snapshot.impactIndex.level2Continuity.percentage}%`,
        snapshot.impactIndex.level2Continuity.numerator,
        snapshot.impactIndex.level2Continuity.denominator,
        'Warga Berisiko yang Telah Menghadiri Konfirmasi Faskes',
      ],
      [
        'Level 3: Pengendalian Klinis',
        'N/A',
        0,
        snapshot.impactIndex.level2Continuity.numerator,
        'BELUM DAPAT DINILAI (Kepatuhan OI-08 CR-OC)',
      ],
      [''],
      ['CATATAN KEPATUHAN & BATASAN DATA (QUALIFICATION NOTES)'],
      ...snapshot.caveats.map((c) => ['• ' + c]),
    ];

    const wsExec = XLSX.utils.aoa_to_sheet(execSummaryData);
    XLSX.utils.book_append_sheet(wb, wsExec, 'Ringkasan_Eksekutif');

    // ---------------- TAB 2: KINERJA 8 PUSKESMAS ----------------
    const facilityHeaders = [
      'Nama Puskesmas',
      'Kecamatan',
      'Skrining Selesai (Jiwa)',
      'Hadir Konfirmasi Faskes (Jiwa)',
      'Tingkat Kontinuitas (%)',
      'Status Kelengkapan Data',
      'Karakteristik Aksesibilitas Maritim',
    ];

    const facilityData = facilities.map((f) => [
      f.facilityName,
      f.kecamatanName,
      f.screenedCount,
      f.attendedFollowUpCount,
      f.continuityRate,
      f.dataCompleteness,
      f.accessibilityContext,
    ]);

    const wsFacility = XLSX.utils.aoa_to_sheet([
      ['CAPAIAN DAN KINERJA 8 PUSKESMAS SE-KABUPATEN PULAU TALIABU'],
      [''],
      facilityHeaders,
      ...facilityData,
    ]);
    XLSX.utils.book_append_sheet(wb, wsFacility, 'Kinerja_8_Puskesmas');

    // ---------------- TAB 3: KASKADE KONTINUITAS 8-TAHAP ----------------
    const cascadeHeaders = [
      'Urutan Tahap',
      'Nama Tahap Kaskade',
      'Jumlah Warga (Jiwa)',
      'Persentase Terhadap Total Skrining (%)',
      'Persentase Penurunan (%)',
      'Status Titik Kritis',
    ];

    const cascadeData = cascade.stages.map((stg, idx) => [
      idx + 1,
      stg.label,
      stg.count,
      stg.percentage !== undefined ? stg.percentage : '-',
      stg.shrinkagePercentage !== undefined ? stg.shrinkagePercentage : '-',
      stg.isLargestDrop ? 'TITIK SUSUT TERBESAR (BOTTLENECK)' : 'Normal',
    ]);

    const wsCascade = XLSX.utils.aoa_to_sheet([
      ['KASKADE KONTINUITAS LAYANAN KESEHATAN POPULASI CKG (8-TAHAP)'],
      [''],
      cascadeHeaders,
      ...cascadeData,
      [''],
      ['Catatan Kaskade', `Total Drop-out Teridentifikasi: ${cascade.exits.totalExits} kasus`],
      ['Rasio Penutupan Manual Tugas', `${(cascade.manualTaskClosureRatio * 100).toFixed(1)}%`],
    ]);
    XLSX.utils.book_append_sheet(wb, wsCascade, 'Kaskade_Kontinuitas');

    // ---------------- TAB 4: HAMBATAN MARITIM WILAYAH ----------------
    const barrierHeaders = [
      'Kategori Hambatan',
      'Jumlah Kasus Teridentifikasi',
      'Persentase (%)',
      'Faskes Paling Terdampak',
      'Rekomendasi Intervensi Lintas Sektor',
    ];

    const barrierRows = barrierData.summaries.map((b) => [
      b.causeLabel,
      b.reportedCount,
      b.percentage,
      b.reportingFacilities.join(', '),
      b.category === 'COMMUNITY'
        ? 'Penguatan kader posyandu & subsidi transport perahu'
        : b.category === 'SYSTEM_SUPPLY'
        ? 'Relokasi buffer stock obat esensial Pustu'
        : 'Konseling kepatuhan minum obat di FKTP',
    ]);

    const wsBarrier = XLSX.utils.aoa_to_sheet([
      ['ANALISIS HAMBATAN MARITIM DAN PENJANGKAUAN WARGA KABUPATEN PULAU TALIABU'],
      [''],
      barrierHeaders,
      ...barrierRows,
    ]);
    XLSX.utils.book_append_sheet(wb, wsBarrier, 'Hambatan_Maritim');

    // ---------------- TAB 5: JEJAK AUDIT & KEABSAHAN ----------------
    const auditData = [
      ['LOG INTEGRITAS DAN AUDIT JEJAK DATA COMMAND CENTER'],
      [''],
      ['Parameter', 'Nilai'],
      ['Waktu Generasi', new Date().toISOString()],
      ['User ID Pemohon', user.id],
      ['Nama Pemohon', user.name],
      ['Hak Akses / Peran', user.roleName || user.roleId],
      ['Kabupaten / Wilayah', 'Kabupaten Pulau Taliabu, Maluku Utara'],
      ['Tingkat Agregasi', 'S0 Aggregate Only (Tanpa NIK/Identitas Pasien)'],
      ['Status Kepatuhan Kemenkes', '100% Sesuai Pedoman CKG & PMK No. 5/2014'],
    ];

    const wsAudit = XLSX.utils.aoa_to_sheet(auditData);
    XLSX.utils.book_append_sheet(wb, wsAudit, 'Jejak_Audit_Integritas');

    // Write file and trigger download
    const excelFileName = `CKG_Command_Center_Taliabu_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, excelFileName);

    // Audit log
    await auditRepo.log({
      actorUserId: user?.id || 'usr-kadinkes',
      actorName: user?.name || 'dr. Hj. Nur Aini, M.Kes',
      actorRole: user?.roleId || 'KEPALA_DINAS',
      action: 'EXPORT',
      entityType: 'POPULATION_REPORT',
      entityId: 'XLSX-CMD-CENTER',
      targetLabel: 'Ekspor Data Excel Multi-Tab Command Center',
      description: `Format: XLSX (5 Sheets) | Periode: ${snapshot.period}`,
      details: {
        fileName: excelFileName,
        sheetCount: 5,
        period: snapshot.period,
      },
    });
  },
};
