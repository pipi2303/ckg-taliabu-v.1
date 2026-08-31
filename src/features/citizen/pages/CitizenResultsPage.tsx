import React, { useState } from 'react';
import {
  FileText,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Building2,
  Info,
  ChevronLeft,
  TrendingUp,
  BookOpen,
  Plus,
  Activity,
} from 'lucide-react';
import { useCitizen } from '../context/CitizenContext';
import { CitizenActiveTab } from '../components/CitizenAppShell';
import { SAFETY_MESSAGES } from '../../../services/citizenCopyDictionary';
import { DocBadge } from '../components/DocBadge';
import { BloodPressureTrendChart, BpDataPoint, DEFAULT_BP_HISTORY } from '../components/BloodPressureTrendChart';

interface CitizenResultsPageProps {
  onBack: () => void;
  onNavigate: (tab: CitizenActiveTab) => void;
}

export const CitizenResultsPage: React.FC<CitizenResultsPageProps> = ({ onBack, onNavigate }) => {
  const { citizen, healthValues } = useCitizen();
  const [activeSubTab, setActiveSubTab] = useState<'LATEST' | 'TREND' | 'EDUCATION' | 'SELF'>('LATEST');
  const [selfBp, setSelfBp] = useState('125/80');
  const [selfLogged, setSelfLogged] = useState(false);
  const [additionalPoints, setAdditionalPoints] = useState<BpDataPoint[]>([]);

  const handleAddSelfMeasurement = () => {
    if (!selfBp || !selfBp.includes('/')) return;
    const parts = selfBp.split('/');
    const sys = parseInt(parts[0].trim(), 10) || 120;
    const dia = parseInt(parts[1].trim(), 10) || 80;

    const newPoint: BpDataPoint = {
      id: `self-${Date.now()}`,
      timestamp: new Date().toISOString(),
      dateLabel: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      timeLabel: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIT',
      eventNote: 'Pencatatan Mandiri di Rumah (Alat Tensimeter Pribadi)',
      facility: 'Data Mandiri Warga',
      examiner: citizen?.fullName || 'Warga Mandiri',
      systolic: sys,
      diastolic: dia,
      pulse: 75,
      status: sys < 130 && dia < 80 ? 'NORMAL' : sys < 140 ? 'PRE_HTN' : 'STAGE_1',
      statusLabel: 'Data Mandiri (Perlu Konfirmasi Nakes)',
      sourceType: 'SELF_MANDIRI',
      therapyNote: 'Catatan mandiri harian untuk pemantauan pribadi',
      isConfirmed: false,
    };

    setAdditionalPoints((prev) => [...prev, newPoint]);
    setSelfLogged(true);
  };

  return (
    <div className="p-4 space-y-5">
      {/* Header with DocBadge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-1.5 rounded-full hover:bg-gray-200 text-gray-700 transition-colors"
            aria-label="Kembali ke Beranda"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-black">Hasil & Riwayat</h1>
            <p className="text-xs text-[#60716D]">
              Catatan nilai pemeriksaan kesehatan dari kegiatan CKG
            </p>
          </div>
        </div>

        <DocBadge
          code="SCR-WRG-D01"
          title="Hasil Pemeriksaan Saya"
          phase="F1"
          plafon="S4"
          useCase="UC PSN-05"
          description="Nilai disertai satuan baku dan penjelasan awam. Temuan unconfirmed bukan diagnosis."
          rules={[
            'Nilai selalu disertai satuan dan penjelasan awam.',
            'Nilai belum terkonfirmasi diberi penanda tegas.',
            'Data mandiri dibedakan visualnya dari faskes resmi.',
          ]}
          variant="amber"
          size="xs"
        />
      </div>

      {/* Sub Tabs for D01, D02, D03, E03 */}
      <div className="flex rounded-xl bg-gray-200/80 p-1 text-xs gap-1">
        <button
          onClick={() => setActiveSubTab('LATEST')}
          title="[SCR-WRG-D01] Hasil Pemeriksaan Saya"
          className={`flex-1 py-1.5 font-bold rounded-lg transition-all text-center ${
            activeSubTab === 'LATEST'
              ? 'bg-[#00201C] text-white shadow-xs'
              : 'text-gray-700 hover:bg-gray-300/60'
          }`}
        >
          Hasil (D01)
        </button>

        <button
          onClick={() => setActiveSubTab('TREND')}
          title="[SCR-WRG-D02] Riwayat Longitudinal Tren Tensi/Gula"
          className={`flex-1 py-1.5 font-bold rounded-lg transition-all text-center ${
            activeSubTab === 'TREND'
              ? 'bg-[#00201C] text-white shadow-xs'
              : 'text-gray-700 hover:bg-gray-300/60'
          }`}
        >
          Tren (D02)
        </button>

        <button
          onClick={() => setActiveSubTab('EDUCATION')}
          title="[SCR-WRG-D03] Edukasi Sesuai Temuan Spesifik"
          className={`flex-1 py-1.5 font-bold rounded-lg transition-all text-center ${
            activeSubTab === 'EDUCATION'
              ? 'bg-[#00201C] text-white shadow-xs'
              : 'text-gray-700 hover:bg-gray-300/60'
          }`}
        >
          Edukasi (D03)
        </button>

        <button
          onClick={() => setActiveSubTab('SELF')}
          title="[SCR-WRG-E03] Pengukuran Mandiri Warga"
          className={`flex-1 py-1.5 font-bold rounded-lg transition-all text-center ${
            activeSubTab === 'SELF'
              ? 'bg-[#00201C] text-white shadow-xs'
              : 'text-gray-700 hover:bg-gray-300/60'
          }`}
        >
          Mandiri (E03)
        </button>
      </div>

      {/* Safety Banner */}
      <div className="bg-[#FFFACD]/70 border border-[#f0df9f] p-3.5 rounded-2xl flex items-start gap-2.5 text-xs text-amber-950 leading-relaxed">
        <Info className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
        <div>
          <strong className="block text-amber-900 font-semibold mb-0.5">
            Pemeriksaan Konfirmasi:
          </strong>
          {SAFETY_MESSAGES.UNCONFIRMED_VALUE}
        </div>
      </div>

      {/* SUB-VIEW 1: LATEST RESULTS (SCR-WRG-D01) */}
      {activeSubTab === 'LATEST' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Daftar Hasil Pengukuran
            </h2>
            <span className="text-[10px] text-gray-400 font-mono">Plafon S4 Dirinya Sendiri</span>
          </div>

          {healthValues.length === 0 ? (
            <div className="bg-white p-6 rounded-2xl border border-[#D8E5E2] text-center space-y-2">
              <FileText className="w-8 h-8 mx-auto text-gray-400" />
              <p className="text-xs text-gray-500 font-medium">
                Belum ada riwayat hasil pengukuran yang tercatat.
              </p>
            </div>
          ) : (
            healthValues.map((item, idx) => {
              const isConfirmed = item.confirmationState === 'CONFIRMED';
              return (
                <div
                  key={idx}
                  className="bg-white p-4 rounded-2xl border border-[#D8E5E2] shadow-2xs space-y-2.5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-black">{item.label}</h3>
                      <div className="text-[11px] text-[#60716D] flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        {new Date(item.measuredAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                    </div>

                    {/* Confirmation Badge */}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        isConfirmed
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {isConfirmed ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Dikonfirmasi
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3 h-3 text-amber-700" />
                          Perlu Dipastikan
                        </>
                      )}
                    </span>
                  </div>

                  {/* Value Display */}
                  <div className="bg-[#F8FBFA] p-3 rounded-xl border border-[#D8E5E2] flex items-baseline justify-between">
                    <span className="text-xs text-gray-600 font-medium">Hasil Ukur</span>
                    <span className="text-lg font-extrabold text-black tracking-tight">
                      {item.value}
                    </span>
                  </div>

                  {/* Provenance */}
                  <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                    <span>Sumber: {item.sourceLabel}</span>
                    {!isConfirmed && (
                      <button
                        onClick={() => onNavigate('SCHEDULE')}
                        className="text-black font-semibold hover:underline"
                      >
                        Jadwalkan Cek Ulang &rarr;
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* SUB-VIEW 2: LONGITUDINAL TREND (SCR-WRG-D02) */}
      {activeSubTab === 'TREND' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <DocBadge
              code="SCR-WRG-D02"
              title="Riwayat Longitudinal"
              phase="F2"
              plafon="S4"
              useCase="UC PSN-08"
              description="Tren tekanan darah & gula darah antar waktu berdampingan dengan terapi pengobatan."
              rules={[
                'Garis Sistole dan Garis Diastole ditampilkan berdampingan dengan catatan waktu.',
                'Tren dipadukan dengan catatan terapi pengobatan pada periode tersebut.',
                'Nilai dari sumber berbeda tidak digabung ke dalam satu garis tanpa pembeda.',
              ]}
              variant="purple"
              size="xs"
            />
            <span className="text-[10px] text-gray-500 font-mono">F2 · Tren Historis</span>
          </div>

          {/* Dedicated Blood Pressure Trend Chart with Systole & Diastole lines vs Catatan Waktu */}
          <BloodPressureTrendChart
            customData={additionalPoints.length > 0 ? [...DEFAULT_BP_HISTORY, ...additionalPoints] : undefined}
            onScheduleClick={() => onNavigate('SCHEDULE')}
          />
        </div>
      )}

      {/* SUB-VIEW 3: CONTEXTUAL EDUCATION (SCR-WRG-D03) */}
      {activeSubTab === 'EDUCATION' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <DocBadge
              code="SCR-WRG-D03"
              title="Edukasi Sesuai Temuan"
              phase="F2"
              plafon="S3"
              useCase="UC PSN-09"
              description="Materi edukasi personal sesuai temuan spesifik tanpa anjuran perubahan dosis obat mandiri."
              rules={[
                'Terpersonalisasi sesuai temuan, bukan konten generik.',
                'Tidak pernah menggantikan nasihat nakes / merubah dosis mandiri.',
              ]}
              variant="emerald"
              size="xs"
            />
            <span className="text-[10px] text-gray-500 font-mono">F2 · Gaya Hidup</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#D8E5E2] space-y-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-700" />
              <h3 className="font-bold text-xs text-black">Panduan Garam & Konsumsi Air di Daerah Pesisir</h3>
            </div>
            <p className="text-xs text-gray-700 leading-relaxed">
              Di Pulau Taliabu, konsumsi ikan asin dan makanan olahan laut memiliki kadar natrium tinggi. Dianjurkan merendam ikan asin sebelum dimasak dan mencukupi asupan air putih 2 liter per hari.
            </p>
            <div className="pt-2 border-t border-gray-100 text-[11px] text-gray-500">
              Disusun oleh Tim Promkes Dinkes Kabupaten Pulau Taliabu
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 4: SELF-MEASUREMENT (SCR-WRG-E03) */}
      {activeSubTab === 'SELF' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <DocBadge
              code="SCR-WRG-E03"
              title="Pengukuran Mandiri Warga"
              phase="F3"
              plafon="S4"
              useCase="UC PSN-17"
              description="Pencatatan tensi / gula mandiri dengan label pembeda tegas 'Data Mandiri' tanpa mengubah status CRS."
              rules={[
                'Ditandai jelas sebagai "Data Mandiri" di seluruh antarmuka.',
                'Tidak pernah memicu penetapan status klinis tanpa konfirmasi nakes.',
              ]}
              variant="slate"
              size="xs"
            />
            <span className="text-[10px] text-gray-500 font-mono">F3 · Mandiri</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#D8E5E2] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-black">Catat Tekanan Darah Mandiri</span>
              <span className="text-[9px] font-bold uppercase bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                Data Mandiri
              </span>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-medium text-gray-600 block">
                Hasil Tensi dari Alat Pribadi di Rumah (mmHg):
              </label>
              <input
                type="text"
                value={selfBp}
                onChange={(e) => setSelfBp(e.target.value)}
                placeholder="Contoh: 125/80"
                className="w-full px-3.5 py-2 text-xs border border-[#D8E5E2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00201C]"
              />
            </div>

            <button
              onClick={handleAddSelfMeasurement}
              className="w-full py-2.5 bg-[#00201C] text-white text-xs font-bold rounded-xl hover:bg-[#102521] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Simpan Data Mandiri ke Riwayat
            </button>

            {selfLogged && (
              <div className="p-2.5 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs space-y-1">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Pengukuran mandiri <strong>{selfBp} mmHg</strong> berhasil dicatat.</span>
                </div>
                <p className="text-[11px] text-emerald-800 pl-6">
                  Data ini masuk ke catatan pribadi dan dapat Anda tinjau pada tab <strong>Tren (D02)</strong>.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CTA to Schedule */}
      <div className="pt-2">
        <button
          onClick={() => onNavigate('SCHEDULE')}
          className="w-full py-3.5 bg-[#00201C] text-white rounded-xl font-bold text-xs hover:bg-[#102521] transition-colors text-center"
        >
          Lihat / Atur Jadwal Pemeriksaan
        </button>
      </div>
    </div>
  );
};

