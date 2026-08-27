import { ExtendedBarrierCause, NonAdherenceCause, CauseProvenance } from '../types';

export interface CauseMeta {
  code: ExtendedBarrierCause;
  label: string;
  category: 'CLINICAL' | 'COMMUNITY' | 'SYSTEM_SUPPLY' | 'SUPPORT';
  suggestedActionText: string;
  isSystemContext: boolean;
}

export const CAUSE_DICTIONARY: Record<ExtendedBarrierCause, CauseMeta> = {
  FORGOT: {
    code: 'FORGOT',
    label: 'Lupa Minum Obat / Kesibukan',
    category: 'COMMUNITY',
    suggestedActionText: 'Dukungan pengingat keluarga / kader Posyandu saat kunjungan rumah.',
    isSystemContext: false,
  },
  FEELS_HEALTHY: {
    code: 'FEELS_HEALTHY',
    label: 'Merasa Sudah Sehat / Tanpa Gejala',
    category: 'COMMUNITY',
    suggestedActionText: 'Edukasi sifat kronis penyakit degeneratif yang memerlukan kontrol teratur.',
    isSystemContext: false,
  },
  DISTANCE_TRANSPORT: {
    code: 'DISTANCE_TRANSPORT',
    label: 'Kendala Transportasi Laut / Perahu / Akses Faskes',
    category: 'COMMUNITY',
    suggestedActionText: 'Koordinasi jadwal penyeberangan / layanan Posbindu jemput bola.',
    isSystemContext: false,
  },
  MEDICATION_SIDE_EFFECT: {
    code: 'MEDICATION_SIDE_EFFECT',
    label: 'Dugaan Efek Samping Obat / Keluhan Fisik',
    category: 'CLINICAL',
    suggestedActionText: 'Konsultasi telaah klinis dengan Dokter Puskesmas (evaluasi regimen).',
    isSystemContext: false,
  },
  DOSE_CONFUSION: {
    code: 'DOSE_CONFUSION',
    label: 'Bingung Jadwal / Cara Minum Obat',
    category: 'CLINICAL',
    suggestedActionText: 'Pemberian label waktu minum obat yang disederhanakan oleh petugas farmasi.',
    isSystemContext: false,
  },
  MEDICATION_UNAVAILABLE: {
    code: 'MEDICATION_UNAVAILABLE',
    label: 'Obat Tidak Tersedia / Stok Faskes Habis',
    category: 'SYSTEM_SUPPLY',
    suggestedActionText: 'Penerbitan task MEDICATION_RESUPPLY ke instalasi farmasi / puskesmas induk.',
    isSystemContext: true,
  },
  SUPPLY_EXHAUSTED: {
    code: 'SUPPLY_EXHAUSTED',
    label: 'Stok Obat Habis Sebelum Tanggal Kontrol',
    category: 'SYSTEM_SUPPLY',
    suggestedActionText: 'Penyelarasan kuantitas resep obat dengan interval jadwal kontrol berikutnya.',
    isSystemContext: true,
  },
  SERVICE_COST: {
    code: 'SERVICE_COST',
    label: 'Kendala Biaya Non-Medis / Transportasi',
    category: 'SUPPORT',
    suggestedActionText: 'Advokasi jaminan kesehatan BPJS / bantuan sosial daerah.',
    isSystemContext: false,
  },
  NO_COMPANION: {
    code: 'NO_COMPANION',
    label: 'Tidak Ada Pendamping ke Faskes (Lansia/Disabilitas)',
    category: 'SUPPORT',
    suggestedActionText: 'Pendampingan kader Posyandu Lansia / kunjungan perawat Home Care.',
    isSystemContext: false,
  },
  WORK_SCHEDULE: {
    code: 'WORK_SCHEDULE',
    label: 'Bentrok Jadwal Kerja / Melaut / Berkebun',
    category: 'COMMUNITY',
    suggestedActionText: 'Penjadwalan kontrol fleksibel pada hari pelayanan khusus atau sore.',
    isSystemContext: false,
  },
  FEAR_SHAME: {
    code: 'FEAR_SHAME',
    label: 'Takut / Cemas Hasil Pemeriksaan',
    category: 'COMMUNITY',
    suggestedActionText: 'Konseling empatik dan motivasi oleh petugas kesehatan faskes.',
    isSystemContext: false,
  },
  UNAWARE: {
    code: 'UNAWARE',
    label: 'Belum Mengetahui Kewajiban Kontrol Rutin',
    category: 'COMMUNITY',
    suggestedActionText: 'Pemberian kartu kontrol CKG dan penjelasan jadwal tindak lanjut.',
    isSystemContext: false,
  },
  OTHER: {
    code: 'OTHER',
    label: 'Kendala Lainnya',
    category: 'SUPPORT',
    suggestedActionText: 'Telaah langsung oleh tim pembina wilayah kerja faskes.',
    isSystemContext: false,
  },
};

export const nonAdherenceCauseService = {
  getAllCauses(): CauseMeta[] {
    return Object.values(CAUSE_DICTIONARY);
  },

  getCauseMeta(code: ExtendedBarrierCause): CauseMeta {
    return (
      CAUSE_DICTIONARY[code] || {
        code,
        label: 'Kendala Lainnya',
        category: 'SUPPORT',
        suggestedActionText: 'Telaah oleh petugas kesehatan.',
        isSystemContext: false,
      }
    );
  },

  /**
   * Builds formatted cause entity
   */
  createCauseEntity(params: {
    causeCode: ExtendedBarrierCause;
    reportedVia: CauseProvenance;
    reportedByUserName?: string;
    clinicalNotes?: string;
    assessmentId?: string;
    cycleId?: string;
    citizenId?: string;
  }): NonAdherenceCause {
    const meta = this.getCauseMeta(params.causeCode);
    return {
      id: `cause-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      assessmentId: params.assessmentId || '',
      cycleId: params.cycleId,
      citizenId: params.citizenId,
      causeCode: params.causeCode,
      causeLabel: meta.label,
      reportedVia: params.reportedVia,
      reportedByUserName: params.reportedByUserName,
      clinicalNotes: params.clinicalNotes,
      suggestedInterventionCategory: meta.category,
      createdAt: new Date().toISOString(),
    };
  },
};
