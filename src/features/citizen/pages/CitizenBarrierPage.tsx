import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  Send,
  HeartHandshake,
  Info,
} from 'lucide-react';
import { useCitizen } from '../context/CitizenContext';
import { citizenBarrierService } from '../../../services/citizenBarrierService';
import { BARRIER_REASON_LABELS } from '../../../services/citizenCopyDictionary';
import { SharedBarrierReason } from '../../../types';
import { DocBadge } from '../components/DocBadge';

interface CitizenBarrierPageProps {
  onBack: () => void;
}

export const CitizenBarrierPage: React.FC<CitizenBarrierPageProps> = ({ onBack }) => {
  const { citizen, profile, isOnline } = useCitizen();

  const [selectedBarriers, setSelectedBarriers] = useState<SharedBarrierReason[]>([]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const toggleBarrier = (key: SharedBarrierReason) => {
    setSelectedBarriers((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleSubmit = async () => {
    if (!citizen || selectedBarriers.length === 0) return;
    setIsSubmitting(true);
    try {
      const res = await citizenBarrierService.reportBarrier({
        citizenId: citizen.id,
        taskId: profile?.nextAction?.taskId,
        appointmentId: profile?.appointment?.id,
        barriers: selectedBarriers,
        notes,
      });

      if (res.success) {
        setIsSubmitted(true);
      }
    } catch (err) {
      console.error('Failed to report barrier', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-1.5 rounded-full hover:bg-gray-200 text-gray-700 transition-colors"
            aria-label="Kembali"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-black">Lapor Kendala</h1>
            <p className="text-xs text-[#60716D]">
              Beritahu kami jika Anda mengalami kesulitan untuk memeriksakan diri
            </p>
          </div>
        </div>

        <DocBadge
          code="SCR-WRG-C04"
          title="Lapor Kendala Kehadiran"
          phase="F2"
          plafon="S2"
          useCase="UC PSN-14"
          description="Formulir lapor kendala mandiri (ombak tinggi, biaya, izin kerja, pengasuhan anak)."
          rules={[
            'Pilihan kendala sesuai taksonomi CMP-07.',
            'Laporan masuk antrean penjangkauan kader (SCR-KDR-B01).',
            'Bahasa non-pemberian sanksi.',
          ]}
          variant="amber"
          size="xs"
        />
      </div>

      {isSubmitted ? (
        <div className="bg-white p-6 rounded-2xl border border-[#D8E5E2] shadow-sm text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-black">
              Kendala Anda Sudah Diterima
            </h2>
            <p className="text-xs text-gray-600 mt-2 leading-relaxed">
              Puskesmas dan kader kesehatan desa Anda telah menerima laporan ini. Kami akan membantu mencarikan waktu dan cara tindak lanjut yang lebih sesuai.
            </p>
          </div>

          <div className="p-3.5 bg-[#FFFACD]/60 border border-[#ebd79b] rounded-xl text-xs text-amber-950 flex items-start gap-2.5 text-left">
            <HeartHandshake className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
            <span>
              Pemeriksaan tindak lanjut Anda tetap berjalan dan tidak dibatalkan.
            </span>
          </div>

          <button
            onClick={onBack}
            className="w-full py-3 bg-[#00201C] text-white rounded-xl text-xs font-semibold hover:bg-[#102521] transition-colors"
          >
            Kembali ke Beranda
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Reassurance Banner */}
          <div className="p-3.5 bg-[#E1F5FE]/60 border border-[#b2e3f8] rounded-xl text-xs text-black flex items-start gap-2.5 leading-relaxed">
            <Info className="w-4 h-4 text-black shrink-0 mt-0.5" />
            <div>
              <strong>Kesehatan Anda Adalah Prioritas Kami:</strong>
              <p className="text-[11px] text-gray-700 mt-0.5">
                Melaporkan kendala tidak akan menghilangkan hak Anda untuk mendapatkan layanan kesehatan. Kami siap membantu mencari solusinya.
              </p>
            </div>
          </div>

          {/* Barrier Selection Grid */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-800 block">
              Pilih kendala yang Anda alami (bisa lebih dari satu):
            </label>

            <div className="space-y-2">
              {(Object.keys(BARRIER_REASON_LABELS) as SharedBarrierReason[]).map((key) => {
                const item = BARRIER_REASON_LABELS[key];
                const isChecked = selectedBarriers.includes(key);

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleBarrier(key)}
                    className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                      isChecked
                        ? 'bg-[#E1F5FE] border-[#00201C] ring-1 ring-[#00201C]'
                        : 'bg-white border-[#D8E5E2] hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}} // Controlled by button
                      className="mt-0.5 accent-[#00201C] rounded"
                    />
                    <div>
                      <div className="font-bold text-xs text-black">{item.label}</div>
                      <div className="text-[11px] text-gray-600 mt-0.5 leading-tight">{item.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Extra Notes */}
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-bold text-gray-800 block">
              Jelaskan lebih lanjut (opsional):
            </label>
            <textarea
              rows={3}
              placeholder="Ceritakan kendala Anda, misalnya: jadwal panen cengkeh, ombak laut sedang kencang, dsb."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#00201C] focus:outline-none bg-white"
            />
          </div>

          {/* Submit CTA */}
          <div className="pt-2">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || selectedBarriers.length === 0 || !isOnline}
              className="w-full py-3.5 bg-[#00201C] hover:bg-[#102521] text-white rounded-xl font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4 text-[#FFFACD]" />
              Kirim Laporan Kendala ke Puskesmas
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
