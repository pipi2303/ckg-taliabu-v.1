import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Phone,
  MessageSquare,
  Users,
  Send,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronLeft,
  Info,
} from 'lucide-react';
import { useCitizen } from '../context/CitizenContext';
import { citizenHelpService } from '../../../services/citizenHelpService';
import {
  HELP_CATEGORY_LABELS,
  PREFERRED_CHANNEL_LABELS,
  SAFETY_MESSAGES,
} from '../../../services/citizenCopyDictionary';
import { CitizenHelpRequest } from '../../../types';
import { DocBadge } from '../components/DocBadge';

interface CitizenHelpPageProps {
  onBack: () => void;
}

export const CitizenHelpPage: React.FC<CitizenHelpPageProps> = ({ onBack }) => {
  const { citizen, isOnline } = useCitizen();

  const [preferredChannel, setPreferredChannel] = useState<'PHONE' | 'MESSAGE' | 'KADER'>('PHONE');
  const [category, setCategory] = useState<CitizenHelpRequest['category']>('SCHEDULING');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [helpHistory, setHelpHistory] = useState<CitizenHelpRequest[]>([]);
  const [showEmergencyWarning, setShowEmergencyWarning] = useState(false);
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState<string | null>(null);

  const loadHistory = async () => {
    if (!citizen) return;
    const history = await citizenHelpService.getCitizenHelpRequests(citizen.id);
    setHelpHistory(history);
  };

  useEffect(() => {
    loadHistory();
  }, [citizen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!citizen) return;
    setIsSubmitting(true);
    setShowEmergencyWarning(false);
    try {
      const res = await citizenHelpService.submitHelpRequest({
        citizenId: citizen.id,
        preferredChannel,
        category,
        citizenMessage: message,
      });

      if (res.success) {
        setSubmitSuccessMsg(res.message);
        setMessage('');
        if (res.isEmergencyWarning) {
          setShowEmergencyWarning(true);
        }
        await loadHistory();
      }
    } catch (err) {
      console.error('Failed to submit help request', err);
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
            <h1 className="text-xl font-extrabold text-black">Minta Bantuan</h1>
            <p className="text-xs text-[#60716D]">
              Hubungi petugas Puskesmas atau kader desa untuk panduan operasional
            </p>
          </div>
        </div>

        <DocBadge
          code="SCR-WRG-F01"
          title="Bantuan & Kontak Pendamping"
          phase="F1"
          plafon="S1"
          useCase="UC PSN-15"
          description="Akses cepat kontak kader, perawat desa, & puskesmas dengan disclaimer darurat tegas."
          rules={[
            'Kontak personil yang relevan dengan wilayah domisili.',
            'Penegasan tegas: bukan layanan gawat darurat klinis.',
          ]}
          variant="emerald"
          size="xs"
        />
      </div>

      {/* Emergency Notice Safety Banner */}
      <div className="bg-amber-50 border border-amber-300 p-3.5 rounded-2xl flex items-start gap-2.5 text-xs text-amber-950 leading-relaxed">
        <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <strong className="block text-amber-900 font-bold mb-0.5">
            Bukan Layanan Gawat Darurat
          </strong>
          {SAFETY_MESSAGES.EMERGENCY_BODY}
        </div>
      </div>

      {/* Emergency Warning Alert if user message contains urgent keywords */}
      {showEmergencyWarning && (
        <div className="bg-red-50 border-2 border-red-400 p-4 rounded-2xl text-xs text-red-950 space-y-2 animate-bounce">
          <div className="flex items-center gap-2 font-bold text-red-900 text-sm">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Peringatan Keselamatan Penting
          </div>
          <p className="leading-relaxed">
            Pesan Anda menyebutkan gejala yang berpotensi membutuhkan penanganan cepat. Jika saat ini Anda merasa sesak berat atau nyeri dada hebat, mohon <strong>JANGAN MENUNGGU</strong> balasan pesan ini dan segera datangi UGD Puskesmas Bobong atau RSUD.
          </p>
        </div>
      )}

      {/* Success Notification */}
      {submitSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-3.5 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{submitSuccessMsg}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white p-5 rounded-2xl border border-[#D8E5E2] shadow-sm space-y-4">
        {/* Preferred Channel */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-800 block">
            Bagaimana Anda ingin dihubungi?
          </label>
          <div className="grid grid-cols-1 gap-2">
            {[
              { id: 'PHONE', label: 'Telepon saya langsung', icon: Phone },
              { id: 'MESSAGE', label: 'Pesan WhatsApp / SMS', icon: MessageSquare },
              { id: 'KADER', label: 'Kunjungan Kader Posyandu ke Rumah', icon: Users },
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = preferredChannel === item.id;
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setPreferredChannel(item.id as any)}
                  className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                    isSelected
                      ? 'bg-[#E1F5FE] border-[#00201C] text-black font-bold ring-1 ring-[#00201C]'
                      : 'bg-[#F8FBFA] border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-white text-black' : 'bg-gray-200 text-gray-600'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Category */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-800 block">Topik Bantuan:</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as any)}
            className="w-full p-2.5 border border-gray-300 rounded-xl text-xs bg-white text-gray-800 focus:ring-2 focus:ring-[#00201C] focus:outline-none"
          >
            {Object.entries(HELP_CATEGORY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>

        {/* Message */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-800 block">
            Pesan / Pertanyaan Anda:
          </label>
          <textarea
            rows={3}
            required
            placeholder="Tuliskan apa yang ingin Anda tanyakan atau bantuan yang dibutuhkan..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl text-xs bg-white text-gray-800 focus:ring-2 focus:ring-[#00201C] focus:outline-none"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting || !message.trim() || !isOnline}
          className="w-full py-3.5 bg-[#00201C] hover:bg-[#102521] text-white rounded-xl font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Send className="w-4 h-4 text-[#FFFACD]" />
          Kirim Permintaan Bantuan
        </button>
      </form>

      {/* History of Help Requests */}
      {helpHistory.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-[#60716D] uppercase tracking-wider px-1">
            Riwayat Permintaan Bantuan
          </h3>

          <div className="space-y-2.5">
            {helpHistory.map((item) => (
              <div
                key={item.id}
                className="bg-white p-3.5 rounded-xl border border-[#D8E5E2] shadow-2xs space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-black">
                    {HELP_CATEGORY_LABELS[item.category] || item.category}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                      item.status === 'RESOLVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.status === 'ACKNOWLEDGED'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {item.status === 'RESOLVED'
                      ? 'Selesai'
                      : item.status === 'ACKNOWLEDGED'
                      ? 'Diterima Petugas'
                      : 'Menunggu Respon'}
                  </span>
                </div>

                <p className="text-gray-600 text-[11px] italic bg-[#F8FBFA] p-2 rounded-lg border border-gray-100">
                  "{item.citizenMessage}"
                </p>

                {item.resolutionNotes && (
                  <div className="bg-[#E1F5FE]/60 p-2 rounded-lg border border-[#b2e3f8] text-[11px] text-black">
                    <strong>Tanggapan Petugas:</strong> {item.resolutionNotes}
                  </div>
                )}

                <div className="text-[10px] text-gray-400 flex items-center justify-between pt-1">
                  <span>Jalur: {PREFERRED_CHANNEL_LABELS[item.preferredChannel]}</span>
                  <span>{new Date(item.createdAt).toLocaleDateString('id-ID')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
