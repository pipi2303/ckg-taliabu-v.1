import React, { useState, useMemo, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Anchor,
  CheckCircle2,
  ChevronRight,
  Compass,
  Eye,
  Filter,
  HeartPulse,
  Info,
  Layers,
  MapPin,
  Maximize2,
  MessageSquare,
  Minus,
  Navigation,
  Phone,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  TrendingUp,
  Truck,
  User,
  UserCheck,
  UserPlus,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { CareTask, User as AppUser } from '../../../types';

export interface PetaDistribusiKunjunganPustuProps {
  tasks: CareTask[];
  kaderList: AppUser[];
  villageName: string;
  assignedDesaList: string[];
  onSelectTask?: (task: CareTask) => void;
  onQuickAssign?: (task: CareTask) => void;
  onCompleteTask?: (task: CareTask) => void;
}

export interface SpatialCitizenPoint {
  id: string;
  taskId: string;
  citizenName: string;
  citizenNik: string;
  citizenPhone?: string;
  villageName: string;
  dusun: string;
  address: string;
  age: number;
  condition: string;
  systolic: number;
  diastolic: number;
  gds: number;
  priorityScore: number;
  isCritical: boolean;
  status: 'PENDING' | 'ASSIGNED' | 'COMPLETED';
  assignedKader?: string;
  accessMode: 'JALAN_KAKI' | 'MOTOR' | 'PERAHU';
  distanceMeters: number;
  travelMinutes: number;
  longitude: number;
  latitude: number;
  x: number; // Projected SVG coordinate (0 to 800)
  y: number; // Projected SVG coordinate (0 to 500)
  taskRef: CareTask;
}

// Center Coordinates of Pustu Wayo (Taliabu Barat)
const PUSTU_BASE = {
  name: 'Pustu Induk Desa Wayo',
  lon: 124.3980,
  lat: -1.8245,
  x: 290,
  y: 270,
};

// Sub-regions / Dusun anchor coordinates for geographic clustering
const DUSUN_ANCHORS: Record<string, { x: number; y: number; lon: number; lat: number; mode: 'JALAN_KAKI' | 'MOTOR' | 'PERAHU'; baseDistance: number }> = {
  'Dusun 1': { x: 230, y: 310, lon: 124.3920, lat: -1.8280, mode: 'JALAN_KAKI', baseDistance: 450 },
  'Dusun 2': { x: 440, y: 170, lon: 124.4120, lat: -1.8150, mode: 'MOTOR', baseDistance: 1300 },
  'Dusun 3': { x: 190, y: 390, lon: 124.3880, lat: -1.8360, mode: 'JALAN_KAKI', baseDistance: 850 },
  'Dusun Perkebunan': { x: 510, y: 120, lon: 124.4190, lat: -1.8100, mode: 'MOTOR', baseDistance: 1800 },
  'Ratahaya Pesisir': { x: 670, y: 360, lon: 124.4350, lat: -1.8330, mode: 'PERAHU', baseDistance: 2900 },
  'Ratahaya Perbukitan': { x: 720, y: 210, lon: 124.4400, lat: -1.8190, mode: 'MOTOR', baseDistance: 3400 },
  'Default': { x: 360, y: 250, lon: 124.4050, lat: -1.8220, mode: 'MOTOR', baseDistance: 1000 },
};

/**
 * Deterministic pseudo-random offset generator from string hash
 */
function getHashOffset(str: string, maxOffset: number): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const normalized = (Math.abs(hash) % 1000) / 1000;
  return (normalized - 0.5) * 2 * maxOffset;
}

export const PetaDistribusiKunjunganPustu: React.FC<PetaDistribusiKunjunganPustuProps> = ({
  tasks,
  kaderList,
  villageName,
  assignedDesaList,
  onSelectTask,
  onQuickAssign,
  onCompleteTask,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const zoomGroupRef = useRef<SVGGElement | null>(null);

  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);
  const [filterDusun, setFilterDusun] = useState<string>('ALL');
  const [filterUrgency, setFilterUrgency] = useState<'ALL' | 'CRITICAL' | 'HIGH'>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'ASSIGNED' | 'COMPLETED'>('ALL');
  const [filterTransport, setFilterTransport] = useState<'ALL' | 'PERAHU' | 'DARAT'>('ALL');
  const [showDensityHeatmap, setShowDensityHeatmap] = useState<boolean>(true);
  const [showRouteAnimation, setShowRouteAnimation] = useState<boolean>(true);
  const [zoomTransform, setZoomTransform] = useState<{ k: number; x: number; y: number }>({ k: 1, x: 0, y: 0 });

  // D3 Projection Scales to convert lon/lat to SVG pixel canvas coordinates (800x500)
  const projectionScaleX = useMemo(() => {
    return d3.scaleLinear()
      .domain([124.3700, 124.4600])
      .range([60, 760]);
  }, []);

  const projectionScaleY = useMemo(() => {
    return d3.scaleLinear()
      .domain([-1.8500, -1.8000])
      .range([460, 40]);
  }, []);

  // Dynamically compute spatial coordinates for all tasks
  // Markers for COMPLETED tasks shift dynamically to the Pustu Induk Completed Hub
  const spatialPoints = useMemo<SpatialCitizenPoint[]>(() => {
    if (!tasks || tasks.length === 0) return [];

    return tasks.map((task, idx) => {
      const citizenName = task.citizenName || 'Warga Sasaran';
      const citizenNik = task.citizenNik || `820701000000000${idx + 1}`;
      const address = (task as any).address || (task as any).dusun || `RT 0${(idx % 4) + 1}, ${villageName}`;
      const isCompleted = task.status === 'CLOSED';
      
      // Determine dusun and anchor
      let dusunName = 'Dusun 1 - Pesisir Wayo';
      let anchor = DUSUN_ANCHORS['Dusun 1'];

      if (address.toLowerCase().includes('ratahaya') || (task as any).villageName?.toLowerCase().includes('ratahaya')) {
        if (idx % 2 === 0) {
          dusunName = 'Dusun Nelayan Ratahaya (Pesisir)';
          anchor = DUSUN_ANCHORS['Ratahaya Pesisir'];
        } else {
          dusunName = 'Dusun Perbukitan Ratahaya';
          anchor = DUSUN_ANCHORS['Ratahaya Perbukitan'];
        }
      } else if (address.toLowerCase().includes('cengkeh') || address.toLowerCase().includes('kebun') || idx % 4 === 1) {
        dusunName = 'Dusun 2 - Perkebunan Cengkeh';
        anchor = DUSUN_ANCHORS['Dusun 2'];
      } else if (address.toLowerCase().includes('muara') || idx % 4 === 2) {
        dusunName = 'Dusun 3 - Muara Wayo';
        anchor = DUSUN_ANCHORS['Dusun 3'];
      }

      // Add deterministic jitter around the anchor
      const offsetX = getHashOffset(`${citizenNik}-x`, 32);
      const offsetY = getHashOffset(`${citizenNik}-y`, 28);

      // If completed, coordinates update automatically to the Pustu hub completed ring
      let targetX = Math.max(80, Math.min(740, anchor.x + offsetX));
      let targetY = Math.max(50, Math.min(450, anchor.y + offsetY));

      if (isCompleted) {
        // Shift coordinate towards completed cluster near Pustu Induk
        const completedAngle = (idx * 0.8) % (2 * Math.PI);
        targetX = PUSTU_BASE.x + Math.cos(completedAngle) * 38;
        targetY = PUSTU_BASE.y + Math.sin(completedAngle) * 38;
      }

      // Calculate approximate GPS coords
      const lon = projectionScaleX.invert(targetX);
      const lat = projectionScaleY.invert(targetY);

      // Distance calculation from Pustu Base in meters
      const dx = targetX - PUSTU_BASE.x;
      const dy = targetY - PUSTU_BASE.y;
      const pixelDistance = Math.sqrt(dx * dx + dy * dy);
      const calculatedDistance = isCompleted ? 0 : Math.round(anchor.baseDistance + pixelDistance * 4.5);
      
      // Transport mode
      const accessMode = anchor.mode;
      const travelMinutes = isCompleted 
        ? 0
        : accessMode === 'PERAHU' 
        ? Math.round(calculatedDistance / 180 + 5)
        : accessMode === 'MOTOR'
        ? Math.round(calculatedDistance / 350 + 2)
        : Math.round(calculatedDistance / 75 + 1);

      // Clinical vitals estimation from task criteria or priority
      const isCriticalPriority = task.priority === 'CRITICAL' || (task as any).urgency === 'URGENT' || task.priorityScore >= 85;
      const systolic = isCriticalPriority ? 165 + (idx % 20) : 135 + (idx % 25);
      const diastolic = isCriticalPriority ? 100 + (idx % 12) : 85 + (idx % 10);
      const gds = isCriticalPriority && idx % 2 === 0 ? 240 + (idx % 80) : 120 + (idx % 60);

      // Status mapping
      const status: 'PENDING' | 'ASSIGNED' | 'COMPLETED' = 
        task.status === 'CLOSED'
          ? 'COMPLETED'
          : task.assignedToUserId
          ? 'ASSIGNED'
          : 'PENDING';

      const condition = 
        task.actionText || 
        task.completionCriteria || 
        (isCriticalPriority ? 'Hipertensi Berat & Evaluasi Drop-out Obat' : 'Kunjungan Pemantauan Rutin Posyandu');

      return {
        id: `spatial-${task.id}`,
        taskId: task.id,
        citizenName,
        citizenNik,
        citizenPhone: (task as any).citizenPhone || `0812${Math.floor(10000000 + Math.random() * 89999999)}`,
        villageName: (task as any).villageName || (address.includes('Ratahaya') ? 'Desa Ratahaya' : 'Desa Wayo'),
        dusun: dusunName,
        address,
        age: 45 + (idx % 35),
        condition,
        systolic,
        diastolic,
        gds,
        priorityScore: task.priorityScore || (isCriticalPriority ? 90 : 65),
        isCritical: isCriticalPriority,
        status,
        assignedKader: task.assignedToUserName,
        accessMode,
        distanceMeters: calculatedDistance,
        travelMinutes,
        longitude: lon,
        latitude: lat,
        x: targetX,
        y: targetY,
        taskRef: task,
      };
    });
  }, [tasks, villageName, projectionScaleX, projectionScaleY]);

  // Apply visual interactive filters
  const filteredPoints = useMemo(() => {
    return spatialPoints.filter((pt) => {
      // Dusun filter
      const matchDusun =
        filterDusun === 'ALL' ||
        pt.dusun.toLowerCase().includes(filterDusun.toLowerCase()) ||
        pt.villageName.toLowerCase().includes(filterDusun.toLowerCase());

      // Urgency filter
      const matchUrgency =
        filterUrgency === 'ALL' ||
        (filterUrgency === 'CRITICAL' && pt.isCritical) ||
        (filterUrgency === 'HIGH' && pt.priorityScore >= 70);

      // Status filter
      const matchStatus =
        filterStatus === 'ALL' ||
        (filterStatus === 'PENDING' && pt.status === 'PENDING') ||
        (filterStatus === 'ASSIGNED' && pt.status === 'ASSIGNED') ||
        (filterStatus === 'COMPLETED' && pt.status === 'COMPLETED');

      // Transport filter
      const matchTransport =
        filterTransport === 'ALL' ||
        (filterTransport === 'PERAHU' && pt.accessMode === 'PERAHU') ||
        (filterTransport === 'DARAT' && pt.accessMode !== 'PERAHU');

      return matchDusun && matchUrgency && matchStatus && matchTransport;
    });
  }, [spatialPoints, filterDusun, filterUrgency, filterStatus, filterTransport]);

  // Selected Point details
  const selectedPoint = useMemo(() => {
    if (!selectedPointId) return filteredPoints[0] || spatialPoints[0];
    return spatialPoints.find((p) => p.id === selectedPointId) || filteredPoints[0];
  }, [selectedPointId, filteredPoints, spatialPoints]);

  // Setup D3 Zoom & Pan behaviors
  useEffect(() => {
    if (!svgRef.current || !zoomGroupRef.current) return;

    const svg = d3.select(svgRef.current);
    const zoomGroup = d3.select(zoomGroupRef.current);

    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.8, 4])
      .translateExtent([[0, 0], [800, 500]])
      .on('zoom', (event) => {
        zoomGroup.attr('transform', event.transform.toString());
        setZoomTransform({ k: event.transform.k, x: event.transform.x, y: event.transform.y });
      });

    svg.call(zoomBehavior);

    return () => {
      svg.on('.zoom', null);
    };
  }, []);

  const handleZoomIn = () => {
    if (!svgRef.current) return;
    d3.select(svgRef.current).transition().duration(300).call(
      d3.zoom<SVGSVGElement, unknown>().scaleBy as any,
      1.3
    );
  };

  const handleZoomOut = () => {
    if (!svgRef.current) return;
    d3.select(svgRef.current).transition().duration(300).call(
      d3.zoom<SVGSVGElement, unknown>().scaleBy as any,
      0.75
    );
  };

  const handleResetZoom = () => {
    if (!svgRef.current) return;
    d3.select(svgRef.current).transition().duration(400).call(
      d3.zoom<SVGSVGElement, unknown>().transform as any,
      d3.zoomIdentity
    );
  };

  // Generate D3 SVG curved route path string from Pustu Base to selected point
  const routePathD = useMemo(() => {
    if (!selectedPoint || selectedPoint.status === 'COMPLETED') return '';
    const startX = PUSTU_BASE.x;
    const startY = PUSTU_BASE.y;
    const endX = selectedPoint.x;
    const endY = selectedPoint.y;

    if (selectedPoint.accessMode === 'PERAHU') {
      // Coastal sea curve
      const midX = (startX + endX) / 2 - 40;
      const midY = Math.max(startY, endY) + 50;
      return `M ${startX},${startY} Q ${midX},${midY} ${endX},${endY}`;
    } else {
      // Land road curvature
      const midX = (startX + endX) / 2 + 15;
      const midY = (startY + endY) / 2 - 20;
      return `M ${startX},${startY} Q ${midX},${midY} ${endX},${endY}`;
    }
  }, [selectedPoint]);

  // Statistics
  const totalInQueue = spatialPoints.filter((p) => p.status !== 'COMPLETED').length;
  const criticalCount = spatialPoints.filter((p) => p.isCritical && p.status !== 'COMPLETED').length;
  const maritimeBoatCount = spatialPoints.filter((p) => p.accessMode === 'PERAHU' && p.status !== 'COMPLETED').length;
  const completedCount = spatialPoints.filter((p) => p.status === 'COMPLETED').length;

  return (
    <Card className="p-5 bg-white border border-[#D8E5E2] shadow-xs rounded-xl space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-[#D8E5E2]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00201C] text-emerald-400 flex items-center justify-center font-bold shrink-0 shadow-2xs">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-black">
                Peta Distribusi Spasial Warga Butuh Kunjungan Rumah
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                {totalInQueue} Butuh Kunjungan
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                {completedCount} Selesai Dikunjungi
              </span>
            </div>
            <p className="text-xs text-[#60716D] mt-0.5">
              Visualisasi zonasi spasial interaktif D3.js di <strong>{villageName} & Desa Ratahaya</strong>. Koordinat marker otomatis terbarui saat kunjungan selesai ditindaklanjuti.
            </p>
          </div>
        </div>

        {/* Quick Filter Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Dusun Selector */}
          <select
            value={filterDusun}
            onChange={(e) => setFilterDusun(e.target.value)}
            className="text-xs bg-[#F8FBFA] border border-[#D8E5E2] rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-600 font-medium"
          >
            <option value="ALL">Semua Wilayah Binaan</option>
            <option value="Dusun 1">Dusun 1 - Pesisir Wayo</option>
            <option value="Dusun 2">Dusun 2 - Perkebunan Cengkeh</option>
            <option value="Dusun 3">Dusun 3 - Muara Wayo</option>
            <option value="Ratahaya">Desa Ratahaya (Pesisir & Perbukitan)</option>
          </select>

          {/* Urgency Selector */}
          <select
            value={filterUrgency}
            onChange={(e) => setFilterUrgency(e.target.value as any)}
            className="text-xs bg-[#F8FBFA] border border-[#D8E5E2] rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-600 font-medium"
          >
            <option value="ALL">Semua Tingkat Urgensi</option>
            <option value="CRITICAL">🚨 Kritis Saja (TD &gt; 165 / GDS &gt; 240)</option>
            <option value="HIGH">Prioritas Tinggi (Skor &ge; 70)</option>
          </select>

          {/* Transport Mode Selector */}
          <select
            value={filterTransport}
            onChange={(e) => setFilterTransport(e.target.value as any)}
            className="text-xs bg-[#F8FBFA] border border-[#D8E5E2] rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-600 font-medium"
          >
            <option value="ALL">Semua Akses Jalur</option>
            <option value="DARAT">🏍️ Jalur Darat (Motor / Jalan Kaki)</option>
            <option value="PERAHU">⛵ Jalur Laut (Perahu Katinting)</option>
          </select>

          {/* Status Tabs */}
          <div className="flex items-center rounded-lg border border-[#D8E5E2] bg-[#F8FBFA] p-0.5 text-xs">
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`px-2 py-1 rounded-md font-semibold cursor-pointer transition-all ${
                filterStatus === 'ALL' ? 'bg-emerald-700 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({spatialPoints.length})
            </button>
            <button
              onClick={() => setFilterStatus('PENDING')}
              className={`px-2 py-1 rounded-md font-semibold cursor-pointer transition-all ${
                filterStatus === 'PENDING' ? 'bg-amber-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Belum Diplot
            </button>
            <button
              onClick={() => setFilterStatus('ASSIGNED')}
              className={`px-2 py-1 rounded-md font-semibold cursor-pointer transition-all ${
                filterStatus === 'ASSIGNED' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Di Kader
            </button>
            <button
              onClick={() => setFilterStatus('COMPLETED')}
              className={`px-2 py-1 rounded-md font-semibold cursor-pointer transition-all ${
                filterStatus === 'COMPLETED' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Selesai ({completedCount})
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Interactive D3 Map View (8 Cols) */}
        <div className="lg:col-span-8 bg-slate-950 rounded-xl overflow-hidden relative border border-slate-800 min-h-[420px] sm:min-h-[480px] flex flex-col justify-between p-3 select-none">
          {/* Top Floating Controls */}
          <div className="flex items-center justify-between z-20 text-white text-xs gap-2">
            <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-white/10 shadow-lg">
              <Compass className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-[11px] sm:text-xs">Pustu Wayo (1°49'S, 124°23'E)</span>
              <span className="text-[10px] text-slate-400 hidden sm:inline">• Zoom: {zoomTransform.k.toFixed(1)}x</span>
            </div>

            {/* Visual Layers & Zoom Buttons */}
            <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-xs p-1 rounded-lg border border-white/10 shadow-lg">
              <button
                onClick={() => setShowDensityHeatmap(!showDensityHeatmap)}
                title="Toggle D3 Density Heatmap"
                className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                  showDensityHeatmap ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-800 text-slate-400'
                }`}
              >
                <Layers className="w-3 h-3" />
                <span className="hidden sm:inline">Kepadatan Risiko</span>
              </button>

              <button
                onClick={() => setShowRouteAnimation(!showRouteAnimation)}
                title="Toggle Rute Navigasi"
                className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                  showRouteAnimation ? 'bg-cyan-800 text-cyan-100' : 'bg-slate-800 text-slate-400'
                }`}
              >
                <Navigation className="w-3 h-3" />
                <span className="hidden sm:inline">Rute Aktif</span>
              </button>

              <div className="h-4 w-px bg-slate-700 mx-0.5" />

              <button
                onClick={handleZoomIn}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                title="Zoom In (+)"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleZoomOut}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                title="Zoom Out (-)"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleResetZoom}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                title="Reset View"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* D3 Vector SVG Interactive Map Canvas */}
          <div className="absolute inset-0 z-10 overflow-hidden cursor-grab active:cursor-grabbing">
            <svg
              ref={svgRef}
              viewBox="0 0 800 500"
              className="w-full h-full object-cover"
              preserveAspectRatio="xMidYMid slice"
            >
              {/* Defs for gradients & patterns */}
              <defs>
                <radialGradient id="criticalGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                  <stop offset="60%" stopColor="#dc2626" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#991b1b" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="highRiskGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.7" />
                  <stop offset="60%" stopColor="#d97706" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#b45309" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="seaGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#041319" />
                  <stop offset="100%" stopColor="#08222c" />
                </linearGradient>
              </defs>

              {/* Static Background: Sea Base */}
              <rect width="800" height="500" fill="url(#seaGradient)" />

              {/* Dynamic Zoomable Container */}
              <g ref={zoomGroupRef}>
                {/* Coastal Sea Waves Contour */}
                <path
                  d="M-50,120 Q150,180 300,100 T700,160 T900,120"
                  fill="none"
                  stroke="#0e3846"
                  strokeWidth="1.5"
                  strokeDasharray="6,6"
                />
                <path
                  d="M-50,240 Q200,280 400,210 T850,250"
                  fill="none"
                  stroke="#0e3846"
                  strokeWidth="1.5"
                  strokeDasharray="8,8"
                />

                {/* Primary Island Landmass of Desa Wayo & Ratahaya */}
                <path
                  d="M 120,0 
                     Q 150,120 180,180 
                     Q 220,240 240,320 
                     Q 270,400 450,420 
                     Q 620,440 750,380 
                     Q 800,340 800,0 
                     Z"
                  fill="#112d25"
                  stroke="#234c3f"
                  strokeWidth="3"
                />

                {/* Sandy Beach Perimeter */}
                <path
                  d="M 120,0 
                     Q 150,120 180,180 
                     Q 220,240 240,320 
                     Q 270,400 450,420 
                     Q 620,440 750,380 
                     Q 800,340 800,0"
                  fill="none"
                  stroke="#c2b280"
                  strokeWidth="2.5"
                  strokeOpacity="0.45"
                />

                {/* Hills / Perbukitan Cengkeh Contour */}
                <path
                  d="M 360,0 Q 400,160 520,220 Q 640,280 800,200 L 800,0 Z"
                  fill="#0c201a"
                  stroke="#16382e"
                  strokeWidth="1.5"
                />

                {/* Village Main Road Network */}
                <path
                  d="M 280,480 Q 320,360 380,260 T 540,160 T 780,100"
                  fill="none"
                  stroke="#7c6347"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <path
                  d="M 280,480 Q 320,360 380,260 T 540,160 T 780,100"
                  fill="none"
                  stroke="#e2b988"
                  strokeWidth="1.2"
                  strokeDasharray="4,4"
                />

                {/* Branch road to Pesisir Dusun 1 */}
                <path d="M 380,260 Q 300,280 230,310" fill="none" stroke="#604c35" strokeWidth="2.5" />
                {/* Branch road to Dusun 2 Perkebunan */}
                <path d="M 460,210 Q 480,120 510,80" fill="none" stroke="#604c35" strokeWidth="2.5" />
                {/* Sea Route from Dermaga Wayo to Ratahaya */}
                <path
                  d="M 230,310 Q 450,480 670,360"
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  strokeOpacity="0.75"
                />

                {/* Regional Labels */}
                <text x="320" y="325" fill="#a7f3d0" fontSize="12" fontWeight="bold" opacity="0.85">
                  DESA WAYO (PUSTU INDUK)
                </text>
                <text x="600" y="240" fill="#a7f3d0" fontSize="12" fontWeight="bold" opacity="0.85">
                  DESA RATAHAYA (BINAAN)
                </text>
                <text x="120" y="440" fill="#38bdf8" fontSize="10" fontStyle="italic" opacity="0.75">
                  Perairan Laut Maluku (Akses Perahu Katinting)
                </text>
                <text x="490" y="70" fill="#86efac" fontSize="10" fontStyle="italic" opacity="0.75">
                  Perbukitan Cengkeh & Rempah
                </text>

                {/* D3 Density Heatmap Layer */}
                {showDensityHeatmap && (
                  <g className="density-layer pointer-events-none">
                    {filteredPoints
                      .filter((pt) => pt.isCritical && pt.status !== 'COMPLETED')
                      .map((pt) => (
                        <circle
                          key={`glow-${pt.id}`}
                          cx={pt.x}
                          cy={pt.y}
                          r={36}
                          fill="url(#criticalGlow)"
                        />
                      ))}
                    {filteredPoints
                      .filter((pt) => !pt.isCritical && pt.priorityScore >= 70 && pt.status !== 'COMPLETED')
                      .map((pt) => (
                        <circle
                          key={`glow-high-${pt.id}`}
                          cx={pt.x}
                          cy={pt.y}
                          r={28}
                          fill="url(#highRiskGlow)"
                        />
                      ))}
                  </g>
                )}

                {/* Active Animated Navigation Route Path to Selected Point */}
                {showRouteAnimation && selectedPoint && selectedPoint.status !== 'COMPLETED' && (
                  <g className="route-layer pointer-events-none">
                    {/* Background glow line */}
                    <path
                      d={routePathD}
                      fill="none"
                      stroke={selectedPoint.accessMode === 'PERAHU' ? '#0284c7' : '#10b981'}
                      strokeWidth="5"
                      strokeOpacity="0.4"
                      strokeLinecap="round"
                    />
                    {/* Animated dashed line */}
                    <path
                      d={routePathD}
                      fill="none"
                      stroke={selectedPoint.accessMode === 'PERAHU' ? '#38bdf8' : '#34d399'}
                      strokeWidth="2.5"
                      strokeDasharray="6,6"
                      className="animate-dash"
                    />
                    {/* Midpoint Route Tooltip Label */}
                    <g transform={`translate(${(PUSTU_BASE.x + selectedPoint.x) / 2}, ${(PUSTU_BASE.y + selectedPoint.y) / 2})`}>
                      <rect x="-55" y="-12" width="110" height="24" rx="6" fill="#0f172a" stroke="#334155" strokeWidth="1" />
                      <text x="0" y="3.5" fill="#f8fafc" fontSize="9.5" fontWeight="bold" textAnchor="middle">
                        {selectedPoint.distanceMeters} m ({selectedPoint.travelMinutes} mnt)
                      </text>
                    </g>
                  </g>
                )}

                {/* PUSTU BASE HEADQUARTERS PIN */}
                <g transform={`translate(${PUSTU_BASE.x}, ${PUSTU_BASE.y})`}>
                  <circle r="18" fill="#10b981" fillOpacity="0.3" className="animate-ping" />
                  <circle r="13" fill="#047857" stroke="#ffffff" strokeWidth="2.5" />
                  <rect x="-4.5" y="-8.5" width="9" height="17" fill="#ffffff" rx="1" />
                  <rect x="-8.5" y="-4.5" width="17" height="9" fill="#ffffff" rx="1" />
                  <text x="18" y="4" fill="#ffffff" fontSize="11" fontWeight="bold" stroke="#000000" strokeWidth="0.5">
                    POS PUSTU WAYO
                  </text>
                </g>

                {/* DYNAMIC CITIZEN TASK PINS - Position updates dynamically with status */}
                {filteredPoints.map((pt) => {
                  const isSelected = selectedPoint?.id === pt.id;
                  const isCritical = pt.isCritical;
                  const isCompleted = pt.status === 'COMPLETED';
                  const isAssigned = pt.status === 'ASSIGNED';

                  const pinColor = isCompleted
                    ? '#10b981'
                    : isCritical
                    ? '#e11d48'
                    : isAssigned
                    ? '#2563eb'
                    : '#d97706';

                  return (
                    <g
                      key={pt.id}
                      transform={`translate(${pt.x}, ${pt.y})`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPointId(pt.id);
                      }}
                      className="cursor-pointer group transition-all duration-700 ease-out"
                    >
                      {/* Pulse Ring for Critical items */}
                      {isCritical && !isCompleted && (
                        <circle r="18" fill="#e11d48" fillOpacity="0.35" className="animate-ping" />
                      )}

                      {/* Selection Ring */}
                      {isSelected && (
                        <circle r="19" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeDasharray="3,3" className="animate-spin-slow" />
                      )}

                      {/* Main Pin Circle */}
                      <circle
                        r={isSelected ? 14 : isCompleted ? 9 : 11}
                        fill={pinColor}
                        stroke="#ffffff"
                        strokeWidth={isSelected ? "2.5" : "1.8"}
                        className="transition-all duration-300 group-hover:scale-125 shadow-lg"
                      />

                      {/* Icon / Text inside pin */}
                      <text
                        x="0"
                        y="3.5"
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize={isSelected ? "11" : isCompleted ? "9" : "9.5"}
                        fontWeight="900"
                      >
                        {isCompleted ? '✓' : isCritical ? '!' : pt.priorityScore}
                      </text>

                      {/* Hover Tooltip inside SVG */}
                      <g className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" transform="translate(0, -22)">
                        <rect x="-60" y="-18" width="120" height="20" rx="4" fill="#020617" stroke="#334155" strokeWidth="1" />
                        <text x="0" y="-4.5" fill="#f8fafc" fontSize="9.5" fontWeight="bold" textAnchor="middle">
                          {pt.citizenName} {isCompleted ? '(Selesai)' : ''}
                        </text>
                      </g>
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>

          {/* Bottom Bar: Real-Time Operational Spasial Stats */}
          <div className="z-20 bg-slate-950/85 backdrop-blur-xs p-2.5 rounded-xl border border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs text-white">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <Navigation className="w-3.5 h-3.5" />
                <span>Radius Pustu: <strong>4.8 KM</strong></span>
              </span>
              <span className="hidden sm:inline text-slate-600">|</span>
              <span className="text-slate-300 flex items-center gap-1">
                <Anchor className="w-3.5 h-3.5 text-cyan-400" />
                <span>Jalur Laut Perahu: <strong>{maritimeBoatCount} Titik</strong></span>
              </span>
              <span className="hidden sm:inline text-slate-600">|</span>
              <span className="text-slate-300 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                <span>Kasus Kritis: <strong>{criticalCount} Warga</strong></span>
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span>Klik marker titik warga untuk navigasi, delegasi kader & selesaikan kunjungan.</span>
            </div>
          </div>
        </div>

        {/* Right Inspector & Action Panel (4 Cols) */}
        <div className="lg:col-span-4 space-y-3">
          {selectedPoint ? (
            <div className="bg-[#F8FBFA] rounded-xl border border-[#D8E5E2] p-4 space-y-3.5 shadow-2xs flex flex-col justify-between h-full">
              <div className="space-y-3">
                {/* Header: Name, NIK, Status */}
                <div className="flex items-start justify-between gap-2 border-b border-[#D8E5E2] pb-2.5">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-black">
                        {selectedPoint.citizenName}
                      </span>
                      {selectedPoint.isCritical && (
                        <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white font-bold text-[9px] animate-pulse">
                          KRITIS
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] font-mono text-[#60716D]">
                      NIK: {selectedPoint.citizenNik} • Usia: <strong>{selectedPoint.age} Thn</strong>
                    </p>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        selectedPoint.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : selectedPoint.status === 'ASSIGNED'
                          ? 'bg-blue-100 text-blue-800 border-blue-300'
                          : 'bg-amber-100 text-amber-900 border-amber-300'
                      }`}
                    >
                      {selectedPoint.status === 'COMPLETED'
                        ? '✓ Tuntas Dikunjungi'
                        : selectedPoint.status === 'ASSIGNED'
                        ? 'Di Kader'
                        : 'Butuh Kunjungan'}
                    </span>
                  </div>
                </div>

                {/* Spatial Navigation & Geographic Route Details */}
                <div className="p-2.5 bg-white rounded-lg border border-[#D8E5E2] space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-700 font-semibold">
                    <span className="flex items-center gap-1 text-slate-900">
                      <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                      {selectedPoint.dusun}
                    </span>
                    <span className="text-[11px] text-emerald-800 font-bold">
                      {selectedPoint.status === 'COMPLETED' 
                        ? 'Tuntas di Pos Pustu' 
                        : `~${selectedPoint.distanceMeters} Meter (${selectedPoint.travelMinutes} mnt)`}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">{selectedPoint.address}</p>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                    <span className="text-slate-600">Moda & Jalur Akses:</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1">
                      {selectedPoint.accessMode === 'PERAHU' ? (
                        <>
                          <Anchor className="w-3 h-3 text-cyan-600" />
                          <span>Perahu Katinting Pesisir (15 Mnt)</span>
                        </>
                      ) : selectedPoint.accessMode === 'MOTOR' ? (
                        <span>Sepeda Motor / Poros (8 Mnt)</span>
                      ) : (
                        <span>Jalan Kaki / Setapak (5 Mnt)</span>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-0.5">
                    <span>Koordinat Spasial Terkini:</span>
                    <span>{selectedPoint.latitude.toFixed(4)}°S, {selectedPoint.longitude.toFixed(4)}°E</span>
                  </div>
                </div>

                {/* Clinical Vitals & Priority Condition */}
                <div className="space-y-1.5">
                  <p className="text-[11px] font-bold text-[#60716D] uppercase tracking-wider">
                    Kondisi Klinis & Tanda Vital
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded-lg bg-white border border-[#D8E5E2]">
                      <p className="text-[10px] text-slate-500">Tensi Darah (TD)</p>
                      <p
                        className={`text-sm font-black ${
                          selectedPoint.systolic >= 160 ? 'text-rose-700' : 'text-slate-900'
                        }`}
                      >
                        {selectedPoint.systolic}/{selectedPoint.diastolic}{' '}
                        <span className="text-[10px] font-normal text-slate-500">mmHg</span>
                      </p>
                    </div>

                    <div className="p-2 rounded-lg bg-white border border-[#D8E5E2]">
                      <p className="text-[10px] text-slate-500">Gula Darah (GDS)</p>
                      <p
                        className={`text-sm font-black ${
                          selectedPoint.gds >= 200 ? 'text-rose-700' : 'text-slate-900'
                        }`}
                      >
                        {selectedPoint.gds}{' '}
                        <span className="text-[10px] font-normal text-slate-500">mg/dL</span>
                      </p>
                    </div>
                  </div>

                  <div className="p-2 bg-rose-50/60 rounded-lg border border-rose-200 text-xs text-rose-900">
                    <p className="font-semibold">{selectedPoint.condition}</p>
                    <p className="text-[10px] text-rose-800 mt-0.5">
                      Skor Prioritas Kunjungan: <strong>{selectedPoint.priorityScore}</strong>/100
                    </p>
                  </div>
                </div>

                {/* Assigned Kader if any */}
                {selectedPoint.assignedKader && (
                  <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-blue-700 shrink-0" />
                    <div>
                      <span className="font-bold">Kader Pendamping:</span> {selectedPoint.assignedKader}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons for Selected Citizen */}
              <div className="space-y-2 pt-2 border-t border-[#D8E5E2]">
                {selectedPoint.citizenPhone && (
                  <a
                    href={`https://wa.me/${selectedPoint.citizenPhone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg border border-emerald-200 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WhatsApp Warga / Keluarga</span>
                  </a>
                )}

                {selectedPoint.status !== 'COMPLETED' ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          onQuickAssign?.(selectedPoint.taskRef);
                        }}
                        className="flex-1 text-xs cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5 text-blue-700 mr-1" />
                        <span>Tugaskan Kader</span>
                      </Button>

                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          onSelectTask?.(selectedPoint.taskRef);
                        }}
                        className="flex-1 text-xs bg-emerald-700 hover:bg-emerald-600 text-white cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        <span>Detail Tugas</span>
                      </Button>
                    </div>

                    {/* Quick Finish / Complete Visit Button */}
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        onCompleteTask?.(selectedPoint.taskRef);
                      }}
                      className="w-full text-xs bg-emerald-800 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5 py-2 cursor-pointer shadow-xs"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      <span>Tandai Kunjungan Selesai (Update Koordinat)</span>
                    </Button>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-center">
                    <p className="text-xs font-bold text-emerald-800 flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Kunjungan Rumah Selesai Dilaksanakan</span>
                    </p>
                    <p className="text-[11px] text-emerald-700 mt-0.5">
                      Marker koordinat telah diperbarui ke Pos Pustu Induk.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500 text-xs flex flex-col items-center justify-center h-full">
              <MapPin className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p>Pilih salah satu titik pin di peta untuk melihat profil kondisi klinis dan delegasi kunjungan warga.</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
