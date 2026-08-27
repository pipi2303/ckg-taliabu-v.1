import React, { useState } from 'react';
import { HelpCircle, AlertTriangle, ShieldCheck, Lock, ChevronRight } from 'lucide-react';
import { QualifiedMetric, MetricDefinition } from '../../../types';
import { MetricDefinitionModal } from './MetricDefinitionModal';
import { populationMetricDefinitionService } from '../../../services/populationMetricDefinitionService';

interface QualifiedMetricCardProps {
  metric: QualifiedMetric;
  levelBadge?: string;
  onDrilldown?: () => void;
  canDrilldown?: boolean;
}

export const QualifiedMetricCard: React.FC<QualifiedMetricCardProps> = ({
  metric,
  levelBadge,
  onDrilldown,
  canDrilldown = false,
}) => {
  const [definition, setDefinition] = useState<MetricDefinition | undefined>(undefined);
  const [isDefOpen, setIsDefOpen] = useState(false);

  const handleOpenDefinition = async () => {
    const def = await populationMetricDefinitionService.getDefinition(metric.metricCode);
    setDefinition(def);
    setIsDefOpen(true);
  };

  const isNotAssessable = metric.completeness === 'NOT_ASSESSABLE';
  const isPartial = metric.completeness === 'PARTIAL';
  const isSuppressed = metric.suppressed;

  return (
    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col justify-between shadow-lg">
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            {levelBadge && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-400 border border-teal-500/20 uppercase tracking-wider">
                {levelBadge}
              </span>
            )}
            <span className="text-xs font-semibold text-slate-200 line-clamp-1">{metric.label}</span>
          </div>

          <button
            onClick={handleOpenDefinition}
            title="Lihat Definisi & Pembilang/Penyebut"
            className="p-1 rounded-lg text-slate-400 hover:text-teal-400 hover:bg-slate-800 transition shrink-0"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>

        {/* Big Number / Value */}
        <div className="my-2">
          {isNotAssessable ? (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm mb-1">
                <Lock className="w-4 h-4" />
                Belum Dapat Dinilai
              </div>
              <p className="text-xs text-amber-200/80 leading-snug">
                Menunggu pengesahan kriteria evaluasi klinis CR-OC (Governance Lock OI-08).
              </p>
            </div>
          ) : isSuppressed ? (
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-400">
              <span className="text-sm font-semibold text-slate-300">&lt; 5 (Disembunyikan)</span>
              <p className="text-[11px] mt-0.5 text-slate-400">{metric.suppressionReason || 'Perlindungan Privasi DS-OI-06'}</p>
            </div>
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white tracking-tight">
                {metric.percentage !== undefined ? `${metric.percentage}%` : metric.value ?? '—'}
              </span>
              {metric.numerator !== undefined && metric.denominator !== undefined && (
                <span className="text-xs text-slate-400 font-medium">
                  ({metric.numerator.toLocaleString('id-ID')} / {metric.denominator.toLocaleString('id-ID')} sasaran)
                </span>
              )}
            </div>
          )}
        </div>

        {/* Qualification & Caveat messages */}
        {metric.qualificationMessages.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1">
            {metric.qualificationMessages.map((msg, idx) => (
              <p key={idx} className="leading-relaxed flex items-start gap-1.5">
                <span className="text-slate-500 shrink-0">•</span>
                <span>{msg}</span>
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info & Action */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1.5 text-slate-500 font-mono">
          <span>{metric.definitionVersion}</span>
          <span>•</span>
          <span className={isPartial ? 'text-amber-400 font-sans' : 'text-slate-400 font-sans'}>
            {metric.completeness}
          </span>
        </div>

        {canDrilldown && onDrilldown && !isNotAssessable && (
          <button
            onClick={onDrilldown}
            className="flex items-center gap-1 text-teal-400 hover:text-teal-300 font-medium transition"
          >
            <span>Telusuri Data</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Modal Definisi */}
      <MetricDefinitionModal
        isOpen={isDefOpen}
        onClose={() => setIsDefOpen(false)}
        definition={definition}
      />
    </div>
  );
};
