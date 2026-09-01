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
    <div className="p-5 rounded-2xl bg-[#faf9f6] border border-stone-200/90 hover:border-stone-300 transition-all flex flex-col justify-between shadow-2xs">
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            {levelBadge && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200 uppercase tracking-wider">
                {levelBadge}
              </span>
            )}
            <span className="text-xs font-semibold text-stone-800 line-clamp-1">{metric.label}</span>
          </div>

          <button
            onClick={handleOpenDefinition}
            title="Lihat Definisi & Pembilang/Penyebut"
            className="p-1 rounded-lg text-stone-400 hover:text-teal-700 hover:bg-stone-100 transition shrink-0 cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>

        {/* Big Number / Value */}
        <div className="my-2">
          {isNotAssessable ? (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
              <div className="flex items-center gap-2 text-amber-800 font-semibold text-sm mb-1">
                <Lock className="w-4 h-4" />
                Belum Dapat Dinilai
              </div>
              <p className="text-xs text-amber-900 leading-snug">
                Menunggu pengesahan kriteria evaluasi klinis CR-OC (Governance Lock OI-08).
              </p>
            </div>
          ) : isSuppressed ? (
            <div className="p-3 rounded-xl bg-stone-100 border border-stone-200 text-stone-600">
              <span className="text-sm font-semibold text-stone-800">&lt; 5 (Disembunyikan)</span>
              <p className="text-[11px] mt-0.5 text-stone-500">{metric.suppressionReason || 'Perlindungan Privasi DS-OI-06'}</p>
            </div>
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-black tracking-tight">
                {metric.percentage !== undefined ? `${metric.percentage}%` : metric.value ?? '—'}
              </span>
              {metric.numerator !== undefined && metric.denominator !== undefined && (
                <span className="text-xs text-stone-500 font-medium">
                  ({metric.numerator.toLocaleString('id-ID')} / {metric.denominator.toLocaleString('id-ID')} sasaran)
                </span>
              )}
            </div>
          )}
        </div>

        {/* Qualification & Caveat messages */}
        {metric.qualificationMessages.length > 0 && (
          <div className="mt-3 pt-3 border-t border-stone-200 text-[11px] text-stone-600 space-y-1">
            {metric.qualificationMessages.map((msg, idx) => (
              <p key={idx} className="leading-relaxed flex items-start gap-1.5">
                <span className="text-stone-400 shrink-0">•</span>
                <span>{msg}</span>
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info & Action */}
      <div className="mt-4 pt-3 border-t border-stone-200 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1.5 text-stone-400 font-mono">
          {metric.definitionVersion && <span>{metric.definitionVersion}</span>}
          {metric.completeness && metric.completeness !== 'COMPLETE' && (
            <>
              {metric.definitionVersion && <span>•</span>}
              <span className={isPartial ? 'text-amber-700 font-sans' : 'text-stone-600 font-sans'}>
                {metric.completeness}
              </span>
            </>
          )}
        </div>

        {canDrilldown && onDrilldown && !isNotAssessable && (
          <button
            onClick={onDrilldown}
            className="flex items-center gap-1 text-teal-700 hover:text-teal-900 font-medium transition cursor-pointer"
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
