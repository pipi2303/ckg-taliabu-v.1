import React, { useState } from 'react';
import {
  Sliders,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Play,
  TrendingUp,
  HelpCircle,
  CheckCircle2,
  Info,
  Layers,
  MapPin,
  Calendar,
  Compass,
} from 'lucide-react';
import { scenarioSimulationService } from '../../../services/scenarioSimulationService';
import { ScenarioSimulation } from '../../../types';

export const ScenarioLabPage: React.FC = () => {
  const scenarios = scenarioSimulationService.getScenarios();
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(scenarios[0]?.id || 'SCEN-TALIABU-01');
  const [showNewSimulationModal, setShowNewSimulationModal] = useState<boolean>(false);
  const [customName, setCustomName] = useState('');
  const [customRegion, setCustomRegion] = useState('Taliabu Utara');
  const [customIntervention, setCustomIntervention] = useState<'TRANSPORT' | 'BUFFER_STOCK' | 'KADER_INTENSIVE' | 'DIGITAL_NUDGE'>('BUFFER_STOCK');
  const [customDesc, setCustomDesc] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeScenario = scenarioSimulationService.getScenarioById(selectedScenarioId) || scenarios[0];

  const handleRunCustomSimulation = (e: React.FormEvent) => {
    e.preventDefault();
    const created = scenarioSimulationService.runNewSimulation({
      name: customName || `Skenario: Intervensi ${customIntervention} di ${customRegion}`,
      regionId: `KEC-${customRegion.replace(/\s+/g, '-').toUpperCase()}`,
      regionName: `Kecamatan ${customRegion}`,
      hypotheticalDescription: customDesc || 'Simulasi pemodelan populasi berbasis asumsi intervensi faskes',
      assumptions: [
        'Kapasitas faskes pembina melayani resep kronis 100%',
        'Kader posyandu aktif melakukan edukasi dialogis',
      ],
      interventionType: customIntervention,
    });

    setSelectedScenarioId(created.id);
    setShowNewSimulationModal(false);
    setToastMessage(`Skenario simulasi "${created.name}" berhasil dijalankan.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#00201C] to-[#00332D] text-white p-6 rounded-2xl border border-amber-900/50 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
              <Sliders className="w-4 h-4" />
              POPULATION SCENARIO SIMULATION LAB ("WHAT IF?")
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Laboratorium Simulasi Skenario Kebijakan Dinkes
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Eksplorasi hipotetis dampak berbagai opsi intervensi kesehatan masyarakat (logistik obat, transportasi maritim,
              kader keliling) terhadap kontinuitas perawatan di Kabupaten Pulau Taliabu.
            </p>
          </div>

          <button
            onClick={() => setShowNewSimulationModal(true)}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition cursor-pointer shadow-xs shrink-0"
          >
            <Play className="w-4 h-4 fill-white" />
            Jalankan Simulasi Baru
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3 bg-amber-950 border border-amber-500/60 rounded-xl text-amber-100 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
          {toastMessage}
        </div>
      )}

      {/* Governed Counterfactual Warning */}
      <div className="p-4 bg-slate-900/90 border border-amber-900/60 rounded-xl text-xs space-y-1.5">
        <div className="flex items-center gap-2 font-bold text-amber-300">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          Batasan Tata Kelola Model Counterfactual AI
        </div>
        <p className="text-slate-400 leading-relaxed">
          <strong>Perhatian:</strong> Simulasi ini bukan prediksi pasti dan tidak membuktikan bahwa suatu intervensi akan
          menyebabkan hasil tertentu. Angka proyeksi merupakan model matematis probabilistik dengan asumsi eksplisit untuk
          membantu perbandingan alternatif kebijakan Dinas Kesehatan.
        </p>
      </div>

      {/* Scenario Selector & Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: List of Scenarios */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Daftar Skenario Teruji ({scenarios.length})
          </div>
          {scenarios.map((scen) => (
            <div
              key={scen.id}
              onClick={() => setSelectedScenarioId(scen.id)}
              className={`p-4 rounded-xl border text-xs space-y-2 cursor-pointer transition ${
                selectedScenarioId === scen.id
                  ? 'bg-slate-800/90 border-amber-500 shadow-md text-white'
                  : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold">{scen.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                    scen.estimatedDirection === 'MEMBAIK'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}
                >
                  {scen.estimatedDirection === 'MEMBAIK' ? '▲ Positif' : '▼ Menurun'}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-amber-400" />
                {scen.regionName}
              </div>
            </div>
          ))}
        </div>

        {/* Right Columns (2-Span): Active Scenario Deep-Dive */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-amber-400">ID: {activeScenario.id}</span>
              <span className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-300 rounded font-semibold">
                Mode: {activeScenario.mode}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">{activeScenario.name}</h2>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              {activeScenario.hypotheticalDescription}
            </p>
          </div>

          {/* Metric Comparison Card: Baseline vs Projected */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-1">
              <div className="text-[11px] text-slate-400 uppercase font-semibold">
                Kondisi Baseline Saat Ini:
              </div>
              <div className="text-3xl font-extrabold text-slate-200">
                {activeScenario.expectedRange.baselineRate}%
              </div>
              <div className="text-[11px] text-slate-400">
                {activeScenario.expectedRange.metricLabel}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-700/60 space-y-1">
              <div className="text-[11px] text-amber-300 uppercase font-semibold">
                Rentang Proyeksi Intervensi:
              </div>
              <div className="text-3xl font-extrabold text-amber-400">
                {activeScenario.expectedRange.projectedRateMin}% – {activeScenario.expectedRange.projectedRateMax}%
              </div>
              <div className="text-[11px] text-amber-200/80">
                Arah: <strong>{activeScenario.estimatedDirection}</strong> (Ketidakpastian: {activeScenario.uncertaintyRating})
              </div>
            </div>
          </div>

          {/* Assumptions Box */}
          <div className="space-y-2 text-xs">
            <h3 className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
              Asumsi Eksplisit Model:
            </h3>
            <div className="space-y-1.5">
              {activeScenario.assumptions.map((assump, idx) => (
                <div key={idx} className="p-2.5 bg-slate-800/80 rounded-lg text-slate-300 border border-slate-700/60">
                  • {assump}
                </div>
              ))}
            </div>
          </div>

          {/* Limitations Box */}
          <div className="space-y-2 text-xs">
            <h3 className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Batasan Data & Konteks Lapangan:
            </h3>
            <div className="space-y-1.5">
              {activeScenario.dataLimitations.map((limit, idx) => (
                <div key={idx} className="p-2.5 bg-slate-800/80 rounded-lg text-slate-400 border border-slate-700/60">
                  • {limit}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* New Simulation Modal */}
      {showNewSimulationModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Play className="w-4 h-4 text-amber-400" />
                Jalankan Simulasi Skenario Baru
              </div>
              <button
                onClick={() => setShowNewSimulationModal(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                Tutup
              </button>
            </div>

            <form onSubmit={handleRunCustomSimulation} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Nama / Judul Skenario:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Skenario Distribusi Perahu Posyandu Keliling"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Wilayah Kecamatan:</label>
                  <select
                    value={customRegion}
                    onChange={(e) => setCustomRegion(e.target.value)}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-amber-500"
                  >
                    <option value="Taliabu Barat">Taliabu Barat</option>
                    <option value="Taliabu Barat Daya">Taliabu Barat Daya</option>
                    <option value="Taliabu Selatan">Taliabu Selatan</option>
                    <option value="Taliabu Timur">Taliabu Timur</option>
                    <option value="Taliabu Timur Selatan">Taliabu Timur Selatan</option>
                    <option value="Taliabu Utara">Taliabu Utara</option>
                    <option value="Lede">Lede</option>
                    <option value="Tabona">Tabona</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Tipe Intervensi:</label>
                  <select
                    value={customIntervention}
                    onChange={(e) => setCustomIntervention(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-amber-500"
                  >
                    <option value="BUFFER_STOCK">Buffer Stock Obat 3 Bulan</option>
                    <option value="TRANSPORT">Bantuan Transportasi Maritim</option>
                    <option value="KADER_INTENSIVE">Intensifikasi Kader Desa</option>
                    <option value="DIGITAL_NUDGE">Pengingat Digital Sahabat</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Deskripsi Hipotetis:</label>
                <textarea
                  rows={3}
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                  placeholder="Jelaskan asumsi operasional intervensi..."
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewSimulationModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg cursor-pointer font-semibold"
                >
                  Simulasikan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
