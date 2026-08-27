import React, { useState } from 'react';
import { Citizen } from '../../../types';
import { Button } from '../../../components/common/Button';
import { rawStorage } from '../../../repositories/storage';
import { citizenRepo } from '../../../repositories/citizenRepo';
import { auditService } from '../../../services/auditService';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { MapPin, ArrowRight } from 'lucide-react';

interface AreaChangeModalProps {
  citizen: Citizen;
  onSuccess: () => void;
  closeModal: () => void;
}

export const AreaChangeModal: React.FC<AreaChangeModalProps> = ({
  citizen,
  onSuccess,
  closeModal,
}) => {
  const { currentUser } = useAuth();
  const toast = useToast();
  const desas = rawStorage.getDesa();
  const faskesList = rawStorage.getFacilities();

  const [selectedDesaId, setSelectedDesaId] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedDesa = desas.find((d) => d.id === selectedDesaId);
  const targetPuskesmas = selectedDesa ? faskesList.find((f) => f.id === selectedDesa.puskesmasId) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDesa || !targetPuskesmas || !currentUser) return;
    if (!reason.trim()) {
      toast.warning('Alasan Wajib Diisi', 'Silakan masukkan alasan perpindahan wilayah warga.');
      return;
    }

    setIsSubmitting(true);
    try {
      await citizenRepo.recordAreaChange(
        citizen.id,
        selectedDesa.id,
        selectedDesa.name,
        selectedDesa.kecamatanId,
        selectedDesa.kecamatanName,
        targetPuskesmas.id,
        targetPuskesmas.name,
        reason,
        currentUser.id,
        currentUser.name
      );

      await auditService.log(currentUser, 'UPDATE', 'CITIZEN', {
        targetLabel: citizen.fullName,
        citizenId: citizen.id,
        purposeCode: 'AREA_CHANGE_CONFIRMATION',
        details: {
          fromVillage: citizen.villageName,
          toVillage: selectedDesa.name,
          fromFacility: citizen.facilityName,
          toFacility: targetPuskesmas.name,
          reason,
        },
      });

      toast.success(
        'Perpindahan Wilayah Berhasil',
        `Warga ${citizen.fullName} berhasil dipindahkan ke Desa ${selectedDesa.name} (${targetPuskesmas.name}).`
      );
      onSuccess();
      closeModal();
    } catch (err: any) {
      toast.error('Gagal Memindahkan Wilayah', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Current vs Target Comparison */}
      <div className="bg-[#F8FBFA] p-3.5 rounded-xl border border-[#D8E5E2] flex items-center justify-between gap-3 text-xs">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-[#60716D] uppercase">Wilayah Saat Ini</span>
          <p className="font-bold text-black">Desa {citizen.villageName || '—'}</p>
          <p className="text-[#60716D]">{citizen.facilityName || '—'}</p>
        </div>

        <ArrowRight className="w-5 h-5 text-[#2E7D5B] shrink-0" />

        <div className="space-y-1 text-right">
          <span className="text-[10px] font-bold text-[#2E7D5B] uppercase">Wilayah Tujuan</span>
          <p className="font-bold text-black">
            {selectedDesa ? `Desa ${selectedDesa.name}` : 'Pilih Desa...'}
          </p>
          <p className="text-[#60716D]">{targetPuskesmas ? targetPuskesmas.name : '—'}</p>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-black mb-1">
          Desa / Kelurahan Baru <span className="text-[#C84A4A]">*</span>
        </label>
        <select
          value={selectedDesaId}
          onChange={(e) => setSelectedDesaId(e.target.value)}
          className="w-full px-3 py-2 text-xs bg-white border border-[#D8E5E2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00201C]"
          required
        >
          <option value="">-- Pilih Desa Tujuan --</option>
          {desas
            .filter((d) => d.id !== citizen.villageId)
            .map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} — Kec. {d.kecamatanName} ({d.puskesmasName})
              </option>
            ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-bold text-black mb-1">
          Alasan Perpindahan <span className="text-[#C84A4A]">*</span>
        </label>
        <textarea
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Contoh: Pindah domisili menetap mengikuti keluarga / pekerjaan..."
          className="w-full px-3 py-2 text-xs bg-white border border-[#D8E5E2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00201C]"
          required
        />
      </div>

      <div className="p-3 bg-[#FFFACD] rounded-lg border border-[#F2ECC2] text-[11px] text-[#554700] space-y-1">
        <p className="font-bold">Ketentuan Perpindahan Wilayah:</p>
        <p>
          Riwayat skrining sebelumnya tetap tersimpan utuh dan tidak terhapus. Hak kepemilikan dan penugasan tindak lanjut mendatang akan berpindah ke Puskesmas baru.
        </p>
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-[#D8E5E2]">
        <Button variant="ghost" size="sm" type="button" onClick={closeModal}>
          Batal
        </Button>
        <Button
          variant="primary"
          size="sm"
          type="submit"
          isLoading={isSubmitting}
          disabled={!selectedDesaId || !reason.trim()}
          leftIcon={<MapPin className="w-3.5 h-3.5" />}
        >
          Konfirmasi Perpindahan
        </Button>
      </div>
    </form>
  );
};
