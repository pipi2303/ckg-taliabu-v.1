import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  FileText,
  HelpCircle,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Building2,
  ChevronRight,
  RefreshCw,
  PhoneCall,
  UserCheck,
  Pill,
  Check,
} from 'lucide-react';
import { useCitizen } from '../context/CitizenContext';
import { CitizenActiveTab } from '../components/CitizenAppShell';
import { citizenOfflineCacheService } from '../../../services/citizenOfflineCacheService';
import { DocBadge } from '../components/DocBadge';

interface CitizenHomePageProps {
  onNavigate: (tab: CitizenActiveTab) => void;
}

export const CitizenHomePage: React.FC<CitizenHomePageProps> = ({ onNavigate }) => {
  const { citizen, profile, offlineCache, isOnline, isLoading, refreshProfile, demoMode } =
    useCitizen();

  const [medTakenToday, setMedTakenToday] = useState(false);

  // Freshness timestamp
  const lastUpdated = isOnline
    ? citizenOfflineCacheService.formatFreshnessTime(profile?.lastUpdatedAt)
    : citizenOfflineCacheService.formatFreshnessTime(offlineCache?.cachedAt);

  // If no citizen / loading
  if (isLoading) {
    return (
      <div className="p-4 space-y-4 animate-pulse">
        <div className="h-40 bg-gray-200 rounded-2xl"></div>
        <div className="h-28 bg-gray-200 rounded-xl"></div>
        <div className="h-20 bg-gray-200 rounded-xl"></div>
      </div>
    );
  }

  // State: No CKG Data Available (Scenario 5)
  if (demoMode === 'NO_DATA' || !citizen) {
    return (
      <div className="p-5 space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-[#D8E5E2] shadow-sm text-center space-y-4">
          <div className="flex justify-center">
            <DocBadge
              code="SCR-WRG-B01"
              title="Beranda: Keadaan Tanpa Tindakan"
              phase="F1"
              plafon="S2"
              useCase="UC PSN-06"
              description="Keadaan tanpa data / tanpa tindakan dinyatakan sebagai keadaan baik dengan panduan ramah."
              rules={[
                'Bukan pesan kesalahan sistem, melainkan panduan cara ikut CKG.',
                'Warga belum CKG dipandu ke Posyandu atau faskes terdekat.',
              ]}
              variant="amber"
              size="xs"
            />
          </div>
          <div className="w-14 h-14 mx-auto rounded-full bg-[#E1F5FE] flex items-center justify-center text-black">
            <Clock className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-black">Data CKG Anda Belum Tersedia</h2>
            <p className="text-xs text-[#60716D] mt-1.5 leading-relaxed">
              Hasil pemeriksaan skrining kesehatan CKG Anda belum masuk ke sistem Puskesmas. Mohon pastikan Anda sudah melakukan skrining di Posyandu atau faskes.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => onNavigate('FACILITY')}
              className="w-full py-3 bg-[#00201C] text-white rounded-xl text-xs font-semibold hover:bg-[#102521] transition-all flex items-center justify-center gap-2"
            >
              <Building2 className="w-4 h-4" />
              Hubungi Puskesmas Bobong
            </button>
            <button
              onClick={refreshProfile}
              className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Periksa Ulang Data
            </button>
          </div>
        </div>

        <div className="text-center text-[11px] text-gray-500">
          Terakhir diperiksa: {lastUpdated}
        </div>
      </div>
    );
  }

  const nextAction = profile?.nextAction;
  const appointment = profile?.appointment;
  const step = profile?.statusTimelineStep || 1;

  return (
    <div className="p-4 space-y-5">
      {/* Greeting & Subtitle */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-black tracking-tight">
            Halo, {citizen.fullName.split(' ')[0]}
          </h1>
          <p className="text-xs text-[#60716D] mt-0.5">
            {citizen.villageName ? `Desa ${citizen.villageName}` : 'Kabupaten Pulau Taliabu'}
          </p>
        </div>

        <button
          onClick={refreshProfile}
          title="Perbarui data"
          className="p-2 rounded-full bg-white border border-[#D8E5E2] text-gray-600 hover:text-black active:scale-95 shadow-2xs"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* ============================================================ */}
      {/* 1. DOMINANT NEXT ACTION CARD (THE MOST IMPORTANT ELEMENT)    */}
      {/* ============================================================ */}
      <section aria-labelledby="next-action-heading" className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <DocBadge
            code="SCR-WRG-B01"
            title="Beranda: Tindakan Berikutnya"
            phase="F1"
            plafon="S2"
            useCase="UC PSN-06, PSN-07"
            description="Satu tindakan menonjol menjawab apa yang harus dilakukan, kapan, dan di mana."
            rules={[
              'Satu tindakan menonjol, sisanya sekunder (mencegah beban kognitif).',
              'Kategori risiko internal merah/oranye/kuning & aturan CRS tidak pernah ditampilkan.',
              'Tenggat waktu dalam bahasa sehari-hari ("sebelum akhir bulan ini").',
            ]}
            variant="amber"
            size="xs"
          />
          <span className="text-[10px] text-gray-500 font-mono">F1 · Plafon S2</span>
        </div>

        <div className="bg-[#00201C] text-white p-5 rounded-2xl shadow-md relative overflow-hidden border border-[#102521]">
          {/* Subtle decoration */}
          <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-[#102521] pointer-events-none opacity-50" />

          <div className="relative z-10 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#FFFACD] text-black">
                Tindakan Anda Berikutnya
              </span>
              {nextAction && (
                <span className="text-[11px] text-[#E1F5FE] flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  {nextAction.dueText}
                </span>
              )}
            </div>

            {nextAction ? (
              <>
                <div>
                  <h2 id="next-action-heading" className="text-lg font-bold text-white leading-snug">
                    {nextAction.title}
                  </h2>
                  <p className="text-xs text-[#D8E5E2] mt-1 leading-relaxed">
                    {nextAction.description}
                  </p>
                </div>

                <div className="bg-[#102521] p-3 rounded-xl border border-[#27463f] space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-[#E1F5FE]">
                    <MapPin className="w-4 h-4 text-[#FFFACD] shrink-0" />
                    <span className="font-semibold">{nextAction.facilityName || 'Puskesmas Bobong'}</span>
                  </div>

                  {nextAction.preparationItems && nextAction.preparationItems.length > 0 && (
                    <div className="pt-1.5 border-t border-[#1c3832] text-[11px] text-gray-300">
                      <div className="font-medium text-[#FFFACD] mb-1">Yang perlu disiapkan / dibawa:</div>
                      <ul className="list-disc list-inside space-y-0.5 text-gray-200">
                        {nextAction.preparationItems.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Dominant Primary Action Button */}
                <div className="pt-1">
                  {nextAction.primaryAction === 'VIEW_APPOINTMENT' ? (
                    <button
                      onClick={() => onNavigate('SCHEDULE')}
                      className="w-full py-3.5 px-4 bg-[#E1F5FE] hover:bg-white text-black rounded-xl font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 active:scale-98"
                    >
                      <Calendar className="w-4 h-4 text-black" />
                      Lihat Detail Jadwal Kunjungan
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => onNavigate('SCHEDULE')}
                      className="w-full py-3.5 px-4 bg-[#FFFACD] hover:bg-[#fff7b3] text-black rounded-xl font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 active:scale-98"
                    >
                      <Calendar className="w-4 h-4 text-black" />
                      Pilih Jadwal Pemeriksaan
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="py-2 space-y-2">
                <h2 className="text-base font-bold text-white">
                  Saat Ini Tidak Ada Tindakan Aktif
                </h2>
                <p className="text-xs text-[#D8E5E2] leading-relaxed">
                  Pemeriksaan kesehatan tindak lanjut Anda telah selesai atau sedang dalam pemantauan rutin.
                </p>
                <button
                  onClick={() => onNavigate('RESULTS')}
                  className="w-full py-3 bg-[#E1F5FE] text-black rounded-xl font-semibold text-xs mt-2"
                >
                  Lihat Hasil Pemeriksaan Terakhir
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. PLAIN-LANGUAGE STATUS EXPLANATION TIMELINE (SCR-WRG-B02)  */}
      {/* ============================================================ */}
      <section className="bg-white p-4 rounded-2xl border border-[#D8E5E2] shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <DocBadge
            code="SCR-WRG-B02"
            title="Penjelasan Status"
            phase="F1"
            plafon="S3"
            useCase="UC PSN-05, PSN-06"
            description="Temuan belum terkonfirmasi wajib disampaikan 'hasilnya perlu dipastikan dulu' — bukan vonis penyakit."
            rules={[
              'Temuan belum terkonfirmasi bukan penyakit.',
              'Tidak ada warna risiko internal (merah, oranye, kuning).',
              'Lolos uji keterpahaman bahasa awam >50 tahun (UX-OI-01).',
            ]}
            variant="emerald"
            size="xs"
          />
          <span className="text-[10px] text-gray-500 font-medium">Langkah {step} dari 4</span>
        </div>

        {/* Timeline dots */}
        <div className="grid grid-cols-4 gap-1.5 pt-1">
          <div
            className={`h-2 rounded-full transition-all ${
              step >= 1 ? 'bg-[#00201C]' : 'bg-gray-200'
            }`}
          />
          <div
            className={`h-2 rounded-full transition-all ${
              step >= 2 ? 'bg-[#00201C]' : 'bg-gray-200'
            }`}
          />
          <div
            className={`h-2 rounded-full transition-all ${
              step >= 3 ? 'bg-[#00201C]' : 'bg-gray-200'
            }`}
          />
          <div
            className={`h-2 rounded-full transition-all ${
              step >= 4 ? 'bg-emerald-600' : 'bg-gray-200'
            }`}
          />
        </div>

        {/* Friendly explanation card */}
        <div className="bg-[#F8FBFA] p-3 rounded-xl border border-[#D8E5E2] flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-black leading-relaxed">
              {profile?.followUpStatusText ||
                'Hasil pemeriksaan CKG Anda sedang dalam proses pendampingan.'}
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* PENANDA MINUM OBAT HARIAN (SCR-WRG-E01)                      */}
      {/* ============================================================ */}
      <section className="bg-white p-4 rounded-2xl border border-[#D8E5E2] shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between">
          <DocBadge
            code="SCR-WRG-E01"
            title="Penanda Minum Obat Harian"
            phase="F2"
            plafon="S4"
            useCase="UC PSN-15"
            description="Checklist minum obat harian satu ketukan, tanpa skor kepatuhan menyalahkan."
            rules={[
              'Satu ketukan per hari tanpa skor kepatuhan yang ditampilkan ke warga.',
              'Hari terlewat tidak diberi warna merah atau bahasa menghakimi.',
            ]}
            variant="blue"
            size="xs"
          />
          <span className="text-[10px] text-gray-400 font-mono">F2 · Terapi</span>
        </div>

        <div className="p-3 bg-[#F0F5F4] rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E1F5FE] text-black flex items-center justify-center">
              <Pill className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-black">Obat Rutin Hari Ini</div>
              <div className="text-[10px] text-gray-600">Amlodipine 5mg (1x sehari)</div>
            </div>
          </div>

          <button
            onClick={() => setMedTakenToday((prev) => !prev)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs ${
              medTakenToday
                ? 'bg-emerald-700 text-white'
                : 'bg-[#00201C] text-white hover:bg-[#102521]'
            }`}
          >
            {medTakenToday ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Sudah Diminum</span>
              </>
            ) : (
              <span>Tandai Sudah Minum</span>
            )}
          </button>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. ACTIVE APPOINTMENT SUMMARY (IF SCHEDULED) (SCR-WRG-C01)   */}
      {/* ============================================================ */}
      {appointment && (
        <section className="bg-[#E1F5FE]/60 border border-[#b2e3f8] p-4 rounded-2xl space-y-2.5">
          <div className="flex items-center justify-between">
            <DocBadge
              code="SCR-WRG-C01"
              title="Jadwal Kunjungan Terjadwal"
              phase="F1"
              plafon="S2"
              useCase="UC PSN-10"
              description="Konfirmasi jadwal faskes terintegrasi kuota FKTP."
              variant="blue"
              size="xs"
            />
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
              {appointment.status === 'CONFIRMED' ? 'Terkonfirmasi' : appointment.status}
            </span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-[#D8E5E2] space-y-1.5 text-xs">
            <div className="font-bold text-black">
              {appointment.scheduledDate} • {appointment.scheduledTimeSlot}
            </div>
            <div className="text-[#60716D] flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              {appointment.facilityName}
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={() => onNavigate('SCHEDULE')}
              className="flex-1 py-2 px-3 bg-white border border-[#00201C] text-black text-xs font-semibold rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              Ubah / Konfirmasi
            </button>
            <button
              onClick={() => onNavigate('FACILITY')}
              className="py-2 px-3 bg-[#00201C] text-white text-xs font-semibold rounded-lg hover:bg-[#102521] transition-colors text-center"
            >
              Petunjuk Lokasi
            </button>
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/* 4. SECONDARY ACTION HUBS                                     */}
      {/* ============================================================ */}
      <section className="space-y-2.5">
        <h3 className="text-xs font-bold text-[#60716D] uppercase tracking-wider px-1">
          Menu Bantuan & Informasi
        </h3>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Hasil Pemeriksaan */}
          <button
            onClick={() => onNavigate('RESULTS')}
            className="p-3.5 bg-white rounded-xl border border-[#D8E5E2] text-left hover:border-[#00201C] transition-all flex flex-col justify-between shadow-2xs group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-[#E1F5FE] flex items-center justify-center text-black group-hover:scale-105 transition-transform">
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-mono font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                D01
              </span>
            </div>
            <div>
              <div className="font-bold text-xs text-black">Hasil Pemeriksaan</div>
              <div className="text-[10px] text-[#60716D] mt-0.5">Lihat nilai gula & tensi</div>
            </div>
          </button>

          {/* Informasi Fasilitas */}
          <button
            onClick={() => onNavigate('FACILITY')}
            className="p-3.5 bg-white rounded-xl border border-[#D8E5E2] text-left hover:border-[#00201C] transition-all flex flex-col justify-between shadow-2xs group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-[#FFFACD] flex items-center justify-center text-black group-hover:scale-105 transition-transform">
                <Building2 className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-mono font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                C03
              </span>
            </div>
            <div>
              <div className="font-bold text-xs text-black">Fasilitas & Lokasi</div>
              <div className="text-[10px] text-[#60716D] mt-0.5">Jadwal & rute kapal</div>
            </div>
          </button>

          {/* Lapor Kendala */}
          <button
            onClick={() => onNavigate('BARRIER')}
            className="p-3.5 bg-white rounded-xl border border-[#D8E5E2] text-left hover:border-amber-600 transition-all flex flex-col justify-between shadow-2xs group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-800 group-hover:scale-105 transition-transform">
                <AlertCircle className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-mono font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                C04
              </span>
            </div>
            <div>
              <div className="font-bold text-xs text-black">Lapor Kendala</div>
              <div className="text-[10px] text-[#60716D] mt-0.5">Sulit hadir atau transpor</div>
            </div>
          </button>

          {/* Minta Bantuan */}
          <button
            onClick={() => onNavigate('HELP')}
            className="p-3.5 bg-white rounded-xl border border-[#D8E5E2] text-left hover:border-[#00201C] transition-all flex flex-col justify-between shadow-2xs group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-800 group-hover:scale-105 transition-transform">
                <HelpCircle className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-mono font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                F01
              </span>
            </div>
            <div>
              <div className="font-bold text-xs text-black">Minta Bantuan</div>
              <div className="text-[10px] text-[#60716D] mt-0.5">Telepon atau kader</div>
            </div>
          </button>
        </div>
      </section>

      {/* Freshness Footer Note */}
      <div className="pt-2 text-center text-[10px] text-gray-500">
        Data diperbarui: {lastUpdated}
      </div>
    </div>
  );
};
