import React, { useState, useEffect } from 'react';
import {
  Activity,
  Layers,
  ShieldCheck,
  Lock,
  Info,
  HelpCircle,
  TrendingUp,
  FileText,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { DocBadge } from '../../../components/common/DocBadge';
import { CompletenessBanner } from '../components/CompletenessBanner';
import { MetricDefinitionModal } from '../components/MetricDefinitionModal';
import { ImpactLevelAnalyticsCharts } from '../components/ImpactLevelAnalyticsCharts';
import {
  populationQualificationService,
  CountyCompletenessSummary,
} from '../../../services/populationQualificationService';
import { impactIndexService, ImpactIndexSummary } from '../../../services/impactIndexService';
import { MetricDefinition } from '../../../types';
import { populationMetricDefinitionService } from '../../../services/populationMetricDefinitionService';

export const ImpactIndexPage: React.FC = () => {
  const { user } = useAuth();
  const [completeness, setCompleteness] = useState<CountyCompletenessSummary | null>(null);
  const [impact, setImpact] = useState<ImpactIndexSummary | null>(null);
  const [selectedDefinition, setSelectedDefinition] = useState<MetricDefinition | undefined>(undefined);
  const [isDefOpen, setIsDefOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [compData, impactData] = await Promise.all([
        populationQualificationService.getCountyCompleteness(),
        impactIndexService.getImpactIndex(),
      ]);
      setCompleteness(compData);
      setImpact(impactData);
    } catch (err) {
      console.error('Failed to load impact index:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openDefinition = async (metricCode: string) => {
    const def = await populationMetricDefinitionService.getDefinition(metricCode);
    setSelectedDefinition(def);
    setIsDefOpen(true);
  };

  if (isLoading || !completeness || !impact) {
    return (
      <div className="p-8 text-center text-gray-600 space-y-3">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs">Memuat CKG Impact Index...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-teal-400 font-semibold uppercase tracking-wider mb-1">
          <Activity className="w-4 h-4" />
          EXECUTIVE DECISION FRAMEWORK
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-black tracking-tight">CKG Impact Index</h1>
          <DocBadge code="SCR-DNK-B03" size="sm" />
        </div>
        <p className="text-xs text-gray-600 mt-1">
          Tiga tingkatan evaluasi dampak program: dari jangkauan skrining (Coverage), kepatuhan tindak lanjut (Continuity), hingga hasil pengendalian klinis (Outcome).
        </p>
      </div>

      <CompletenessBanner completeness={completeness} onRefresh={loadData} />

      {/* Recharts Analytics Charts for Level 1, 2, and 3 */}
      <ImpactLevelAnalyticsCharts impact={impact} />

      {/* Architectural Explanations of the 3 Levels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Level 1 Explanation */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">Level 1: Coverage</span>
            <button
              onClick={() => openDefinition('IMPACT_LVL_1_COVERAGE')}
              className="text-slate-400 hover:text-white transition"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
          <h4 className="text-sm font-bold text-white">Jangkauan Skrining Populasi</h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Mengukur seberapa besar porsi warga terdaftar di Pulau Taliabu yang telah tersentuh pemeriksaan awal skrining CKG secara menyeluruh.
          </p>
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div>• Pembilang: Warga unik dengan skrining valid lengkap</div>
            <div>• Penyebut: Populasi sasaran kabupaten terdaftar</div>
            <div>• Sumber: CKG Unified Ingestion Engine</div>
          </div>
        </div>

        {/* Level 2 Explanation */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">Level 2: Continuity</span>
            <button
              onClick={() => openDefinition('IMPACT_LVL_2_CONTINUITY')}
              className="text-slate-400 hover:text-white transition"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
          <h4 className="text-sm font-bold text-white">Kontinuitas Tindak Lanjut Klinis</h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Mengukur apakah temuan abnormal (Risiko Kuning, Merah, Kritis) benar-benar sampai ke layanan pemeriksaan klinis FKTP dan tidak terhenti di lapangan.
          </p>
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div>• Pembilang: Warga berisiko yang hadir di Puskesmas</div>
            <div>• Penyebut: Total temuan skrining berisiko terstratifikasi</div>
            <div>• Sumber: Clinical Follow-Up & Care Task Module</div>
          </div>
        </div>

        {/* Level 3 Explanation & Lock Notice */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Level 3: Outcome</span>
            <button
              onClick={() => openDefinition('IMPACT_LVL_3_OUTCOME')}
              className="text-slate-400 hover:text-white transition"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
          <h4 className="text-sm font-bold text-white">Pengendalian Hasil Klinis</h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Tingkat tertinggi: evaluasi apakah terapi dan pemantauan menghasilkan tekanan darah & gula darah terkendali sesuai kriteria klinis terverifikasi.
          </p>
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 space-y-1">
            <div className="font-semibold flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Governance Lock OI-08 Aktif
            </div>
            <p className="text-amber-200/80 leading-tight">
              Belum dinilai otomatis demi menjamin tidak ada angka semu sebelum aturan klinis CR-OC disahkan secara formal oleh Komite Medis Dinkes.
            </p>
          </div>
        </div>
      </div>

      {/* Definition Modal */}
      <MetricDefinitionModal
        isOpen={isDefOpen}
        onClose={() => setIsDefOpen(false)}
        definition={selectedDefinition}
      />
    </div>
  );
};
