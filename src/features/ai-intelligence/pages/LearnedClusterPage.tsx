import React from 'react';
import {
  Layers,
  Sparkles,
  Users,
  MapPin,
  Compass,
  ShieldCheck,
  Info,
  ArrowRight,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { learnedClusterService } from '../../../services/learnedClusterService';

export const LearnedClusterPage: React.FC = () => {
  const clusters = learnedClusterService.getClusters();

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-[#faf9f6] text-black p-6 rounded-2xl border border-stone-200/90 shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-800 uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 text-indigo-700" />
              LEARNED POPULATION PATTERN CLUSTERS (PA-10)
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-black">
              Klaster Pola Populasi & Dinamika Perawatan
            </h1>
            <p className="text-xs text-stone-600 mt-1 max-w-3xl leading-relaxed">
              Pengelompokan pola perilaku kepatuhan dan kendala struktural faskes berbasis unsupervised learning
              untuk merancang intervensi kesehatan masyarakat yang tepat sasaran di Kabupaten Pulau Taliabu.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-900 text-xs font-bold shrink-0 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-indigo-700" />
            Small-Cell Privacy Protected
          </div>
        </div>
      </div>

      {/* Distinction Callout: Learned AI vs Deterministic CRS */}
      <div className="p-4 bg-[#faf9f6] border border-indigo-200 rounded-xl text-xs space-y-1.5 shadow-xs">
        <div className="flex items-center gap-2 font-bold text-indigo-900">
          <Info className="w-4 h-4 text-indigo-700 shrink-0" />
          Perbedaan Klaster AI (PA-10) vs Klaster Deterministik CRS (MVP 3)
        </div>
        <p className="text-stone-600 leading-relaxed">
          • <strong>Klaster Deterministik CRS (Kemenkes):</strong> Ditentukan langsung oleh aturan klinis baku (skrining tensi, gula darah, profil risiko kardiovaskular).<br />
          • <strong>Klaster Pola AI (PA-10):</strong> Mengelompokkan faktor kontekstual non-klinis (kendala musim gelombang maritim, ketiadaan pendamping minum obat, riwayat kekosongan obat) untuk memandu strategi operasional lapangan.
        </p>
      </div>

      {/* Clusters List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {clusters.map((cluster) => (
          <div
            key={cluster.id}
            className="bg-[#faf9f6] border border-stone-200/90 rounded-2xl p-5 space-y-4 flex flex-col justify-between hover:border-indigo-300 transition shadow-xs"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                <span className="font-mono text-[10px] text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 font-bold">
                  {cluster.clusterCode}
                </span>
                <span className="text-xs font-bold text-black flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-700" />
                  {cluster.citizenCount} Warga
                </span>
              </div>

              <h2 className="text-sm font-bold text-black">{cluster.clusterLabel}</h2>
              <p className="text-xs text-stone-600 leading-relaxed">{cluster.description}</p>

              {/* Risk Drivers */}
              <div className="space-y-1.5 pt-2">
                <div className="text-[11px] font-bold text-stone-700 uppercase tracking-wider">
                  Karakteristik Dominan:
                </div>
                {cluster.primaryRiskDrivers.map((driver, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-white text-[11px] text-stone-700 border border-stone-200 shadow-2xs">
                    • {driver}
                  </div>
                ))}
              </div>

              {/* Regional Distribution */}
              <div className="space-y-1.5 pt-2">
                <div className="text-[11px] font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-indigo-700" />
                  Sebaran Wilayah Terbanyak:
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-center">
                  {Object.entries(cluster.regionDistribution).map(([reg, count]) => (
                    <div key={reg} className="p-1.5 bg-white border border-stone-200 rounded-lg shadow-2xs">
                      <div className="text-xs font-bold text-black">{count}</div>
                      <div className="text-[9px] text-stone-500 truncate font-medium">{reg}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Suggested Public Health Action Pathway */}
            <div className="pt-3 border-t border-stone-200 space-y-1">
              <div className="text-[10px] text-indigo-900 uppercase font-bold">
                Rekomendasi Kebijakan Faskes / Dinkes:
              </div>
              <div className="p-2.5 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-950 font-medium">
                {cluster.suggestedOperationalPathway}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
