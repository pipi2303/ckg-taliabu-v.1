import React, { useState } from 'react';
import {
  TrendingDown,
  TrendingUp,
  Activity,
  Calendar,
  Clock,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Info,
  Pill,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { DocBadge } from './DocBadge';

export interface BpDataPoint {
  id: string;
  timestamp: string; // ISO or formatted date
  dateLabel: string; // e.g. "12 Okt 25"
  timeLabel: string; // e.g. "08:30 WIT"
  eventNote: string; // e.g. "Skrining Awal Posyandu"
  facility: string; // e.g. "Posyandu Desa Wayaloar"
  examiner: string; // e.g. "Kader Nurul & Bidan Fitri"
  systolic: number; // mmHg
  diastolic: number; // mmHg
  pulse?: number; // bpm
  status: 'NORMAL' | 'PRE_HTN' | 'STAGE_1' | 'STAGE_2' | 'CRITICAL';
  statusLabel: string;
  sourceType: 'PUSKESMAS' | 'POSYANDU' | 'KADER_VISIT' | 'SELF_MANDIRI';
  therapyNote: string;
  isConfirmed: boolean;
}

export const DEFAULT_BP_HISTORY: BpDataPoint[] = [
  {
    id: 'bp-1',
    timestamp: '2025-10-12T08:30:00+09:00',
    dateLabel: '12 Okt 25',
    timeLabel: '08:30 WIT',
    eventNote: 'Skrining Awal CKG (Posyandu)',
    facility: 'Posyandu Mawar, Bobong',
    examiner: 'Kader Nurlaila & Tim CKG',
    systolic: 155,
    diastolic: 98,
    pulse: 82,
    status: 'STAGE_1',
    statusLabel: 'Hipertensi Tk. 1 (Belum Konfirmasi)',
    sourceType: 'POSYANDU',
    therapyNote: 'Belum ada obat · Dirujuk untuk konfirmasi faskes',
    isConfirmed: false,
  },
  {
    id: 'bp-2',
    timestamp: '2025-10-28T09:15:00+09:00',
    dateLabel: '28 Okt 25',
    timeLabel: '09:15 WIT',
    eventNote: 'Konfirmasi Klinis & Penetapan Terapi',
    facility: 'Puskesmas Bobong (Poli Umum)',
    examiner: 'dr. Farhan & Ns. Rahma',
    systolic: 148,
    diastolic: 94,
    pulse: 78,
    status: 'STAGE_1',
    statusLabel: 'Hipertensi Terkonfirmasi Faskes',
    sourceType: 'PUSKESMAS',
    therapyNote: 'Mulai Terapi: Amlodipine 5mg 1x1 tab pagi',
    isConfirmed: true,
  },
  {
    id: 'bp-3',
    timestamp: '2025-11-18T10:00:00+09:00',
    dateLabel: '18 Nov 25',
    timeLabel: '10:00 WIT',
    eventNote: 'Evaluasi Kontrol Siklus 1',
    facility: 'Puskesmas Bobong',
    examiner: 'dr. Farhan',
    systolic: 138,
    diastolic: 88,
    pulse: 76,
    status: 'PRE_HTN',
    statusLabel: 'Penurunan Baik (Menuju Target)',
    sourceType: 'PUSKESMAS',
    therapyNote: 'Amlodipine 5mg dilanjutkan + Diet rendah garam (<1 sdt/hari)',
    isConfirmed: true,
  },
  {
    id: 'bp-4',
    timestamp: '2025-12-15T08:45:00+09:00',
    dateLabel: '15 Des 25',
    timeLabel: '08:45 WIT',
    eventNote: 'Evaluasi Kontrol Siklus 2',
    facility: 'Puskesmas Bobong',
    examiner: 'dr. Farhan',
    systolic: 132,
    diastolic: 84,
    pulse: 74,
    status: 'PRE_HTN',
    statusLabel: 'Terkontrol Terapi Obat',
    sourceType: 'PUSKESMAS',
    therapyNote: 'Amlodipine 5mg rutin 30 hari · Kepatuhan minum obat 100%',
    isConfirmed: true,
  },
  {
    id: 'bp-5',
    timestamp: '2026-01-14T09:30:00+09:00',
    dateLabel: '14 Jan 26',
    timeLabel: '09:30 WIT',
    eventNote: 'Evaluasi Kontrol Siklus 3',
    facility: 'Puskesmas Bobong',
    examiner: 'dr. Farhan',
    systolic: 128,
    diastolic: 82,
    pulse: 72,
    status: 'NORMAL',
    statusLabel: 'Terkontrol Optimal (<130/80)',
    sourceType: 'PUSKESMAS',
    therapyNote: 'Target tekanan darah tercapai stabil · Pertahankan regimen',
    isConfirmed: true,
  },
  {
    id: 'bp-6',
    timestamp: '2026-02-15T09:00:00+09:00',
    dateLabel: '15 Feb 26',
    timeLabel: '09:00 WIT',
    eventNote: 'Kunjungan Kader Rumah (Terkini)',
    facility: 'Kunjungan Rumah Kader, Bobong',
    examiner: 'Kader Nurlaila',
    systolic: 126,
    diastolic: 80,
    pulse: 70,
    status: 'NORMAL',
    statusLabel: 'Tekanan Darah Normal & Stabil',
    sourceType: 'KADER_VISIT',
    therapyNote: 'Amlodipine 5mg teratur · Tidak ada keluhan pusing/lemas',
    isConfirmed: true,
  },
];

interface BloodPressureTrendChartProps {
  customData?: BpDataPoint[];
  onScheduleClick?: () => void;
}

export const BloodPressureTrendChart: React.FC<BloodPressureTrendChartProps> = ({
  customData,
  onScheduleClick,
}) => {
  const data = customData && customData.length > 0 ? customData : (DEFAULT_BP_HISTORY.length > 0 ? DEFAULT_BP_HISTORY : []);
  const [selectedPointId, setSelectedPointId] = useState<string>(data.length > 0 ? data[data.length - 1]?.id || '' : '');
  const [filterMode, setFilterMode] = useState<'ALL' | 'SYS' | 'DIA'>('ALL');
  const [timeRange, setTimeRange] = useState<'ALL' | 'RECENT_3'>('ALL');

  const displayedData = timeRange === 'RECENT_3' ? data.slice(-3) : data;
  const selectedPoint = displayedData.find((p) => p.id === selectedPointId) || displayedData[displayedData.length - 1] || data[0] || {
    id: 'default',
    timestamp: new Date().toISOString(),
    dateLabel: 'Hari Ini',
    timeLabel: '08:00 WIT',
    eventNote: 'Pemeriksaan Rutin',
    facility: 'Puskesmas',
    examiner: 'Petugas Medis',
    systolic: 120,
    diastolic: 80,
    pulse: 75,
    status: 'NORMAL' as const,
    statusLabel: 'Normal',
    sourceType: 'PUSKESMAS' as const,
    therapyNote: '-',
    isConfirmed: true,
  };

  const firstPoint = data[0] || selectedPoint;
  const latestPoint = data[data.length - 1] || selectedPoint;
  const deltaSys = (latestPoint?.systolic || 0) - (firstPoint?.systolic || 0);
  const deltaDia = (latestPoint?.diastolic || 0) - (firstPoint?.diastolic || 0);

  // Chart dimensions & math coordinates
  const svgWidth = 520;
  const svgHeight = 260;
  const padding = { top: 35, right: 35, bottom: 45, left: 45 };

  const chartWidth = svgWidth - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;

  // Y-Scale: Min 60 mmHg to Max 180 mmHg
  const minY = 60;
  const maxY = 180;
  const getY = (val: number) => {
    const clamped = Math.max(minY, Math.min(maxY, val));
    return padding.top + chartHeight - ((clamped - minY) / (maxY - minY)) * chartHeight;
  };

  // X-Scale: Indexed points across the width
  const getX = (idx: number) => {
    if (displayedData.length <= 1) return padding.left + chartWidth / 2;
    return padding.left + (idx / (displayedData.length - 1)) * chartWidth;
  };

  // Safe reference lines
  const targetSysY = getY(130);
  const targetDiaY = getY(80);

  // SVG Line paths
  const sysPoints = displayedData.map((d, i) => `${getX(i)},${getY(d.systolic)}`).join(' ');
  const diaPoints = displayedData.map((d, i) => `${getX(i)},${getY(d.diastolic)}`).join(' ');

  // Y-axis grid markers
  const yTicks = [60, 80, 100, 120, 140, 160, 180];

  return (
    <div className="space-y-4">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white p-3 rounded-2xl border border-[#D8E5E2] shadow-2xs">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">
            Hasil Terkini
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-base sm:text-lg font-black font-mono text-black">
              {latestPoint.systolic}/{latestPoint.diastolic}
            </span>
            <span className="text-[10px] text-gray-500 font-medium">mmHg</span>
          </div>
          <div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-700 font-bold">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Target Tercapai</span>
          </div>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-[#D8E5E2] shadow-2xs">
          <span className="text-[10px] text-rose-700 font-bold uppercase tracking-wider block">
            Garis Sistole (Atas)
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-base sm:text-lg font-black font-mono text-rose-700">
              {latestPoint.systolic}
            </span>
            <span className="text-[10px] text-rose-600 font-medium">mmHg</span>
          </div>
          <div className="flex items-center gap-0.5 mt-1 text-[10px] text-emerald-700 font-bold">
            <TrendingDown className="w-3 h-3" />
            <span>{Math.abs(deltaSys)} mmHg ({deltaSys <= 0 ? 'Turun' : 'Naik'})</span>
          </div>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-[#D8E5E2] shadow-2xs">
          <span className="text-[10px] text-sky-700 font-bold uppercase tracking-wider block">
            Garis Diastole (Bawah)
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-base sm:text-lg font-black font-mono text-sky-700">
              {latestPoint.diastolic}
            </span>
            <span className="text-[10px] text-sky-600 font-medium">mmHg</span>
          </div>
          <div className="flex items-center gap-0.5 mt-1 text-[10px] text-emerald-700 font-bold">
            <TrendingDown className="w-3 h-3" />
            <span>{Math.abs(deltaDia)} mmHg ({deltaDia <= 0 ? 'Turun' : 'Naik'})</span>
          </div>
        </div>
      </div>

      {/* Main Graph Card */}
      <div className="bg-white p-4 rounded-2xl border border-[#D8E5E2] shadow-xs space-y-3.5">
        {/* Card Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <h3 className="font-extrabold text-xs sm:text-sm text-black tracking-tight">
                Garis Sistole & Diastole vs Catatan Waktu
              </h3>
            </div>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Grafik perkembangan riwayat tekanan darah dari setiap kunjungan/skrining
            </p>
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-1.5 self-start sm:self-center">
            <div className="flex rounded-lg bg-gray-100 p-0.5 text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setFilterMode('ALL')}
                className={`px-2 py-1 rounded-md transition-all ${
                  filterMode === 'ALL'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                Semua Garis
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('SYS')}
                className={`px-2 py-1 rounded-md transition-all ${
                  filterMode === 'SYS'
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'text-rose-700 hover:text-rose-900'
                }`}
              >
                Sistole
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('DIA')}
                className={`px-2 py-1 rounded-md transition-all ${
                  filterMode === 'DIA'
                    ? 'bg-sky-600 text-white shadow-2xs'
                    : 'text-sky-700 hover:text-sky-900'
                }`}
              >
                Diastole
              </button>
            </div>

            <button
              type="button"
              onClick={() => setTimeRange(timeRange === 'ALL' ? 'RECENT_3' : 'ALL')}
              className="px-2 py-1 rounded-lg border border-gray-200 text-[10px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              {timeRange === 'ALL' ? 'Semua Waktu' : '3 Terakhir'}
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] px-1 bg-stone-50/80 p-2 rounded-xl border border-stone-200/80">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-rose-500 rounded-full inline-block" />
              <span className="font-bold text-rose-950">Garis Sistole</span>
              <span className="text-[10px] text-gray-500">(Batas Normal &lt;130)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-sky-500 rounded-full inline-block" />
              <span className="font-bold text-sky-950">Garis Diastole</span>
              <span className="text-[10px] text-gray-500">(Batas Normal &lt;80)</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-emerald-800 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Zona Target Terkontrol</span>
          </div>
        </div>

        {/* Interactive SVG Chart Container */}
        <div className="relative overflow-x-auto overflow-y-hidden pt-1 pb-1">
          <div className="min-w-[480px] w-full">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto select-none"
              style={{ maxHeight: '280px' }}
            >
              <defs>
                {/* Gradient for Sistole Fill */}
                <linearGradient id="sysGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EF4444" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#EF4444" stopOpacity="0.0" />
                </linearGradient>

                {/* Gradient for Diastole Fill */}
                <linearGradient id="diaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0284C7" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#0284C7" stopOpacity="0.0" />
                </linearGradient>

                {/* Drop Shadows */}
                <filter id="nodeGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.15" />
                </filter>
              </defs>

              {/* Background Target Healthy Zone Box (Systole <= 130 and Diastole <= 80) */}
              <rect
                x={padding.left}
                y={targetSysY}
                width={chartWidth}
                height={getY(60) - targetSysY}
                fill="#10B981"
                fillOpacity="0.04"
              />

              {/* Horizontal Grid Lines */}
              {yTicks.map((val) => {
                const y = getY(val);
                const isTargetSys = val === 130;
                const isTargetDia = val === 80;

                return (
                  <g key={val}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={svgWidth - padding.right}
                      y2={y}
                      stroke={isTargetSys || isTargetDia ? '#10B981' : '#E2E8F0'}
                      strokeWidth={isTargetSys || isTargetDia ? 1.2 : 0.8}
                      strokeDasharray={isTargetSys || isTargetDia ? '4 3' : undefined}
                    />
                    <text
                      x={padding.left - 8}
                      y={y + 3.5}
                      textAnchor="end"
                      fontSize="9"
                      fontWeight={isTargetSys || isTargetDia ? 'bold' : 'normal'}
                      fill={isTargetSys || isTargetDia ? '#059669' : '#94A3B8'}
                    >
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Target Guidelines Label */}
              <text
                x={svgWidth - padding.right - 4}
                y={targetSysY - 4}
                textAnchor="end"
                fontSize="8.5"
                fontWeight="bold"
                fill="#059669"
              >
                Target Sistole &le; 130
              </text>
              <text
                x={svgWidth - padding.right - 4}
                y={targetDiaY - 4}
                textAnchor="end"
                fontSize="8.5"
                fontWeight="bold"
                fill="#0284C7"
              >
                Target Diastole &le; 80
              </text>

              {/* Vertical Time Axis Grid Lines & Catatan Waktu */}
              {displayedData.map((d, i) => {
                const x = getX(i);
                const isSelected = d.id === selectedPointId;

                return (
                  <g key={`time-${d.id}`}>
                    <line
                      x1={x}
                      y1={padding.top}
                      x2={x}
                      y2={padding.top + chartHeight}
                      stroke={isSelected ? '#0F172A' : '#F1F5F9'}
                      strokeWidth={isSelected ? 1.5 : 1}
                      strokeDasharray={isSelected ? '2 2' : undefined}
                    />
                    {/* Timestamp Tick */}
                    <text
                      x={x}
                      y={padding.top + chartHeight + 14}
                      textAnchor="middle"
                      fontSize="9"
                      fontWeight={isSelected ? 'bold' : '500'}
                      fill={isSelected ? '#00201C' : '#64748B'}
                    >
                      {d.dateLabel}
                    </text>
                    {/* Catatan Waktu Mini Note */}
                    <text
                      x={x}
                      y={padding.top + chartHeight + 25}
                      textAnchor="middle"
                      fontSize="7.5"
                      fill={isSelected ? '#0F766E' : '#94A3B8'}
                    >
                      {d.timeLabel}
                    </text>
                  </g>
                );
              })}

              {/* Connecting Vertical Bar for Selected Point */}
              {selectedPoint && (
                <line
                  x1={getX(displayedData.findIndex((p) => p.id === selectedPoint.id))}
                  y1={getY(selectedPoint.systolic)}
                  x2={getX(displayedData.findIndex((p) => p.id === selectedPoint.id))}
                  y2={getY(selectedPoint.diastolic)}
                  stroke="#64748B"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
              )}

              {/* Diastole Line & Points */}
              {(filterMode === 'ALL' || filterMode === 'DIA') && (
                <g>
                  {/* Diastole Area fill */}
                  <polygon
                    points={`${diaPoints} ${getX(displayedData.length - 1)},${getY(minY)} ${getX(0)},${getY(minY)}`}
                    fill="url(#diaGradient)"
                  />
                  {/* Diastole Polyline */}
                  <polyline
                    fill="none"
                    stroke="#0284C7"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={diaPoints}
                  />

                  {/* Diastole Data Nodes */}
                  {displayedData.map((d, i) => {
                    const x = getX(i);
                    const y = getY(d.diastolic);
                    const isSelected = d.id === selectedPointId;

                    return (
                      <g
                        key={`dia-node-${d.id}`}
                        onClick={() => setSelectedPointId(d.id)}
                        className="cursor-pointer group"
                      >
                        {/* Hover/Touch Target */}
                        <circle x={x} y={y} r="14" cx={x} cy={y} fill="transparent" />
                        <circle
                          cx={x}
                          cy={y}
                          r={isSelected ? 6 : 4.5}
                          fill="#FFFFFF"
                          stroke="#0284C7"
                          strokeWidth={isSelected ? 3 : 2}
                          filter="url(#nodeGlow)"
                          className="transition-all duration-200 group-hover:scale-125"
                        />
                        {/* Value Badge below point */}
                        <rect
                          x={x - 13}
                          y={y + 7}
                          width="26"
                          height="13"
                          rx="3"
                          fill="#F0F9FF"
                          stroke="#BAE6FD"
                          strokeWidth="0.8"
                        />
                        <text
                          x={x}
                          y={y + 16.5}
                          textAnchor="middle"
                          fontSize="8"
                          fontWeight="bold"
                          fill="#0369A1"
                        >
                          {d.diastolic}
                        </text>
                      </g>
                    );
                  })}
                </g>
              )}

              {/* Systole Line & Points */}
              {(filterMode === 'ALL' || filterMode === 'SYS') && (
                <g>
                  {/* Systole Area fill */}
                  <polygon
                    points={`${sysPoints} ${getX(displayedData.length - 1)},${getY(minY)} ${getX(0)},${getY(minY)}`}
                    fill="url(#sysGradient)"
                  />
                  {/* Systole Polyline */}
                  <polyline
                    fill="none"
                    stroke="#E11D48"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={sysPoints}
                  />

                  {/* Systole Data Nodes */}
                  {displayedData.map((d, i) => {
                    const x = getX(i);
                    const y = getY(d.systolic);
                    const isSelected = d.id === selectedPointId;

                    return (
                      <g
                        key={`sys-node-${d.id}`}
                        onClick={() => setSelectedPointId(d.id)}
                        className="cursor-pointer group"
                      >
                        {/* Hover/Touch Target */}
                        <circle x={x} y={y} r="14" cx={x} cy={y} fill="transparent" />
                        <circle
                          cx={x}
                          cy={y}
                          r={isSelected ? 6.5 : 5}
                          fill="#FFFFFF"
                          stroke="#E11D48"
                          strokeWidth={isSelected ? 3.5 : 2.2}
                          filter="url(#nodeGlow)"
                          className="transition-all duration-200 group-hover:scale-125"
                        />
                        {/* Value Badge above point */}
                        <rect
                          x={x - 14}
                          y={y - 19}
                          width="28"
                          height="14"
                          rx="3"
                          fill="#FFF1F2"
                          stroke="#FECDD3"
                          strokeWidth="0.8"
                        />
                        <text
                          x={x}
                          y={y - 9}
                          textAnchor="middle"
                          fontSize="8.5"
                          fontWeight="bold"
                          fill="#BE123C"
                        >
                          {d.systolic}
                        </text>
                      </g>
                    );
                  })}
                </g>
              )}
            </svg>
          </div>
        </div>

        {/* Selected Point Detail Card (Interactive on tap/click) */}
        {selectedPoint && (
          <div className="p-3.5 bg-[#F8FBFA] rounded-2xl border border-teal-200/80 shadow-2xs space-y-2.5 animate-in fade-in duration-200">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-black">
                  <Calendar className="w-3.5 h-3.5 text-teal-700" />
                  <span>{selectedPoint.dateLabel} ({selectedPoint.timeLabel})</span>
                  {selectedPoint.isConfirmed ? (
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                      Faskes Terkonfirmasi
                    </span>
                  ) : (
                    <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">
                      Skrining Awal
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-gray-600 mt-0.5 flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-gray-500" />
                  <span>{selectedPoint.facility} · {selectedPoint.examiner}</span>
                </div>
              </div>

              {/* Point Measurement Big Display */}
              <div className="text-right">
                <div className="text-sm sm:text-base font-black font-mono text-black">
                  <span className="text-rose-700">{selectedPoint.systolic}</span>
                  <span className="text-gray-400 font-light mx-0.5">/</span>
                  <span className="text-sky-700">{selectedPoint.diastolic}</span>
                  <span className="text-[10px] text-gray-500 font-normal ml-1">mmHg</span>
                </div>
                <span className="text-[9.5px] font-semibold text-teal-800">
                  {selectedPoint.statusLabel}
                </span>
              </div>
            </div>

            {/* Note & Therapy */}
            <div className="p-2 bg-white rounded-xl border border-stone-200 text-[11px] space-y-1">
              <div className="flex items-start gap-1.5 text-stone-700">
                <Info className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                <span><strong>Catatan Kegiatan:</strong> {selectedPoint.eventNote}</span>
              </div>
              <div className="flex items-start gap-1.5 text-stone-800">
                <Pill className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                <span><strong>Regimen Terapi:</strong> {selectedPoint.therapyNote}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* History Log Table: Catatan Waktu & Perkembangan Terapi */}
      <div className="bg-white p-4 rounded-2xl border border-[#D8E5E2] shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
          <span className="text-xs font-bold text-black flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-teal-700" />
            Riwayat Catatan Waktu Pemeriksaan Tensi
          </span>
          <span className="text-[10px] text-gray-500 font-mono">
            {data.length} Kunjungan Tercatat
          </span>
        </div>

        <div className="divide-y divide-gray-100">
          {data.map((item, idx) => {
            const isSelected = item.id === selectedPointId;
            const isLatest = idx === data.length - 1;

            return (
              <div
                key={item.id}
                onClick={() => setSelectedPointId(item.id)}
                className={`py-2.5 px-2 rounded-xl transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                  isSelected
                    ? 'bg-teal-50/70 border border-teal-200'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${
                        isLatest
                          ? 'bg-emerald-500 ring-4 ring-emerald-100'
                          : 'bg-teal-700'
                      }`}
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-black">
                        {item.dateLabel} ({item.timeLabel})
                      </span>
                      {isLatest && (
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                          Terkini
                        </span>
                      )}
                      <span className="text-[10px] text-gray-500">· {item.facility}</span>
                    </div>

                    <p className="text-[11px] text-gray-600 mt-0.5 line-clamp-1">
                      {item.therapyNote}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 self-end sm:self-center shrink-0">
                  <div className="text-right">
                    <span className="text-xs sm:text-sm font-black font-mono">
                      <span className="text-rose-700">{item.systolic}</span>
                      <span className="text-gray-400">/</span>
                      <span className="text-sky-700">{item.diastolic}</span>
                      <span className="text-[9px] text-gray-500 font-normal ml-0.5">mmHg</span>
                    </span>
                  </div>

                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Therapy Notice Footer */}
        <div className="p-3 bg-purple-50/80 rounded-xl text-[11px] text-purple-950 leading-relaxed border border-purple-200 flex items-start gap-2">
          <Pill className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
          <div>
            <strong>Catatan Terapi Berjalan Bersama Tren:</strong> Mengonsumsi Amlodipine 5mg teratur setiap pagi. Evaluasi klinis menunjukkan respon hemodinamik sangat baik dengan penurunan stabil dari skrining awal (155/98 &rarr; 126/80 mmHg).
          </div>
        </div>
      </div>
    </div>
  );
};
