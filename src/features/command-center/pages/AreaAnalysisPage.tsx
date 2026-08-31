import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Building2,
  Shield,
  AlertCircle,
  Filter,
  Eye,
  Lock,
  Layers,
  Info,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { DocBadge } from '../../../components/common/DocBadge';
import { CompletenessBanner } from '../components/CompletenessBanner';
import { DrilldownModal } from '../components/DrilldownModal';
import {
  populationQualificationService,
  CountyCompletenessSummary,
} from '../../../services/populationQualificationService';
import { populationPrivacyService } from '../../../services/populationPrivacyService';
import { INITIAL_KECAMATAN, INITIAL_DESA } from '../../../mock/initialData';
import { KECAMATAN_PROFILES } from '../../../mock/kecamatanProfileData';
import { Kecamatan, Desa } from '../../../types';

type MetricViewMode = 'COVERAGE' | 'GAP' | 'BURDEN';

export const AreaAnalysisPage: React.FC = () => {
  const { user } = useAuth();
  const [completeness, setCompleteness] = useState<CountyCompletenessSummary | null>(null);
  const [viewMode, setViewMode] = useState<MetricViewMode>('COVERAGE');
  const [selectedKecamatanId, setSelectedKecamatanId] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Drilldown state
  const [isDrilldownOpen, setIsDrilldownOpen] = useState<boolean>(false);
  const [drilldownTitle, setDrilldownTitle] = useState<string>('');
  const [drilldownDescription, setDrilldownDescription] = useState<string>('');
  const [drilldownItems, setDrilldownItems] = useState<any[]>([]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const compData = await populationQualificationService.getCountyCompleteness();
      setCompleteness(compData);
    } catch (err) {
      console.error('Failed to load area data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Shared kecamatan/desa mock statistics (single source of truth — see mock/kecamatanProfileData.ts)
  const kecamatanData = KECAMATAN_PROFILES;

  const filteredKecamatan =
    selectedKecamatanId === 'ALL'
      ? kecamatanData
      : kecamatanData.filter((k) => k.id === selectedKecamatanId);

  const handleVillageDrilldown = (v: any, kecName: string) => {
    if (v.suppressed) {
      alert('Data desa ini disembunyikan untuk melindungi privasi warga kepulauan berpenduduk sedikit (DS-OI-06).');
      return;
    }
    setDrilldownTitle(`Penelusuran Wilayah: ${v.name} (${kecName})`);
    setDrilldownDescription(`Menampilkan daftar kasus tindak lanjut di ${v.name}.`);
    const sampleItems = Array.from({ length: Math.min(10, v.gapCount || 3) }).map((_, i) => ({
      id: `case-v-${i + 1}`,
      label: `Warga Desa ${v.name} #${i + 1} (Masked)`,
      subLabel: `NIK: 820801******${2000 + i}`,
      facilityName: 'Puskesmas Wilayah',
      kecamatanName: kecName,
      villageName: v.name,
      stageOrStatus: 'Tertahan di Outreach',
      daysStuck: (i % 5) + 3,
    }));
    setDrilldownItems(sampleItems);
    setIsDrilldownOpen(true);
  };

  if (isLoading || !completeness) {
    return (
      <div className="p-8 text-center text-gray-600 space-y-3">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs">Memuat data wilayah...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-teal-400 font-semibold uppercase tracking-wider mb-1">
            <MapPin className="w-4 h-4" />
            GEOSPATIAL & REGIONAL STRATIFICATION
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-black tracking-tight">Analisis Wilayah & Sebaran Beban</h1>
            <DocBadge code="SCR-DNK-B04" size="sm" />
          </div>
          <p className="text-xs text-gray-600 mt-1">
            Pemetaan cakupan dan disparitas tindak lanjut per kecamatan dan desa dengan proteksi privasi sel kecil (DS-OI-06).
          </p>
        </div>

        {/* View Mode & Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-slate-900 border border-slate-800 p-1 rounded-xl flex items-center gap-1">
            <button
              onClick={() => setViewMode('COVERAGE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                viewMode === 'COVERAGE'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Cakupan Skrining (%)
            </button>
            <button
              onClick={() => setViewMode('GAP')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                viewMode === 'GAP'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Kasus Tertahan (Disparitas)
            </button>
            <button
              onClick={() => setViewMode('BURDEN')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                viewMode === 'BURDEN'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Beban Penyakit Terdeteksi
            </button>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-xl text-xs text-slate-300">
            <Filter className="w-3.5 h-3.5 text-teal-400" />
            <select
              value={selectedKecamatanId}
              onChange={(e) => setSelectedKecamatanId(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">Seluruh Kecamatan</option>
              {kecamatanData.map((k) => (
                <option key={k.id} value={k.id} className="bg-slate-900">
                  {k.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <CompletenessBanner completeness={completeness} onRefresh={loadData} />

      {/* Kecamatan Matrix Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredKecamatan.map((kec) => {
          return (
            <div
              key={kec.id}
              className={`p-5 rounded-2xl bg-slate-900/90 border transition shadow-lg flex flex-col justify-between ${
                kec.isMissing
                  ? 'border-amber-500/30 bg-amber-500/5'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Header Card */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">{kec.name}</h3>
                      {kec.isRemote && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                          Pesisir Terpencil
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-teal-400" />
                      <span>{kec.pkmName}</span>
                      <span>•</span>
                      <span>Pop: {kec.population.toLocaleString('id-ID')} jiwa</span>
                    </p>
                  </div>

                  {kec.isMissing ? (
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      Belum Melapor
                    </span>
                  ) : (
                    <div className="text-right">
                      <div className="text-lg font-black text-white">
                        {viewMode === 'COVERAGE'
                          ? `${kec.coverageRate}%`
                          : viewMode === 'GAP'
                          ? `${kec.gapCount} kasus`
                          : `${kec.burdenCount} kasus`}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {viewMode === 'COVERAGE'
                          ? `${kec.screened} warga diperiksa`
                          : viewMode === 'GAP'
                          ? 'Warga tertahan'
                          : 'Risiko Terdeteksi'}
                      </div>
                    </div>
                  )}
                </div>

                {/* Village-Level Breakdown with Small-Cell Suppression */}
                <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Sebaran Desa ({kec.villages.length} Desa Binaan)</span>
                    <span className="text-[10px] text-slate-500">Proteksi Privasi DS-OI-06</span>
                  </div>

                  <div className="space-y-1.5">
                    {kec.villages.map((v) => (
                      <div
                        key={v.id}
                        onClick={() => !kec.isMissing && handleVillageDrilldown(v, kec.name)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition cursor-pointer ${
                          v.suppressed
                            ? 'bg-slate-800/20 border-slate-800/80 hover:border-slate-700'
                            : 'bg-slate-800/50 border-slate-800 hover:border-teal-500/40'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-slate-300 font-medium">{v.name}</span>
                          <span className="text-[10px] text-slate-500">
                            (Pop: {v.population})
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {v.suppressed ? (
                            <span className="text-[11px] text-slate-400 italic flex items-center gap-1">
                              <Lock className="w-3 h-3 text-amber-400" />
                              &lt; 5 (Disembunyikan)
                            </span>
                          ) : kec.isMissing ? (
                            <span className="text-slate-500 italic text-[11px]">Tidak ada data</span>
                          ) : (
                            <div className="text-right">
                              <span className="font-semibold text-white">
                                {viewMode === 'COVERAGE'
                                  ? `${v.screened} diperiksa`
                                  : viewMode === 'GAP'
                                  ? `${v.gapCount} kasus`
                                  : `${v.burdenCount} kasus`}
                              </span>
                            </div>
                          )}

                          {!kec.isMissing && user?.roleId !== 'BUPATI' && (
                            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Special Indicators for Remote & Offline */}
              {kec.hasPendingOffline && (
                <div className="mt-3 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-[11px] text-sky-300 flex items-center gap-2">
                  <Info className="w-3.5 h-3.5 shrink-0" />
                  <span>18 catatan skrining/kader tersimpan aman di perangkat offline kader desa terisolir.</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Governed Drilldown Modal */}
      <DrilldownModal
        isOpen={isDrilldownOpen}
        onClose={() => setIsDrilldownOpen(false)}
        title={drilldownTitle}
        contextDescription={drilldownDescription}
        currentUser={user}
        items={drilldownItems}
      />
    </div>
  );
};
