import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export interface TourStep {
  id: string;
  targetSelector: string; // CSS selector for target element (e.g., '#tour-dashboard-header', '[data-tour="nav-care-task"]')
  navId?: string; // Optional nav view to navigate to automatically
  title: string;
  subtitle?: string;
  badge?: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  actionLabel?: string;
  highlights?: string[];
}

interface TourContextValue {
  isTourActive: boolean;
  currentStepIndex: number;
  currentStep: TourStep | null;
  totalSteps: number;
  startTour: (stepIndex?: number) => void;
  endTour: (markAsCompleted?: boolean) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
  hasSeenTour: boolean;
  resetTourStatus: () => void;
  onNavigateCallback: ((navId: string) => void) | null;
  setOnNavigateCallback: (fn: (navId: string) => void) => void;
}

const TOUR_STORAGE_KEY = 'ckg_onboarding_tour_completed_v1';

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome-hub',
    targetSelector: '#tour-brand-header',
    navId: 'dashboard',
    placement: 'right',
    badge: 'SELAMAT DATANG',
    title: 'CKG Smart Care Pulau Taliabu',
    subtitle: 'Sistem Deteksi Dini & Rujukan CKG Terpadu Wilayah Kepulauan',
    content:
      'Selamat datang di platform CKG Smart Care! Platform ini dirancang khusus untuk memandu proses skrining terintegrasi, stratifikasi risiko 5-tingkat, penugasan kader posyandu, layanan klinis dokter, hingga analitik komando Dinkes di Kabupaten Pulau Taliabu.',
    highlights: [
      'Terintegrasi protokol resmi Kemenkes RI & PMK No. 5 Tahun 2014',
      'Dukungan penuh offline PWA untuk kader di pulau terpencil',
      'Keamanan data & privasi bertingkat (10 Peran Pengguna & S0 Suppression)',
    ],
  },
  {
    id: 'dashboard-overview',
    targetSelector: '[data-tour="dashboard-overview-area"]',
    navId: 'dashboard',
    placement: 'bottom',
    badge: 'RINGKASAN & TRIASE',
    title: 'Dashboard & Prioritas Hari Ini',
    subtitle: 'Pemantauan Indikator Kunci & Deteksi Temuan Kritis Real-Time',
    content:
      'Dashboard ini menampilkan ringkasan beban populasi, matriks stratifikasi risiko (Hijau, Kuning, Jingga, Merah, Merah Gelap), temuan kritis yang membutuhkan respon darurat, dan ringkasan antrean triase harian faskes.',
    highlights: [
      'Klasifikasi risiko otomatis saat data skrining di-ingest',
      'Pemberitahuan instan untuk kasus krisis (hipertensi urgensi & diabetes)',
      'Statistik cakupan sasaran per desa dan kecamatan',
    ],
  },
  {
    id: 'care-task-orchestration',
    targetSelector: '[data-tour="nav-care-task"]',
    navId: 'care-task',
    placement: 'right',
    badge: 'CARE ORCHESTRATION',
    title: 'Care Task Registry & Alur Lapangan',
    subtitle: 'Manajemen Tugas Tertutup (Closed-Loop) Kader & Tenaga Kesehatan',
    content:
      'Setiap warga berisiko tinggi secara otomatis dibuatkan Care Task terstruktur. Di sini petugas dapat memantau batas SLA, menugaskan kader posyandu untuk penjangkauan rumah, mengatur kuota faskes, serta mendeteksi kandidat yang berisiko putus perawatan.',
    highlights: [
      'Evidence-based closure: Wajib bukti verifikasi klinis sebelum tugas selesai',
      'Otomasi eskalasi kasus bila batas waktu penjangkauan terlampaui',
      'Integrasi langsung dengan modul Kader Field PWA (Offline)',
    ],
  },
  {
    id: 'clinical-followup',
    targetSelector: '[data-tour="nav-clinical-followup"]',
    navId: 'clinical-followup',
    placement: 'right',
    badge: 'LAYANAN KLINIS FKTP',
    title: 'Layanan Klinis & Closed-Loop Referral',
    subtitle: 'Pemeriksaan Dokter, e-Resep Kronis, & Rujukan Antar Faskes',
    content:
      'Modul ini digunakan dokter dan perawat di Puskesmas/Pustu untuk mencatat pemeriksaan konfirmasi, penegakan diagnosis ICD-10 terstandar, peresepan obat antihipertensi/diabetes, dan penerbitan rujukan terkoordinasi ke RSUD Bobong.',
    highlights: [
      'Rekomendasi tata laksana sesuai pedoman klinis Kemenkes',
      'Pencatatan resep elektronik & sinkronisasi stok farmasi',
      'Status rujukan tertutup (Closed-loop referral) terpantau transparan',
    ],
  },
  {
    id: 'dinkes-command-center',
    targetSelector: '[data-tour="nav-dinkes-ringkasan"]',
    navId: 'dinkes-ringkasan',
    placement: 'right',
    badge: 'DINKES COMMAND CENTER',
    title: 'Dinkes Command Center & Kaskade Populasi',
    subtitle: 'Evaluasi Dampak CKG, Kaskade Susut 8-Tahap, & Tampilan Bupati',
    content:
      'Pusat kendali kesehatan populasi untuk Dinas Kesehatan dan Bupati. Menampilkan CKG Impact Index, identifikasi bottleneck rujukan maritim (kondisi gelombang laut perahu nelayan), perbandingan kinerja 8 Puskesmas, dan ekspor laporan eksekutif ber-checksum.',
    highlights: [
      'CKG Impact Index: Tingkat 1 Skrining, Tingkat 2 Kontinuitas, Tingkat 3 Terkunci aman (OI-08)',
      'Tampilan Khusus Bupati: Kedap privasi (S0 Aggregate Only, tanpa NIK warga)',
      'Audit penelusuran drilldown berlandaskan Purpose Code resmi',
    ],
  },
  {
    id: 'ai-intelligence-layer',
    targetSelector: '[data-tour="nav-ai-proyeksi-beban"]',
    navId: 'ai-proyeksi-beban',
    placement: 'right',
    badge: 'ADVANCED AI LAYER',
    title: 'Kecerdasan Buatan & Decision Copilot',
    subtitle: 'Proyeksi Beban 6-Bulan, Copilot Resep, & Nudge Kultural Warga',
    content:
      'Lapisan AI tingkat lanjut membantu mengantisipasi lonjakan beban penyakit, menghitung buffer stock obat sebelum musim gelombang tinggi, memberikan rekomendasi keamanan resep dokter (ICD-10 & DDI), serta menyusun pesan edukasi dalam dialek Melayu Taliabu.',
    highlights: [
      'Forecasting 6-bulan kebutuhan obat esensial maritim',
      'Human-in-the-loop: Dokter memegang kendali penuh Approve/Modify/Reject',
      'Penyusunan rute penjangkauan efisien sesuai kondisi maritim BMKG',
    ],
  },
  {
    id: 'role-network-simulator',
    targetSelector: '#tour-role-network-bar',
    navId: 'dashboard',
    placement: 'bottom',
    badge: 'SIMULASI PERAN',
    title: 'Simulasi Jaringan & Pengujian Peran Demo',
    subtitle: 'Uji Hak Akses 10 Peran & Pengoperasian Mode Luring (Offline)',
    content:
      'Gunakan tombol di pojok kanan atas ini untuk beralih instan antar-peran demo (Bupati, Kadinkes, Dokter Puskesmas, Bidan Desa, Kader Posyandu) guna menguji pembatasan hak akses setiap peran, serta beralih ke mode Offline/Slow untuk menguji ketahanan sinkronisasi PWA.',
    highlights: [
      'Ganti Peran Demo: Verifikasi kepatuhan akses data dan pembatasan wewenang',
      'Simulasi Jaringan: Uji coba penyimpanan lokal IndexedDB saat sinyal terputus',
      'Panduan Tur selalu dapat diakses kembali kapan saja melalui tombol bintang di bilah atas',
    ],
  },
];

const TourContext = createContext<TourContextValue | null>(null);

export const TourProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isTourActive, setIsTourActive] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [hasSeenTour, setHasSeenTour] = useState<boolean>(() => {
    try {
      return localStorage.getItem(TOUR_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [onNavigateCallback, setOnNavigateCallbackState] = useState<((navId: string) => void) | null>(null);

  const setOnNavigateCallback = useCallback((fn: (navId: string) => void) => {
    setOnNavigateCallbackState(() => fn);
  }, []);

  const totalSteps = TOUR_STEPS.length;
  const currentStep = isTourActive && currentStepIndex >= 0 && currentStepIndex < totalSteps
    ? TOUR_STEPS[currentStepIndex]
    : null;

  // Auto trigger navigation when step changes
  useEffect(() => {
    if (isTourActive && currentStep && currentStep.navId && onNavigateCallback) {
      onNavigateCallback(currentStep.navId);
    }
  }, [isTourActive, currentStepIndex, currentStep, onNavigateCallback]);

  const startTour = useCallback((stepIndex: number = 0) => {
    const validIndex = Math.max(0, Math.min(stepIndex, TOUR_STEPS.length - 1));
    setCurrentStepIndex(validIndex);
    setIsTourActive(true);

    const step = TOUR_STEPS[validIndex];
    if (step.navId && onNavigateCallback) {
      onNavigateCallback(step.navId);
    }
  }, [onNavigateCallback]);

  const endTour = useCallback((markAsCompleted: boolean = true) => {
    setIsTourActive(false);
    if (markAsCompleted) {
      try {
        localStorage.setItem(TOUR_STORAGE_KEY, 'true');
        setHasSeenTour(true);
      } catch {
        // ignore
      }
    }
  }, []);

  const nextStep = useCallback(() => {
    if (currentStepIndex < totalSteps - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      const step = TOUR_STEPS[nextIdx];
      if (step.navId && onNavigateCallback) {
        onNavigateCallback(step.navId);
      }
    } else {
      endTour(true);
    }
  }, [currentStepIndex, totalSteps, endTour, onNavigateCallback]);

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      const step = TOUR_STEPS[prevIdx];
      if (step.navId && onNavigateCallback) {
        onNavigateCallback(step.navId);
      }
    }
  }, [currentStepIndex, onNavigateCallback]);

  const goToStep = useCallback((index: number) => {
    if (index >= 0 && index < totalSteps) {
      setCurrentStepIndex(index);
      const step = TOUR_STEPS[index];
      if (step.navId && onNavigateCallback) {
        onNavigateCallback(step.navId);
      }
    }
  }, [totalSteps, onNavigateCallback]);

  const resetTourStatus = useCallback(() => {
    try {
      localStorage.removeItem(TOUR_STORAGE_KEY);
      setHasSeenTour(false);
    } catch {
      // ignore
    }
  }, []);

  return (
    <TourContext.Provider
      value={{
        isTourActive,
        currentStepIndex,
        currentStep,
        totalSteps,
        startTour,
        endTour,
        nextStep,
        prevStep,
        goToStep,
        hasSeenTour,
        resetTourStatus,
        onNavigateCallback,
        setOnNavigateCallback,
      }}
    >
      {children}
    </TourContext.Provider>
  );
};

export const useTour = (): TourContextValue => {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
};
