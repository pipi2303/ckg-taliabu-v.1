import React, { useState } from 'react';
import {
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Shield,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import { CitizenActiveTab } from './CitizenAppShell';

export interface ScreenDocItem {
  code: string;
  group: string;
  name: string;
  phase: 'F1' | 'F2' | 'F3';
  plafon: 'S0' | 'S1' | 'S2' | 'S3' | 'S4';
  useCase: string;
  storyRef: string;
  processRef: string;
  tabTarget?: CitizenActiveTab;
  isExternalLink?: boolean;
  rules: string[];
  description: string;
}

export const CITIZEN_SCREEN_REGISTRY: ScreenDocItem[] = [
  // Kelompok A
  {
    code: 'SCR-WRG-A01',
    group: 'Kelompok A — Masuk & Persetujuan',
    name: 'Masuk & penautan hasil CKG',
    phase: 'F1',
    plafon: 'S1',
    useCase: 'UC PSN-01',
    storyRef: 'Story CA-01, FG-03',
    processRef: 'CKG-BP-02 T2',
    tabTarget: 'ACCOUNT',
    rules: [
      'Kegagalan penautan tidak pernah mengungkapkan apakah seseorang terdaftar dalam program.',
      'Bahasa kegagalan seragam untuk semua sebab untuk mencegah NIK scanning.',
      'Warga belum CKG diberi panduan cara ikut, bukan pesan kesalahan.',
    ],
    description: 'Menautkan warga ke hasil CKG yang sudah ada di sistem via NIK/ponsel & OTP aman.',
  },
  {
    code: 'SCR-WRG-A02',
    group: 'Kelompok A — Masuk & Persetujuan',
    name: 'Persetujuan pemrosesan data',
    phase: 'F1',
    plafon: 'S0',
    useCase: 'UC PSN-02',
    storyRef: 'Story CA-02, FG-06, FG-07',
    processRef: 'CKG-BP-01 T3',
    tabTarget: 'ACCOUNT',
    rules: [
      'Persetujuan bersifat granular — tindak lanjut & pendampingan kader terpisah.',
      'Menolak tidak mengeluarkan warga dari layanan (data tetap masuk agregat FG-07).',
      'Kader tahu nama & alamat tapi tidak tahu hasil pemeriksaan sensitif.',
      'Pencabutan consent tersedia kapan saja di SCR-WRG-F03.',
    ],
    description: 'Persetujuan eksplisit pemrosesan data medis & pendampingan kader sesuai UU 27/2022.',
  },

  // Kelompok B
  {
    code: 'SCR-WRG-B01',
    group: 'Kelompok B — Beranda Satu Tindakan',
    name: 'Beranda: tindakan berikutnya',
    phase: 'F1',
    plafon: 'S2',
    useCase: 'UC PSN-06, PSN-07',
    storyRef: 'Story CA-04, CA-03',
    processRef: 'CKG-BP-02 sisi warga',
    tabTarget: 'HOME',
    rules: [
      'Satu tindakan menonjol, sisanya di bawah (mencegah paradox of choice).',
      'Kategori risiko internal (merah, oranye, kuning) & nomor aturan CRS tidak pernah muncul.',
      'Tenggat ditulis dalam bahasa sehari-hari ("sebelum akhir bulan ini").',
      'Keadaan tanpa tindakan dinyatakan sebagai keadaan baik dengan jadwal berikutnya.',
    ],
    description: 'Menjawab 1 pertanyaan esensial: apa yang harus saya lakukan berikutnya, kapan, dan di mana.',
  },
  {
    code: 'SCR-WRG-B02',
    group: 'Kelompok B — Beranda Satu Tindakan',
    name: 'Penjelasan status',
    phase: 'F1',
    plafon: 'S3',
    useCase: 'UC PSN-05, PSN-06',
    storyRef: 'Story CA-03',
    processRef: 'CKG-BP-02 sisi warga',
    tabTarget: 'HOME',
    rules: [
      'Temuan belum terkonfirmasi wajib disampaikan: "hasilnya perlu dipastikan dulu".',
      'Tidak pernah dinyatakan sebagai vonis atau penyakit sebelum konfirmasi faskes.',
      'Tingkat kemendesakan sebagai kalimat, bukan warna/indikator bahaya internal.',
      'Wajib lulus uji pemahaman warga lansia >50 tahun (UX-OI-01).',
    ],
    description: 'Menjelaskan temuan dan alur tindak lanjut dalam bahasa awam yang menenangkan & jelas.',
  },

  // Kelompok C
  {
    code: 'SCR-WRG-C01',
    group: 'Kelompok C — Jadwal & Kehadiran',
    name: 'Pilih & ubah jadwal',
    phase: 'F1',
    plafon: 'S2',
    useCase: 'UC PSN-10, PSN-12',
    storyRef: 'Story CA-05, CO-07',
    processRef: 'CKG-BP-02 T9',
    tabTarget: 'SCHEDULE',
    rules: [
      'Slot kuota terintegrasi real-time dengan kuota FKTP Puskesmas/Pustu (SCR-PKM-E01).',
      'Alasan penjadwalan ulang memakai format baku CMP-07 (sinyal risiko dropout).',
      'Bahasa netral tanpa kesan menyalahkan agar warga tidak enggan melapor.',
    ],
    description: 'Memilih slot kunjungan di Puskesmas atau Pustu sesuai kuota dan mengubahnya bila perlu.',
  },
  {
    code: 'SCR-WRG-C02',
    group: 'Kelompok C — Jadwal & Kehadiran',
    name: 'Konfirmasi kehadiran dari pesan',
    phase: 'F1',
    plafon: 'S2',
    useCase: 'UC PSN-11',
    storyRef: 'Story CA-06, CO-05, MA-06',
    processRef: 'CKG-BP-02 T3-4',
    tabTarget: 'SCHEDULE',
    isExternalLink: true,
    rules: [
      'Bekerja tanpa perlu login akun aplikasi utama.',
      'Tidak menampilkan data S3 sensitif — hanya jadwal dan tempat.',
      'Tautan sekali pakai dengan masa berlaku terenkripsi.',
      'Menyediakan pemilih alasan kendala CMP-07 bila berhalangan hadir.',
    ],
    description: 'Layar ringan yang dibuka dari tautan pesan WhatsApp untuk konfirmasi kehadiran instan.',
  },
  {
    code: 'SCR-WRG-C03',
    group: 'Kelompok C — Jadwal & Kehadiran',
    name: 'Informasi fasilitas & logistik',
    phase: 'F2',
    plafon: 'S0',
    useCase: 'UC PSN-13',
    storyRef: 'Story CA-07',
    processRef: 'CKG-BP-03 T1',
    tabTarget: 'FACILITY',
    rules: [
      'Wajib berfungsi tanpa peta daring (tersedia instruksi rute teks & maritim).',
      'Keterangan persiapan & puasa diturunkan otomatis dari jenis pemeriksaan yang dijadwalkan.',
      'Informasi nomor kontak darurat & staf faskes resmi.',
    ],
    description: 'Menyampaikan lokasi, jam buka, apa yang perlu dibawa, dan petunjuk puasa pemeriksaan.',
  },
  {
    code: 'SCR-WRG-C04',
    group: 'Kelompok C — Jadwal & Kehadiran',
    name: 'Lapor kendala tindak lanjut',
    phase: 'F1',
    plafon: 'S2',
    useCase: 'UC PSN-12, PSN-14',
    storyRef: 'Story CA-08',
    processRef: 'CKG-BP-02 T8',
    tabTarget: 'BARRIER',
    rules: [
      'Daftar alasan baku CMP-07 wajib identik dengan aplikasi kader (SCR-KDR-C02) & Puskesmas (SCR-PKM-B03).',
      'Setiap kendala memicu intervensi spesifik (kendala perahu memicu kunjungan kader keliling, bukan spam pesan).',
      'Menjelaskan apa yang akan terjadi selanjutnya setelah kendala dilaporkan.',
    ],
    description: 'Memberi warga cara menyampaikan kendala transportasi/biaya sebelum hilang dari kaskade.',
  },

  // Kelompok D
  {
    code: 'SCR-WRG-D01',
    group: 'Kelompok D — Hasil & Riwayat',
    name: 'Hasil pemeriksaan saya',
    phase: 'F1',
    plafon: 'S4',
    useCase: 'UC PSN-05',
    storyRef: 'Story CA-11, CA-03',
    processRef: 'CKG-BP-01 T3',
    tabTarget: 'RESULTS',
    rules: [
      'Nilai selalu disertai satuan baku dan penjelasan awam (bukan angka telanjang).',
      'Nilai belum terkonfirmasi diberi penanda tegas dan tidak pernah disajikan sebagai diagnosis.',
      'Nilai mandiri warga dibedakan visualnya dari hasil faskes resmi.',
    ],
    description: 'Menampilkan hasil pemeriksaan CKG beserta penjelasan singkat dan status konfirmasi.',
  },
  {
    code: 'SCR-WRG-D02',
    group: 'Kelompok D — Hasil & Riwayat',
    name: 'Riwayat longitudinal (Garis Sistole & Diastole)',
    phase: 'F2',
    plafon: 'S4',
    useCase: 'UC PSN-08',
    storyRef: 'Story CA-11',
    processRef: 'CKG-BP-05 T8',
    tabTarget: 'RESULTS',
    rules: [
      'Garis Sistole dan Garis Diastole ditampilkan berdampingan terhadap catatan waktu pemeriksaan.',
      'Tren ditampilkan berdampingan dengan terapi pengobatan dan intervensi pada periode tersebut.',
      'Nilai dari sumber berbeda (faskes vs mandiri) diberi label dan pembeda visual tegas.',
    ],
    description: 'Grafik Garis Sistole dan Garis Diastole vs Catatan Waktu untuk pemantauan tren tekanan darah longitudinal.',
  },
  {
    code: 'SCR-WRG-D03',
    group: 'Kelompok D — Hasil & Riwayat',
    name: 'Edukasi sesuai temuan',
    phase: 'F2',
    plafon: 'S3',
    useCase: 'UC PSN-09',
    storyRef: 'Story CA-16',
    processRef: 'CKG-BP-05 T5',
    tabTarget: 'RESULTS',
    rules: [
      'Materi terpersonalisasi sesuai temuan spesifik, bukan konten generik.',
      'Tidak pernah memuat anjuran yang menggantikan nasihat nakes atau dosis obat mandiri.',
      'Edukasi berhenti pada pemahaman gaya hidup & kepatuhan.',
    ],
    description: 'Panduan edukasi kesehatan kontekstual berdasarkan temuan skrining warga.',
  },

  // Kelompok E
  {
    code: 'SCR-WRG-E01',
    group: 'Kelompok E — Terapi & Kepatuhan',
    name: 'Penanda minum obat harian',
    phase: 'F2',
    plafon: 'S4',
    useCase: 'UC PSN-15',
    storyRef: 'Story CA-12, MA-01',
    processRef: 'CKG-BP-05 T4',
    tabTarget: 'HOME',
    rules: [
      'Satu ketukan per hari tanpa kalkulasi skor kepatuhan yang ditampilkan ke warga.',
      'Hari terlewat tidak diberi bahasa menghakimi/menyalahkan ataupun warna peringatan merah.',
      'Data bersifat indikasi (bukan bukti absolut di mata nakes).',
    ],
    description: 'Checklist harian minum obat mandiri sederhana selama masa terapi kronis.',
  },
  {
    code: 'SCR-WRG-E02',
    group: 'Kelompok E — Terapi & Kepatuhan',
    name: 'Lapor kendala terapi farmakologi',
    phase: 'F2',
    plafon: 'S4',
    useCase: 'UC PSN-16',
    storyRef: 'Story CA-12, MA-07',
    processRef: 'CKG-BP-05 T4',
    tabTarget: 'BARRIER',
    rules: [
      'Efek samping obat (MEDICATION_SIDE_EFFECT) otomatis diteruskan ke jalur klinis dokter.',
      'Obat habis (MEDICATION_UNAVAILABLE) diteruskan ke jalur logistik farmasi Puskesmas.',
      'Menyampaikan estimasi waktu tanggapan dari tenaga kesehatan.',
    ],
    description: 'Menyampaikan efek samping, obat habis, kendala biaya, atau persepsi sudah sembuh.',
  },
  {
    code: 'SCR-WRG-E03',
    group: 'Kelompok E — Terapi & Kepatuhan',
    name: 'Pengukuran mandiri warga',
    phase: 'F3',
    plafon: 'S4',
    useCase: 'UC PSN-17',
    storyRef: 'Story CA-15',
    processRef: 'CKG-BP-05 T3',
    tabTarget: 'RESULTS',
    rules: [
      'Ditandai sebagai "Data Mandiri" di seluruh antarmuka.',
      'Tidak pernah memicu klasifikasi ataupun penetapan status terkendali CRS secara mandiri.',
      'Konfirmasi status terkendali tetap wajib melalui pengukuran terkonfirmasi di faskes.',
    ],
    description: 'Mencatat tekanan darah atau gula darah dari tensimeter/glukometer pribadi warga.',
  },

  // Kelompok F
  {
    code: 'SCR-WRG-F01',
    group: 'Kelompok F — Bantuan, Akun & Hak Data',
    name: 'Minta bantuan & kontak kader',
    phase: 'F2',
    plafon: 'S1',
    useCase: 'UC PSN-14',
    storyRef: 'Story CA-09',
    processRef: 'CKG-BP-02 T8',
    tabTarget: 'HELP',
    rules: [
      'Hanya menampilkan kanal yang memiliki penanggung jawab aktif (kader desa / nakes).',
      'Tersedia jalur panggilan telepon langsung, pesan WhatsApp, dan permohonan kunjungan rumah.',
    ],
    description: 'Menghubungi kader Posyandu desa binaan atau Puskesmas saat memerlukan pendampingan.',
  },
  {
    code: 'SCR-WRG-F02',
    group: 'Kelompok F — Bantuan, Akun & Hak Data',
    name: 'Kelola anggota keluarga (Perwalian)',
    phase: 'F2',
    plafon: 'S4',
    useCase: 'UC PSN-04',
    storyRef: 'Story CA-13',
    processRef: 'lintas proses',
    tabTarget: 'ACCOUNT',
    rules: [
      'Perwalian memerlukan dasar hubungan tercatat (wali lansia/anak/disabilitas).',
      'Anggota yang dikelola dapat melihat siapa wali aktifnya.',
      'Pencabutan hak perwalian dapat dilakukan mandiri.',
    ],
    description: 'Memungkinkan wali mendampingi jadwal dan tindak lanjut akun anggota keluarga lansia.',
  },
  {
    code: 'SCR-WRG-F03',
    group: 'Kelompok F — Bantuan, Akun & Hak Data',
    name: 'Riwayat akses & pencabutan consent',
    phase: 'F2',
    plafon: 'S1',
    useCase: 'UC PSN-03',
    storyRef: 'Story CA-14, FG-13, FG-08',
    processRef: 'CKG-BP-01 T3',
    tabTarget: 'ACCOUNT',
    rules: [
      'Audit log CMP-09 transparan: siapa mengakses, kapan, dan untuk keperluan apa.',
      'Pencabutan consent berlaku ke depan dan akibatnya dijelaskan sebelum disetujui.',
      'Mendukung hak unduh salinan data pribadi warga (UU PDP 27/2022).',
    ],
    description: 'Transparansi jejak akses data medis pribadi dan pengelolaan hak pencabutan persetujuan.',
  },
];

interface CitizenScreenMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectScreen: (screen: ScreenDocItem) => void;
}

export const CitizenScreenMatrixModal: React.FC<CitizenScreenMatrixModalProps> = ({
  isOpen,
  onClose,
  onSelectScreen,
}) => {
  const [selectedGroup, setSelectedGroup] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const groups = [
    'ALL',
    'Kelompok A — Masuk & Persetujuan',
    'Kelompok B — Beranda Satu Tindakan',
    'Kelompok C — Jadwal & Kehadiran',
    'Kelompok D — Hasil & Riwayat',
    'Kelompok E — Terapi & Kepatuhan',
    'Kelompok F — Bantuan, Akun & Hak Data',
  ];

  const filtered = CITIZEN_SCREEN_REGISTRY.filter((s) => {
    const matchGroup = selectedGroup === 'ALL' || s.group === selectedGroup;
    const matchQuery =
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.useCase.toLowerCase().includes(searchQuery.toLowerCase());
    return matchGroup && matchQuery;
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-6"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden text-black border border-[#D8E5E2]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#00201C] text-white px-6 py-4 flex items-center justify-between border-b border-[#003B33]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-black flex items-center justify-center font-bold font-mono text-sm shadow-md">
              03
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-[#E1F5FE] tracking-tight">
                  Matriks Layar SCR-CKG 03 (17 Layar)
                </h2>
                <span className="text-[10px] uppercase font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded-full">
                  Sahabat Warga
                </span>
              </div>
              <p className="text-xs text-[#D8E5E2] font-normal">
                Daftar spesifikasi antarmuka, aturan mengikat, dan batas privasi S0 s.d S4
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/80 transition-colors"
            aria-label="Tutup modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Controls */}
        <div className="p-4 bg-[#F8FBFA] border-b border-[#D8E5E2] space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Cari kode (misal: SCR-WRG-B01, UC PSN-06, atau kata kunci)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-3.5 py-2 text-xs bg-white border border-[#D8E5E2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00201C]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-2.5 py-2 text-xs bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300"
              >
                Reset
              </button>
            )}
          </div>

          {/* Group Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-none">
            {groups.map((grp) => {
              const label = grp === 'ALL' ? 'Semua (17)' : grp.replace('Kelompok ', 'Kel. ');
              const isSelected = selectedGroup === grp;
              return (
                <button
                  key={grp}
                  onClick={() => setSelectedGroup(grp)}
                  className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    isSelected
                      ? 'bg-[#00201C] text-white shadow-xs'
                      : 'bg-white text-gray-700 border border-[#D8E5E2] hover:bg-gray-100'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* List of Screens */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-3 divide-y divide-gray-100">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-xs">
              Tidak ada layar yang cocok dengan kueri pencarian.
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.code}
                className="pt-3 first:pt-0 group hover:bg-[#F8FBFA] p-3 rounded-2xl transition-all border border-transparent hover:border-[#D8E5E2]"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <span className="font-mono font-bold text-xs bg-amber-950/90 text-amber-300 border border-amber-700 px-2 py-1 rounded-md shrink-0 shadow-2xs">
                      {item.code}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-sm text-black">
                          {item.name}
                        </h3>
                        <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded">
                          {item.phase}
                        </span>
                        <span className="text-[10px] font-semibold bg-sky-100 text-sky-900 px-1.5 py-0.5 rounded">
                          Plafon {item.plafon}
                        </span>
                        <span className="text-[10px] font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                          {item.useCase}
                        </span>
                      </div>
                      <p className="text-xs text-[#60716D] mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onSelectScreen(item);
                      onClose();
                    }}
                    className="self-end sm:self-center px-3 py-1.5 bg-[#00201C] text-white hover:bg-[#102521] text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs transition-transform active:scale-95 shrink-0"
                  >
                    <span>Buka Fitur</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Binding Rules Bullet points */}
                <div className="mt-2 pl-2 sm:pl-9 pt-2 border-t border-gray-100">
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Aturan Mengikat Dokumen SCR-CKG 03:
                  </div>
                  <ul className="space-y-1">
                    {item.rules.map((rule, idx) => (
                      <li
                        key={idx}
                        className="text-[11px] text-gray-700 flex items-start gap-1.5 leading-snug"
                      >
                        <span className="text-amber-600 font-bold shrink-0">•</span>
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-[#F8FBFA] px-6 py-3 border-t border-[#D8E5E2] flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-black" />
            <span>Kepatuhan Ketat UU 27/2022 PDP & Juknis Kemenkes CKG</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 font-semibold"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
