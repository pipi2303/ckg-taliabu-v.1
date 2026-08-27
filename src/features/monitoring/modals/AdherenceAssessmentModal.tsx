import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, ShieldAlert, HeartHandshake, Info } from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { adherenceAssessmentService } from '../../../services/adherenceAssessmentService';
import { nonAdherenceCauseService } from '../../../services/nonAdherenceCauseService';
import {
  MonitoringCycle,
  AdherenceLevel,
  AdherenceEvidenceStrength,
  ExtendedBarrierCause,
  CauseProvenance,
  User,
} from '../../../types';

interface AdherenceAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  cycle: MonitoringCycle | null;
  currentUser: User;
  onSaved: () => void;
}

export const AdherenceAssessmentModal: React.FC<AdherenceAssessmentModalProps> = ({
  isOpen,
  onClose,
  cycle,
  currentUser,
  onSaved,
}) => {
  const [adherenceLevel, setAdherenceLevel] = useState<AdherenceLevel>('REGULAR');
  const [evidenceStrength, setEvidenceStrength] = useState<AdherenceEvidenceStrength>('STRONG');
  const [selectedCauses, setSelectedCauses] = useState<ExtendedBarrierCause[]>([]);
  const [reportedVia, setReportedVia] = useState<CauseProvenance>('CLINICIAN');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allCauses = nonAdherenceCauseService.getAllCauses();

  // Reset when cycle changes
  useEffect(() => {
    if (cycle) {
      setAdherenceLevel('REGULAR');
      setEvidenceStrength('STRONG');
      setSelectedCauses([]);
      setReportedVia('CLINICIAN');
      setNotes('');
      setError(null);
    }
  }, [cycle]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !cycle) return null;

  const toggleCause = (code: ExtendedBarrierCause) => {
    if (selectedCauses.includes(code)) {
      setSelectedCauses(selectedCauses.filter((c) => c !== code));
    } else {
      setSelectedCauses([...selectedCauses, code]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const causesPayload = selectedCauses.map((c) => ({
        causeCode: c,
        reportedVia,
        clinicalNotes: notes,
      }));

      await adherenceAssessmentService.recordAssessment({
        cycleId: cycle.id,
        citizenId: cycle.citizenId,
        citizenName: cycle.citizenName,
        facilityId: cycle.facilityId,
        facilityName: cycle.facilityName,
        adherenceLevel,
        evidenceStrength,
        assessorUser: currentUser,
        notes,
        causes: causesPayload,
      });

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan penilaian kepatuhan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#00201C] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-800/80 flex items-center justify-center text-teal-200">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Penilaian Kepatuhan & Kendala Terapi</h3>
              <p className="text-xs text-teal-200/80">
                Siklus #{cycle.cycleNumber} • {cycle.citizenName} • {cycle.condition}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Educational Guidance Notice */}
          <div className="bg-[#E1F5FE] border border-sky-200 rounded-xl p-3.5 flex items-start gap-3">
            <Info className="w-5 h-5 text-sky-700 shrink-0 mt-0.5" />
            <div className="text-xs text-sky-900 leading-relaxed">
              <p className="font-semibold">Prinsip Pendekatan Non-Blaming (Fokus Solusi)</p>
              <p className="mt-0.5 text-sky-800">
                Penilaian ini bertujuan mengidentifikasi faktor penghambat (biaya, logistik, transportasi laut, efek samping) untuk merutekan bantuan yang tepat, bukan untuk menyalahkan warga.
              </p>
            </div>
          </div>

          {/* Level Kepatuhan */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
              Tingkat Kepatuhan Minum Obat / Terapi
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'REGULAR', label: 'Teratur', sub: 'Minum obat tiap hari sesuai resep', color: 'border-emerald-500 bg-emerald-50/50 text-emerald-900' },
                { id: 'PARTIAL', label: 'Sebagian / Kadang', sub: 'Minum obat 4-5 hari/minggu', color: 'border-amber-500 bg-amber-50/50 text-amber-900' },
                { id: 'IRREGULAR', label: 'Tidak Teratur', sub: 'Sering terputus / berhenti', color: 'border-rose-500 bg-rose-50/50 text-rose-900' },
                { id: 'NOT_ASSESSABLE', label: 'Belum Dinilai', sub: 'Pasien baru / data belum ada', color: 'border-stone-400 bg-stone-50 text-stone-800' },
              ].map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setAdherenceLevel(item.id as AdherenceLevel)}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    adherenceLevel === item.id ? `${item.color} shadow-xs font-medium` : 'border-stone-200 hover:border-stone-300 bg-white text-stone-700'
                  }`}
                >
                  <p className="text-sm font-bold">{item.label}</p>
                  <p className="text-[11px] text-stone-500 mt-1 leading-snug">{item.sub}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Kekuatan Bukti Penilaian */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                Kekuatan Bukti Penilaian
              </label>
              <select
                value={evidenceStrength}
                onChange={(e) => setEvidenceStrength(e.target.value as AdherenceEvidenceStrength)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00201C]"
              >
                <option value="STRONG">Kuat (Bawa Sisa Obat & Wawancara Mendalam)</option>
                <option value="MODERATE">Sedang (Pengakuan Verbal Pasien/Keluarga)</option>
                <option value="LIMITED">Terbatas (Catatan Kader / Perkiraan Tanggal)</option>
                <option value="UNKNOWN">Belum Diketahui</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                Sumber Laporan / Asal Data
              </label>
              <select
                value={reportedVia}
                onChange={(e) => setReportedVia(e.target.value as CauseProvenance)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00201C]"
              >
                <option value="CLINICIAN">Pemeriksaan Tenaga Medis Faskes</option>
                <option value="CITIZEN">Laporan Mandiri Warga / Keluarga</option>
                <option value="KADER">Laporan Kunjungan Rumah Kader Posyandu</option>
                <option value="SYSTEM_CONTEXT">Konteks Sistem (Stok Farmasi Kosong)</option>
              </select>
            </div>
          </div>

          {/* Multi-Select Faktor Kendala / Penyebab */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
                Faktor Penyebab / Kendala yang Ditemukan (Boleh Pilih Lebih dari Satu)
              </label>
              <span className="text-xs text-stone-500 font-medium">
                {selectedCauses.length} kendala terpilih
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1">
              {allCauses.map((cause) => {
                const isSelected = selectedCauses.includes(cause.code);
                return (
                  <button
                    type="button"
                    key={cause.code}
                    onClick={() => toggleCause(cause.code)}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-[#00201C] bg-stone-100 font-medium text-stone-900 shadow-xs'
                        : 'border-stone-200 hover:border-stone-300 bg-white text-stone-700'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-md mt-0.5 shrink-0 flex items-center justify-center border ${
                        isSelected ? 'bg-[#00201C] border-[#00201C] text-white' : 'border-stone-300 bg-stone-50'
                      }`}
                    >
                      {isSelected && <CheckCircle className="w-3 h-3" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold">{cause.label}</p>
                      <p className="text-[10px] text-stone-500 mt-0.5 truncate">{cause.suggestedActionText}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Catatan Tambahan */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
              Catatan Klinis & Rekomendasi Tenaga Medis
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Contoh: Pasien melaut malam hari, disarankan membawa tempat obat kecil kedap air..."
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00201C]"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan...' : 'Simpan Penilaian Kepatuhan'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
