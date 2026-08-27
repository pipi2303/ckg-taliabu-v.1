import React, { useState } from 'react';
import { Citizen } from '../../../types';
import { Button } from '../../../components/common/Button';
import { citizenRepo } from '../../../repositories/citizenRepo';
import { auditService } from '../../../services/auditService';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { Edit3 } from 'lucide-react';

interface DataCorrectionModalProps {
  citizen: Citizen;
  onSuccess: () => void;
  closeModal: () => void;
}

export const DataCorrectionModal: React.FC<DataCorrectionModalProps> = ({
  citizen,
  onSuccess,
  closeModal,
}) => {
  const { currentUser } = useAuth();
  const toast = useToast();

  const [fullName, setFullName] = useState(citizen.fullName);
  const [phonePrimary, setPhonePrimary] = useState(citizen.phonePrimary || '');
  const [addressText, setAddressText] = useState(citizen.addressText || '');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!reason.trim()) {
      toast.warning('Alasan Wajib Diisi', 'Silakan masukkan alasan koreksi data kependudukan warga.');
      return;
    }

    setIsSubmitting(true);
    try {
      await citizenRepo.update(citizen.id, {
        fullName: fullName.trim(),
        phonePrimary: phonePrimary.trim() || undefined,
        addressText: addressText.trim() || undefined,
      });

      await auditService.log(currentUser, 'UPDATE', 'CITIZEN', {
        targetLabel: citizen.fullName,
        citizenId: citizen.id,
        purposeCode: 'LOCAL_DATA_CORRECTION',
        details: {
          originalName: citizen.fullName,
          correctedName: fullName.trim(),
          originalPhone: citizen.phonePrimary,
          correctedPhone: phonePrimary.trim(),
          originalAddress: citizen.addressText,
          correctedAddress: addressText.trim(),
          reason,
        },
      });

      toast.success('Koreksi Data Disimpan', `Data warga ${fullName} berhasil diperbarui dengan jejak audit.`);
      onSuccess();
      closeModal();
    } catch (err: any) {
      toast.error('Gagal Menyimpan Koreksi', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-black mb-1">
          Nama Lengkap (Koreksi) <span className="text-[#C84A4A]">*</span>
        </label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full px-3 py-2 text-xs bg-white border border-[#D8E5E2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00201C]"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-black mb-1">
          Nomor Telepon / WhatsApp
        </label>
        <input
          type="tel"
          value={phonePrimary}
          onChange={(e) => setPhonePrimary(e.target.value)}
          placeholder="08xxxxxxxxxx"
          className="w-full px-3 py-2 text-xs bg-white border border-[#D8E5E2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00201C]"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-black mb-1">
          Alamat Domisili Lengkap
        </label>
        <input
          type="text"
          value={addressText}
          onChange={(e) => setAddressText(e.target.value)}
          placeholder="Dusun / RT / RW / Jalan..."
          className="w-full px-3 py-2 text-xs bg-white border border-[#D8E5E2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00201C]"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-black mb-1">
          Alasan / Catatan Koreksi <span className="text-[#C84A4A]">*</span>
        </label>
        <textarea
          rows={2}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Contoh: Klarifikasi ejaan nama berdasarkan KTP fisik saat kunjungan..."
          className="w-full px-3 py-2 text-xs bg-white border border-[#D8E5E2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00201C]"
          required
        />
      </div>

      <div className="p-3 bg-[#E1F5FE] rounded-lg border border-[#BDE3F5] text-[11px] text-black">
        Koreksi ini dicatat sebagai versi operasional lokal dengan jejak audit kekal tanpa menghapus data mentah dari sumber asli ASIK/SSI.
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
          disabled={!fullName.trim() || !reason.trim()}
          leftIcon={<Edit3 className="w-3.5 h-3.5" />}
        >
          Simpan Koreksi
        </Button>
      </div>
    </form>
  );
};
