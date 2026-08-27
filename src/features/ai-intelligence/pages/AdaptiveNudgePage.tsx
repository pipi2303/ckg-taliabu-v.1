import React, { useState, useEffect } from 'react';
import {
  MessageSquareHeart,
  Send,
  Sparkles,
  Users,
  CheckCircle2,
  PhoneCall,
  Volume2,
  Languages,
  Clock,
} from 'lucide-react';
import { aiNudgeService } from '../../../services/aiNudgeService';
import { AIAdaptiveNudge } from '../../../types';
import { useAuth } from '../../../context/AuthContext';

export const AdaptiveNudgePage: React.FC = () => {
  const { user } = useAuth();
  const [nudges, setNudges] = useState<AIAdaptiveNudge[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Form states for new custom nudge generation
  const [citizenName, setCitizenName] = useState<string>('Wa Ode Ramlah');
  const [targetDialect, setTargetDialect] = useState<AIAdaptiveNudge['targetDialect']>('MELAYU_TALIABU');
  const [nudgeObjective, setNudgeObjective] = useState<AIAdaptiveNudge['nudgeObjective']>('PENGINGAT_MINUM_OBAT');
  const [channel, setChannel] = useState<AIAdaptiveNudge['channel']>('WHATSAPP_KADER');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const list = await aiNudgeService.getNudges();
      setNudges(list);
    } catch (err) {
      console.error('Failed to load nudges:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsGenerating(true);
    try {
      const created = await aiNudgeService.generateNudge({
        citizenId: `CIT-8208-${Date.now().toString().slice(-4)}`,
        citizenName,
        targetDialect,
        nudgeObjective,
        channel,
        actor: { id: user.id, name: user.name, role: user.roleName || user.roleId },
      });
      setNudges((prev) => [created, ...prev]);
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-600 space-y-3">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs">Memuat Generator Edukasi & Motivasi Adaptif AI...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-teal-400 font-semibold uppercase tracking-wider mb-1">
          <MessageSquareHeart className="w-4 h-4" />
          BEHAVIORAL AI & ADAPTIVE CULTURAL NUDGE
        </div>
        <h1 className="text-2xl font-bold text-black tracking-tight">Generator Edukasi & Komunikasi Budaya Warga</h1>
        <p className="text-xs text-gray-600 mt-1">
          Penyusunan pesan motivasi personal dalam dialek lokal (Melayu Taliabu, Bahasa Lansia Santun) untuk meningkatkan kepatuhan minum obat dan kehadiran kontrol faskes.
        </p>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Generator Form (5 Cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-slate-800 pb-2">
            <Sparkles className="w-4 h-4 text-teal-400" />
            Generate Pesan Kultural Baru
          </div>

          <form onSubmit={handleGenerate} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-300 mb-1">Nama Warga / Sasaran:</label>
              <input
                type="text"
                value={citizenName}
                onChange={(e) => setCitizenName(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1 flex items-center gap-1">
                <Languages className="w-3.5 h-3.5 text-teal-400" /> Target Dialek / Gaya Bahasa:
              </label>
              <select
                value={targetDialect}
                onChange={(e) => setTargetDialect(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-teal-500"
              >
                <option value="MELAYU_TALIABU">Dialek Melayu Taliabu (Kultural Pesisir)</option>
                <option value="BAHASA_SEDERHANA_LANSIA">Bahasa Sederhana Lansia (Singkat & Hangat)</option>
                <option value="BAHASA_INDONESIA_SANTUN">Bahasa Indonesia Santun (Resmi & Empatis)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Tujuan Intervensi Komunikasi:</label>
              <select
                value={nudgeObjective}
                onChange={(e) => setNudgeObjective(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-teal-500"
              >
                <option value="PENGINGAT_MINUM_OBAT">Pengingat Minum Obat Malam Hari</option>
                <option value="JADWAL_KONTROL_PUSKESMAS">Pengingat Jadwal Kontrol Rutin Puskesmas</option>
                <option value="MOTIVASI_POLA_MAKAN">Motivasi Pola Makan Rendah Garam & Gula</option>
                <option value="ATASI_KECEMASAN">Atasi Kecemasan Efek Samping Obat</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Kanal Penyampaian:</label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-teal-500"
              >
                <option value="WHATSAPP_KADER">WhatsApp Kader Posyandu</option>
                <option value="SMS_SAHABAT_WARGA">SMS Gateway Sahabat Warga</option>
                <option value="KUNJUNGAN_TATAP_MUKA">Panduan Percakapan Kunjungan Lapangan Kader</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition disabled:opacity-50 mt-2"
            >
              <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              {isGenerating ? 'Menyusun Pesan AI...' : 'Generate Pesan Edukasi'}
            </button>
          </form>
        </div>

        {/* Right: History & Sample Nudges (7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Daftar Pesan Edukasi Tergenerate ({nudges.length})
            </h3>
            <span className="text-xs text-teal-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Terintegrasi Sahabat Warga
            </span>
          </div>

          <div className="space-y-3">
            {nudges.map((nudge) => (
              <div
                key={nudge.id}
                className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition space-y-2.5"
              >
                <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{nudge.citizenName}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-teal-300 border border-slate-700 text-[10px] font-mono">
                      {nudge.targetDialect}
                    </span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      nudge.status === 'SENT'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}
                  >
                    {nudge.status === 'SENT' ? 'TERKIRIM' : 'DRAFT KADER'}
                  </span>
                </div>

                <div className="p-3 bg-slate-800/70 rounded-xl border border-slate-700 text-xs text-slate-200 leading-relaxed font-sans">
                  "{nudge.generatedMessage}"
                </div>

                <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-1">
                  <div>
                    <span className="text-slate-500">Karakter Nada: </span>
                    <strong className="text-slate-300">{nudge.empathyTone}</strong>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-3 h-3" />
                    {new Date(nudge.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {nudge.citizenResponseNote && (
                  <div className="p-2 bg-teal-950/40 border border-teal-800/50 rounded-lg text-[11px] text-teal-300">
                    <strong>Tanggapan Warga:</strong> {nudge.citizenResponseNote}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
