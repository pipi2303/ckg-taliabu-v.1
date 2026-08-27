import React, { useEffect } from 'react';
import { ShieldCheck, X, HeartHandshake, PhoneCall, Home, Info } from 'lucide-react';
import { SAFETY_MESSAGES } from '../../../services/citizenCopyDictionary';

interface CitizenConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgree: () => void;
  citizenName: string;
}

export const CitizenConsentModal: React.FC<CitizenConsentModalProps> = ({
  isOpen,
  onClose,
  onAgree,
  citizenName,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden text-black border border-[#D8E5E2]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#D8E5E2] bg-[#F8FBFA]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#E1F5FE] flex items-center justify-center text-black">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-black leading-tight">Persetujuan Pendampingan</h2>
              <p className="text-xs text-[#60716D]">CKG Smart Care Platform • Versi v1.0-2026</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
            aria-label="Tutup modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-sm leading-relaxed">
          <p className="text-black">
            Halo, <strong className="text-black">{citizenName}</strong>. Untuk membantu kelancaran tindak lanjut hasil pemeriksaan kesehatan CKG Anda, Puskesmas menyediakan layanan pendampingan mandiri ini.
          </p>

          <div className="space-y-3 bg-[#F8FBFA] p-4 rounded-xl border border-[#D8E5E2]">
            <h3 className="font-semibold text-black text-xs uppercase tracking-wider">
              Apa yang akan dibantu melalui aplikasi ini?
            </h3>
            
            <div className="flex items-start gap-3">
              <Info className="w-4 h-4 text-black shrink-0 mt-0.5" />
              <p className="text-xs text-black">
                <strong>Informasi Tindak Lanjut:</strong> Mengetahui langkah berikutnya yang dianjurkan oleh tenaga kesehatan dengan bahasa yang mudah dipahami.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <PhoneCall className="w-4 h-4 text-black shrink-0 mt-0.5" />
              <p className="text-xs text-black">
                <strong>Pengingat Jadwal:</strong> Menerima pesan pengingat jadwal kunjungan atau konfirmasi kehadiran dari Puskesmas.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <Home className="w-4 h-4 text-black shrink-0 mt-0.5" />
              <p className="text-xs text-black">
                <strong>Kunjungan Kader:</strong> Kader kesehatan Posyandu di desa Anda dapat berkunjung untuk membantu jika Anda mengalami kendala transportasi atau waktu.
              </p>
            </div>
          </div>

          {/* Non-dark pattern guarantee */}
          <div className="p-3.5 bg-[#FFFACD]/60 border border-[#FFFACD] rounded-xl flex items-start gap-3">
            <HeartHandshake className="w-5 h-5 text-amber-900 shrink-0 mt-0.5" />
            <p className="text-xs font-medium text-amber-950 leading-relaxed">
              {SAFETY_MESSAGES.CONSENT_NO_DARK_PATTERN}
            </p>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="p-4 border-t border-[#D8E5E2] bg-white flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={onAgree}
            className="w-full sm:flex-1 py-3 px-5 bg-[#00201C] hover:bg-[#102521] text-white rounded-xl font-semibold text-sm transition-all shadow-sm active:scale-98 flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            Saya Setuju & Lanjutkan
          </button>
          <button
            onClick={onClose}
            className="w-full sm:w-auto py-3 px-5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium text-sm transition-colors text-center"
          >
            Nanti Saja
          </button>
        </div>
      </div>
    </div>
  );
};
