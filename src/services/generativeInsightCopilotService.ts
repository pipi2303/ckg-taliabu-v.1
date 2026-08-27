import { modelGovernanceRepo } from '../repositories/modelGovernanceRepo';

export const generativeInsightCopilotService = {
  isEnabled(): boolean {
    return modelGovernanceRepo.isGenerativeInsightCopilotEnabled();
  },

  setEnabled(enabled: boolean): void {
    modelGovernanceRepo.setGenerativeInsightCopilotEnabled(enabled);
  },

  generateExecutiveSummaryDraft(topic: string): {
    title: string;
    draftText: string;
    groundedSources: string[];
    disclaimer: string;
  } {
    if (!this.isEnabled()) {
      return {
        title: 'Copilot Dinonaktifkan',
        draftText: 'Fitur Generative Insight Copilot saat ini dalam status nonaktif secara default (Governance Lock). Hubungi Admin System untuk mengaktifkan draf narasi manajemen.',
        groundedSources: [],
        disclaimer: 'DRAF AI — PERLU DITINJAU',
      };
    }

    return {
      title: `Draf Ringkasan Eksekutif: ${topic}`,
      draftText: `Berdasarkan data terkualifikasi Kabupaten Pulau Taliabu (Periode Q2-Q3 2026):\n\n1. Ketercapaian Skrining: Sebanyak 3.420 warga telah terdata dalam Registry CKG, dengan rasio tindak lanjut faskes mencapai 76,4%.\n2. Tantangan Kontinuitas Perawatan: Wilayah pesisir utara (Kecamatan Taliabu Utara dan Lede) terindikasi memiliki risiko perlambatan kontrol obat tertinggi saat musim gelombang barat (Desember-Februari).\n3. Rekomendasi Non-Klinis: Disarankan percepatan distribusi buffer stock obat 3 bulanan di 14 Pustu pesisir sebelum bulan November dan optimalisasi peran kader dalam kunjungan dialogis ramah budaya.`,
      groundedSources: [
        'Registry CKG Kabupaten Pulau Taliabu (n=3.420)',
        'Model Card PA-08 (Population Health Burden Forecaster v3.1)',
        'Dokumen Protokol Layanan Primer CKG Kemenkes 2026'
      ],
      disclaimer: 'DRAF AI — PERLU DITINJAU (Tidak Menetapkan Keputusan Klinis atau Tindakan Otomatis)',
    };
  }
};
