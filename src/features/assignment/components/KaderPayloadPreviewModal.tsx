import React, { useEffect } from 'react';
import { X, ShieldCheck, Smartphone, EyeOff, CheckCircle2, Lock } from 'lucide-react';
import { CareTask } from '../../../types';
import { taskAssignmentService } from '../../../services/taskAssignmentService';
import { Button } from '../../../components/common/Button';

interface KaderPayloadPreviewModalProps {
  task: CareTask | null;
  isOpen: boolean;
  onClose: () => void;
}

export const KaderPayloadPreviewModal: React.FC<KaderPayloadPreviewModalProps> = ({
  task,
  isOpen,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !task) return null;

  const payload = taskAssignmentService.getKaderPayload(task);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-[#D8E5E2] overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-[#00201C] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Pratinjau Data Aplikasi Lapangan Kader</h3>
              <p className="text-xs text-slate-300">Prinsip Kebutuhan Minimum (S0–S2 Payload)</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* S2 Privacy Verified Banner */}
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Privasi Data Medis Terproteksi (UU PDP & Permenkes):</p>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                Kader Posyandu/Pustu hanya menerima instruksi operasional untuk pendampingan warga. Data klinis sensitif (S3/S4) diisolasi di rekam medis Puskesmas.
              </p>
            </div>
          </div>

          {/* Smartphone Mock Frame */}
          <div className="border-2 border-slate-300 rounded-2xl p-4 bg-[#F8FBFA] shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#D8E5E2] text-[11px] text-[#60716D]">
              <span className="font-bold text-black">Kader CKG Mobile</span>
              <span>Tugas #{payload.taskId}</span>
            </div>

            {/* What Kader Sees */}
            <div className="space-y-2.5">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#60716D] block">Nama Sasaran Warga:</span>
                <span className="text-sm font-bold text-black">{payload.citizenName}</span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-[#60716D] block">Wilayah / Domisili:</span>
                <span className="text-xs text-[#334643]">{payload.villageName || 'Desa Taliabu'}</span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-[#D8E5E2]">
                <span className="text-[10px] uppercase font-bold text-emerald-800 block mb-1">
                  Instruksi Kunjungan & Pendampingan:
                </span>
                <p className="text-xs text-black font-medium leading-relaxed">{payload.actionText}</p>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#60716D] block">Batas Waktu:</span>
                  <span className="font-bold text-black">
                    {new Date(payload.dueAt).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                {payload.dueShiftedReason && (
                  <span className="text-[10px] text-amber-800 italic bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                    {payload.dueShiftedReason}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Explicitly Excluded Clinical Attributes */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <EyeOff className="w-4 h-4 text-slate-500" />
              Elemen Klinis yang Dikecualikan dari Kader:
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-[11px] text-black">
              <div className="flex items-center gap-1.5 line-through text-black">
                <Lock className="w-3 h-3 text-slate-700" /> Nilai Tensi (Sistol/Diastol)
              </div>
              <div className="flex items-center gap-1.5 line-through text-black">
                <Lock className="w-3 h-3 text-slate-700" /> Kadar Gula Darah & HbA1c
              </div>
              <div className="flex items-center gap-1.5 line-through text-black">
                <Lock className="w-3 h-3 text-slate-700" /> Diagnosis & ICD-10
              </div>
              <div className="flex items-center gap-1.5 line-through text-black">
                <Lock className="w-3 h-3 text-slate-700" /> Warna Kategori Risiko CRS
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-2 border-t border-[#D8E5E2] flex items-center justify-end">
            <Button variant="primary" size="sm" onClick={onClose}>
              Mengerti & Tutup
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
