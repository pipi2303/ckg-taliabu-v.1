import React, { useEffect, useState } from 'react';
import { LayoutDashboard, AlertTriangle, ShieldAlert, ClipboardList, TrendingUp, PlusCircle, ArrowRight, Check } from 'lucide-react';
import { DocBadge } from '../../../components/common/DocBadge';
import { Tabs, TabItem } from '../../../components/common/Tabs';
import { QualifiedMetricCard } from '../../../features/command-center/components/QualifiedMetricCard';
import { Button } from '../../../components/common/Button';
import { ActionIconButton } from '../../../components/common/ActionIconButton';
import { Input } from '../../../components/common/Input';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import {
  rsudExecutiveService,
  ExecutiveAlert,
  ReferralCascadeSummary,
  SourcePuskesmasRow,
  RejectionRow,
} from '../../../services/rsudExecutiveService';
import { QualifiedMetric, RsudExecutiveAction, RsudServiceReadiness } from '../../../types';
import { RsudExecutiveSummaryCharts } from '../components/RsudExecutiveSummaryCharts';

const alertStyles: Record<ExecutiveAlert['severity'], string> = {
  CRITICAL: 'bg-rose-50 border-rose-300 text-rose-900',
  WARNING: 'bg-amber-50 border-amber-300 text-amber-900',
};

export const RsudExecutivePage: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('ringkasan');
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<QualifiedMetric[]>([]);
  const [closedLoopRate, setClosedLoopRate] = useState<QualifiedMetric | null>(null);
  const [alerts, setAlerts] = useState<ExecutiveAlert[]>([]);
  const [actions, setActions] = useState<RsudExecutiveAction[]>([]);
  const [cascade, setCascade] = useState<ReferralCascadeSummary | null>(null);
  const [sla, setSla] = useState<Awaited<ReturnType<typeof rsudExecutiveService.getReferralSla>> | null>(null);
  const [sourceRows, setSourceRows] = useState<SourcePuskesmasRow[]>([]);
  const [readiness, setReadiness] = useState<RsudServiceReadiness[]>([]);
  const [rejections, setRejections] = useState<RejectionRow[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ title: '', decisionNote: '', picUserName: '', dueDate: '' });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [kpis, rate, actionList, cascadeData, slaData, sourceData, readinessData, rejectionData] = await Promise.all([
        rsudExecutiveService.getExecutiveKpis(),
        rsudExecutiveService.getClosedLoopRate(),
        rsudExecutiveService.getExecutiveActions(),
        rsudExecutiveService.getReferralCascade(),
        rsudExecutiveService.getReferralSla(),
        rsudExecutiveService.getSourcePuskesmasAnalysis(),
        rsudExecutiveService.getServiceReadiness(),
        rsudExecutiveService.getRejectionAnalysis(),
      ]);
      setMetrics(kpis.metrics);
      setAlerts(kpis.alerts);
      setClosedLoopRate(rate);
      setActions(actionList);
      setCascade(cascadeData);
      setSla(slaData);
      setSourceRows(sourceData);
      setReadiness(readinessData);
      setRejections(rejectionData);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const tabs: TabItem[] = [
    { id: 'ringkasan', label: 'Ringkasan', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'alerts', label: 'Executive Alerts', icon: <AlertTriangle className="w-4 h-4" />, count: alerts.length },
    { id: 'actions', label: 'Executive Action Tracker', icon: <ClipboardList className="w-4 h-4" />, count: actions.length },
    { id: 'perbandingan', label: 'Perbandingan Periode', icon: <TrendingUp className="w-4 h-4" /> },
  ];

  const handleCreateAction = async () => {
    if (!user || !form.title || !form.picUserName || !form.dueDate) {
      toast.error('Lengkapi Form', 'Judul, PIC, dan tenggat wajib diisi.');
      return;
    }
    await rsudExecutiveService.createExecutiveAction(form, { id: user.id, name: user.name });
    toast.success('Tindakan Eksekutif Dibuat', form.title);
    setForm({ title: '', decisionNote: '', picUserName: '', dueDate: '' });
    setFormOpen(false);
    loadData();
  };

  const handleAdvanceAction = async (action: RsudExecutiveAction) => {
    if (!user) return;
    const nextStatus = action.status === 'OPEN' ? 'IN_PROGRESS' : 'COMPLETED';
    const nextProgress = nextStatus === 'COMPLETED' ? 100 : Math.max(action.progressPercent, 50);
    await rsudExecutiveService.updateExecutiveActionProgress(
      action.id,
      { status: nextStatus, progressPercent: nextProgress },
      { id: user.id, name: user.name }
    );
    toast.info('Progres Diperbarui', `${action.title} → ${nextStatus}`);
    loadData();
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-600 space-y-3">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs">Memuat Ringkasan Eksekutif RSUD...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div>
        <div className="flex items-center gap-2 text-xs text-teal-400 font-semibold uppercase tracking-wider mb-1">
          <LayoutDashboard className="w-4 h-4" />
          RSUD COMMAND CENTER — EXECUTIVE
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-black tracking-tight">Ringkasan Eksekutif RSUD</h1>
          <DocBadge
            code="SCR-RSD-A01"
            title="Ringkasan Eksekutif RSUD"
            phase="F1"
            plafon="S3"
            description="KPI rujukan CKG masuk-ke-RSUD, executive alerts, dan pelacakan tindakan manajemen. Executive-first, aggregate-first, exception-driven — bukan alat operasional klinis."
            size="sm"
          />
        </div>
        <p className="text-xs text-gray-600 mt-1">
          Direktur RSUD tidak memiliki kewenangan klinis (diagnosis/terapi/resep) — halaman ini murni pemantauan performa rujukan, kesiapan layanan, mutu, dan integrasi secara agregat.
        </p>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'ringkasan' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {metrics.map((m) => (
              <QualifiedMetricCard key={m.metricCode} metric={m} />
            ))}
          </div>
          {closedLoopRate && (
            <div className="max-w-md">
              <QualifiedMetricCard metric={closedLoopRate} levelBadge="Closed-Loop Rate" />
            </div>
          )}

          {/* Dedicated Visual Recharts Charts for Each Executive Section */}
          <RsudExecutiveSummaryCharts
            cascade={cascade}
            sla={sla}
            sourceRows={sourceRows}
            readiness={readiness}
            rejections={rejections}
            onNavigateTab={setActiveTab}
          />
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="space-y-3">
          {alerts.length === 0 && (
            <div className="p-6 text-center text-sm text-gray-500 bg-white border border-[#D8E5E2] rounded-xl">
              Tidak ada exception aktif saat ini.
            </div>
          )}
          {alerts.map((a, idx) => (
            <div key={idx} className={`p-4 rounded-xl border flex items-start gap-3 ${alertStyles[a.severity]}`}>
              <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/70 border border-current">
                    {a.severity}
                  </span>
                  {a.count !== undefined && <span className="text-xs font-semibold">{a.count} kasus</span>}
                </div>
                <p className="text-sm font-medium mt-1">{a.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'actions' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" leftIcon={<PlusCircle className="w-4 h-4" />} onClick={() => setFormOpen((v) => !v)}>
              Tindakan Baru
            </Button>
          </div>

          {formOpen && (
            <div className="p-4 bg-white border border-[#D8E5E2] rounded-xl space-y-3">
              <Input label="Judul Tindakan" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <Input label="Catatan Keputusan" value={form.decisionNote} onChange={(e) => setForm({ ...form, decisionNote: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <Input label="PIC" required value={form.picUserName} onChange={(e) => setForm({ ...form, picUserName: e.target.value })} />
                <Input label="Tenggat" type="date" required value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
              </div>
              <Button size="sm" onClick={handleCreateAction}>Simpan Tindakan</Button>
            </div>
          )}

          <div className="bg-white border border-[#D8E5E2] rounded-xl divide-y divide-[#EDF3F1]">
            {actions.length === 0 && <div className="p-6 text-center text-sm text-gray-500">Belum ada tindakan eksekutif tercatat.</div>}
            {actions.map((a) => (
              <div key={a.id} className="p-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-black">{a.title}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{a.decisionNote}</p>
                  <p className="text-[11px] text-gray-500 mt-1">PIC: {a.picUserName} · Tenggat: {a.dueDate} · Progres: {a.progressPercent}%</p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {a.status}
                  </span>
                  {a.status !== 'COMPLETED' && (
                    <ActionIconButton
                      icon={<ArrowRight className="w-4 h-4 text-teal-700" />}
                      tooltip="Majukan Status Tindakan Eksekutif (In Progress / Completed)"
                      tooltipPosition="left"
                      size="sm"
                      variant="outline"
                      onClick={() => handleAdvanceAction(a)}
                      className="hover:bg-teal-50 hover:border-teal-300"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-gray-500">
            Catatan: tindakan eksekutif di sini adalah aksi manajemen Direktur RSUD — bukan Care Task klinis milik Puskesmas.
          </p>
        </div>
      )}

      {activeTab === 'perbandingan' && (
        <div className="p-6 bg-[#faf9f6] border border-stone-200 rounded-2xl text-stone-700 text-sm space-y-2">
          <p className="font-semibold text-black">Perbandingan Antar-Periode — Belum Dapat Dinilai</p>
          <p className="text-xs leading-relaxed text-stone-600">
            Perbandingan longitudinal antar-periode memerlukan riwayat data multi-periode yang belum tersedia pada pilot ini
            (data historis rujukan baru dicatat sejak Agustus 2026). Fitur ini akan aktif otomatis setelah tersedia ≥2 periode
            penuh, tanpa menampilkan angka perbandingan yang belum bisa dipertanggungjawabkan.
          </p>
        </div>
      )}
    </div>
  );
};
