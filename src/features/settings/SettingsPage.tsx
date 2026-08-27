import React, { useState } from 'react';
import { Settings, RefreshCw, Database, Radio, Globe, Shield, AlertTriangle } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { useNetwork } from '../../context/NetworkContext';
import { useToast } from '../../context/ToastContext';
import { useModal } from '../../context/ModalContext';
import { rawStorage } from '../../repositories/storage';
import { NetworkMode } from '../../types';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, networkMode, setNetworkMode } = useNetwork();
  const toast = useToast();
  const { openModal } = useModal();

  const [platformName, setPlatformName] = useState(settings.platformName || 'CKG Smart Care Platform');
  const [district, setDistrict] = useState(settings.district || 'Kabupaten Pulau Taliabu');
  const [province, setProvince] = useState(settings.province || 'Maluku Utara');
  const [timezone, setTimezone] = useState(settings.timezone || 'Asia/Jayapura (WIT - UTC+9)');
  const [simulatedLatencyMs, setSimulatedLatencyMs] = useState(settings.simulatedLatencyMs || 300);

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      platformName,
      district,
      province,
      timezone,
      simulatedLatencyMs: Number(simulatedLatencyMs),
    });
  };

  const handleResetDatabase = () => {
    openModal({
      title: 'Reset Basis Data Lokal ke Awal?',
      subtitle: 'Tindakan ini akan mengembalikan data Kabupaten Pulau Taliabu ke draf bawaan.',
      size: 'sm',
      content: ({ closeModal }) => {
        const handleConfirm = () => {
          rawStorage.resetToInitial();
          toast.success('Basis Data Direset', 'Seluruh master data dan jejak audit telah dikembalikan ke kondisi awal.');
          closeModal();
          setTimeout(() => {
            window.location.reload();
          }, 300);
        };

        return (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-[#FDF0F0] border border-[#F8C6C6] text-[#9A2D2D] rounded-lg leading-relaxed">
              <strong>Perhatian Pengembang:</strong> Seluruh modifikasi pengguna, faskes baru, draf aturan, dan rekaman consent kustom akan dihapus dan direset ke benih data resmi Taliabu.
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={closeModal}>
                Batal
              </Button>
              <Button variant="danger" size="sm" onClick={handleConfirm}>
                Reset Semua Data
              </Button>
            </div>
          </div>
        );
      },
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-[#D8E5E2] flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-black">Pengaturan Platform & Lingkungan Sistem</h3>
          <p className="text-xs text-[#60716D] mt-0.5">
            Konfigurasi parameter wilayah, zona waktu operasional, dan simulasi jaringan lapangan.
          </p>
        </div>
      </div>

      {/* General Settings */}
      <Card>
        <form onSubmit={handleSaveGeneral} className="space-y-4">
          <div className="flex items-center gap-2 border-b border-[#D8E5E2] pb-3">
            <Globe className="w-4 h-4 text-[#2E7D5B]" />
            <h4 className="text-sm font-bold text-black">Identitas & Parameter Wilayah</h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nama Platform"
              required
              value={platformName}
              onChange={(e) => setPlatformName(e.target.value)}
            />

            <Input
              label="Kabupaten / Kota"
              required
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Provinsi"
              required
              value={province}
              onChange={(e) => setProvince(e.target.value)}
            />

            <Select
              label="Zona Waktu Operasional"
              required
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              options={[
                { value: 'Asia/Jayapura (WIT - UTC+9)', label: 'Waktu Indonesia Timur (WIT / UTC+9)' },
                { value: 'Asia/Makassar (WITA - UTC+8)', label: 'Waktu Indonesia Tengah (WITA / UTC+8)' },
                { value: 'Asia/Jakarta (WIB - UTC+7)', label: 'Waktu Indonesia Barat (WIB / UTC+7)' },
              ]}
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" size="md">
              Simpan Pengaturan
            </Button>
          </div>
        </form>
      </Card>

      {/* Network Simulation & Latency Settings */}
      <Card className="space-y-4">
        <div className="flex items-center gap-2 border-b border-[#D8E5E2] pb-3">
          <Radio className="w-4 h-4 text-[#397B94]" />
          <h4 className="text-sm font-bold text-black">Simulasi Jaringan & Kesiapan Luring</h4>
        </div>

        <p className="text-xs text-[#60716D]">
          Uji perilaku platform pada berbagai skenario konektivitas pulau terpencil Kabupaten Pulau Taliabu.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(['ONLINE', 'SLOW', 'OFFLINE'] as NetworkMode[]).map((mode) => {
            const isCurrent = networkMode === mode;
            const labels: Record<NetworkMode, { title: string; desc: string }> = {
              ONLINE: { title: 'Daring (Online)', desc: 'Koneksi normal tanpa hambatan' },
              SLOW: { title: 'Jaringan Lambat', desc: 'Simulasi latensi 3G/2G pedalaman' },
              OFFLINE: { title: 'Luring Penuh (Offline)', desc: 'Semua aksi dialihkan ke antrian lokal' },
            };

            return (
              <div
                key={mode}
                onClick={() => setNetworkMode(mode)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-[#00201C] text-white border-[#00201C] shadow-xs'
                    : 'bg-[#F8FBFA] text-black border-[#D8E5E2] hover:bg-[#F0F5F4]'
                }`}
              >
                <p className="text-xs font-bold">{labels[mode].title}</p>
                <p className={`text-[11px] mt-1 ${isCurrent ? 'text-slate-300' : 'text-[#60716D]'}`}>
                  {labels[mode].desc}
                </p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Database Management & Development Reset */}
      <Card className="space-y-4 border-[#F8C6C6]">
        <div className="flex items-center gap-2 border-b border-[#D8E5E2] pb-3 text-[#C84A4A]">
          <Database className="w-4 h-4" />
          <h4 className="text-sm font-bold">Reset Basis Data Simulasi</h4>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <p className="text-[#60716D]">
            Kembalikan seluruh pengguna, faskes, wilayah, versi aturan, dan antrian luring ke kondisi bawaan awal.
          </p>
          <Button variant="danger" size="sm" onClick={handleResetDatabase} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            Reset Data Awal
          </Button>
        </div>
      </Card>
    </div>
  );
};
