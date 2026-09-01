import React, { useState } from 'react';
import { 
  Crown, 
  LineChart, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Send, 
  FileSpreadsheet, 
  Sliders, 
  Building2, 
  MapPin, 
  Activity, 
  FileText, 
  Sparkles,
  Info
} from 'lucide-react';
import { Card } from '../../../components/common/Card';
import { Badge } from '../../../components/common/Badge';

export const DinkesRoleComparisonInfographic: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'infografis' | 'tabel' | 'alur'>('infografis');

  return (
    <div className="space-y-5">
      {/* Header Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#F0F5F4] p-2 rounded-2xl border border-[#D8E5E2]">
        <div className="flex items-center gap-2 px-2">
          <Sparkles className="w-4 h-4 text-[#2E7D5B]" />
          <span className="text-xs font-bold text-black uppercase tracking-wider">
            Panduan Pembagian Tugas Tim Dinkes
          </span>
        </div>
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#D8E5E2]">
          <button
            onClick={() => setActiveTab('infografis')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'infografis'
                ? 'bg-[#00201C] text-white shadow-xs'
                : 'text-[#60716D] hover:text-black hover:bg-[#F8FBFA]'
            }`}
          >
            Ringkasan Peran
          </button>
          <button
            onClick={() => setActiveTab('alur')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'alur'
                ? 'bg-[#00201C] text-white shadow-xs'
                : 'text-[#60716D] hover:text-black hover:bg-[#F8FBFA]'
            }`}
          >
            Cara Kerja Bersama
          </button>
          <button
            onClick={() => setActiveTab('tabel')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'tabel'
                ? 'bg-[#00201C] text-white shadow-xs'
                : 'text-[#60716D] hover:text-black hover:bg-[#F8FBFA]'
            }`}
          >
            Tabel Beda Tugas
          </button>
        </div>
      </div>

      {/* TAB 1: INFOGRAFIS DUA KARTU */}
      {activeTab === 'infografis' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Card: Kepala Dinas */}
          <div className="bg-gradient-to-b from-amber-50/70 to-white p-5 rounded-2xl border-2 border-amber-200 shadow-sm space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/20 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md">
                  <Crown className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-slate-900">Kepala Dinas Kesehatan</h3>
                    <Badge variant="warning" size="xs">Pimpinan Utama</Badge>
                  </div>
                  <p className="text-xs text-amber-900 font-medium mt-0.5">
                    Pengambil Keputusan & Pemberi Perintah Resmi
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-amber-100/60 rounded-xl border border-amber-200 text-xs text-amber-950 leading-relaxed">
              <strong>Tugas Utama:</strong> Melihat rangkuman kondisi kesehatan satu kabupaten, mengetahui Puskesmas mana yang butuh bantuan segera, dan mengirim surat perintah tindak lanjut.
            </div>

            <div className="space-y-2 text-xs">
              <p className="font-bold text-slate-900 uppercase tracking-wide text-[11px]">
                Apa Saja yang Bisa Dilakukan:
              </p>
              <div className="space-y-1.5">
                <div className="flex items-start gap-2.5 p-2 bg-white rounded-lg border border-amber-100 text-slate-800">
                  <Send className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span><strong>Kirim Arahan Langsung:</strong> Memberikan petunjuk kerja ke Puskesmas yang warganya masih banyak belum berobat.</span>
                </div>
                <div className="flex items-start gap-2.5 p-2 bg-white rounded-lg border border-amber-100 text-slate-800">
                  <Activity className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span><strong>Layar Rangkuman Singkat:</strong> Melihat jumlah warga sehat, warga sakit, dan target pemeriksaan dalam satu layar praktis.</span>
                </div>
                <div className="flex items-start gap-2.5 p-2 bg-white rounded-lg border border-amber-100 text-slate-800">
                  <FileText className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span><strong>Laporan untuk Bupati & DPRD:</strong> Mengunduh berkas laporan siap pakai untuk bahan rapat bersama pimpinan daerah.</span>
                </div>
                <div className="flex items-start gap-2.5 p-2 bg-white rounded-lg border border-amber-100 text-slate-800">
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span><strong>Jaga Rahasia Warga:</strong> Hanya melihat jumlah total pasien tanpa membuka identitas atau nama pribadi warga.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Analis Dinas */}
          <div className="bg-gradient-to-b from-teal-50/70 to-white p-5 rounded-2xl border-2 border-teal-200 shadow-sm space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-200/20 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-md">
                  <LineChart className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-slate-900">Analis Kesehatan Dinas</h3>
                    <Badge variant="active" size="xs">Pemeriksa & Pengolah Data</Badge>
                  </div>
                  <p className="text-xs text-teal-900 font-medium mt-0.5">
                    Mencari Akar Masalah & Menyiapkan Saran Solusi
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-teal-100/60 rounded-xl border border-teal-200 text-xs text-teal-950 leading-relaxed">
              <strong>Tugas Utama:</strong> Meneliti kenapa warga di desa tertentu susah berobat, menghitung perkiraan kebutuhan obat beberapa bulan ke depan, dan menyiapkan saran solusi untuk Kepala Dinas.
            </div>

            <div className="space-y-2 text-xs">
              <p className="font-bold text-slate-900 uppercase tracking-wide text-[11px]">
                Apa Saja yang Bisa Dilakukan:
              </p>
              <div className="space-y-1.5">
                <div className="flex items-start gap-2.5 p-2 bg-white rounded-lg border border-teal-100 text-slate-800">
                  <MapPin className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span><strong>Peta Kendala 8 Kecamatan:</strong> Melihat desa mana yang warganya terhalang ombak laut atau jarak jauh ke Puskesmas.</span>
                </div>
                <div className="flex items-start gap-2.5 p-2 bg-white rounded-lg border border-teal-100 text-slate-800">
                  <Sparkles className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span><strong>Perkiraan Kebutuhan Obat:</strong> Menghitung stok obat tensi & gula darah yang dibutuhkan untuk 6 bulan ke depan agar tidak kehabisan.</span>
                </div>
                <div className="flex items-start gap-2.5 p-2 bg-white rounded-lg border border-teal-100 text-slate-800">
                  <Sliders className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span><strong>Simulasi Bantuan:</strong> Menghitung manfaat jika dikirim perahu puskesmas keliling ke pulau terpencil.</span>
                </div>
                <div className="flex items-start gap-2.5 p-2 bg-white rounded-lg border border-teal-100 text-slate-800">
                  <Building2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span><strong>Pemeriksaan Mutu Data:</strong> Memastikan laporan pemeriksaan dari semua Puskesmas sudah lengkap dan akurat.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ALUR KERJA KOLABORASI */}
      {activeTab === 'alur' && (
        <Card className="p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-black uppercase tracking-wide">
              Contoh Cara Kerja Bersama: Dari Temuan Data Menjadi Bantuan Nyata
            </h3>
            <p className="text-xs text-[#60716D] mt-0.5">
              Begini cara Analis dan Kepala Dinas saling bekerja sama membantu warga:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
            {/* Step 1 */}
            <div className="p-4 bg-[#F8FBFA] rounded-xl border border-[#D8E5E2] space-y-2 relative">
              <div className="w-7 h-7 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center">
                1
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-teal-800">
                <LineChart className="w-3.5 h-3.5" /> Analis Dinas
              </div>
              <p className="text-xs font-bold text-black">Menemukan Masalah</p>
              <p className="text-[11px] text-[#60716D] leading-relaxed">
                Analis melihat banyak warga darah tinggi di pulau seberang jarang kontrol karena laut sedang berombak besar.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-4 bg-[#F8FBFA] rounded-xl border border-[#D8E5E2] space-y-2 relative">
              <div className="w-7 h-7 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center">
                2
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-teal-800">
                <Sparkles className="w-3.5 h-3.5" /> Analis Dinas
              </div>
              <p className="text-xs font-bold text-black">Menyiapkan Saran Solusi</p>
              <p className="text-[11px] text-[#60716D] leading-relaxed">
                Analis mengusulkan jadwal perahu keliling dan menghitung jumlah obat yang perlu diantar langsung ke rumah warga.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-2 relative">
              <div className="w-7 h-7 rounded-full bg-amber-500 text-white font-bold text-xs flex items-center justify-center">
                3
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                <Crown className="w-3.5 h-3.5" /> Kepala Dinas
              </div>
              <p className="text-xs font-bold text-black">Membaca & Menyetujui</p>
              <p className="text-[11px] text-amber-950 leading-relaxed">
                Kepala Dinas membaca rangkuman saran analis, lalu menyetujui bantuan bensin perahu dan pengiriman obat.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-2 relative">
              <div className="w-7 h-7 rounded-full bg-amber-500 text-white font-bold text-xs flex items-center justify-center">
                4
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                <Send className="w-3.5 h-3.5" /> Kepala Dinas
              </div>
              <p className="text-xs font-bold text-black">Kirim Perintah Kerja</p>
              <p className="text-[11px] text-amber-950 leading-relaxed">
                Kepala Dinas mengirim pesan arahan resmi ke Kepala Puskesmas agar tim perahu segera berangkat melayani warga.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* TAB 3: TABEL RINCIAN PERBANDINGAN FITUR */}
      {activeTab === 'tabel' && (
        <Card className="p-0 overflow-hidden">
          <div className="p-4 bg-[#F8FBFA] border-b border-[#D8E5E2]">
            <h3 className="text-xs font-bold text-black uppercase tracking-wider">
              Tabel Beda Tanggung Jawab & Hak Akses
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#00201C] text-white">
                  <th className="px-4 py-3 font-semibold w-1/4">Bagian / Kegiatan</th>
                  <th className="px-4 py-3 font-semibold w-3/8 text-amber-200">
                    👑 Kepala Dinas Kesehatan
                  </th>
                  <th className="px-4 py-3 font-semibold w-3/8 text-teal-200">
                    📊 Analis Kesehatan Dinas
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8EFEB]">
                <tr className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-bold text-black">Halaman Awal Saat Buka Aplikasi</td>
                  <td className="px-4 py-3 bg-amber-50/40 text-amber-950">
                    <strong>Rangkuman Eksekutif</strong> (Layar ringkas berisi kondisi kesehatan umum & hal yang butuh tindakan cepat)
                  </td>
                  <td className="px-4 py-3 bg-teal-50/40 text-teal-950">
                    <strong>Pusat Data Lengkap</strong> (Data detail per desa, tabel tren, dan data lengkap per Puskesmas)
                  </td>
                </tr>

                <tr className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-bold text-black">Kirim Arahan / Instruksi ke Puskesmas</td>
                  <td className="px-4 py-3 bg-amber-50/40">
                    <span className="inline-flex items-center gap-1 font-bold text-[#2E7D5B] bg-[#EBF7F2] px-2 py-0.5 rounded border border-[#C6EAD9]">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Ya, Berwenang Kirim Arahan Resmi
                    </span>
                  </td>
                  <td className="px-4 py-3 bg-teal-50/40 text-[#60716D]">
                    Hanya menyiapkan catatan saran untuk bahan pertimbangan
                  </td>
                </tr>

                <tr className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-bold text-black">Kerahasiaan Data Pasien</td>
                  <td className="px-4 py-3 bg-amber-50/40 text-amber-950">
                    <strong>Aman:</strong> Hanya melihat total angka (contoh: "ada 50 warga hipertensi"), tanpa melihat nama atau NIK
                  </td>
                  <td className="px-4 py-3 bg-teal-50/40 text-teal-950">
                    <strong>Aman:</strong> Melihat pengelompokan per desa/wilayah untuk memetakan kebutuhan bantuan
                  </td>
                </tr>

                <tr className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-bold text-black">Bantuan Hitungan Komputer / AI</td>
                  <td className="px-4 py-3 bg-amber-50/40 text-amber-950">
                    Melihat hasil akhir perkiraan dampak biaya dan manfaat kebijakan
                  </td>
                  <td className="px-4 py-3 bg-teal-50/40 text-teal-950 font-medium">
                    Akses lengkap: Menghitung risiko pasien putus obat, perkiraan stok obat 6 bulan, dan jalur perahu puskesmas keliling
                  </td>
                </tr>

                <tr className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-bold text-black">Cetak & Unduh Laporan</td>
                  <td className="px-4 py-3 bg-amber-50/40 text-amber-950">
                    Laporan resmi format Kemenkes untuk Bupati dan DPRD
                  </td>
                  <td className="px-4 py-3 bg-teal-50/40 text-teal-950">
                    Unduh berkas Excel untuk pengolahan tabel dan grafik
                  </td>
                </tr>

                <tr className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-bold text-black">Pengecekan Data dari Puskesmas</td>
                  <td className="px-4 py-3 bg-amber-50/40 text-amber-950">
                    Melihat Puskesmas mana yang laporannya sudah masuk atau terlambat
                  </td>
                  <td className="px-4 py-3 bg-teal-50/40 text-teal-950 font-medium">
                    Memeriksa keakuratan isi data dan mencari angka yang keliru/tidak wajar
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
