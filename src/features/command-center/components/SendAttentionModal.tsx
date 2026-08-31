import React, { useState } from 'react';
import { X, Send, AlertTriangle, Building2, CheckCircle2 } from 'lucide-react';
import { User, HealthFacility } from '../../../types';
import { populationGapService } from '../../../services/populationGapService';

interface SendAttentionModalProps {
  isOpen: boolean;
  onClose: () => void;
  facilities: HealthFacility[];
  currentUser: User | null;
  defaultFacilityId?: string;
  defaultGapType?: 'CAPACITY_GAP' | 'CITIZEN_ACCESS_GAP' | 'FOLLOW_UP_DELAY';
  defaultCount?: number;
  onSuccess?: () => void;
}

export const SendAttentionModal: React.FC<SendAttentionModalProps> = ({
  isOpen,
  onClose,
  facilities,
  currentUser,
  defaultFacilityId = '',
  defaultGapType = 'CITIZEN_ACCESS_GAP',
  defaultCount = 5,
  onSuccess,
}) => {
  const [targetFacilityId, setTargetFacilityId] = useState<string>(defaultFacilityId);
  const [gapType, setGapType] = useState<'CAPACITY_GAP' | 'CITIZEN_ACCESS_GAP' | 'FOLLOW_UP_DELAY'>(defaultGapType);
  const [affectedCount, setAffectedCount] = useState<number>(defaultCount);
  const [message, setMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const puskesmasList = (facilities || []).filter((f) => f && f.type === 'PUSKESMAS');
  const selectedFacility = puskesmasList.find((f) => f && f.id === targetFacilityId) || puskesmasList[0] || null;

  const isKadis = currentUser?.roleId === 'KEPALA_DINAS';
  const isAnalyst = currentUser?.roleId === 'ANALYST_DINKES';

  const modalTitle = isKadis
    ? 'Kirim Arahan Resmi Kepala Dinas'
    : isAnalyst
    ? 'Kirim Rekomendasi Analisis Dinkes'
    : 'Teruskan Perhatian ke Puskesmas';

  const modalSubtitle = isKadis
    ? 'Kirim instruksi kebijakan & supervisi langsung ke Kepala Puskesmas'
    : isAnalyst
    ? 'Kirim catatan rekomendasi tindak lanjut & observasi data ke Puskesmas'
    : 'Kirim sinyal koordinasi operasional tanpa mengubah data klinis';

  const defaultMsgPlaceholder = isKadis
    ? 'Tuliskan arahan resmi pimpinan terkait tindak lanjut percepatan atau dukungan sumber daya...'
    : isAnalyst
    ? 'Tuliskan rekomendasi analisis data, pola risiko wilayah, atau usulan intervensi faskes...'
    : 'Tuliskan arahan tindak lanjut atau tawaran dukungan bantuan logistik/transportasi dari Dinkes...';

  const submitButtonLabel = isKadis
    ? 'Kirim Arahan Resmi'
    : isAnalyst
    ? 'Kirim Rekomendasi Analis'
    : 'Kirim Sinyal Perhatian';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedFacility) return;

    setIsSubmitting(true);
    try {
      await populationGapService.sendAttentionSignal({
        targetFacilityId: selectedFacility.id,
        targetFacilityName: selectedFacility.name,
        gapType,
        affectedCount,
        period: 'Agustus 2026',
        message: message || (isKadis 
          ? `[Arahan Kadis] Evaluasi khusus atas akumulasi ${affectedCount} kasus pada kategori ${gapType}.`
          : `[Rekomendasi Analis] Perhatian atas akumulasi ${affectedCount} kasus pada kategori ${gapType}.`),
        creatorUser: currentUser,
      });

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onSuccess?.();
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Failed to send attention signal:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${
              isKadis 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                : isAnalyst 
                ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' 
                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">{modalTitle}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{modalSubtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-semibold text-white">
              {isKadis ? 'Arahan Resmi Berhasil Dikirim' : isAnalyst ? 'Rekomendasi Analis Berhasil Terkirim' : 'Sinyal Perhatian Berhasil Dikirim'}
            </h4>
            <p className="text-xs text-slate-300">
              Notifikasi telah diteruskan ke dashboard Kepala Puskesmas & PJ CKG terkait.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs text-slate-300">
            <div>
              <label className="block font-medium text-slate-300 mb-1.5">Puskesmas Tujuan:</label>
              <select
                value={targetFacilityId}
                onChange={(e) => setTargetFacilityId(e.target.value)}
                className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-1 focus:ring-teal-500 focus:outline-none"
              >
                {puskesmasList.map((pkm) => (
                  <option key={pkm.id} value={pkm.id}>
                    {pkm.name} ({pkm.kecamatanName})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-300 mb-1.5">Kategori Hambatan:</label>
                <select
                  value={gapType}
                  onChange={(e) => setGapType(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-1 focus:ring-teal-500 focus:outline-none"
                >
                  <option value="CITIZEN_ACCESS_GAP">Hambatan Akses Warga / Transportasi</option>
                  <option value="CAPACITY_GAP">Kapasitas Faskes / Kuota & Obat</option>
                  <option value="FOLLOW_UP_DELAY">Keterlambatan Tindak Lanjut</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1.5">Estimasi Kasus Terdampak:</label>
                <input
                  type="number"
                  min={1}
                  value={affectedCount}
                  onChange={(e) => setAffectedCount(parseInt(e.target.value) || 1)}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-1 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1.5">
                {isKadis ? 'Instruksi Arahan Kebijakan Kadis:' : isAnalyst ? 'Catatan Rekomendasi Analis:' : 'Catatan Arahan Dinkes:'}
              </label>
              <textarea
                rows={3}
                placeholder={defaultMsgPlaceholder}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-1 focus:ring-teal-500 focus:outline-none resize-none"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
              Catatan: Sinyal ini berfungsi sebagai jembatan komunikasi supervisi Dinkes. Sistem tidak mengubah status tugas operasional puskesmas secara sepihak.
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-4 py-2 rounded-xl text-white font-medium transition flex items-center gap-1.5 cursor-pointer ${
                  isKadis 
                    ? 'bg-emerald-600 hover:bg-emerald-500' 
                    : isAnalyst 
                    ? 'bg-sky-600 hover:bg-sky-500' 
                    : 'bg-teal-600 hover:bg-teal-500'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Mengirim...' : submitButtonLabel}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
