import React, { useEffect, useState } from 'react';
import { X, Send, AlertTriangle, ShieldCheck, MessageSquare, Info } from 'lucide-react';
import { CareTask } from '../../../types';
import { outreachOrchestrationService, SimulatedMessagePayload } from '../../../services/outreachOrchestrationService';
import { useAuth } from '../../../context/AuthContext';
import { Button } from '../../../components/common/Button';

interface DigitalOutreachModalProps {
  task: CareTask | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const DigitalOutreachModal: React.FC<DigitalOutreachModalProps> = ({
  task,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { currentUser } = useAuth();
  const [prepData, setPrepData] = useState<{
    canAutomate: boolean;
    reason?: string;
    payload?: SimulatedMessagePayload;
    suggestedChannel: any;
  } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && task) {
      loadPrep();
      setError(null);
    }
  }, [isOpen, task]);

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

  const loadPrep = async () => {
    if (!task) return;
    setIsLoading(true);
    try {
      const res = await outreachOrchestrationService.prepareNextOutreach(task.id);
      setPrepData(res);
    } catch (err: any) {
      setError(err.message || 'Gagal menyiapkan data outreach.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !task) return null;

  const handleSend = async () => {
    if (!prepData?.payload || !currentUser) return;
    setIsSending(true);
    setError(null);

    try {
      await outreachOrchestrationService.sendSimulatedMessage(task.id, prepData.payload, {
        id: currentUser.id,
        name: currentUser.name,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal mengirimkan simulasi pesan.');
    } finally {
      setIsSending(false);
    }
  };

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
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base">Kirim Pesan Outreach Digital</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                  SIMULASI KANAL PESAN
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {task.citizenName} · {task.citizenPhone || 'Tanpa No. Telp'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {isLoading ? (
            <div className="py-8 text-center text-xs text-[#60716D]">Memeriksa parameter outreach & privasi...</div>
          ) : !prepData?.canAutomate ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
                Pesan Otomatis Dilewati
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">{prepData?.reason}</p>
              <div className="pt-2 text-[11px] text-amber-900 font-semibold">
                Saran Saluran Lanjutan: <u>{prepData?.suggestedChannel}</u>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Message Payload Preview */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-[#60716D] uppercase">Pratinjau Pesan ({prepData.payload?.channel})</span>
                  <span className="text-[11px] font-mono text-black bg-[#E1F5FE] px-2 py-0.5 rounded">
                    Step {prepData.payload?.stepNumber} / 2
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#F0F5F4] border border-[#D8E5E2] text-xs text-black font-sans leading-relaxed relative">
                  <p>{prepData.payload?.messageText}</p>
                </div>
              </div>

              {/* Privacy Verification Banner */}
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-700 mt-0.5" />
                <div>
                  <span className="font-bold">Kepatuhan Privasi Data Terjamin:</span>
                  <p className="mt-0.5 text-emerald-800 leading-relaxed">
                    Template pesan telah diverifikasi: <strong>TIDAK mengandung diagnosis klinis, hasil tensi/gula darah, nama obat, atau warna risiko</strong>.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-[#FFFACD] border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 text-amber-700 mt-0.5" />
                <p>
                  <strong>Simulasi:</strong> Pengiriman ini mencatat riwayat ContactAttempt pada sistem demo Pulau Taliabu tanpa membebani gateway WhatsApp eksternal berbayar.
                </p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="pt-2 border-t border-[#D8E5E2] flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>
              Tutup
            </Button>
            {prepData?.canAutomate && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleSend}
                disabled={isSending}
                leftIcon={<Send className="w-4 h-4" />}
              >
                {isSending ? 'Mengirimkan...' : 'Kirim Pesan Simulasi'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
