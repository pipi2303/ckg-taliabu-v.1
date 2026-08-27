import React from 'react';
import { X, BookOpen, Layers, CheckCircle, Ban, Database, GitCommit } from 'lucide-react';
import { MetricDefinition } from '../../../types';

interface MetricDefinitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  definition?: MetricDefinition;
}

export const MetricDefinitionModal: React.FC<MetricDefinitionModalProps> = ({
  isOpen,
  onClose,
  definition,
}) => {
  if (!isOpen || !definition) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">{definition.label}</h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">Kode: {definition.metricCode}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm text-slate-300">
          {/* Formula */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-2">
                <Layers className="w-4 h-4" />
                PEMBILANG (NUMERATOR)
              </div>
              <p className="text-xs leading-relaxed text-slate-300">{definition.numeratorDefinition}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 mb-2">
                <Layers className="w-4 h-4" />
                PENYEBUT (DENOMINATOR)
              </div>
              <p className="text-xs leading-relaxed text-slate-300">{definition.denominatorDefinition}</p>
            </div>
          </div>

          {/* Inclusions & Exclusions */}
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300 mb-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                Kriteria Inklusi
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{definition.inclusionCriteria}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800">
              <div className="flex items-center gap-2 text-xs font-semibold text-rose-300 mb-1.5">
                <Ban className="w-4 h-4 text-rose-400" />
                Kriteria Eksklusi
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{definition.exclusionCriteria}</p>
            </div>
          </div>

          {/* Data Source & Version */}
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col md:flex-row justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-400">
              <Database className="w-4 h-4 text-teal-400" />
              <span>Sumber Data: <strong className="text-slate-200">{definition.dataSource}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-slate-400 font-mono">
              <GitCommit className="w-4 h-4 text-amber-400" />
              <span>Versi Definisi: <strong className="text-amber-300">{definition.version}</strong></span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition border border-slate-700"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
