import React, { useEffect, useState } from 'react';
import { Activity, Stethoscope, FlaskConical, Pill, ShieldQuestion, Gauge } from 'lucide-react';
import { DocBadge } from '../../../components/common/DocBadge';
import { Tabs, TabItem } from '../../../components/common/Tabs';
import { Badge, BadgeVariant } from '../../../components/common/Badge';
import { rsudExecutiveService } from '../../../services/rsudExecutiveService';
import { RsudServiceReadiness, RsudCapabilityStatus } from '../../../types';

const CAPABILITY_VARIANT: Record<RsudCapabilityStatus, BadgeVariant> = {
  READY: 'active',
  LIMITED: 'warning',
  TEMPORARILY_UNAVAILABLE: 'pending',
  NOT_AVAILABLE: 'failed',
};

const CAPABILITY_LABEL: Record<RsudCapabilityStatus, string> = {
  READY: 'Siap',
  LIMITED: 'Terbatas',
  TEMPORARILY_UNAVAILABLE: 'Tidak Tersedia Sementara',
  NOT_AVAILABLE: 'Tidak Tersedia',
};

export const RsudServiceReadinessPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('capability');
  const [isLoading, setIsLoading] = useState(true);
  const [readiness, setReadiness] = useState<RsudServiceReadiness[]>([]);
  const [constraints, setConstraints] = useState<Awaited<ReturnType<typeof rsudExecutiveService.getResourceConstraintAnalytics>>>([]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [r, c] = await Promise.all([
        rsudExecutiveService.getServiceReadiness(),
        rsudExecutiveService.getResourceConstraintAnalytics(),
      ]);
      setReadiness(r);
      setConstraints(c);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const tabs: TabItem[] = [
    { id: 'capability', label: 'Capability & Capacity', icon: <Gauge className="w-4 h-4" /> },
    { id: 'specialist', label: 'Specialist & Credential', icon: <Stethoscope className="w-4 h-4" /> },
    { id: 'diagnostic', label: 'Diagnostic & Pharmacy', icon: <FlaskConical className="w-4 h-4" /> },
    { id: 'critical', label: 'Critical Readiness', icon: <ShieldQuestion className="w-4 h-4" /> },
    { id: 'constraint', label: 'Analitik Keterbatasan Sumber Daya', icon: <Activity className="w-4 h-4" /> },
  ];

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-600 space-y-3">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs">Memuat Service Readiness...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div>
        <div className="flex items-center gap-2 text-xs text-teal-400 font-semibold uppercase tracking-wider mb-1">
          <Activity className="w-4 h-4" />
          RSUD COMMAND CENTER — SERVICE READINESS
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-black tracking-tight">Service Readiness</h1>
          <DocBadge
            code="SCR-RSD-C01"
            title="Service Readiness"
            phase="F1"
            plafon="S3"
            description="Capacity (berapa banyak dapat dilayani) vs Capability (apakah layanan memang dapat diberikan secara aman & sah) — dua indikator berbeda, tidak digabung (Gap Closure §19 Hard Lock)."
            size="sm"
          />
        </div>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'capability' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {readiness.map((s) => (
            <div key={s.id} className="p-4 bg-white border border-[#D8E5E2] rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-black">{s.serviceName}</span>
                <Badge variant={CAPABILITY_VARIANT[s.capabilityStatus]} size="sm">{CAPABILITY_LABEL[s.capabilityStatus]}</Badge>
              </div>
              <div className="text-xs text-gray-600 space-y-1">
                <p>Demand: <strong>{s.demandCount}</strong> · Kapasitas: <strong>{s.capacityCount}</strong></p>
                <p>Utilisasi: {s.utilizationPercent !== undefined ? `${s.utilizationPercent}%` : 'Belum dapat dinilai'}</p>
                {s.capabilityNote && <p className="text-[11px] text-amber-700 italic">{s.capabilityNote}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'specialist' && (
        <div className="overflow-x-auto rounded-xl border border-[#D8E5E2]">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-gray-600 uppercase text-[11px] border-b border-[#D8E5E2]">
              <tr>
                <th className="py-2.5 px-3">Layanan</th>
                <th className="py-2.5 px-3 text-right">Spesialis Tersedia</th>
                <th className="py-2.5 px-3">Cuti/Absen Terjadwal</th>
                <th className="py-2.5 px-3 text-right">Credential Akan Berakhir (≤30 hari)</th>
                <th className="py-2.5 px-3 text-right">Credential Belum Lengkap</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDF3F1]">
              {readiness.map((s) => (
                <tr key={s.id}>
                  <td className="py-2.5 px-3 font-medium">{s.serviceName}</td>
                  <td className="py-2.5 px-3 text-right">{s.specialistsAvailable} / {s.specialistsTotal}</td>
                  <td className="py-2.5 px-3 text-gray-500">{s.plannedAbsenceNote || '—'}</td>
                  <td className={`py-2.5 px-3 text-right font-semibold ${s.credentialsExpiringWithin30d > 0 ? 'text-amber-600' : ''}`}>{s.credentialsExpiringWithin30d}</td>
                  <td className={`py-2.5 px-3 text-right font-semibold ${s.credentialsIncomplete > 0 ? 'text-rose-600' : ''}`}>{s.credentialsIncomplete}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'diagnostic' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {readiness.map((s) => (
            <div key={s.id} className="p-4 bg-white border border-[#D8E5E2] rounded-xl space-y-1.5">
              <p className="text-sm font-semibold text-black">{s.serviceName}</p>
              <p className="text-xs text-gray-600 flex items-center gap-1.5">
                <FlaskConical className="w-3.5 h-3.5 text-sky-600" />
                Turnaround diagnostik: {s.diagnosticTurnaroundHours !== undefined ? `${s.diagnosticTurnaroundHours} jam` : 'Belum dapat dinilai'}
              </p>
              {s.diagnosticCapacityNote && <p className="text-[11px] text-gray-500">{s.diagnosticCapacityNote}</p>}
              <p className="text-xs text-gray-600 flex items-center gap-1.5">
                <Pill className="w-3.5 h-3.5 text-emerald-600" />
                Ketersediaan Obat: <Badge size="sm" variant={s.medicationAvailabilityStatus === 'TERSEDIA' ? 'active' : s.medicationAvailabilityStatus === 'TERBATAS' ? 'warning' : 'failed'}>{s.medicationAvailabilityStatus}</Badge>
              </p>
              {s.medicationRecurringGap && <p className="text-[11px] text-rose-700 italic">{s.medicationRecurringGap}</p>}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'critical' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {readiness.map((s) => (
            <div key={s.id} className="p-5 bg-[#faf9f6] border border-stone-200 rounded-2xl text-stone-800 space-y-2 shadow-2xs">
              <p className="text-sm font-bold text-black">{s.serviceName}</p>
              <Badge variant={CAPABILITY_VARIANT[s.capabilityStatus]}>{CAPABILITY_LABEL[s.capabilityStatus]}</Badge>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                Readiness mempertimbangkan: ruang, staf, alat, obat, diagnostik, dan SOP — bukan sekadar kapasitas jadwal.
              </p>
              <p className="text-[10px] text-stone-500">Cut-off: {new Date(s.dataCutoffAt).toLocaleString('id-ID')}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'constraint' && (
        <div className="space-y-3">
          <p className="text-xs text-gray-500 italic">
            Faktor di bawah adalah korelasi yang mungkin terkait, belum tentu penyebab tunggal backlog rujukan (belum dibuktikan kausal).
          </p>
          {constraints.length === 0 && <p className="text-sm text-gray-500">Tidak ada faktor keterbatasan tercatat saat ini.</p>}
          {constraints.map((c, idx) => (
            <div key={idx} className="p-4 bg-white border border-[#D8E5E2] rounded-xl">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-black">{c.serviceName}</span>
                <Badge variant={CAPABILITY_VARIANT[c.capabilityStatus]} size="sm">{CAPABILITY_LABEL[c.capabilityStatus]}</Badge>
              </div>
              <ul className="text-xs text-gray-600 list-disc list-inside">
                {c.constraintFactors.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
              <p className="text-[11px] text-gray-400 mt-1 italic">{c.note}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
