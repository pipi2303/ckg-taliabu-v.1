import React, { useState } from 'react';
import { TrendingUp, FileText, Download } from 'lucide-react';
import { PeriodComparisonPage } from './PeriodComparisonPage';
import { ReportExportPage } from './ReportExportPage';

interface TrendReportUnifiedPageProps {
  initialTab?: 'tren' | 'laporan';
}

export const TrendReportUnifiedPage: React.FC<TrendReportUnifiedPageProps> = ({
  initialTab = 'tren',
}) => {
  const [activeTab, setActiveTab] = useState<'tren' | 'laporan'>(initialTab);

  return (
    <div className="space-y-6">
      {/* Top Banner & Tab Navigation Bar */}
      <div className="bg-white dark:bg-slate-900 border border-[#D8E5E2] dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-xs">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3.5">
          {/* 1-Line Text Section */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 text-xs leading-none">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#00201C] dark:text-emerald-400 shrink-0">
                Analisis Tren &amp; Pelaporan
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 shrink-0">
                Modul Terpadu
              </span>
              <span className="text-slate-300 dark:text-slate-600 shrink-0">•</span>
              <h1 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white shrink-0">
                Tren Strategis &amp; Pelaporan Eksekutif
              </h1>
              <span className="text-slate-300 dark:text-slate-600 shrink-0 hidden md:inline">—</span>
              <p className="text-xs text-slate-600 dark:text-slate-400 truncate max-w-xl inline-block" title="Perbandingan tren indikator kesehatan dari waktu ke waktu serta penerbitan laporan resmi eksekutif format PDF dan Excel untuk Bupati & Kemenkes RI.">
                Perbandingan tren indikator kesehatan dari waktu ke waktu serta penerbitan laporan resmi eksekutif format PDF dan Excel untuk Bupati &amp; Kemenkes RI.
              </p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center bg-[#F0F5F4] dark:bg-slate-800 p-1.5 rounded-xl border border-[#D8E5E2] dark:border-slate-700 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('tren')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'tren'
                  ? 'bg-[#00201C] text-white shadow-2xs'
                  : 'text-[#60716D] dark:text-slate-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Perbandingan Tren Periode
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('laporan')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'laporan'
                  ? 'bg-[#00201C] text-white shadow-2xs'
                  : 'text-[#60716D] dark:text-slate-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              Laporan Resmi & Ekspor (PDF/Excel)
            </button>
          </div>
        </div>
      </div>

      {/* Tab Contents */}
      <div>
        {activeTab === 'tren' ? <PeriodComparisonPage /> : <ReportExportPage />}
      </div>
    </div>
  );
};
