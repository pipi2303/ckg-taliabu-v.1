import { ScenarioSimulation } from '../types';

const defaultScenarios: ScenarioSimulation[] = [
  {
    id: 'SCEN-TALIABU-01',
    name: 'Skenario A: Intervensi Bantuan Transportasi Maritim di Pesisir Utara',
    mode: 'RESEARCH_SIMULATION',
    regionId: 'KEC-TALIABU-UTARA',
    regionName: 'Kecamatan Taliabu Utara (Desa Gela, Jorjoga, Padang)',
    baselinePeriod: 'Januari - Juni 2026',
    hypotheticalDescription: 'Simulasi dampak penyediaan kapal pos rujukan & subsidi BBM perahu motor bagi warga terjadwal kontrol saat musim gelombang barat.',
    assumptions: [
      'Subsidi bahan bakar perahu motor beroperasi 2x seminggu sesuai jadwal poli kronis Puskesmas Gela',
      'Kader desa mengonfirmasi kesiapan warga H-2 sebelum pelayaran',
      'Stok obat antihipertensi & diabetes di Puskesmas tersedia 100%'
    ],
    estimatedDirection: 'MEMBAIK',
    expectedRange: {
      baselineRate: 48, // 48% tingkat kepatuhan kontrol saat ini
      projectedRateMin: 68,
      projectedRateMax: 82,
      metricLabel: 'Tingkat Kehadiran Kontrol Tepat Waktu (%)'
    },
    uncertaintyRating: 'SEDANG',
    dataLimitations: [
      'Model mengasumsikan cuaca ekstrem tidak menyebabkan larangan berlayar total dari Syahbandar',
      'Tidak memperhitungkan kemungkinan perpindahan tempat tinggal sementara nelayan saat musim cumi-cumi'
    ],
    createdAt: '2026-08-20T10:00:00Z',
  },
  {
    id: 'SCEN-TALIABU-02',
    name: 'Skenario B: Penerapan Buffer Stock Obat 3-Bulanan di Pustu Pesisir',
    mode: 'RESEARCH_SIMULATION',
    regionId: 'KEC-LEDE',
    regionName: 'Kecamatan Lede & Pulau Sekitarnya',
    baselinePeriod: 'Januari - Juni 2026',
    hypotheticalDescription: 'Simulasi jika pasien hipertensi/DM stabil diberikan paket perbekalan obat 90 hari langsung di Pustu, didampingi pemantauan mingguan oleh Bidan Desa.',
    assumptions: [
      'Pasien telah mencapai target tekanan darah/gula darah stabil minimal 2 siklus',
      'Kader posyandu melakukan cek tensi keliling setiap 2 minggu',
      'Tidak terjadi insiden efek samping baru selama 3 bulan'
    ],
    estimatedDirection: 'MEMBAIK',
    expectedRange: {
      baselineRate: 38, // baseline drop-out rate saat ini 38%
      projectedRateMin: 12,
      projectedRateMax: 20,
      metricLabel: 'Estimasi Angka Putus Perawatan Kontrol (%)'
    },
    uncertaintyRating: 'RENDAH',
    dataLimitations: [
      'Diperlukan jaminan penyimpanan obat pada suhu ruang yang aman (< 30°C) di rumah warga'
    ],
    createdAt: '2026-08-22T14:30:00Z',
  },
  {
    id: 'SCEN-TALIABU-03',
    name: 'Skenario C: Status Quo (Tanpa Intervensi Tambahan)',
    mode: 'RESEARCH_SIMULATION',
    regionId: 'ALL-TALIABU',
    regionName: 'Kabupaten Pulau Taliabu (Semua Kecamatan)',
    baselinePeriod: 'Januari - Juni 2026',
    hypotheticalDescription: 'Proyeksi jika pola saat ini berlanjut tanpa intervensi logistik dan tanpa penyesuaian kalender maritim.',
    assumptions: [
      'Pola distribusi obat bulanan reguler tetap berjalan seperti biasa',
      'Tingkat keterjangkauan kader mengandalkan jadwal rutin posyandu'
    ],
    estimatedDirection: 'MENURUN',
    expectedRange: {
      baselineRate: 54,
      projectedRateMin: 42,
      projectedRateMax: 50,
      metricLabel: 'Tingkat Keterkendalian Tekanan Darah Terjaga (%)'
    },
    uncertaintyRating: 'SEDANG',
    dataLimitations: [
      'Diproyeksikan terjadi lonjakan ketidakhadiran kontrol saat puncak gelombang barat bulan Desember-Januari'
    ],
    createdAt: '2026-08-24T08:00:00Z',
  }
];

export const scenarioSimulationService = {
  getScenarios(): ScenarioSimulation[] {
    return [...defaultScenarios];
  },

  getScenarioById(id: string): ScenarioSimulation | undefined {
    return defaultScenarios.find((s) => s.id === id);
  },

  runNewSimulation(params: {
    name: string;
    regionId: string;
    regionName: string;
    hypotheticalDescription: string;
    assumptions: string[];
    interventionType: 'TRANSPORT' | 'BUFFER_STOCK' | 'KADER_INTENSIVE' | 'DIGITAL_NUDGE';
  }): ScenarioSimulation {
    const isTransport = params.interventionType === 'TRANSPORT';
    const isStock = params.interventionType === 'BUFFER_STOCK';

    const newScen: ScenarioSimulation = {
      id: `SCEN-CUSTOM-${Date.now()}`,
      name: params.name,
      mode: 'RESEARCH_SIMULATION',
      regionId: params.regionId,
      regionName: params.regionName,
      baselinePeriod: 'Juli - Agustus 2026',
      hypotheticalDescription: params.hypotheticalDescription,
      assumptions: params.assumptions.length > 0 ? params.assumptions : [
        'Kapasitas pelayanan puskesmas beroperasi normal',
        'Partisipasi kader posyandu aktif minimal 80%'
      ],
      estimatedDirection: 'MEMBAIK',
      expectedRange: {
        baselineRate: 45,
        projectedRateMin: isStock ? 65 : (isTransport ? 60 : 55),
        projectedRateMax: isStock ? 80 : (isTransport ? 75 : 70),
        metricLabel: 'Estimasi Peningkatan Retensi Perawatan (%)'
      },
      uncertaintyRating: 'SEDANG',
      dataLimitations: [
        'Simulasi ini berbasis model matematis populasi sintesis dan tidak menjamin luaran pasti individu.'
      ],
      createdAt: new Date().toISOString(),
    };

    defaultScenarios.unshift(newScen);
    return newScen;
  }
};
