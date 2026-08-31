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

      {/* Definition Modal */}
      <MetricDefinitionModal
        isOpen={isDefOpen}
        onClose={() => setIsDefOpen(false)}
        definition={selectedDefinition}
      />
    </div>
  );
};
