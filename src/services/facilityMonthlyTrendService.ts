export interface PuskesmasMonthlyDataPoint {
  monthKey: string;          // e.g. '2026-01'
  monthName: string;         // e.g. 'Januari 2026'
  monthShort: string;        // e.g. 'Jan'
  screenedCount: number;     // Beban Sasaran Skrining Bulanan
  eligibleCount: number;     // Warga Berisiko Teridentifikasi
  attendedCount: number;     // Warga Berhasil Ditangani (Tuntas)
  gapCount: number;          // Kesenjangan Kasus (Belum Ditangani)
  continuityRate: number;    // % Capaian Kontinuitas Layanan
  targetRateSPM: number;     // 50% Standar Pelayanan Minimal
  avgSlaDays: number;        // Waktu Tanggap / SLA Rata-rata (Hari)
  dataQualityRate: number;   // % Kelengkapan & Validitas Data
  kaderFieldVisits: number;  // Jumlah Kunjungan Kader Lapangan
  manualClosureRatio: number;// % Penutupan Kasus Manual
  momGrowth: number;         // Fluktuasi Month-over-Month (% poin dari bulan sebelumnya)
  notes?: string;            // Catatan Lapangan / Konteks Cuaca Maritim
}

export interface PuskesmasTrendProfile {
  facilityId: string;
  facilityName: string;
  kecamatanName: string;
  isRemoteIsland: boolean;
  baselineYear: number;
  monthlyHistory: PuskesmasMonthlyDataPoint[];
  summary: {
    avgContinuityRate: number;
    highestMonth: { month: string; rate: number };
    lowestMonth: { month: string; rate: number };
    totalScreenedYTD: number;
    totalAttendedYTD: number;
    totalGapYTD: number;
    trendDirection: 'UPWARD' | 'STABLE' | 'VOLATILE' | 'NEEDS_INTERVENTION';
    fluctuationSummary: string;
  };
}

const MONTH_NAMES = [
  { key: '2026-01', name: 'Januari 2026', short: 'Jan' },
  { key: '2026-02', name: 'Februari 2026', short: 'Feb' },
  { key: '2026-03', name: 'Maret 2026', short: 'Mar' },
  { key: '2026-04', name: 'April 2026', short: 'Apr' },
  { key: '2026-05', name: 'Mei 2026', short: 'Mei' },
  { key: '2026-06', name: 'Juni 2026', short: 'Jun' },
  { key: '2026-07', name: 'Juli 2026', short: 'Jul' },
  { key: '2026-08', name: 'Agustus 2026', short: 'Agu' },
];

const RAW_FACILITY_MONTHLY_METRICS: Record<
  string,
  {
    screened: number[];
    attended: number[];
    slaDays: number[];
    dataQuality: number[];
    kaderVisits: number[];
    notes: string[];
  }
> = {
  // 1. Puskesmas Bobong (faskes-1)
  'faskes-1': {
    screened: [260, 275, 290, 305, 295, 310, 325, 310],
    attended: [135, 151, 168, 183, 174, 189, 205, 192],
    slaDays: [4.2, 3.8, 3.5, 3.2, 3.4, 3.1, 2.9, 3.0],
    dataQuality: [92, 94, 95, 96, 95, 98, 97, 98],
    kaderVisits: [45, 52, 58, 64, 60, 68, 72, 70],
    notes: [
      'Awal implementasi CKG 2026 di ibu kota kabupaten.',
      'Optimalisasi poli rujukan terjadwal.',
      'Penambahan perawat pendamping PTM di Bobong.',
      'Rekor skrining tertinggi kuartal I.',
      'Sedikit penurunan saat libur hari raya.',
      'Pemeriksaan rutin terintegrasi posyandu.',
      'Capaian penanganan tertinggi (63.1%).',
      'Kinerja stabil memenuhi ambang SPM.',
    ],
  },
  // 2. Puskesmas Lede (faskes-2)
  'faskes-2': {
    screened: [115, 125, 130, 95, 110, 135, 150, 145],
    attended: [55, 64, 69, 40, 54, 74, 87, 83],
    slaDays: [5.8, 5.2, 4.9, 7.8, 6.1, 4.5, 4.2, 4.1],
    dataQuality: [85, 88, 90, 78, 86, 91, 93, 94],
    kaderVisits: [24, 28, 30, 16, 25, 34, 38, 36],
    notes: [
      'Wilayah daratan utara terkendali.',
      'Kader posyandu aktif mendata warga berisiko.',
      'Peningkatan kesadaran deteksi dini hipertensi.',
      'Fluktuasi anjlok: Longsor jalur perbukitan & cuaca ekstrem membatasi mobilisasi.',
      'Pemulihan pasca pembukaan jalan & restocking buffer obat di Pustu Todoli.',
      'Kunjungan meningkat signifikan pasca penambahan kader.',
      'Capaian kembali di atas standar SPM 50%.',
      'Kinerja Agustus stabil di 57.2%.',
    ],
  },
  // 3. Puskesmas Nggele (faskes-3)
  'faskes-3': {
    screened: [75, 80, 90, 95, 90, 82, 102, 98],
    attended: [30, 35, 44, 48, 48, 39, 55, 51],
    slaDays: [7.5, 6.8, 5.6, 5.2, 5.4, 6.9, 4.8, 5.0],
    dataQuality: [80, 82, 86, 88, 87, 81, 90, 89],
    kaderVisits: [18, 20, 24, 26, 25, 19, 28, 26],
    notes: [
      'Musim ombak barat membatasi perahu motor nelayan.',
      'Mulai koordinasi jadwal pusling laut antar tanjung.',
      'Cuaca laut membaik, kunjungan warga meningkat.',
      'Capaian melewati ambang SPM (50.5%).',
      'Stabilitas rujukan pesisir barat.',
      'Gelombang pasang Juni menunda 8 jadwal rujukan pusling.',
      'Lonjakan kunjungan pasca cuaca tenang.',
      'Capaian Agustus tercatat 52.0%.',
    ],
  },
  // 4. Puskesmas Pancado (faskes-4)
  'faskes-4': {
    screened: [70, 72, 78, 80, 82, 85, 88, 85],
    attended: [21, 23, 27, 27, 30, 32, 35, 33],
    slaDays: [9.2, 8.8, 8.5, 8.1, 7.9, 7.5, 6.8, 6.9],
    dataQuality: [68, 70, 72, 74, 75, 76, 80, 79],
    kaderVisits: [12, 14, 15, 16, 17, 18, 22, 20],
    notes: [
      'Tantangan akses darat rusak & jarak rujukan laut 3-4 jam.',
      'Kendala sinyal BTS lokal memperlambat sinkronisasi.',
      'Rasio penutupan manual terdeteksi tinggi.',
      'Dinkes memberikan pendampingan audit penutupan tugas.',
      'Peningkatan bertahap respon tindak lanjut warga.',
      'Pustu pembantu mulai difungsikan untuk skrining lokal.',
      'Intervensi satgas Dinkes menurunkan SLA dari 9.2 ke 6.8 hari.',
      'Capaian Agustus 38.8% (dalam pantauan prioritas intervensi).',
    ],
  },
  // 5. Puskesmas Samuya (faskes-5)
  'faskes-5': {
    screened: [50, 52, 58, 60, 62, 65, 66, 64],
    attended: [19, 21, 24, 27, 29, 31, 32, 31],
    slaDays: [7.8, 7.4, 7.0, 6.5, 6.3, 6.0, 5.7, 5.8],
    dataQuality: [82, 84, 85, 87, 88, 89, 91, 90],
    kaderVisits: [14, 15, 17, 18, 19, 20, 21, 20],
    notes: [
      'Wilayah kantong pemukiman terpisah teluk timur.',
      'Pemanfaatan perahu sewa kader untuk posyandu keliling.',
      'Peningkatan kepatuhan minum obat warga terpencil.',
      'Tren penanganan berangsur mendekati target 50%.',
      'Logistik obat hipertensi tiba tepat waktu.',
      'Integrasi jadwal bidan desa dan kader lapangan.',
      'Capaian 48.5% hampir mencapai standar minimal.',
      'Kinerja stabil dengan data kelengkapan baik (90%).',
    ],
  },
  // 6. Puskesmas Losseng (faskes-6)
  'faskes-6': {
    screened: [40, 42, 50, 55, 58, 62, 65, 60],
    attended: [10, 12, 18, 22, 25, 28, 31, 28],
    slaDays: [11.0, 10.2, 8.8, 8.0, 7.5, 7.0, 6.4, 6.5],
    dataQuality: [60, 65, 72, 78, 82, 85, 88, 87],
    kaderVisits: [8, 10, 14, 16, 18, 20, 22, 20],
    notes: [
      'Keterisolasian pesisir tenggara & ketiadaan pelabuhan permanen.',
      'Sinkronisasi offline kader tertunda karena listrik desa bergilir.',
      'Pemasangan repeater radio darurat oleh Kominfo & Dinkes.',
      'Data mulai terkirim teratur ke Command Center.',
      'Peningkatan kunjungan warga ke balai desa.',
      'Rasio capaian melonjak dari 25% ke 45.2%.',
      'Capaian Agustus mencapai 46.7% mendekati target kabupaten.',
      'Pelaporan data telah terintegrasi penuh.',
    ],
  },
  // 7. Puskesmas Gela (faskes-7)
  'faskes-7': {
    screened: [95, 100, 110, 115, 118, 122, 125, 120],
    attended: [42, 46, 53, 56, 59, 62, 63, 60],
    slaDays: [6.5, 6.2, 5.8, 5.5, 5.3, 5.1, 4.9, 5.0],
    dataQuality: [88, 89, 91, 92, 92, 94, 95, 94],
    kaderVisits: [26, 28, 32, 34, 35, 38, 40, 38],
    notes: [
      'Kepulauan utara terdepan mengandalkan kader offline tablet.',
      'Sinkronisasi offline batch mingguan berjalan disiplin.',
      'Edukasi warga pulau terpencil mengenai bahaya PTM.',
      'Capaian menembus 48.7% di awal kuartal II.',
      'Standar SPM 50% berhasil dicapai konsisten.',
      '18 catatan offline kader tersinkronisasi aman.',
      'Capaian puncak di Juli 50.4%.',
      'Kinerja Agustus konsisten di 50.0%.',
    ],
  },
  // 8. Puskesmas Tabona (faskes-8_pkm)
  'faskes-8_pkm': {
    screened: [60, 65, 70, 72, 74, 78, 80, 75],
    attended: [25, 29, 33, 35, 37, 41, 41, 38],
    slaDays: [6.8, 6.4, 6.0, 5.7, 5.5, 5.2, 5.0, 5.1],
    dataQuality: [84, 86, 88, 89, 90, 92, 93, 92],
    kaderVisits: [18, 20, 22, 24, 25, 28, 29, 27],
    notes: [
      'Wilayah pesisir barat daya aktif menggerakkan posyandu.',
      'Edukasi rutin pencegahan komplikasi kardiovaskular.',
      'Pemberdayaan kader desa pesisir Tabona.',
      'Capaian 48.6% mendekati standar SPM.',
      'Mencapai target 50.0% di bulan Mei.',
      'Puncak performa 52.6% di bulan Juni.',
      'Kinerja stabil di kisaran 51.3%.',
      'Capaian Agustus tercatat 50.7%.',
    ],
  },
};

export const facilityMonthlyTrendService = {
  getMonthlyTrendByFacilityId(
    facilityId: string,
    facilityName: string = 'Puskesmas',
    kecamatanName: string = 'Kecamatan',
    isRemoteIsland: boolean = false
  ): PuskesmasTrendProfile {
    const raw = RAW_FACILITY_MONTHLY_METRICS[facilityId] || {
      screened: [50, 55, 60, 65, 70, 75, 80, 75],
      attended: [24, 27, 30, 33, 35, 38, 41, 38],
      slaDays: [6.0, 5.8, 5.5, 5.3, 5.0, 4.8, 4.5, 4.6],
      dataQuality: [85, 86, 88, 90, 91, 92, 94, 93],
      kaderVisits: [15, 17, 19, 21, 23, 25, 27, 25],
      notes: Array(8).fill('Aktivitas pelayanan rutin berjalan normal.'),
    };

    let prevRate = 0;
    const monthlyHistory: PuskesmasMonthlyDataPoint[] = MONTH_NAMES.map((m, idx) => {
      const screened = raw.screened[idx] || 0;
      const attended = raw.attended[idx] || 0;
      const gap = Math.max(0, screened - attended);
      const eligible = Math.round(screened * 0.48); // estimasi temuan berisiko
      const continuityRate = screened > 0 ? Math.round((attended / screened) * 1000) / 10 : 0;
      const momGrowth = idx === 0 ? 0 : Math.round((continuityRate - prevRate) * 10) / 10;
      prevRate = continuityRate;

      return {
        monthKey: m.key,
        monthName: m.name,
        monthShort: m.short,
        screenedCount: screened,
        eligibleCount: eligible,
        attendedCount: attended,
        gapCount: gap,
        continuityRate,
        targetRateSPM: 50,
        avgSlaDays: raw.slaDays[idx] || 5.0,
        dataQualityRate: raw.dataQuality[idx] || 85,
        kaderFieldVisits: raw.kaderVisits[idx] || 20,
        manualClosureRatio: Math.max(5, Math.round(30 - continuityRate * 0.3)),
        momGrowth,
        notes: raw.notes[idx] || '',
      };
    });

    // Compute Summaries
    const rates = monthlyHistory.map((d) => d.continuityRate);
    const avgContinuityRate =
      rates.length > 0 ? Math.round((rates.reduce((a, b) => a + b, 0) / rates.length) * 10) / 10 : 0;

    let highestMonth = { month: monthlyHistory[0].monthName, rate: monthlyHistory[0].continuityRate };
    let lowestMonth = { month: monthlyHistory[0].monthName, rate: monthlyHistory[0].continuityRate };

    monthlyHistory.forEach((d) => {
      if (d.continuityRate > highestMonth.rate) {
        highestMonth = { month: d.monthName, rate: d.continuityRate };
      }
      if (d.continuityRate < lowestMonth.rate) {
        lowestMonth = { month: d.monthName, rate: d.continuityRate };
      }
    });

    const totalScreenedYTD = monthlyHistory.reduce((acc, curr) => acc + curr.screenedCount, 0);
    const totalAttendedYTD = monthlyHistory.reduce((acc, curr) => acc + curr.attendedCount, 0);
    const totalGapYTD = Math.max(0, totalScreenedYTD - totalAttendedYTD);

    const firstRate = monthlyHistory[0].continuityRate;
    const lastRate = monthlyHistory[monthlyHistory.length - 1].continuityRate;
    let trendDirection: 'UPWARD' | 'STABLE' | 'VOLATILE' | 'NEEDS_INTERVENTION' = 'STABLE';

    if (lastRate < 42) {
      trendDirection = 'NEEDS_INTERVENTION';
    } else if (lastRate - firstRate >= 6) {
      trendDirection = 'UPWARD';
    } else if (Math.abs(lastRate - firstRate) <= 3) {
      trendDirection = 'STABLE';
    } else {
      trendDirection = 'VOLATILE';
    }

    const fluctuationSummary =
      trendDirection === 'UPWARD'
        ? `Tren positif: Capaian meningkat dari ${firstRate}% (Januari) ke ${lastRate}% (Agustus), dengan pertumbuhan MoM rata-rata +${Math.round(((lastRate - firstRate) / 7) * 10) / 10}% per bulan.`
        : trendDirection === 'NEEDS_INTERVENTION'
        ? `Perhatian Khusus: Capaian berada di angka ${lastRate}% (di bawah standar SPM 50%). Memerlukan intervensi logistik & asistensi supervisi rujukan.`
        : `Tren relatif stabil dengan rata-rata semester ${avgContinuityRate}% dan capaian puncak di ${highestMonth.month} (${highestMonth.rate}%).`;

    return {
      facilityId,
      facilityName,
      kecamatanName,
      isRemoteIsland,
      baselineYear: 2026,
      monthlyHistory,
      summary: {
        avgContinuityRate,
        highestMonth,
        lowestMonth,
        totalScreenedYTD,
        totalAttendedYTD,
        totalGapYTD,
        trendDirection,
        fluctuationSummary,
      },
    };
  },
};
