import React, { useState } from 'react';
import {
  X,
  Sliders,
  Wifi,
  HardDrive,
  Clock,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  UserCheck,
  Smartphone,
  Trash2,
} from 'lucide-react';
import { useNetwork } from '../../../context/NetworkContext';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { kaderStorageRepo } from '../../../repositories/kaderStorageRepo';
import { runSecurityPayloadAuditTest } from '../../../services/kaderPayloadSecurityService';

interface DevSimulatorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshData?: () => void;
  onSwitchToDesktop?: () => void;
}

export const DevSimulatorDrawer: React.FC<DevSimulatorDrawerProps> = ({
  isOpen,
  onClose,
  onRefreshData,
  onSwitchToDesktop,
}) => {
  const { networkMode, setNetworkMode } = useNetwork();
  const { currentUser, switchDemoUser } = useAuth();
  const toast = useToast();

  const [deviceState, setDeviceStateState] = useState(kaderStorageRepo.getDeviceState());
  const [securityTestResult, setSecurityTestResult] = useState<{
    tested: boolean;
    passed?: boolean;
    error?: string;
  }>({ tested: false });

  if (!isOpen) return null;

  const handleSetStorageMode = (mode: 'NORMAL' | 'NEARLY_FULL' | 'FULL') => {
    kaderStorageRepo.setDeviceState({ simulatedStorageMode: mode });
    setDeviceStateState(kaderStorageRepo.getDeviceState());
    toast.info('Simulasi Ruang Penyimpanan', `Penyimpanan diset ke mode: ${mode}`);
    if (onRefreshData) onRefreshData();
  };

  const handleToggleClockSkew = () => {
    const newSkew = deviceState.simulatedClockSkewMinutes === 0 ? 5 * 24 * 60 : 0;
    kaderStorageRepo.setDeviceState({ simulatedClockSkewMinutes: newSkew });
    setDeviceStateState(kaderStorageRepo.getDeviceState());
    toast.warning(
      'Simulasi Clock Skew',
      newSkew > 0 ? 'Jam perangkat diset lebih cepat 5 hari (Clock Skew Flagged).' : 'Jam perangkat kembali normal.'
    );
    if (onRefreshData) onRefreshData();
  };

  const handleExpirePackageNow = () => {
    kaderStorageRepo.purgeExpiredPackage('MANUAL_TEST_EXPIRY');
    toast.warning(
      'Paket Dibuat Kedaluwarsa',
      'Paket unduhan warga dihapus. Catatan kunjungan lokal yang belum terkirim TETAP AMAN.'
    );
    if (onRefreshData) onRefreshData();
  };

  const handleRunSecurityAudit = () => {
    const pkg = kaderStorageRepo.getActivePackage();
    if (!pkg) {
      toast.info('Audit Privasi S2', 'Unduh paket terlebih dahulu untuk menjalankan audit struktur.');
      return;
    }

    const res = runSecurityPayloadAuditTest(pkg);
    setSecurityTestResult({
      tested: true,
      passed: res.passed,
      error: res.error,
    });

    if (res.passed) {
      toast.success('Audit Privasi Lolos', '100% Bersih dari atribut klinis S3/S4 (Tensi, Gula, IMT, Diagnosa, Warna Risiko Nihil).');
    } else {
      toast.error('Pelanggaran S2 Terdeteksi', res.error || 'Ditemukan kebocoran data klinis');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 overflow-y-auto">
        {/* Header */}
        <div className="p-4 bg-[#00201C] text-white flex items-center justify-between border-b border-[#D8E5E2]/20">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold">Simulator & Uji Lapangan</h3>
              <p className="text-[10px] text-slate-300">Tool pengujian alur demo penjangkauan kader</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-5 text-xs">
          {/* 1. Network Simulation */}
          <div className="space-y-2">
            <label className="font-bold text-black flex items-center gap-1.5">
              <Wifi className="w-4 h-4 text-[#2E7D5B]" />
              Simulasi Kondisi Jaringan
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => setNetworkMode('ONLINE')}
                className={`py-2 px-2.5 rounded-lg font-semibold border text-center cursor-pointer transition-all ${
                  networkMode === 'ONLINE'
                    ? 'bg-[#00201C] text-white border-[#00201C]'
                    : 'bg-white text-[#334643] border-[#D8E5E2] hover:bg-[#F8FBFA]'
                }`}
              >
                Daring (Online)
              </button>
              <button
                onClick={() => setNetworkMode('SLOW')}
                className={`py-2 px-2.5 rounded-lg font-semibold border text-center cursor-pointer transition-all ${
                  networkMode === 'SLOW'
                    ? 'bg-amber-800 text-white border-amber-800'
                    : 'bg-white text-[#334643] border-[#D8E5E2] hover:bg-[#F8FBFA]'
                }`}
              >
                Sinyal Lemah
              </button>
              <button
                onClick={() => setNetworkMode('OFFLINE')}
                className={`col-span-2 py-2 px-2.5 rounded-lg font-semibold border text-center cursor-pointer transition-all ${
                  networkMode === 'OFFLINE'
                    ? 'bg-slate-800 text-white border-slate-800'
                    : 'bg-white text-[#334643] border-[#D8E5E2] hover:bg-[#F8FBFA]'
                }`}
              >
                Luring (Offline Penuh)
              </button>
            </div>
          </div>

          {/* 2. Storage Simulator */}
          <div className="space-y-2 pt-3 border-t border-[#D8E5E2]">
            <label className="font-bold text-black flex items-center gap-1.5">
              <HardDrive className="w-4 h-4 text-[#2E7D5B]" />
              Simulasi Memori Penyimpanan
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => handleSetStorageMode('NORMAL')}
                className={`py-1.5 px-2 rounded-lg font-semibold border text-center text-[11px] cursor-pointer ${
                  deviceState.simulatedStorageMode === 'NORMAL'
                    ? 'bg-[#00201C] text-white border-[#00201C]'
                    : 'bg-white text-[#334643] border-[#D8E5E2]'
                }`}
              >
                Normal (128M)
              </button>
              <button
                onClick={() => handleSetStorageMode('NEARLY_FULL')}
                className={`py-1.5 px-2 rounded-lg font-semibold border text-center text-[11px] cursor-pointer ${
                  deviceState.simulatedStorageMode === 'NEARLY_FULL'
                    ? 'bg-amber-800 text-white border-amber-800'
                    : 'bg-white text-[#334643] border-[#D8E5E2]'
                }`}
              >
                Hampir Penuh
              </button>
              <button
                onClick={() => handleSetStorageMode('FULL')}
                className={`py-1.5 px-2 rounded-lg font-semibold border text-center text-[11px] cursor-pointer ${
                  deviceState.simulatedStorageMode === 'FULL'
                    ? 'bg-red-800 text-white border-red-800'
                    : 'bg-white text-[#334643] border-[#D8E5E2]'
                }`}
              >
                Penuh (Tolak)
              </button>
            </div>
          </div>

          {/* 3. Clock Skew Simulator */}
          <div className="space-y-2 pt-3 border-t border-[#D8E5E2]">
            <label className="font-bold text-black flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#2E7D5B]" />
              Simulasi Jam Perangkat (Clock Skew)
            </label>
            <button
              onClick={handleToggleClockSkew}
              className={`w-full py-2 px-3 rounded-lg font-semibold border text-left cursor-pointer flex items-center justify-between ${
                deviceState.simulatedClockSkewMinutes > 0
                  ? 'bg-amber-50 text-amber-900 border-amber-300'
                  : 'bg-white text-[#334643] border-[#D8E5E2]'
              }`}
            >
              <span>
                {deviceState.simulatedClockSkewMinutes > 0
                  ? 'Clock Skew: +5 Hari Aktif (Flagged)'
                  : 'Jam Perangkat: Normal'}
              </span>
              <span className="text-[10px] font-bold underline">Ubah</span>
            </button>
          </div>

          {/* 4. Package Expiry Test */}
          <div className="space-y-2 pt-3 border-t border-[#D8E5E2]">
            <label className="font-bold text-black flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Uji Siklus Kedaluwarsa Paket
            </label>
            <button
              onClick={handleExpirePackageNow}
              className="w-full py-2 px-3 bg-red-50 text-red-800 border border-red-200 rounded-lg font-semibold hover:bg-red-100 cursor-pointer flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
              Kedaluwarsakan Paket Sekarang
            </button>
            <p className="text-[10px] text-[#60716D]">
              Menghapus paket baca warga tanpa menghilangkan antrean kerja belum terkirim.
            </p>
          </div>

          {/* 5. Privacy S2 Hard Lock Inspection */}
          <div className="space-y-2 pt-3 border-t border-[#D8E5E2]">
            <label className="font-bold text-black flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#2E7D5B]" />
              Audit Keamanan Batas Privasi S2
            </label>
            <button
              onClick={handleRunSecurityAudit}
              className="w-full py-2 px-3 bg-[#E1F5FE] text-black border border-[#00201C]/20 rounded-lg font-semibold hover:bg-[#D8E5E2] cursor-pointer flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-black" />
              Uji Kebocoran S3/S4 Payload
            </button>
            {securityTestResult.tested && (
              <div
                className={`p-2.5 rounded-lg text-[11px] font-medium ${
                  securityTestResult.passed
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                    : 'bg-red-50 text-red-900 border border-red-200'
                }`}
              >
                {securityTestResult.passed
                  ? '✓ HASIL: VALID. Tidak ada tensi, gula, IMT, diagnosa, resep, atau warna risiko yang terkirim ke gawai kader.'
                  : `✗ HASIL: GAGAL. ${securityTestResult.error}`}
              </div>
            )}
          </div>

          {/* 6. Akun Kader Aktif */}
          <div className="space-y-2 pt-3 border-t border-[#D8E5E2]">
            <label className="font-bold text-black flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-[#2E7D5B]" />
              Akun Kader Lapangan
            </label>
            <div className="p-2.5 rounded-lg border border-[#2E7D5B] bg-[#EBF7F2] text-xs">
              <div className="font-bold text-black flex items-center justify-between">
                <span>Kader Marlina</span>
                <span className="text-[10px] bg-[#2E7D5B] text-white px-1.5 py-0.5 rounded font-semibold">Aktif</span>
              </div>
              <div className="text-[11px] text-[#2E7D5B] mt-0.5">Wilayah Binaan: Desa Bobong (Puskesmas Bobong)</div>
            </div>
          </div>

          {/* 7. Switch to Desktop Puskesmas App */}
          {onSwitchToDesktop && (
            <div className="pt-3 border-t border-[#D8E5E2]">
              <button
                onClick={onSwitchToDesktop}
                className="w-full py-2.5 px-3 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-900 cursor-pointer flex items-center justify-center gap-2"
              >
                <Smartphone className="w-4 h-4 text-emerald-400" />
                Beralih ke Tampilan Desktop Puskesmas
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
