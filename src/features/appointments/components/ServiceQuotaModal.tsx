import React, { useEffect, useState } from 'react';
import { X, Sliders, AlertTriangle, Users } from 'lucide-react';
import { HealthFacility, ServiceQuota } from '../../../types';
import { serviceQuotaRepo } from '../../../repositories/serviceQuotaRepo';
import { facilityRepo } from '../../../repositories/facilityRepo';
import { useAuth } from '../../../context/AuthContext';
import { Button } from '../../../components/common/Button';

interface ServiceQuotaModalProps {
  quota: ServiceQuota | null;
  facilityId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ServiceQuotaModal: React.FC<ServiceQuotaModalProps> = ({
  quota,
  facilityId,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { currentUser } = useAuth();
  const [facilities, setFacilities] = useState<HealthFacility[]>([]);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>('');
  const [serviceType, setServiceType] = useState<string>('Pemeriksaan Klinis CKG & Konfirmasi');
  const [date, setDate] = useState<string>('');
  const [capacity, setCapacity] = useState<number>(15);
  const [warning, setWarning] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadFacilities();
      if (quota) {
        setSelectedFacilityId(quota.facilityId);
        setServiceType(quota.serviceType);
        setDate(quota.date);
        setCapacity(quota.capacity);
      } else {
        setSelectedFacilityId(facilityId || 'FASKES-PKM-01');
        setServiceType('Pemeriksaan Klinis CKG & Konfirmasi');
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setDate(tomorrow.toISOString().split('T')[0]);
        setCapacity(15);
      }
      setWarning(null);
      setError(null);
    }
  }, [isOpen, quota, facilityId]);

  // ESC Key close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const loadFacilities = async () => {
    try {
      const list = await facilityRepo.getAll();
      setFacilities(list);
    } catch (err) {
      console.error('Failed to load facilities:', err);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setIsSubmitting(true);
    setError(null);

    try {
      if (quota) {
        const res = await serviceQuotaRepo.updateCapacity(quota.id, capacity, {
          id: currentUser.id,
          name: currentUser.name,
        });
        if (res.warning) {
          setWarning(res.warning);
        }
      } else {
        const fac = facilities.find((f) => f.id === selectedFacilityId);
        await serviceQuotaRepo.create(
          {
            facilityId: selectedFacilityId,
            facilityName: fac?.name || 'Puskesmas',
            serviceType,
            date,
            capacity,
            active: true,
          },
          { id: currentUser.id, name: currentUser.name }
        );
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan kuota.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-[#D8E5E2] overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 bg-[#00201C] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">{quota ? 'Ubah Kuota Layanan' : 'Atur Kuota Layanan Baru'}</h3>
              <p className="text-xs text-slate-300">Kapasitas Slot Fasilitas Kesehatan</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {warning && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{warning}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#60716D] mb-1">
              Fasilitas Kesehatan
            </label>
            <select
              value={selectedFacilityId}
              onChange={(e) => setSelectedFacilityId(e.target.value)}
              disabled={!!quota}
              className="w-full text-xs p-2 border border-[#D8E5E2] rounded-lg bg-white disabled:bg-slate-100"
            >
              {facilities.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#60716D] mb-1">
              Jenis Layanan
            </label>
            <select
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              disabled={!!quota}
              className="w-full text-xs p-2 border border-[#D8E5E2] rounded-lg bg-white disabled:bg-slate-100"
            >
              <option value="Pemeriksaan Klinis CKG & Konfirmasi">Pemeriksaan Klinis CKG & Konfirmasi</option>
              <option value="Konsultasi Dokter FPKTP">Konsultasi Dokter FPKTP</option>
              <option value="Pemeriksaan Lab Gula Darah & Profil Lipid">Laboratorium (GDP/Lipid)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#60716D] mb-1">
              Tanggal Layanan <span className="text-red-600">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={!!quota}
              className="w-full text-xs p-2 border border-[#D8E5E2] rounded-lg disabled:bg-slate-100"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#60716D]">
                Kapasitas Maksimal (Orang) <span className="text-red-600">*</span>
              </label>
              {quota && (
                <span className="text-xs font-semibold text-black">
                  Sudah Terisi: <strong>{quota.bookedCount}</strong>
                </span>
              )}
            </div>
            <input
              type="number"
              min={1}
              max={100}
              value={capacity}
              onChange={(e) => setCapacity(parseInt(e.target.value) || 0)}
              className="w-full text-xs p-2 border border-[#D8E5E2] rounded-lg"
              required
            />
            {quota && capacity < quota.bookedCount && (
              <p className="text-[11px] text-amber-700 mt-1 font-medium">
                Peringatan: Kapasitas lebih kecil dari janji temu yang ada. Janji temu yang ada tidak dibatalkan otomatis.
              </p>
            )}
          </div>

          <div className="pt-2 border-t border-[#D8E5E2] flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>
              Batal
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan...' : 'Simpan Kuota'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
