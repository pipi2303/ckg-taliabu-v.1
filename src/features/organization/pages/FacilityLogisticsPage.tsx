import React, { useEffect, useState } from 'react';
import { Building2, FlaskConical, Pill, Users, AlertTriangle, X } from 'lucide-react';
import { DocBadge } from '../../../components/common/DocBadge';
import { facilityLogisticsService, FacilityLogisticsSummary } from '../../../services/facilityLogisticsService';
import { aiForecastService } from '../../../services/aiForecastService';
import { FacilityLogisticsSnapshot, AIPopulationForecast } from '../../../types';

const STOCK_STATUS_STYLE: Record<string, string> = {
  AMAN: 'bg-[#EBF7F2] text-[#2E7D5B] border-[#BFE3D0]',
  MENIPIS: 'bg-[#FFFACD] text-[#8C6407] border-[#F5EC9C]',
  KRITIS: 'bg-rose-50 text-rose-700 border-rose-200',
};

export const FacilityLogisticsPage: React.FC = () => {
  const [snapshots, setSnapshots] = useState<FacilityLogisticsSnapshot[]>([]);
  const [summary, setSummary] = useState<FacilityLogisticsSummary | null>(null);
  const [countyForecast, setCountyForecast] = useState<AIPopulationForecast | null>(null);
  const [selected, setSelected] = useState<FacilityLogisticsSnapshot | null>(null);

  useEffect(() => {
    setSnapshots(facilityLogisticsService.getAllSnapshots());
    setSummary(facilityLogisticsService.getSummary());
    aiForecastService.getCountyForecast().then(setCountyForecast);
  }, []);

  if (!summary) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-[#D8E5E2]">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-black">Alokasi Logistik Faskes</h2>
          <DocBadge code="SCR-PKM-E05" size="xs" />
        </div>
        <p className="text-xs text-[#60716D] mt-0.5">
          Kapasitas laboratorium, stok obat antihipertensi/diabetes, dan kecukupan tenaga medis per fasilitas kesehatan Kabupaten Pulau Taliabu.
        </p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-[#D8E5E2] shadow-2xs">
          <div className="flex items-center justify-between text-[#60716D] mb-1">
            <span className="text-xs font-semibold">Faskes Stok Kritis</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-bold text-rose-700">{summary.facilitiesAtCriticalStock}</p>
          <p className="text-[11px] text-[#60716D] mt-0.5">dari {snapshots.length} fasilitas aktif</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#D8E5E2] shadow-2xs">
          <div className="flex items-center justify-between text-[#60716D] mb-1">
            <span className="text-xs font-semibold">Rata-rata Utilisasi Lab</span>
            <FlaskConical className="w-4 h-4 text-[#397B94]" />
          </div>
          <p className="text-2xl font-bold text-black">{summary.avgLabUtilization}%</p>
          <p className="text-[11px] text-[#60716D] mt-0.5">kapasitas terpakai bulan berjalan</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#D8E5E2] shadow-2xs">
          <div className="flex items-center justify-between text-[#60716D] mb-1">
            <span className="text-xs font-semibold">Kekurangan Tenaga</span>
            <Users className="w-4 h-4 text-[#C99720]" />
          </div>
          <p className="text-2xl font-bold text-[#C99720]">{summary.totalStaffGap}</p>
          <p className="text-[11px] text-[#60716D] mt-0.5">orang, akumulasi seluruh faskes</p>
        </div>
      </div>

      {/* Facility grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
        {snapshots.map((s) => {
          const labUtil = Math.round((s.labTestsThisMonth / s.labCapacityMonthly) * 100);
          const staffGap = Math.max(0, s.staffRecommended - s.staffActive);
          const criticalDrugs = s.medicineStock.filter((m) => m.status === 'KRITIS').length;

          return (
            <button
              key={s.id}
              onClick={() => setSelected(s)}
              className="text-left bg-white p-4 rounded-xl border border-[#D8E5E2] shadow-2xs hover:border-[#00201C] transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Building2 className="w-4 h-4 text-[#2E7D5B] shrink-0" />
                  <span className="font-bold text-sm text-black truncate">{s.facilityName}</span>
                </div>
                {criticalDrugs > 0 && (
                  <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                    {criticalDrugs} Kritis
                  </span>
                )}
              </div>

              <div className="space-y-1.5 mb-3">
                <div className="flex items-center justify-between text-[11px] text-[#60716D]">
                  <span>Utilisasi Lab</span>
                  <span className="font-semibold text-black">{s.labTestsThisMonth} / {s.labCapacityMonthly} tes</span>
                </div>
                <div className="w-full bg-[#F0F5F4] rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full ${labUtil >= 90 ? 'bg-rose-500' : labUtil >= 70 ? 'bg-amber-500' : 'bg-[#2E7D5B]'}`}
                    style={{ width: `${Math.min(100, labUtil)}%` }}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {s.medicineStock.map((m) => (
                  <span
                    key={m.drugName}
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${STOCK_STATUS_STYLE[m.status]}`}
                  >
                    {m.drugName.split(' ')[0]}: {m.status}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between text-[11px] pt-2 border-t border-[#D8E5E2]">
                <span className="text-[#60716D] flex items-center gap-1">
                  <Users className="w-3 h-3" /> {s.staffActive}/{s.staffRecommended} staf
                </span>
                {staffGap > 0 ? (
                  <span className="text-[#C99720] font-semibold">-{staffGap} kekurangan</span>
                ) : (
                  <span className="text-[#2E7D5B] font-semibold">Terpenuhi</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div
            className="bg-white rounded-2xl border border-[#D8E5E2] max-w-lg w-full max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-[#D8E5E2] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-black">{selected.facilityName}</h3>
                <p className="text-[11px] text-[#60716D]">
                  Diperbarui {new Date(selected.updatedAt).toLocaleDateString('id-ID')}
                </p>
              </div>
              <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-[#F0F5F4] cursor-pointer">
                <X className="w-4 h-4 text-[#60716D]" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase text-[#60716D] mb-2 flex items-center gap-1.5">
                  <Pill className="w-3.5 h-3.5" /> Stok Obat PTM
                </h4>
                <div className="space-y-2">
                  {selected.medicineStock.map((m) => (
                    <div key={m.drugName} className="flex items-center justify-between p-2.5 bg-[#F8FBFA] rounded-lg border border-[#D8E5E2]">
                      <div>
                        <p className="text-xs font-semibold text-black">{m.drugName}</p>
                        <p className="text-[11px] text-[#60716D]">{m.currentStock.toLocaleString('id-ID')} {m.unit} · {m.daysOfSupply} hari cukup</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${STOCK_STATUS_STYLE[m.status]}`}>
                        {m.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {countyForecast && (
                <div>
                  <h4 className="text-xs font-bold uppercase text-[#60716D] mb-2">Rekomendasi Dinkes (Proyeksi Beban 6-Bulan)</h4>
                  <ul className="space-y-1.5">
                    {countyForecast.recommendedStockActions
                      .filter((action) => action.toLowerCase().includes(selected.facilityName.split(' ')[1]?.toLowerCase() || '__none__'))
                      .concat(countyForecast.recommendedStockActions.slice(0, 1))
                      .slice(0, 2)
                      .map((action, idx) => (
                        <li key={idx} className="text-[11px] text-[#334643] flex items-start gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-[#2E7D5B] mt-1.5 shrink-0" />
                          <span>{action}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
