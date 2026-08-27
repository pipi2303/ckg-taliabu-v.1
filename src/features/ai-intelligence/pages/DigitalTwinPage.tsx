import React, { useState } from 'react';
import {
  Layers,
  Activity,
  Calendar,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  Heart,
  Pill,
  MapPin,
  TrendingUp,
  Sliders,
  FileText,
  Search,
} from 'lucide-react';
import { digitalTwinService } from '../../../services/digitalTwinService';
import { CitizenHealthTwin } from '../../../types';

export const DigitalTwinPage: React.FC = () => {
  const allTwins = digitalTwinService.getAllTwins();
  const [selectedCitizenId, setSelectedCitizenId] = useState<string>(allTwins[0]?.citizenId || 'CIT-8208-0012');
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'TIMELINE' | 'SIMULATION'>('OVERVIEW');

  const twin = digitalTwinService.getDigitalTwin(selectedCitizenId);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#00201C] to-[#00332D] text-white p-6 rounded-2xl border border-teal-900/50 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-400 uppercase tracking-wider mb-1">
              <Layers className="w-4 h-4" />
              CKG DIGITAL TWIN & LONGITUDINAL HEALTH PROFILE
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Profil Kesehatan Longitudinal Warga (Digital Twin)
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Agregasi dinamis data lintas faskes, kader desa, dan pemantauan mandiri. Memisahkan secara tegas
              antara data hasil observasi klinis nyata, status deterministik CRS, dan sinyal prediktif kecerdasan buatan.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-300">Pilih Warga:</span>
            <select
              value={selectedCitizenId}
              onChange={(e) => setSelectedCitizenId(e.target.value)}
              className="px-3 py-2 bg-slate-900/90 border border-teal-500/60 rounded-xl text-xs font-bold text-teal-300 focus:outline-none focus:border-teal-400"
            >
              {allTwins.map((t) => (
                <option key={t.citizenId} value={t.citizenId}>
                  {t.citizenName} ({t.citizenId}) — {t.desaName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Citizen Snapshot Identity Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-teal-950 border border-teal-600/40 text-teal-400 flex items-center justify-center font-bold text-lg">
            <User className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">{twin.citizenName}</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                NIK: {twin.nikMasked}
              </span>
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-3 mt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-teal-400" />
                {twin.desaName}, {twin.kecamatanName}
              </span>
              <span>•</span>
              <span className="text-slate-400">Versi Twin: {twin.twinVersion}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] text-slate-400 uppercase">Kelengkapan Data:</div>
            <span
              className={`inline-block px-2 py-0.5 text-[11px] font-bold rounded mt-0.5 ${
                twin.dataCompleteness === 'LENGKAP'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-amber-950 text-amber-300 border border-amber-800'
              }`}
            >
              {twin.dataCompleteness}
            </span>
          </div>

          <div className="text-right pl-3 border-l border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase">Status Usia Data:</div>
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 justify-end mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Aktif & Mutakhir
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'OVERVIEW'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          4 Kuadran Status (Observed, Derived, Predicted, Simulated)
        </button>
        <button
          onClick={() => setActiveTab('TIMELINE')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'TIMELINE'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          Riwayat Longitudinal & Intervensi
        </button>
      </div>

      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* 4 Quadrants of the Governed Digital Twin */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* QUADRANT 1: # OBSERVED STATE */}
            <div className="bg-slate-900/90 border border-emerald-900/60 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  <Activity className="w-4 h-4" />
                  1. OBSERVED DATA (Pemeriksaan Nyata Klinisi & Kader)
                </div>
                <span className="text-[10px] px-2 py-0.5 bg-emerald-950 text-emerald-300 rounded font-mono border border-emerald-800">
                  REAL EVIDENCE
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-800/70 rounded-xl">
                  <div className="text-slate-400 text-[11px]">Tekanan Darah Terakhir:</div>
                  <div className="text-base font-bold text-white mt-0.5">
                    {twin.observedState.lastSystolic} / {twin.observedState.lastDiastolic} mmHg
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Gula Darah: {twin.observedState.lastBloodSugar || '-'} mg/dL
                  </div>
                </div>
                <div className="p-3 bg-slate-800/70 rounded-xl">
                  <div className="text-slate-400 text-[11px]">Jumlah Skrining:</div>
                  <div className="text-base font-bold text-white mt-0.5">
                    {twin.observedState.screeningCount} Kali Skrining
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Penebusan Obat: {twin.observedState.medicationDispensesCount}x
                  </div>
                </div>
              </div>
              <div className="p-3 bg-slate-800/40 rounded-xl text-xs space-y-1">
                <div className="text-slate-400 text-[11px]">Diagnosis Terkonfirmasi Dokter:</div>
                <div className="font-semibold text-emerald-300">
                  {twin.observedState.confirmedDiagnoses.join(', ') || 'Belum Ada Diagnosis Definitif'}
                </div>
              </div>
            </div>

            {/* QUADRANT 2: # DERIVED DETERMINISTIC STATE */}
            <div className="bg-slate-900/90 border border-blue-900/60 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" />
                  2. DERIVED DETERMINISTIC (Klasifikasi Protokol CRS Kemenkes)
                </div>
                <span className="text-[10px] px-2 py-0.5 bg-blue-950 text-blue-300 rounded font-mono border border-blue-800">
                  DETERMINISTIC
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-800/70 rounded-xl">
                  <div className="text-slate-400 text-[11px]">Kategori CRS CKG:</div>
                  <div className="text-base font-bold text-amber-400 mt-0.5">
                    {twin.careState.crsCategory} (RISIKO TINGGI)
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Siklus: #{twin.careState.monitoringCycleNumber}</div>
                </div>
                <div className="p-3 bg-slate-800/70 rounded-xl">
                  <div className="text-slate-400 text-[11px]">Tugas Aktif Faskes:</div>
                  <div className="text-base font-bold text-white mt-0.5">
                    {twin.careState.activeCareTasksCount} CareTask
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Jadwal: {twin.careState.nextFollowUpDue}</div>
                </div>
              </div>
              <div className="p-3 bg-slate-800/40 rounded-xl text-xs space-y-1">
                <div className="text-slate-400 text-[11px]">Tahap Kaskade Outreach:</div>
                <div className="font-semibold text-blue-300">
                  {twin.careState.lastOutreachStage || 'RUTIN'}
                </div>
              </div>
            </div>

            {/* QUADRANT 3: # PREDICTED STATE */}
            <div className="bg-slate-900/90 border border-purple-900/60 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  3. PREDICTED SIGNALS (Estimasi Model AI Teruji)
                </div>
                <span className="text-[10px] px-2 py-0.5 bg-purple-950 text-purple-300 rounded font-mono border border-purple-800">
                  PREDICTIVE
                </span>
              </div>
              <div className="space-y-2 text-xs">
                {twin.predictiveSignals.map((sig, idx) => (
                  <div key={idx} className="p-3 bg-slate-800/70 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">{sig.type}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          sig.level === 'HIGH'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}
                      >
                        {sig.level}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">{sig.keyFactor}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* QUADRANT 4: # SIMULATED SCENARIO STATE */}
            <div className="bg-slate-900/90 border border-amber-900/60 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                  <Sliders className="w-4 h-4" />
                  4. SIMULATED TRAJECTORY (Skenario Hipotetis)
                </div>
                <span className="text-[10px] px-2 py-0.5 bg-amber-950 text-amber-300 rounded font-mono border border-amber-800">
                  WHAT-IF LAB
                </span>
              </div>
              <div className="p-3 bg-slate-800/70 rounded-xl text-xs space-y-2">
                <div className="font-semibold text-slate-200">
                  Skenario A: Penyerahan Titipan Obat 3 Bulan di Pustu Pesisir
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Jika pasien diberikan perbekalan obat antihipertensi 90 hari menjelang musim gelombang barat,
                  estimasi probabilitas kepatuhan kontrol meningkat dari 48% ke 82%.
                </p>
                <div className="text-[10px] text-amber-300/90 italic">
                  *Bukan jaminan klinis individual; digunakan untuk perencanaan dukungan logistik faskes.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'TIMELINE' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-teal-400" />
              Linimasa Peristiwa Kesehatan & Intervensi Longitudinal
            </h3>
            <span className="text-xs text-slate-400">Total Peristiwa: {twin.longitudinalFactors.length} Catatan</span>
          </div>

          <div className="space-y-4">
            {twin.longitudinalFactors.map((item, idx) => (
              <div key={idx} className="flex items-start gap-4 text-xs">
                <div className="w-24 text-slate-400 font-mono text-[11px] pt-1">{item.date}</div>
                <div className="w-2.5 h-2.5 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                <div className="flex-1 p-3 bg-slate-800/70 rounded-xl border border-slate-700 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{item.event}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-slate-700 text-slate-300 rounded font-semibold">
                      {item.source}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">{item.impact}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Interventions Section */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Daftar Intervensi Petugas & Kader Terlaksana:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {twin.interventionHistory.map((intv) => (
                <div key={intv.id} className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/60 space-y-1">
                  <div className="flex items-center justify-between text-slate-200 font-medium">
                    <span>{intv.type}</span>
                    <span className="text-[10px] text-slate-400">{intv.date}</span>
                  </div>
                  <div className="text-[11px] text-teal-300">Pelaksana: {intv.actor}</div>
                  <p className="text-[11px] text-slate-400">{intv.result}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
