import React, { useState } from 'react';
import { Info, ShieldAlert, CheckCircle2, FileText, ArrowRight } from 'lucide-react';

export interface DocBadgeProps {
  code: string;
  title: string;
  phase?: string; // F1, F2, F3
  plafon?: string; // S0, S1, S2, S3, S4
  useCase?: string; // UC PSN-01, PSN-06, etc.
  description?: string;
  rules?: string[];
  className?: string;
  variant?: 'amber' | 'emerald' | 'blue' | 'purple' | 'slate';
  size?: 'xs' | 'sm' | 'md';
}

export const DocBadge: React.FC<DocBadgeProps> = ({
  code,
  title,
  phase = 'F1',
  plafon = 'S2',
  useCase,
  description,
  rules = [],
  className = '',
  variant = 'amber',
  size = 'xs',
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const variantStyles = {
    amber: 'bg-amber-950/90 text-amber-300 border-amber-700/60 hover:bg-amber-900',
    emerald: 'bg-emerald-950/90 text-emerald-300 border-emerald-700/60 hover:bg-emerald-900',
    blue: 'bg-blue-950/90 text-blue-300 border-blue-700/60 hover:bg-blue-900',
    purple: 'bg-purple-950/90 text-purple-300 border-purple-700/60 hover:bg-purple-900',
    slate: 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800',
  };

  const sizeStyles = {
    xs: 'text-[9px] px-2 py-0.5',
    sm: 'text-[10px] px-2.5 py-1',
    md: 'text-xs px-3 py-1.5',
  };

  const tooltipSummary = `[${code}] ${title}\nFase: ${phase} · Plafon: ${plafon}${useCase ? ` · ${useCase}` : ''}${description ? `\n${description}` : ''}`;

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <button
        type="button"
        title={tooltipSummary}
        onClick={(e) => {
          e.stopPropagation();
          setShowTooltip((prev) => !prev);
        }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`font-mono font-bold rounded-md border tracking-tight transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${variantStyles[variant]} ${sizeStyles[size]}`}
        aria-label={`Dokumentasi ${code}: ${title}`}
      >
        <span>{code}</span>
        <span className="opacity-60 text-[8px] font-sans font-normal border-l border-white/20 pl-1">
          {plafon}
        </span>
      </button>

      {/* Interactive Tooltip Card */}
      {showTooltip && (
        <div 
          className="absolute z-50 bottom-full mb-2 left-0 sm:left-auto w-72 sm:w-80 bg-slate-900 text-white p-3 rounded-xl shadow-2xl border border-slate-700 text-left text-xs pointer-events-none transform -translate-x-2 sm:translate-x-0 transition-all duration-150 animate-in fade-in zoom-in-95"
          role="tooltip"
        >
          <div className="flex items-center justify-between border-b border-slate-700/80 pb-2 mb-2">
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-bold text-amber-400 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-800 text-[10px]">
                {code}
              </span>
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800">
                {phase}
              </span>
              <span className="text-[10px] font-semibold text-sky-400 bg-sky-950/80 px-1.5 py-0.5 rounded border border-sky-800">
                Plafon {plafon}
              </span>
            </div>
            {useCase && (
              <span className="text-[9px] text-slate-400 font-mono">
                {useCase}
              </span>
            )}
          </div>

          <h4 className="font-bold text-slate-100 text-xs mb-1">
            {title}
          </h4>

          {description && (
            <p className="text-[11px] text-slate-300 leading-relaxed mb-2">
              {description}
            </p>
          )}

          {rules.length > 0 && (
            <div className="mt-2 pt-2 border-t border-slate-800 space-y-1">
              <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                Kaidah Mengikat SCR-CKG 03:
              </div>
              <ul className="space-y-0.5">
                {rules.map((rule, idx) => (
                  <li key={idx} className="text-[10px] text-slate-300 flex items-start gap-1 leading-snug">
                    <span className="text-amber-400 shrink-0 font-bold">•</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Pointer triangle */}
          <div className="absolute -bottom-1.5 left-4 w-3 h-3 bg-slate-900 border-r border-b border-slate-700 transform rotate-45" />
        </div>
      )}
    </div>
  );
};
