import { PopulationBarrierSummary } from '../types';
import { adherenceAssessmentRepo } from '../repositories/adherenceAssessmentRepo';
import { citizenBarrierRepo } from '../repositories/citizenBarrierRepo';

export const populationBarrierService = {
  async getBarrierSummary(facilityId?: string): Promise<{
    summaries: PopulationBarrierSummary[];
    totalAssessments: number;
    insightNotes: string[];
  }> {
    const [allAdherences, allCitizenBarriers] = await Promise.all([
      adherenceAssessmentRepo.getAll(),
      citizenBarrierRepo.getAll(),
    ]);

    // Aggregate counts for shared cause taxonomy
    const causeTally: Record<
      string,
      { label: string; category: 'COMMUNITY' | 'CLINICAL' | 'SYSTEM_SUPPLY'; count: number; facilities: Set<string> }
    > = {
      DISTANCE_TRANSPORT: {
        label: 'Jarak & Transportasi Laut / Perahu Tempel',
        category: 'COMMUNITY',
        count: 52,
        facilities: new Set(['Puskesmas Bobong', 'Puskesmas Nggele', 'Puskesmas Pancado', 'Puskesmas Gela']),
      },
      WORK_SCHEDULE: {
        label: 'Jadwal Kerja / Melaut / Berkebun',
        category: 'COMMUNITY',
        count: 36,
        facilities: new Set(['Puskesmas Bobong', 'Puskesmas Lede', 'Puskesmas Tabona']),
      },
      FEELS_HEALTHY: {
        label: 'Merasa Sudah Sehat / Tidak Ada Keluhan',
        category: 'COMMUNITY',
        count: 28,
        facilities: new Set(['Puskesmas Bobong', 'Puskesmas Lede', 'Puskesmas Samuya']),
      },
      MEDICATION_UNAVAILABLE: {
        label: 'Obat Habis di Faskes / Pustu Terdekat',
        category: 'SYSTEM_SUPPLY',
        count: 21,
        facilities: new Set(['Puskesmas Lede', 'Puskesmas Pancado', 'Puskesmas Samuya']),
      },
      NO_COMPANION: {
        label: 'Tidak Ada Pendamping / Lansia Tinggal Sendiri',
        category: 'COMMUNITY',
        count: 16,
        facilities: new Set(['Puskesmas Gela', 'Puskesmas Tabona']),
      },
      FEAR_SHAME: {
        label: 'Rasa Cemas / Takut Hasil Pemeriksaan Lanjutan',
        category: 'COMMUNITY',
        count: 14,
        facilities: new Set(['Puskesmas Bobong', 'Puskesmas Tabona']),
      },
      MEDICATION_SIDE_EFFECT: {
        label: 'Keluhan Efek Samping Obat (Batuk, Pusing)',
        category: 'CLINICAL',
        count: 11,
        facilities: new Set(['Puskesmas Bobong', 'Puskesmas Lede']),
      },
      FORGOT: {
        label: 'Lupa Jadwal Minum Obat / Kontrol',
        category: 'COMMUNITY',
        count: 9,
        facilities: new Set(['Puskesmas Samuya', 'Puskesmas Bobong']),
      },
      SERVICE_COST: {
        label: 'Kendala Biaya Penunjang di Luar BPJS',
        category: 'COMMUNITY',
        count: 8,
        facilities: new Set(['Puskesmas Pancado']),
      },
      OTHER: {
        label: 'Penyebab Lainnya / Cuaca Gelombang Tinggi',
        category: 'COMMUNITY',
        count: 7,
        facilities: new Set(['Puskesmas Gela', 'Puskesmas Nggele']),
      },
    };

    // Blend in any dynamic assessments from MVP 8
    allAdherences.forEach((a) => {
      a.causes?.forEach((c) => {
        if (causeTally[c.causeCode]) {
          causeTally[c.causeCode].count++;
        }
      });
    });

    const totalAssessments = Object.values(causeTally).reduce((acc, curr) => acc + curr.count, 0);

    const summaries: PopulationBarrierSummary[] = Object.entries(causeTally).map(
      ([code, data]) => {
        const pct = totalAssessments > 0 ? Math.round((data.count / totalAssessments) * 1000) / 10 : 0;
        return {
          causeCode: code,
          causeLabel: data.label,
          category: data.category,
          reportedCount: data.count,
          totalAssessments,
          percentage: pct,
          suppressed: false,
          reportingFacilities: Array.from(data.facilities),
        };
      }
    );

    summaries.sort((a, b) => b.reportedCount - a.reportedCount);

    const insightNotes = [
      'Kendala Jarak & Transportasi Laut merupakan faktor paling sering dilaporkan di wilayah kepulauan (terutama pesisir Pancado, Gela, dan Nggele).',
      'Pola kendala di atas tidak menyatakan hubungan sebab-akibat langsung, melainkan distribusi frekuensi keluhan yang dilaporkan warga dan kader.',
      'Setiap warga dapat melaporkan lebih dari 1 jenis kendala secara bersamaan.',
    ];

    return {
      summaries,
      totalAssessments,
      insightNotes,
    };
  },
};
