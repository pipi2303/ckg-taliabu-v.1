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
      <div className="bg-[#faf9f6] text-black p-6 rounded-2xl border border-stone-200/90 shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-teal-800 uppercase tracking-wider mb-1">
              <Layers className="w-4 h-4 text-teal-700" />
              CKG DIGITAL TWIN & LONGITUDINAL HEALTH PROFILE
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-black">
              Profil Kesehatan Longitudinal Warga (Digital Twin)
            </h1>
            <p className="text-xs text-stone-600 mt-1 max-w-3xl leading-relaxed">
              Agregasi dinamis data lintas faskes, kader desa, dan pemantauan mandiri. Memisahkan secara tegas
              antara data hasil observasi klinis nyata, status deterministik CRS, dan sinyal prediktif kecerdasan buatan.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-600 font-medium">Pilih Warga:</span>
            <select
              value={selectedCitizenId}
              onChange={(e) => setSelectedCitizenId(e.target.value)}
              className="px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs font-bold text-teal-800 focus:outline-none focus:border-teal-700 cursor-pointer"
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
      <div className="bg-[#faf9f6] border border-stone-200/90 shadow-xs rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center font-bold text-lg">
            <User className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-black">{twin.citizenName}</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white border border-stone-200 text-stone-700 font-semibold">
                NIK: {twin.nikMasked}
              </span>
            </div>
            <div className="text-xs text-stone-500 flex items-center gap-3 mt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-teal-700" />
                {twin.desaName}, {twin.kecamatanName}
              </span>
              <span>•</span>
              <span className="text-stone-500 font-medium">Versi Twin: {twin.twinVersion}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] text-stone-500 uppercase font-semibold">Kelengkapan Data:</div>
            <span
              className={`inline-block px-2 py-0.5 text-[11px] font-bold rounded mt-0.5 ${
                twin.dataCompleteness === 'LENGKAP'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}
            >
              {twin.dataCompleteness}
            </span>
          </div>

          <div className="text-right pl-3 border-l border-stone-200">
            <div className="text-[10px] text-stone-500 uppercase font-semibold">Status Usia Data:</div>
            <span className="text-xs font-bold text-emerald-800 flex items-center gap-1 justify-end mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              Aktif & Mutakhir
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'OVERVIEW'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'bg-white text-stone-600 border border-stone-200 hover:text-black'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          4 Kuadran Status (Observed, Derived, Predicted, Simulated)
        </button>
        <button
          onClick={() => setActiveTab('TIMELINE')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'TIMELINE'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'bg-white text-stone-600 border border-stone-200 hover:text-black'
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
            <div className="bg-[#faf9f6] border border-emerald-300 rounded-2xl p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 uppercase tracking-wider">
                  <Activity className="w-4 h-4 text-emerald-700" />
                  1. OBSERVED DATA (Pemeriksaan Nyata Klinisi & Kader)
                </div>
                <span className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded font-mono border border-emerald-200 font-bold">
                  REAL EVIDENCE
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white border border-stone-200 rounded-xl shadow-2xs">
                  <div className="text-stone-500 text-[11px]">Tekanan Darah Terakhir:</div>
                  <div className="text-base font-bold text-black mt-0.5">
                    {twin.observedState.lastSystolic} / {twin.observedState.lastDiastolic} mmHg
                  </div>
                  <div className="text-[10px] text-stone-500 mt-0.5">
                    Gula Darah: {twin.observedState.lastBloodSugar || '-'} mg/dL
                  </div>
                </div>
                <div className="p-3 bg-white border border-stone-200 rounded-xl shadow-2xs">
                  <div className="text-stone-500 text-[11px]">Jumlah Skrining:</div>
                  <div className="text-base font-bold text-black mt-0.5">
                    {twin.observedState.screeningCount} Kali Skrining
                  </div>
                  <div className="text-[10px] text-stone-500 mt-0.5">
                    Penebusan Obat: {twin.observedState.medicationDispensesCount}x
                  </div>
                </div>
              </div>
              <div className="p-3 bg-white border border-stone-200 rounded-xl text-xs space-y-1 shadow-2xs">
                <div className="text-stone-500 text-[11px] font-semibold">Diagnosis Terkonfirmasi Dokter:</div>
                <div className="font-semibold text-emerald-900">
                  {twin.observedState.confirmedDiagnoses.join(', ') || 'Belum Ada Diagnosis Definitif'}
                </div>
              </div>
            </div>

            {/* QUADRANT 2: # DERIVED DETERMINISTIC STATE */}
            <div className="bg-[#faf9f6] border border-blue-300 rounded-2xl p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-900 uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-blue-700" />
                  2. DERIVED DETERMINISTIC (Klasifikasi Protokol CRS Kemenkes)
                </div>
                <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-800 rounded font-mono border border-blue-200 font-bold">
                  DETERMINISTIC
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white border border-stone-200 rounded-xl shadow-2xs">
                  <div className="text-stone-500 text-[11px]">Kategori CRS CKG:</div>
                  <div className="text-base font-bold text-amber-800 mt-0.5">
                    {twin.careState.crsCategory} (RISIKO TINGGI)
                  </div>
                  <div className="text-[10px] text-stone-500 mt-0.5">Siklus: #{twin.careState.monitoringCycleNumber}</div>
                </div>
                <div className="p-3 bg-white border border-stone-200 rounded-xl shadow-2xs">
                  <div className="text-stone-500 text-[11px]">Tugas Aktif Faskes:</div>
                  <div className="text-base font-bold text-black mt-0.5">
                    {twin.careState.activeCareTasksCount} CareTask
                  </div>
                  <div className="text-[10px] text-stone-500 mt-0.5">Jadwal: {twin.careState.nextFollowUpDue}</div>
                </div>
              </div>
              <div className="p-3 bg-white border border-stone-200 rounded-xl text-xs space-y-1 shadow-2xs">
                <div className="text-stone-500 text-[11px] font-semibold">Tahap Kaskade Outreach:</div>
                <div className="font-semibold text-blue-900">
                  {twin.careState.lastOutreachStage || 'RUTIN'}
                </div>
              </div>
            </div>

            {/* QUADRANT 3: # PREDICTED STATE */}
            <div className="bg-[#faf9f6] border border-purple-300 rounded-2xl p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-900 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-purple-700" />
                  3. PREDICTED SIGNALS (Estimasi Model AI Teruji)
                </div>
                <span className="text-[10px] px-2 py-0.5 bg-purple-50 text-purple-800 rounded font-mono border border-purple-200 font-bold">
                  PREDICTIVE
                </span>
              </div>
              <div className="space-y-2 text-xs">
                {twin.predictiveSignals.map((sig, idx) => (
                  <div key={idx} className="p-3 bg-white border border-stone-200 rounded-xl space-y-1 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-black">{sig.type}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          sig.level === 'HIGH'
                            ? 'bg-rose-50 text-rose-800 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {sig.level}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-600">{sig.keyFactor}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* QUADRANT 4: # SIMULATED SCENARIO STATE */}
            <div className="bg-[#faf9f6] border border-amber-300 rounded-2xl p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wider">
                  <Sliders className="w-4 h-4 text-amber-700" />
                  4. SIMULATED TRAJECTORY (Skenario Hipotetis)
                </div>
                <span className="text-[10px] px-2 py-0.5 bg-amber-50 text-amber-800 rounded font-mono border border-amber-200 font-bold">
                  WHAT-IF LAB
                </span>
              </div>
              <div className="p-3 bg-white border border-stone-200 rounded-xl text-xs space-y-2 shadow-2xs">
                <div className="font-semibold text-black">
                  Skenario A: Penyerahan Titipan Obat 3 Bulan di Pustu Pesisir
                </div>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  Jika pasien diberikan perbekalan obat antihipertensi 90 hari menjelang musim gelombang barat,
                  estimasi probabilitas kepatuhan kontrol meningkat dari 48% ke 82%.
                </p>
                <div className="text-[10px] text-amber-800 italic">
                  *Bukan jaminan klinis individual; digunakan untuk perencanaan dukungan logistik faskes.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'TIMELINE' && (
        <div className="bg-[#faf9f6] border border-stone-200/90 shadow-xs rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <h3 className="text-sm font-bold text-black flex items-center gap-2">
              <Calendar className="w-4 h-4 text-teal-700" />
              Linimasa Peristiwa Kesehatan & Intervensi Longitudinal
            </h3>
            <span className="text-xs text-stone-500">Total Peristiwa: {twin.longitudinalFactors.length} Catatan</span>
          </div>

          <div className="space-y-4">
            {twin.longitudinalFactors.map((item, idx) => (
              <div key={idx} className="flex items-start gap-4 text-xs">
                <div className="w-24 text-stone-500 font-mono text-[11px] pt-1">{item.date}</div>
                <div className="w-2.5 h-2.5 rounded-full bg-teal-600 mt-1.5 shrink-0" />
                <div className="flex-1 p-3 bg-white rounded-xl border border-stone-200 space-y-1 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-black">{item.event}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-stone-100 text-stone-700 rounded font-semibold border border-stone-200">
                      {item.source}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600">{item.impact}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Interventions Section */}
          <div className="pt-4 border-t border-stone-200 space-y-3">
            <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
              Daftar Intervensi Petugas & Kader Terlaksana:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {twin.interventionHistory.map((intv) => (
                <div key={intv.id} className="p-3 bg-white rounded-xl border border-stone-200 space-y-1 shadow-2xs">
                  <div className="flex items-center justify-between text-stone-800 font-medium">
                    <span className="font-bold">{intv.type}</span>
                    <span className="text-[10px] text-stone-500">{intv.date}</span>
                  </div>
                  <div className="text-[11px] text-teal-800 font-semibold">Pelaksana: {intv.actor}</div>
                  <p className="text-[11px] text-stone-600">{intv.result}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
