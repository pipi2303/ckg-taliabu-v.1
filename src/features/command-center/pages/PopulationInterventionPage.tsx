import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Target,
  MessageSquare,
  X,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { DocBadge } from '../../../components/common/DocBadge';
import { populationInterventionService } from '../../../services/populationInterventionService';
import { PopulationIntervention } from '../../../types';
import { INITIAL_KECAMATAN } from '../../../mock/initialData';

export const PopulationInterventionPage: React.FC = () => {
  const { user } = useAuth();
  const [interventions, setInterventions] = useState<PopulationIntervention[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // New Intervention Modal
  const [isNewOpen, setIsNewOpen] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDesc, setNewDesc] = useState<string>('');
  const [newRegionId, setNewRegionId] = useState<string>('kec-1');
  const [newDueDate, setNewDueDate] = useState<string>('2026-09-30');
  const [newProblemMetric, setNewProblemMetric] = useState<string>('BARRIER_DISTANCE_TRANSPORT');
  const [newSuccessMetric, setNewSuccessMetric] = useState<string>('IMPACT_LVL_2_CONTINUITY');
  const [newBaseline, setNewBaseline] = useState<string>('');

  // Add Progress Note Modal
  const [isNoteOpen, setIsNoteOpen] = useState<boolean>(false);
  const [selectedInterventionId, setSelectedInterventionId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState<string>('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const list = await populationInterventionService.getAllInterventions();
      setInterventions(list);
    } catch (err) {
      console.error('Failed to load interventions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateIntervention = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newTitle) return;

    const kec = INITIAL_KECAMATAN.find((k) => k.id === newRegionId) || INITIAL_KECAMATAN[0] || { id: 'kec-1', name: 'Taliabu Barat' };

    try {
      await populationInterventionService.createIntervention(
        {
          title: newTitle,
          description: newDesc,
          targetRegionId: kec?.id || 'kec-1',
          targetRegionName: `Kecamatan ${kec?.name || 'Taliabu Barat'}`,
          ownerUserId: user.id,
          ownerUserName: `${user.name} (${user.roleName})`,
          startDate: new Date().toISOString().slice(0, 10),
          dueDate: newDueDate,
          sourceMetricCode: newProblemMetric,
          sourceMetricLabel: newProblemMetric === 'BARRIER_DISTANCE_TRANSPORT' ? 'Kendala Transportasi Laut' : 'Kekosongan Obat Kronis',
          successMetricCode: newSuccessMetric,
          successMetricLabel: 'Peningkatan Kontinuitas Tindak Lanjut',
          baselineValueSummary: newBaseline || 'Baseline: 35.0% kehadiran kontrol',
        },
        user
      );

      setIsNewOpen(false);
      setNewTitle('');
      setNewDesc('');
      setNewBaseline('');
      loadData();
    } catch (err) {
      console.error('Failed to create intervention:', err);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedInterventionId || !noteText) return;

    try {
      await populationInterventionService.addProgressNote(selectedInterventionId, noteText, user);
      setIsNoteOpen(false);
      setNoteText('');
      loadData();
    } catch (err) {
      console.error('Failed to add note:', err);
    }
  };

  const handleComplete = async (id: string) => {
    if (!user) return;
    const finalSummary = prompt('Masukkan ringkasan hasil evaluasi akhir intervensi:');
    if (!finalSummary) return;

    try {
      await populationInterventionService.completeIntervention(id, finalSummary, user);
      loadData();
    } catch (err) {
      console.error('Failed to complete intervention:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-600 space-y-3">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs">Memuat Intervensi Populasi...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            POPULATION HEALTH PROGRAM MANAGEMENT
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-black tracking-tight">Intervensi Populasi Dinkes</h1>
            <DocBadge code="SCR-DNK-B10" size="sm" />
          </div>
          <p className="text-xs text-gray-600 mt-1">
            Perencanaan, pengawasan, dan evaluasi berkala program intervensi spesifik berbasis metrik masalah di lapangan.
          </p>
        </div>

        {user?.roleId !== 'BUPATI' && (
          <button
            onClick={() => setIsNewOpen(true)}
            className="px-4 py-2 text-xs font-medium rounded-xl bg-teal-600 hover:bg-teal-500 text-white transition flex items-center gap-1.5 self-start md:self-center"
          >
            <Plus className="w-4 h-4" />
            <span>Rancang Intervensi Baru</span>
          </button>
        )}
      </div>

      {/* Interventions List */}
      <div className="space-y-4">
        {interventions.map((item) => {
          const isCompleted = item.status === 'COMPLETED';

          return (
            <div
              key={item.id}
              className={`p-6 rounded-2xl bg-slate-900/90 border transition shadow-lg space-y-4 ${
                isCompleted ? 'border-emerald-500/30' : 'border-slate-800'
              }`}
            >
              {/* Top Row */}
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isCompleted
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                      }`}
                    >
                      {isCompleted ? 'SELESAI (EVALUASI SUKSES)' : 'SEDANG BERJALAN'}
                    </span>
                    <h3 className="text-base font-bold text-white">{item.title}</h3>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>
                </div>

                {/* Region & PIC */}
                <div className="text-right text-xs text-slate-400 shrink-0 space-y-1">
                  <div className="flex items-center md:justify-end gap-1.5 text-slate-300 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-teal-400" />
                    <span>{item.targetRegionName}</span>
                  </div>
                  <div className="flex items-center md:justify-end gap-1.5 text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>Target: {item.dueDate}</span>
                  </div>
                  <div className="text-[11px] text-slate-500">Penanggung Jawab: {item.ownerUserName}</div>
                </div>
              </div>

              {/* Baseline vs Current Metric */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-800/50 border border-slate-800 text-xs">
                <div className="space-y-1">
                  <div className="text-slate-400 flex items-center gap-1.5 text-[11px] font-semibold">
                    <Target className="w-3.5 h-3.5 text-rose-400" />
                    <span>Metrik Masalah Dasar (Baseline):</span>
                  </div>
                  <div className="text-slate-200 font-mono text-[11px]">{item.baselineValueSummary}</div>
                </div>

                <div className="space-y-1">
                  <div className="text-slate-400 flex items-center gap-1.5 text-[11px] font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Metrik Sasaran Keberhasilan:</span>
                  </div>
                  <div className="text-emerald-300 font-mono text-[11px]">
                    {item.currentValueSummary || 'Dalam pemantauan siklus berjalan'}
                  </div>
                </div>
              </div>

              {/* Progress Notes Timeline */}
              {item.progressNotes.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-teal-400" />
                    <span>Catatan Perkembangan Lapangan ({item.progressNotes.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {item.progressNotes.map((note) => (
                      <div key={note.id} className="p-2.5 rounded-lg bg-slate-800/30 text-xs text-slate-300 space-y-1">
                        <p className="leading-relaxed">{note.note}</p>
                        <div className="text-[10px] text-slate-500 flex items-center gap-2">
                          <span>{note.authorName}</span>
                          <span>•</span>
                          <span>{new Date(note.timestamp).toLocaleDateString('id-ID')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              {user?.roleId !== 'BUPATI' && !isCompleted && (
                <div className="pt-2 flex justify-end gap-2 text-xs">
                  <button
                    onClick={() => {
                      setSelectedInterventionId(item.id);
                      setIsNoteOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                  >
                    + Tambah Catatan Lapangan
                  </button>
                  <button
                    onClick={() => handleComplete(item.id)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 transition"
                  >
                    Tandai Selesai & Evaluasi Akhir
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* New Intervention Modal */}
      {isNewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Rancang Intervensi Populasi Baru</h3>
              <button onClick={() => setIsNewOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateIntervention} className="space-y-4 text-xs text-slate-300">
              <div>
                <label className="block font-medium mb-1">Judul Intervensi:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Subsidi BBM Perahu Pasien Desa Wayo"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Deskripsi & Rencana Aksi:</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Jelaskan mekanisme intervensi, jadwal operasional, dan pihak terkait..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-teal-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1">Wilayah Sasaran:</label>
                  <select
                    value={newRegionId}
                    onChange={(e) => setNewRegionId(e.target.value)}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                  >
                    {INITIAL_KECAMATAN.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium mb-1">Target Batas Waktu:</label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1">Kondisi Awal (Baseline Metric):</label>
                <input
                  type="text"
                  placeholder="Contoh: Baseline: 34.2% (41/120 warga hadir kontrol)"
                  value={newBaseline}
                  onChange={(e) => setNewBaseline(e.target.value)}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-medium transition"
                >
                  Simpan Intervensi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Note Modal */}
      {isNoteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Tambah Catatan Lapangan</h3>
              <button onClick={() => setIsNoteOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNote} className="space-y-4 text-xs text-slate-300">
              <div>
                <label className="block font-medium mb-1">Perkembangan Terkini:</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Tuliskan hasil koordinasi, kunjungan lapangan, atau capaian sementara..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-teal-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNoteOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-medium transition"
                >
                  Simpan Catatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
