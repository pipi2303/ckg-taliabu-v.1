import React, { useState } from 'react';
import {
  Home,
  Calendar,
  HelpCircle,
  User,
  Wifi,
  WifiOff,
  Sparkles,
  ChevronDown,
  Activity,
  MapPin,
  AlertTriangle,
  FileText,
  Layers,
  BookOpen,
} from 'lucide-react';
import { useCitizen, CitizenDemoMode } from '../context/CitizenContext';
import { CitizenConsentModal } from './CitizenConsentModal';
import { CitizenScreenMatrixModal, ScreenDocItem } from './CitizenScreenMatrixModal';
import { DocBadge } from './DocBadge';

export type CitizenActiveTab = 'HOME' | 'SCHEDULE' | 'RESULTS' | 'FACILITY' | 'BARRIER' | 'HELP' | 'ACCOUNT';

interface CitizenAppShellProps {
  activeTab: CitizenActiveTab;
  setActiveTab: (tab: CitizenActiveTab) => void;
  children: React.ReactNode;
}

export const CitizenAppShell: React.FC<CitizenAppShellProps> = ({
  activeTab,
  setActiveTab,
  children,
}) => {
  const {
    citizen,
    profile,
    isOnline,
    toggleOnlineStatus,
    demoMode,
    setDemoMode,
    showConsentModal,
    dismissConsentModal,
    grantConsent,
  } = useCitizen();

  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const [showMatrixModal, setShowMatrixModal] = useState(false);

  const demoScenarios: { id: CitizenDemoMode; label: string; desc: string }[] = [
    { id: 'ACTION_REQUIRED', label: '1. Hamid La Ode (Perlu Jadwal)', desc: 'Tindakan: Pilih jadwal tindak lanjut' },
    { id: 'AWAITING_CONFIRMATION', label: '2. Nuraini (Menunggu Konfirmasi)', desc: 'Hasil skrining perlu dipastikan dulu' },
    { id: 'SCHEDULED', label: '3. Siti Rahmawati (Sudah Ada Jadwal)', desc: 'Jadwal kunjungan telah ditetapkan' },
    { id: 'BARRIER_CASE', label: '4. Yohanis (Terkendala Transportasi)', desc: 'Kendala perahu pulau Jorjoga' },
    { id: 'NO_DATA', label: '5. Rusli Silayar (Data Belum Tersedia)', desc: 'Skrining belum masuk sistem' },
    { id: 'OFFLINE_CACHED', label: '6. Mode Offline (Data Tersimpan)', desc: 'Melihat riwayat offline' },
  ];

  // Active Tab metadata for badge and tooltips
  const tabMetadata: Record<CitizenActiveTab, { code: string; label: string; plafon: string; useCase: string; desc: string }> = {
    HOME: {
      code: 'SCR-WRG-B01',
      label: 'Beranda: Tindakan Berikutnya',
      plafon: 'S2',
      useCase: 'UC PSN-06, PSN-07',
      desc: 'Satu tindakan utama menonjol, tanpa kategori warna risiko merah/oranye/kuning internal, tenggat bahasa awam.',
    },
    SCHEDULE: {
      code: 'SCR-WRG-C01',
      label: 'Pilih & Ubah Jadwal',
      plafon: 'S2',
      useCase: 'UC PSN-10, PSN-12',
      desc: 'Pemilihan slot kuota faskes real-time & penjadwalan ulang dengan pemilih alasan CMP-07 (sinyal drop-out).',
    },
    RESULTS: {
      code: 'SCR-WRG-D01',
      label: 'Hasil Pemeriksaan Saya & Longitudinal',
      plafon: 'S4',
      useCase: 'UC PSN-05, PSN-08',
      desc: 'Nilai disertai satuan & penjelasan, penanda tegas unconfirmed, tren longitudinal bersama pengobatan.',
    },
    FACILITY: {
      code: 'SCR-WRG-C03',
      label: 'Informasi Fasilitas & Rute Maritim',
      plafon: 'S0',
      useCase: 'UC PSN-13',
      desc: 'Lokasi, jam buka, rute teks maritim tanpa peta daring, dan persiapan puasa sesuai jenis lab.',
    },
    BARRIER: {
      code: 'SCR-WRG-C04',
      label: 'Lapor Kendala Tindak Lanjut',
      plafon: 'S2',
      useCase: 'UC PSN-12, PSN-14',
      desc: 'Pelaporan kendala transportasi/biaya awal CMP-07 sebelum hilang dari kaskade tindak lanjut.',
    },
    HELP: {
      code: 'SCR-WRG-F01',
      label: 'Minta Bantuan & Kontak Kader',
      plafon: 'S1',
      useCase: 'UC PSN-14',
      desc: 'Akses jalur bantuan aktif ke kader Posyandu desa binaan atau staf Puskesmas resmi.',
    },
    ACCOUNT: {
      code: 'SCR-WRG-F03',
      label: 'Kelola Akun, Consent & Hak Data',
      plafon: 'S1',
      useCase: 'UC PSN-03, PSN-04',
      desc: 'Audit jejak akses CMP-09, perwalian keluarga SCR-WRG-F02, dan pencabutan consent UU PDP 27/2022.',
    },
  };

  const currentMeta = tabMetadata[activeTab];

  return (
    <div className="min-h-screen bg-[#F0F5F4] flex flex-col items-center justify-start text-black antialiased">
      {/* Mobile container - max 480px width to simulate mobile PWA or expand responsively */}
      <div className="w-full max-w-md min-h-screen bg-[#F8FBFA] shadow-xl flex flex-col relative border-x border-[#D8E5E2]">
        
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-[#00201C] text-white px-4 py-3 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-[#E1F5FE]">
                  CKG Sahabat
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-[#FFFACD] text-black">
                  Warga
                </span>
              </div>
              <p className="text-[11px] text-[#D8E5E2] font-normal truncate max-w-[180px]">
                {citizen?.fullName || 'Warga Taliabu'}
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Screen Matrix Spec Button */}
              <button
                onClick={() => setShowMatrixModal(true)}
                title="Buka Matriks Spesifikasi SCR-CKG 03 (17 Layar)"
                className="flex items-center gap-1 text-[10.5px] font-bold bg-[#003B33] hover:bg-[#004d43] text-amber-300 px-2 py-1 rounded-lg border border-amber-500/40 transition-colors shadow-xs"
              >
                <BookOpen className="w-3 h-3 text-amber-400" />
                <span className="font-mono">SCR-CKG 03</span>
              </button>

              {/* Online/Offline Toggle */}
              <button
                onClick={toggleOnlineStatus}
                title={isOnline ? 'Online (Klik untuk uji coba offline)' : 'Offline (Klik untuk online)'}
                className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full border transition-colors ${
                  isOnline
                    ? 'bg-emerald-900/60 text-emerald-200 border-emerald-700/60'
                    : 'bg-amber-900/80 text-amber-200 border-amber-700'
                }`}
              >
                {isOnline ? (
                  <>
                    <Wifi className="w-3 h-3 text-emerald-400" />
                    <span className="hidden sm:inline">Online</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3 text-amber-300" />
                    <span className="hidden sm:inline">Offline</span>
                  </>
                )}
              </button>

              {/* Demo Mode Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowDemoMenu(!showDemoMenu)}
                  title="Ganti skenario simulasi warga"
                  className="flex items-center gap-1 text-[11px] font-bold bg-[#102521] hover:bg-[#1a3832] text-[#FFFACD] px-2 py-1 rounded-lg border border-[#3b5750] transition-colors"
                >
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <ChevronDown className="w-3 h-3 opacity-75" />
                </button>

                {showDemoMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowDemoMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-72 bg-white text-black rounded-xl shadow-2xl border border-[#D8E5E2] z-50 p-2 text-xs divide-y divide-gray-100">
                      <div className="px-3 py-2 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                        Pilih Skenario Warga (Demo Interaktif)
                      </div>
                      <div className="py-1 space-y-1">
                        {demoScenarios.map((s) => (
                          <button
                            key={s.id}
                            onClick={() => {
                              setDemoMode(s.id);
                              setShowDemoMenu(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                              demoMode === s.id
                                ? 'bg-[#E1F5FE] text-black font-semibold'
                                : 'hover:bg-gray-50 text-gray-700'
                            }`}
                          >
                            <div className="font-medium text-xs">{s.label}</div>
                            <div className="text-[10px] text-gray-500">{s.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Spec Breadcrumb & Active Screen Doc Badge Strip */}
        <div className="bg-[#002D27] text-white px-3 py-1.5 border-b border-[#003B33] flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-slate-300 truncate font-medium text-[10px]">
              Layar Aktif:
            </span>
            <DocBadge
              code={currentMeta.code}
              title={currentMeta.label}
              plafon={currentMeta.plafon}
              useCase={currentMeta.useCase}
              description={currentMeta.desc}
              rules={[
                'Satu tindakan per layar, tanpa penomoran internal CRS.',
                'Temuan belum terkonfirmasi bukan penyakit.',
                'Tanpa warna risiko operasional (merah/oranye/kuning).',
              ]}
              variant="amber"
              size="xs"
            />
          </div>

          <button
            onClick={() => setShowMatrixModal(true)}
            className="text-[10px] text-amber-300 hover:text-amber-200 font-semibold underline underline-offset-2 shrink-0 ml-2"
          >
            Lihat 17 Layar
          </button>
        </div>

        {/* Offline Warning Banner */}
        {!isOnline && (
          <div className="bg-amber-100 border-b border-amber-300 text-amber-950 px-4 py-2 text-xs flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-amber-700 shrink-0" />
            <span className="text-[11px] leading-tight">
              <strong>Mode Offline:</strong> Menampilkan data terakhir yang tersimpan. Pengubahan jadwal memerlukan jaringan internet.
            </span>
          </div>
        )}

        {/* Simulation Watermark Banner */}
        <div className="bg-[#FFFACD]/70 border-b border-[#ebd79b] text-amber-900 px-4 py-1.5 text-[11px] flex items-center justify-between">
          <span className="font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-amber-600" />
            DATA SIMULASI KABUPATEN PULAU TALIABU
          </span>
          <span className="text-[10px] text-amber-800">
            {profile?.facilityName || 'Puskesmas Bobong'}
          </span>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 pb-24 overflow-y-auto">
          {children}
        </main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 w-full max-w-md bg-white border-t border-[#D8E5E2] px-2 py-1.5 z-30 flex items-center justify-around shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
          <button
            onClick={() => setActiveTab('HOME')}
            title="[SCR-WRG-B01] Beranda: Tindakan Berikutnya & B02 Penjelasan Status"
            className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all relative group cursor-pointer ${
              activeTab === 'HOME'
                ? 'text-black font-bold scale-105'
                : 'text-[#60716D] hover:text-black'
            }`}
          >
            <div className={`p-1 rounded-full ${activeTab === 'HOME' ? 'bg-[#E1F5FE]' : ''}`}>
              <Home className="w-5 h-5" />
            </div>
            <span className="text-[11px] mt-0.5">Beranda</span>
            <span className="text-[7.5px] font-mono text-gray-500 font-bold -mt-0.5">B01</span>
          </button>

          <button
            onClick={() => setActiveTab('SCHEDULE')}
            title="[SCR-WRG-C01] Pilih & Ubah Jadwal Kunjungan Faskes"
            className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all relative group cursor-pointer ${
              activeTab === 'SCHEDULE'
                ? 'text-black font-bold scale-105'
                : 'text-[#60716D] hover:text-black'
            }`}
          >
            <div className={`p-1 rounded-full ${activeTab === 'SCHEDULE' ? 'bg-[#E1F5FE]' : ''}`}>
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-[11px] mt-0.5">Jadwal</span>
            <span className="text-[7.5px] font-mono text-gray-500 font-bold -mt-0.5">C01</span>
          </button>

          <button
            onClick={() => setActiveTab('RESULTS')}
            title="[SCR-WRG-D01] Hasil Pemeriksaan Saya & D02 Riwayat Longitudinal"
            className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all relative group cursor-pointer ${
              activeTab === 'RESULTS'
                ? 'text-black font-bold scale-105'
                : 'text-[#60716D] hover:text-black'
            }`}
          >
            <div className={`p-1 rounded-full ${activeTab === 'RESULTS' ? 'bg-[#E1F5FE]' : ''}`}>
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-[11px] mt-0.5">Hasil</span>
            <span className="text-[7.5px] font-mono text-gray-500 font-bold -mt-0.5">D01</span>
          </button>

          <button
            onClick={() => setActiveTab('HELP')}
            title="[SCR-WRG-F01] Minta Bantuan & C04 Lapor Kendala"
            className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all relative group cursor-pointer ${
              activeTab === 'HELP' || activeTab === 'BARRIER'
                ? 'text-black font-bold scale-105'
                : 'text-[#60716D] hover:text-black'
            }`}
          >
            <div className={`p-1 rounded-full ${activeTab === 'HELP' || activeTab === 'BARRIER' ? 'bg-[#E1F5FE]' : ''}`}>
              <HelpCircle className="w-5 h-5" />
            </div>
            <span className="text-[11px] mt-0.5">Bantuan</span>
            <span className="text-[7.5px] font-mono text-gray-500 font-bold -mt-0.5">F01</span>
          </button>

          <button
            onClick={() => setActiveTab('ACCOUNT')}
            title="[SCR-WRG-F03] Riwayat Akses, Perwalian F02 & Consent A02"
            className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all relative group cursor-pointer ${
              activeTab === 'ACCOUNT'
                ? 'text-black font-bold scale-105'
                : 'text-[#60716D] hover:text-black'
            }`}
          >
            <div className={`p-1 rounded-full ${activeTab === 'ACCOUNT' ? 'bg-[#E1F5FE]' : ''}`}>
              <User className="w-5 h-5" />
            </div>
            <span className="text-[11px] mt-0.5">Akun</span>
            <span className="text-[7.5px] font-mono text-gray-500 font-bold -mt-0.5">F03</span>
          </button>
        </nav>

        {/* Global Consent Modal */}
        <CitizenConsentModal
          isOpen={showConsentModal}
          onClose={dismissConsentModal}
          onAgree={grantConsent}
          citizenName={citizen?.fullName || 'Warga'}
        />

        {/* Matriks Layar Modal */}
        <CitizenScreenMatrixModal
          isOpen={showMatrixModal}
          onClose={() => setShowMatrixModal(false)}
          onSelectScreen={(screen: ScreenDocItem) => {
            if (screen.tabTarget) {
              setActiveTab(screen.tabTarget);
            }
          }}
        />
      </div>
    </div>
  );
};

