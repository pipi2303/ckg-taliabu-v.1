import { LearnedPopulationCluster } from '../types';

const defaultClusters: LearnedPopulationCluster[] = [
  {
    id: 'CLUS-AI-01',
    clusterCode: 'AI-CLUST-MARITIME-BARRIER',
    clusterLabel: 'Klaster Kendala Akses Maritim & Musim Ombak',
    description: 'Warga dengan tingkat kesadaran kontrol baik namun berisiko putus jadwal secara periodik saat musim gelombang laut timur/barat.',
    citizenCount: 412,
    primaryRiskDrivers: [
      'Domisili di desa pulau terluar / pesisir tanpa jalan darat',
      'Ketergantungan sewa perahu motor tempel',
      'Riwayat terlambat kontrol berulang pada bulan Desember - Februari'
    ],
    suggestedOperationalPathway: 'Distribusi buffer stock obat 3 bulan di Pustu & jadwal perahu penjemputan berkala kader.',
    regionDistribution: {
      'Taliabu Utara': 168,
      'Lede': 142,
      'Taliabu Barat Laut': 102
    },
    generatedAt: '2026-08-20T08:00:00Z',
  },
  {
    id: 'CLUS-AI-02',
    clusterCode: 'AI-CLUST-ASYMPTOMATIC-FEEL-WELL',
    clusterLabel: 'Klaster "Merasa Sehat" & Asimtomatik Lansia',
    description: 'Pasien hipertensi derajat I-II yang sering menghentikan obat mandiri saat gejala pusing mereda karena menganggap penyakit telah sembuh.',
    citizenCount: 528,
    primaryRiskDrivers: [
      'Miskonsepsi bahwa obat hipertensi hanya diminum saat sakit kepala',
      'Tingkat literasi kesehatan dasar perlu penguatan',
      'Ketiadaan pendamping minum obat (PMO) di rumah tangga'
    ],
    suggestedOperationalPathway: 'Kunjungan edukasi dialogis kader menggunakan dialek Melayu Taliabu dan penunjukan PMO keluarga.',
    regionDistribution: {
      'Taliabu Barat': 210,
      'Taliabu Selatan': 175,
      'Tabona': 143
    },
    generatedAt: '2026-08-20T08:00:00Z',
  },
  {
    id: 'CLUS-AI-03',
    clusterCode: 'AI-CLUST-SYSTEMIC-STOCKOUT',
    clusterLabel: 'Klaster Dampak Keterbatasan Stok Faskes',
    description: 'Warga yang hadir kontrol tepat waktu tetapi sempat mengalami kekosongan jenis obat lini pertama di faskes pembina.',
    citizenCount: 194,
    primaryRiskDrivers: [
      'Riwayat resep tidak terlayani penuh (obat kosong)',
      'Jarak jauh ke apotek swasta terdekat',
      'Risiko keengganan kontrol ulang akibat persepsi obat sering habis'
    ],
    suggestedOperationalPathway: 'Prioritas pemenuhan pasokan logistik farmasi Dinkes dan pengantaran obat tertunda via bidan desa.',
    regionDistribution: {
      'Taliabu Timur': 86,
      'Taliabu Timur Selatan': 64,
      'Taliabu Barat Daya': 44
    },
    generatedAt: '2026-08-20T08:00:00Z',
  }
];

export const learnedClusterService = {
  getClusters(): LearnedPopulationCluster[] {
    return [...defaultClusters];
  },

  getClusterById(id: string): LearnedPopulationCluster | undefined {
    return defaultClusters.find((c) => c.id === id || c.clusterCode === id);
  }
};
