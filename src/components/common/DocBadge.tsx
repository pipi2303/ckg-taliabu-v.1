import React, { useState } from 'react';
import { Info, ShieldAlert, CheckCircle2, FileText, ArrowRight, AlertTriangle, BookOpen } from 'lucide-react';

export interface DocBadgeInfo {
  code: string;
  title: string;
  phase?: 'F1' | 'F2' | 'F3' | string;
  plafon?: 'S0' | 'S1' | 'S2' | 'S3' | 'S4' | string;
  useCase?: string;
  story?: string;
  issueWarning?: string; // e.g. "⚠ Tertahan OI-08" or "⚠ Tertahan UX-OI-03"
  description?: string;
  rules?: string[];
  variant?: 'emerald' | 'teal' | 'blue' | 'purple' | 'amber' | 'rose' | 'slate' | 'indigo';
}

export const SCR_SPEC_REGISTRY: Record<string, DocBadgeInfo> = {
  // Kelompok A — Sesi & Beranda
  'SCR-PKM-A01': {
    code: 'SCR-PKM-A01',
    title: 'Masuk & Pemilihan Peran',
    phase: 'F1',
    plafon: 'S0',
    useCase: 'UC PKM-24',
    story: 'FG-03, FG-04, FG-02',
    description: 'Menetapkan identitas, peran aktif, dan wilayah kerja sebelum data warga dimuat.',
    rules: [
      'Wilayah kerja terpilih membatasi seluruh permintaan data di sisi peladen.',
      'Peran aktif ditampilkan menetap pada kepala setiap layar.',
      'Gagal masuk menyebut penyebabnya tanpa mengungkap apakah akun ada.',
    ],
    variant: 'teal',
  },
  'SCR-PKM-A02': {
    code: 'SCR-PKM-A02',
    title: 'Beranda',
    phase: 'F1',
    plafon: 'S3',
    useCase: 'UC PKM-21, PKM-06',
    story: 'CO-12, CO-02, PC-03',
    description: 'Gambaran keadaan hari ini dalam satu layar (beban hari ini, tenggat lewat, kritis belum tertangani, rel kaskade ringkas).',
    rules: [
      'Beranda bukan tempat kerja; seluruh angka mengantar ke layar kerja spesifik.',
      'Setiap angka membawa penyebut dan waktu pemutakhiran (CMP-08).',
    ],
    variant: 'teal',
  },

  // Kelompok B — Antrean Kerja Harian
  'SCR-PKM-B01': {
    code: 'SCR-PKM-B01',
    title: 'Prioritas Hari Ini',
    phase: 'F1',
    plafon: 'S4',
    useCase: 'UC PKM-06, PKM-07',
    story: 'CO-02, CO-01, CO-08, RS-05, RS-09',
    description: 'Antrean kerja terurut berdasarkan kapasitas layanan harian (bukan seluruh registry).',
    rules: [
      'Temuan kritis RS-05 selalu di urutan teratas dan TIDAK terpengaruh penyaring.',
      'Skor prioritas wajib dapat diuraikan menjadi faktor pembentuknya.',
      'Setelah ditindak, baris meredup dan tombol nonaktif (tidak hilang seketika).',
    ],
    variant: 'teal',
  },
  'SCR-PKM-B02': {
    code: 'SCR-PKM-B02',
    title: 'Penugasan Outreach',
    phase: 'F1',
    plafon: 'S2',
    useCase: 'UC PKM-08',
    story: 'CO-03, CO-15, CO-16',
    description: 'Melimpahkan pekerjaan penjangkauan kepada kader Posyandu/Pustu per desa.',
    rules: [
      'Isi dibatasi Plafon S2 (nama, alamat, kalimat tindakan, tenggat).',
      'Informasi klinis sensitif (S3/S4) dilarang dikirim ke perangkat kader.',
    ],
    variant: 'teal',
  },
  'SCR-PKM-B03': {
    code: 'SCR-PKM-B03',
    title: 'Hasil Kontak',
    phase: 'F1',
    plafon: 'S2',
    useCase: 'UC PKM-09, PKM-10',
    story: 'CO-06, CO-05',
    issueWarning: '⚠ Tertahan UX-OI-03',
    description: 'Mencatat hasil upaya kontak telepon/pesan dengan alasan penolakan baku CMP-07.',
    rules: [
      'Alasan memakai enumerasi decline_reason yang identik dengan aplikasi kader dan warga.',
      'Catatan bebas tidak pernah menggantikan pilihan taksonomi baku.',
    ],
    variant: 'amber',
  },
  'SCR-PKM-B04': {
    code: 'SCR-PKM-B04',
    title: 'Drop-out & Kandidat Putus Perawatan',
    phase: 'F1',
    plafon: 'S3',
    useCase: 'UC PKM-11',
    story: 'CO-09, CO-10, CF-09, OM-09',
    description: 'Menyatukan warga yang mangkir/terlewat kontrol dari seluruh sumber dengan sebab teridentifikasi.',
    rules: [
      'Status LOST_TO_FOLLOWUP ditetapkan oleh manusia, tidak pernah oleh sistem.',
      'Bahasa antarmuka memakai "belum kembali kontrol", bukan "gagal follow-up".',
    ],
    variant: 'rose',
  },
  'SCR-PKM-B05': {
    code: 'SCR-PKM-B05',
    title: 'Papan Tenggat & Jenjang Pengingat',
    phase: 'F1',
    plafon: 'S2',
    useCase: 'UC PKM-09',
    story: 'CO-08, CO-04, CO-14, CO-12',
    description: 'Menampilkan tugas mendekati/melewati batas SLA dan status jenjang eskalasi otomatis.',
    rules: [
      'Tenggat terlampaui memakai warna perhatian sistem (--sys-attention), bukan merah klinis.',
      'Menyatakan keadaan dan langkah berikutnya tanpa menyalahkan petugas atau warga.',
    ],
    variant: 'teal',
  },

  // Kelompok C — Registry & Kartu Warga
  'SCR-PKM-C01': {
    code: 'SCR-PKM-C01',
    title: 'Registry Wilayah Kerja',
    phase: 'F1',
    plafon: 'S4',
    useCase: 'UC PKM-02',
    story: 'IR-06, IR-05, FG-04',
    description: 'Penelusuran seluruh warga wilayah kerja menurut nama, NIK, risiko, dan kaskade.',
    rules: [
      'Registry dirancang untuk mencari, bukan untuk antrean kerja harian.',
      'Ekspor tunduk pada aturan FG-08 dan tercatat lengkap pada jejak audit.',
    ],
    variant: 'teal',
  },
  'SCR-PKM-C02': {
    code: 'SCR-PKM-C02',
    title: 'Kartu Warga',
    phase: 'F1',
    plafon: 'S4',
    useCase: 'UC PKM-03',
    story: 'IR-05, IR-04, IR-10, IR-13',
    description: 'Satu tempat lengkap profil warga: temuan CKG, riwayat longitudinal, terapi berjalan, dan status consent.',
    rules: [
      'Nilai faskes klinis, observasi kader, dan data mandiri warga dibedakan visualnya.',
      'Nilai unconfirmed diberi penanda tegas dan tidak disajikan sebagai diagnosis.',
    ],
    variant: 'teal',
  },
  'SCR-PKM-C03': {
    code: 'SCR-PKM-C03',
    title: 'Dasar Klasifikasi',
    phase: 'F1',
    plafon: 'S4',
    useCase: 'UC PKM-03, PKM-04',
    story: 'RS-02, RS-06, RS-04, RS-07, RS-12',
    description: 'Transparansi nomor aturan CRS, nilai mentah input, dan versi aturan yang berlaku saat itu.',
    rules: [
      'Nomor aturan ditampilkan apa adanya tanpa disembunyikan istilah abstrak.',
      'Penimpaan manual (override) wajib menyertakan alasan dan riwayat lama tetap disimpan.',
    ],
    variant: 'teal',
  },
  'SCR-PKM-C04': {
    code: 'SCR-PKM-C04',
    title: 'Antrean Data Bermasalah',
    phase: 'F1',
    plafon: 'S3',
    useCase: 'UC PKM-05',
    story: 'IR-03, IR-07, IR-13',
    description: 'Menampung data anomali: NIK tidak valid, data tidak lengkap, warga luar wilayah.',
    rules: [
      'Warga di antrean ini tidak pernah dihitung 0; dihitung sebagai kelompok berkualifikasi.',
      'Koreksi data tercatat pada riwayat perubahan.',
    ],
    variant: 'amber',
  },
  'SCR-PKM-C05': {
    code: 'SCR-PKM-C05',
    title: 'Peninjauan Duplikat',
    phase: 'F2',
    plafon: 'S3',
    useCase: 'UC PKM-05',
    story: 'IR-08, IR-02',
    description: 'Meninjau pasangan identitas yang diduga sama dan memutuskan rekonsiliasi penggabungan.',
    rules: [
      'Penggabungan tidak menghapus riwayat peristiwa medis masa lalu.',
      'Tindakan penggabungan dapat dibatalkan (undoable).',
    ],
    variant: 'blue',
  },
  'SCR-PKM-C06': {
    code: 'SCR-PKM-C06',
    title: 'Selisih Skrining vs Terkonfirmasi',
    phase: 'F2',
    plafon: 'S3',
    useCase: 'UC PKM-03',
    story: 'RS-15',
    description: 'Menampilkan selisih temuan awal skrining terhadap hasil konfirmatori (mutu skrining).',
    rules: [
      'Bukan penilaian kinerja petugas perorangan.',
      'Kelompok AWAITING_CONFIRMATION ditampilkan terpisah.',
    ],
    variant: 'blue',
  },

  // Kelompok D — Kunjungan Klinis
  'SCR-PKM-D01': {
    code: 'SCR-PKM-D01',
    title: 'Ringkasan Pra-Kunjungan',
    phase: 'F1',
    plafon: 'S4',
    useCase: 'UC PKM-12',
    story: 'CF-01, CF-15, IR-10',
    description: 'Konteks lengkap sebelum konsultasi dokter dimulai (waktu baca < 1 menit).',
    rules: [
      'Tren pengukuran ditampilkan berdampingan dengan terapi berjalan pada periode itu.',
      'Pemeriksaan yang belum lengkap ditandai jelas.',
    ],
    variant: 'teal',
  },
  'SCR-PKM-D02': {
    code: 'SCR-PKM-D02',
    title: 'Kehadiran & Verifikasi Identitas',
    phase: 'F1',
    plafon: 'S1',
    useCase: 'UC PKM-12',
    story: 'CF-02',
    description: 'Mencatat kehadiran fisik warga di FKTP dan menutup care task CO-11.',
    rules: [
      'Kehadiran tidak dapat dicatat surut tanpa alasan terdokumentasi.',
      'Ketidakhadiran mengalirkan warga ke antrean drop-out B04, bukan menutup tugas.',
    ],
    variant: 'teal',
  },
  'SCR-PKM-D03': {
    code: 'SCR-PKM-D03',
    title: 'Pengukuran Konfirmatori Terpandu',
    phase: 'F1',
    plafon: 'S4',
    useCase: 'UC PKM-13',
    story: 'CF-03, RS-03',
    description: 'Pemandu pengukuran ulang tensi/gula darah dengan jeda istirahat standar CRS.',
    rules: [
      'Jeda antar-pengukuran ditegakkan oleh timer sistem (bukan ingatan petugas).',
      'Sebelum syarat konfirmasi terpenuhi, status bertahan di AWAITING_CONFIRMATION.',
    ],
    variant: 'teal',
  },
  'SCR-PKM-D04': {
    code: 'SCR-PKM-D04',
    title: 'Klasifikasi Final & Saran Tata Laksana',
    phase: 'F1',
    plafon: 'S4',
    useCase: 'UC PKM-14',
    story: 'CF-04, RS-10, RS-11',
    description: 'Klasifikasi final atas nilai terkonfirmasi beserta rujukan Juknis CKG & PPK.',
    rules: [
      'Saran adalah rujukan cepat ke panduan klinis, bukan keputusan pengganti dokter.',
      'Keputusan klinis akhir tetap milik dokter ber-SIP.',
    ],
    variant: 'teal',
  },
  'SCR-PKM-D05': {
    code: 'SCR-PKM-D05',
    title: 'Diagnosis & Tata Laksana',
    phase: 'F1',
    plafon: 'S4',
    useCase: 'UC PKM-15',
    story: 'CF-05, CF-08',
    issueWarning: '⚠ IS INT-02 (SATUSEHAT sync)',
    description: 'Pencatatan diagnosis ICD-10, terapi obat, instruksi dokter, dan pengiriman SATUSEHAT.',
    rules: [
      'Pengiriman SATUSEHAT idempoten; kegagalan jaringan tidak menghalangi simpan lokal.',
      'Tanda tangan digital dokter melekat pada rekam kunjungan.',
    ],
    variant: 'teal',
  },
  'SCR-PKM-D06': {
    code: 'SCR-PKM-D06',
    title: 'Pemberian Obat',
    phase: 'F1',
    plafon: 'S4',
    useCase: 'UC PKM-15',
    story: 'CF-07, OM-13',
    description: 'Pencatatan obat yang benar-benar diserahkan di farmasi (termasuk paket 15 hari gratis).',
    rules: [
      'Yang dicatat adalah penyerahan riil obat, bukan sekadar peresepan.',
      'Obat kosong dialirkan ke status MEDICATION_UNAVAILABLE, bukan ketidakpatuhan warga.',
    ],
    variant: 'teal',
  },
  'SCR-PKM-D07': {
    code: 'SCR-PKM-D07',
    title: 'Penjadwalan Kontrol',
    phase: 'F1',
    plafon: 'S2',
    useCase: 'UC PKM-16',
    story: 'CF-06, CO-07, CO-13',
    description: 'Penetapan interval kunjungan kontrol berikutnya berdasarkan CRS CR-IV dan kuota layanan.',
    rules: [
      'Interval kontrol diturunkan dari aturan CRS, bukan angka lepas sembarangan.',
      'Perubahan interval oleh petugas wajib disertai alasan.',
    ],
    variant: 'teal',
  },

  // Kelompok E — Rujukan Tertutup
  'SCR-PKM-E01': {
    code: 'SCR-PKM-E01',
    title: 'Pembuatan Rujukan',
    phase: 'F2',
    plafon: 'S4',
    useCase: 'UC PKM-17',
    story: 'CF-10, CF-17',
    description: 'Penerbitan surat rujukan FKRTL berbasis keterjangkauan geografis & maritim.',
    rules: [
      'Penerbitan rujukan bukan penutupan kasus; kasus tetap aktif sampai ada balasan FKRTL.',
      'Usulan fasilitas rujukan menampilkan dasar alasan keterjangkauan transport.',
    ],
    variant: 'blue',
  },
  'SCR-PKM-E02': {
    code: 'SCR-PKM-E02',
    title: 'Papan Pelacakan Rujukan',
    phase: 'F2',
    plafon: 'S3',
    useCase: 'UC PKM-17',
    story: 'CF-11, CF-12, CF-14',
    description: 'Pelacakan status rujukan terbit, hadir di RS, dan tagihan balasan medis.',
    rules: [
      'Rujukan tidak dihadiri dialirkan kembali ke antrean penjangkauan B04.',
      'Bahasa penagihan ditujukan kepada faskes tujuan, bukan menyalahkan warga.',
    ],
    variant: 'blue',
  },
  'SCR-PKM-E03': {
    code: 'SCR-PKM-E03',
    title: 'Peninjauan Balasan & Penutupan Kasus',
    phase: 'F2',
    plafon: 'S4',
    useCase: 'UC PKM-17',
    story: 'CF-13, CO-11',
    description: 'Meninjau balasan medis spesialis FKRTL dan memutuskan PRB atau perawatan berlanjut di RS.',
    rules: [
      'Penutupan rujukan wajib disertai bukti balasan medis tercatat.',
      'Kasus dialirkan ke siklus pemantauan F01.',
    ],
    variant: 'blue',
  },
  'SCR-PKM-E04': {
    code: 'SCR-PKM-E04',
    title: 'Daftar Fasilitas Rujukan',
    phase: 'F2',
    plafon: 'S0',
    useCase: 'UC PKM-17, DNK-11',
    story: 'CF-16',
    description: 'Master jejaring RS rujukan, jadwal poliklinik, dan kontak darurat.',
    rules: [
      'Master data fasilitas dimiliki oleh Dinkes; faskes hanya menambah catatan lokal.',
    ],
    variant: 'blue',
  },

  // Kelompok F — Pemantauan & Kohort
  'SCR-PKM-F01': {
    code: 'SCR-PKM-F01',
    title: 'Siklus Pemantauan Berjalan',
    phase: 'F1',
    plafon: 'S3',
    useCase: 'UC PKM-20',
    story: 'OM-01, OM-10, OM-02',
    description: 'Menampilkan seluruh warga dalam terapi kardiometabolik beserta posisi siklus kontrolnya.',
    rules: [
      'Terlambat kontrol diberi penanda khusus dan disebut "belum kembali kontrol".',
      'Deteksi putus pengobatan dialirkan langsung ke antrean outreach.',
    ],
    variant: 'teal',
  },
  'SCR-PKM-F02': {
    code: 'SCR-PKM-F02',
    title: 'Kunjungan Kontrol',
    phase: 'F1',
    plafon: 'S4',
    useCase: 'UC PKM-18',
    story: 'OM-03, CF-03',
    description: 'Pencatatan pengukuran ulang tensi/gula darah pada kunjungan kontrol terjadwal.',
    rules: [
      'Aturan konfirmasi CRS berlaku sama seperti kunjungan awal.',
      'Nilai tunggal tidak pernah cukup menetapkan status terkendali.',
    ],
    variant: 'teal',
  },
  'SCR-PKM-F03': {
    code: 'SCR-PKM-F03',
    title: 'Kepatuhan & Penyebab',
    phase: 'F1',
    plafon: 'S4',
    useCase: 'UC PKM-19',
    story: 'OM-04, OM-05, MA-02, MA-03',
    issueWarning: '⚠ Tertahan UX-OI-03',
    description: 'Menilai kepatuhan konsumsi obat kronis disertai taksonomi penyebab dominan CMP-07.',
    rules: [
      'Bahasa antarmuka: "belum minum obat teratur", tidak pernah "pasien tidak patuh".',
      'Kepatuhan rendah selalu disajikan bersama penyebabnya (bukan angka telanjang).',
      'Efek samping obat diteruskan ke dokter penanggung jawab.',
    ],
    variant: 'amber',
  },
  'SCR-PKM-F04': {
    code: 'SCR-PKM-F04',
    title: 'Penetapan Status Terkendali',
    phase: 'F1',
    plafon: 'S4',
    useCase: 'UC PKM-18',
    story: 'OM-06, OM-08',
    issueWarning: '⚠ Tertahan OI-08 (Klinis)',
    description: 'Evaluasi status terkendali atas nilai terkonfirmasi: CONTROLLED, NOT_CONTROLLED, atau NOT_YET_ASSESSABLE.',
    rules: [
      'Penetapan CONTROLLED definitif ditahan sampai CRS-CKG v1.0 CR-OC disetujui.',
      'Kelompok NOT_YET_ASSESSABLE tidak pernah dilebur ke salah satu sisi.',
    ],
    variant: 'amber',
  },
  'SCR-PKM-F05': {
    code: 'SCR-PKM-F05',
    title: 'Evaluasi Ulang Tata Laksana',
    phase: 'F1',
    plafon: 'S4',
    useCase: 'UC PKM-14',
    story: 'OM-07, OM-15',
    description: 'Penyesuaian terapi obat bila kondisi belum terkendali atau evaluasi kelayakan remisi.',
    rules: [
      'Penyesuaian dosis tidak disarankan sebelum indikasi kepatuhan ditampilkan.',
    ],
    variant: 'teal',
  },
  'SCR-PKM-F06': {
    code: 'SCR-PKM-F06',
    title: 'Kohort per Penyakit',
    phase: 'F2',
    plafon: 'S3',
    useCase: 'UC PKM-20',
    story: 'OM-11',
    description: 'Distribusi kohort Hipertensi, Diabetes Melitus, dan Dislipidemia per desa.',
    rules: [
      'Kelompok belum dapat dinilai disajikan sebagai kategori tersendiri.',
    ],
    variant: 'blue',
  },
  'SCR-PKM-F07': {
    code: 'SCR-PKM-F07',
    title: 'Tren Outcome Pasien',
    phase: 'F2',
    plafon: 'S4',
    useCase: 'UC PKM-18',
    story: 'OM-14, IR-10',
    description: 'Perjalanan nilai kardiometabolik longitudinal bersama catatan intervensi terapi.',
    rules: [
      'Tren tidak pernah ditampilkan tanpa intervensi terapi yang menyertainya.',
      'Nilai faskes, kader, dan mandiri dibedakan visualnya (tidak digabung satu garis).',
    ],
    variant: 'blue',
  },

  // Kelompok G — Manajemen Puskesmas
  'SCR-PKM-G01': {
    code: 'SCR-PKM-G01',
    title: 'Jadwal & Kuota Layanan',
    phase: 'F1',
    plafon: 'S0',
    useCase: 'UC PKM-23',
    story: 'CO-13, CO-07',
    description: 'Konfigurasi hari buka, jam layanan, dan kuota penerimaan tindak lanjut FKTP.',
    rules: [
      'Kuota layanan menjadi dasar tunggal pembatasan antrean harian dan penawaran slot warga.',
    ],
    variant: 'teal',
  },
  'SCR-PKM-G02': {
    code: 'SCR-PKM-G02',
    title: 'Beban Kerja Tim',
    phase: 'F2',
    plafon: 'S2',
    useCase: 'UC PKM-22',
    story: 'CO-12, KF-15',
    description: 'Sebaran tugas pendampingan antar-petugas dan kader wilayah.',
    rules: [
      'Disajikan sebagai sebaran beban kerja tim, bukan peringkat kompetisi personil.',
    ],
    variant: 'blue',
  },
  'SCR-PKM-G03': {
    code: 'SCR-PKM-G03',
    title: 'Akun & Peran Puskesmas',
    phase: 'F1',
    plafon: 'S1',
    useCase: 'UC PKM-24',
    story: 'FG-02, FG-14, FG-03',
    description: 'Manajemen akun staf FKTP, delegasi peran ILP, dan kendali perangkat kader.',
    rules: [
      'Penghapusan perangkat kader menampilkan peringatan data yang belum tersinkron.',
    ],
    variant: 'teal',
  },
  'SCR-PKM-G04': {
    code: 'SCR-PKM-G04',
    title: 'Kaskade Puskesmas',
    phase: 'F1',
    plafon: 'S3',
    useCase: 'UC PKM-21',
    story: 'PC-03, CO-12',
    description: 'Rel kaskade wilayah kerja: Diperiksa → Ditemukan → Dihubungi → Datang → Diterapi → Bertahan → Terkendali.',
    rules: [
      'Tahap terkendali mengikuti penahanan OI-08 dan ditampilkan "belum dapat dinilai".',
      'Lebar segmen proporsional terhadap jumlah warga.',
    ],
    variant: 'teal',
  },
  'SCR-PKM-G05': {
    code: 'SCR-PKM-G05',
    title: 'Ekspor Laporan Puskesmas',
    phase: 'F2',
    plafon: 'S3',
    useCase: 'UC PKM-25',
    story: 'IR-12, PC-10, FG-08',
    description: 'Ekspor laporan tindak lanjut CKG untuk evaluasi lokakarya mini dan Dinkes.',
    rules: [
      'Setiap kegiatan ekspor data S3/S4 wajib menyertakan alasan dan tercatat di audit.',
    ],
    variant: 'blue',
  },
  'SCR-PKM-G06': {
    code: 'SCR-PKM-G06',
    title: 'Jejak Audit Puskesmas',
    phase: 'F1',
    plafon: 'S1',
    useCase: 'UC DNK-12 turunan',
    story: 'FG-08, FG-16',
    description: 'Log catatan akses: siapa membuka rekam siapa, kapan, dan untuk keperluan apa.',
    rules: [
      'Jejak audit tidak dapat diubah maupun dihapus dari antarmuka apa pun.',
    ],
    variant: 'teal',
  },
};

export interface DocBadgeProps {
  code: string;
  title?: string;
  phase?: string;
  plafon?: string;
  useCase?: string;
  description?: string;
  rules?: string[];
  issueWarning?: string;
  className?: string;
  variant?: 'emerald' | 'teal' | 'blue' | 'purple' | 'amber' | 'rose' | 'slate' | 'indigo';
  size?: 'xs' | 'sm' | 'md';
  showModalOnClick?: boolean;
}

export const DocBadge: React.FC<DocBadgeProps> = ({
  code,
  title: propTitle,
  phase: propPhase,
  plafon: propPlafon,
  useCase: propUseCase,
  description: propDesc,
  rules: propRules,
  issueWarning: propIssueWarning,
  className = '',
  variant: propVariant,
  size = 'xs',
  showModalOnClick = true,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Auto-resolve info from registry dictionary if available
  const registryInfo = SCR_SPEC_REGISTRY[code];
  const title = propTitle || registryInfo?.title || code;
  const phase = propPhase || registryInfo?.phase || 'F1';
  const plafon = propPlafon || registryInfo?.plafon || 'S2';
  const useCase = propUseCase || registryInfo?.useCase;
  const description = propDesc || registryInfo?.description;
  const rules = propRules || registryInfo?.rules || [];
  const issueWarning = propIssueWarning || registryInfo?.issueWarning;
  const variant = propVariant || registryInfo?.variant || 'teal';

  const variantStyles: Record<string, string> = {
    teal: 'bg-teal-950/90 text-teal-300 border-teal-700/60 hover:bg-teal-900',
    emerald: 'bg-emerald-950/90 text-emerald-300 border-emerald-700/60 hover:bg-emerald-900',
    blue: 'bg-blue-950/90 text-blue-300 border-blue-700/60 hover:bg-blue-900',
    purple: 'bg-purple-950/90 text-purple-300 border-purple-700/60 hover:bg-purple-900',
    amber: 'bg-amber-950/90 text-amber-300 border-amber-700/60 hover:bg-amber-900',
    rose: 'bg-rose-950/90 text-rose-300 border-rose-700/60 hover:bg-rose-900',
    indigo: 'bg-indigo-950/90 text-indigo-300 border-indigo-700/60 hover:bg-indigo-900',
    slate: 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800',
  };

  const sizeStyles = {
    xs: 'text-[9px] px-2 py-0.5',
    sm: 'text-[10px] px-2.5 py-1',
    md: 'text-xs px-3 py-1.5',
  };

  const tooltipSummary = `[${code}] ${title}\nFase: ${phase} · Plafon: ${plafon}${useCase ? ` · ${useCase}` : ''}${issueWarning ? ` (${issueWarning})` : ''}${description ? `\n${description}` : ''}`;

  return (
    <>
      <div className={`relative inline-flex items-center ${className}`}>
        <button
          type="button"
          title={tooltipSummary}
          onClick={(e) => {
            e.stopPropagation();
            if (showModalOnClick) {
              setShowModal(true);
            } else {
              setShowTooltip((prev) => !prev);
            }
          }}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className={`font-mono font-bold rounded-md border tracking-tight transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${variantStyles[variant] || variantStyles.teal} ${sizeStyles[size]}`}
          aria-label={`Dokumentasi Layar ${code}: ${title}`}
        >
          <span>{code}</span>
          {issueWarning && (
            <span className="text-amber-400 font-sans text-[8px]" title={issueWarning}>
              ⚠
            </span>
          )}
          <span className="opacity-60 text-[8px] font-sans font-normal border-l border-white/20 pl-1">
            {plafon}
          </span>
        </button>

        {/* Hover Tooltip Card */}
        {showTooltip && (
          <div 
            className="absolute z-50 bottom-full mb-2 left-0 sm:left-auto w-72 sm:w-80 bg-slate-900 text-white p-3 rounded-xl shadow-2xl border border-slate-700 text-left text-xs pointer-events-none transform -translate-x-2 sm:translate-x-0 transition-all duration-150 animate-in fade-in zoom-in-95"
            role="tooltip"
          >
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-2 mb-2">
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-bold text-teal-300 bg-teal-950/80 px-1.5 py-0.5 rounded border border-teal-800 text-[10px]">
                  {code}
                </span>
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800">
                  {phase}
                </span>
                <span className="text-[10px] font-semibold text-sky-400 bg-sky-950/80 px-1.5 py-0.5 rounded border border-sky-800">
                  Plafon {plafon}
                </span>
              </div>
              {useCase && (
                <span className="text-[9px] text-slate-400 font-mono">
                  {useCase}
                </span>
              )}
            </div>

            <h4 className="font-bold text-slate-100 text-xs mb-1">
              {title}
            </h4>

            {issueWarning && (
              <div className="mb-2 px-2 py-1 bg-amber-950/80 border border-amber-700/80 rounded-md text-[10px] text-amber-300 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                <span>{issueWarning}</span>
              </div>
            )}

            {description && (
              <p className="text-[11px] text-slate-300 leading-relaxed mb-2">
                {description}
              </p>
            )}

            {rules.length > 0 && (
              <div className="mt-2 pt-2 border-t border-slate-800 space-y-1">
                <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  Kaidah Mengikat Dokumen SCR:
                </div>
                <ul className="space-y-0.5">
                  {rules.slice(0, 3).map((rule, idx) => (
                    <li key={idx} className="text-[10px] text-slate-300 flex items-start gap-1 leading-snug">
                      <span className="text-teal-400 shrink-0 font-bold">•</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-2 pt-1 border-t border-slate-800/80 text-[9px] text-slate-400 italic text-right">
              Klik badge untuk melihat detail lengkap
            </div>

            {/* Pointer triangle */}
            <div className="absolute -bottom-1.5 left-4 w-3 h-3 bg-slate-900 border-r border-b border-slate-700 transform rotate-45" />
          </div>
        )}
      </div>

      {/* Full Screen Specification Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-2xl max-w-lg w-full border border-slate-700 shadow-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-sm font-extrabold text-teal-400 bg-teal-950 px-2 py-0.5 rounded border border-teal-700">
                    {code}
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-700 rounded font-semibold">
                    Fase {phase}
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-sky-950 text-sky-300 border border-sky-700 rounded font-semibold">
                    Plafon {plafon}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-100">{title}</h3>
                {useCase && (
                  <p className="text-xs font-mono text-slate-400 mt-0.5">
                    {useCase} {registryInfo?.story ? `· Story ${registryInfo.story}` : ''}
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                aria-label="Tutup"
              >
                ✕
              </button>
            </div>

            {issueWarning && (
              <div className="p-3 bg-amber-950/70 border border-amber-600/70 rounded-xl text-xs text-amber-200 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong>Status Isu Terbuka:</strong>
                  <p className="mt-0.5 text-amber-300/90">{issueWarning}</p>
                </div>
              </div>
            )}

            {description && (
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Tujuan & Isi Layar:
                </h4>
                <p className="text-xs text-slate-200 leading-relaxed bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                  {description}
                </p>
              </div>
            )}

            {rules.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                  Aturan Mengikat (SCR-CKG 01):
                </h4>
                <div className="bg-slate-800/40 rounded-xl border border-slate-700/60 p-3 space-y-2">
                  {rules.map((rule, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0 mt-1.5" />
                      <span className="leading-relaxed">{rule}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Platform Tindak Lanjut CKG Taliabu</span>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-1.5 bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold rounded-lg transition-colors"
              >
                Tutup Spesifikasi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
