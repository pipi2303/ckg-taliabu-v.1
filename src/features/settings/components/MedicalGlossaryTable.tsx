import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  Tag,
  Stethoscope,
  Building2,
  Activity,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { Card } from '../../../components/common/Card';
import { Badge } from '../../../components/common/Badge';

export interface GlossaryItem {
  id: string;
  term: string;
  abbreviation?: string;
  category: 'Klinis & Penyakit' | 'Layanan & Faskes' | 'Pemeriksaan & Indikator' | 'Sistem & Tata Kelola';
  plainLanguage: string;
  definition: string;
  example: string;
  context: string;
}

const GLOSSARY_DATA: GlossaryItem[] = [
  {
    id: 'ckg',
    term: 'Cek Kesehatan Gratis',
    abbreviation: 'CKG',
    category: 'Layanan & Faskes',
    plainLanguage: 'Pemeriksaan kesehatan gratis untuk seluruh warga',
    definition: 'Program nasional pemeriksaan kesehatan berkala tanpa biaya di Posyandu/Puskesmas untuk mendeteksi penyakit sedini mungkin.',
    example: 'Warga datang ke posyandu untuk periksa tensi, gula darah, dan berat badan gratis.',
    context: 'Program utama yang menjadi sumber data aplikasi ini.',
  },
  {
    id: 'fktp',
    term: 'Fasilitas Kesehatan Tingkat Pertama',
    abbreviation: 'FKTP',
    category: 'Layanan & Faskes',
    plainLanguage: 'Puskesmas, Puskesmas Pembantu (Pustu), atau Klinik Pratama',
    definition: 'Tempat berobat dan periksa pertama kali di tingkat kecamatan/desa sebelum dirujuk ke rumah sakit bila diperlukan.',
    example: 'Puskesmas Bobong dan Puskesmas Lede adalah FKTP di Pulau Taliabu.',
    context: 'Faskes yang menangani pemeriksaan awal, pengobatan rutin, dan input data.',
  },
  {
    id: 'fkrtl',
    term: 'Fasilitas Kesehatan Rujukan Tingkat Lanjutan',
    abbreviation: 'FKRTL',
    category: 'Layanan & Faskes',
    plainLanguage: 'Rumah Sakit Umum Daerah (RSUD) / Rumah Sakit Rujukan',
    definition: 'Fasilitas kesehatan dengan dokter spesialis dan rawat inap lengkap untuk menangani kasus berat yang tidak bisa diselesaikan di Puskesmas.',
    example: 'Pasien stroke atau komplikasi jantung dirujuk dari Puskesmas ke RSUD Bobong.',
    context: 'Tujuan rujukan jika kondisi pasien membutuhkan dokter spesialis.',
  },
  {
    id: 'hipertensi',
    term: 'Hipertensi',
    abbreviation: 'HT',
    category: 'Klinis & Penyakit',
    plainLanguage: 'Tekanan Darah Tinggi',
    definition: 'Kondisi saat tekanan darah berada di atas batas normal (≥ 140/90 mmHg). Sering tidak bergejala namun bisa memicu stroke atau penyakit jantung jika tidak diobati.',
    example: 'Pak Budi memiliki tensi 150/95 mmHg, sehingga perlu minum obat penurun tensi setiap hari.',
    context: 'Salah satu penyakit utama yang dipantau dalam skrining CKG.',
  },
  {
    id: 'diabetes',
    term: 'Diabetes Melitus',
    abbreviation: 'DM',
    category: 'Klinis & Penyakit',
    plainLanguage: 'Penyakit Kencing Manis / Gula Darah Tinggi',
    definition: 'Kondisi kadar gula dalam darah melebihi batas normal (GDS ≥ 200 mg/dL atau GDP ≥ 126 mg/dL) karena tubuh kekurangan atau tidak bisa memanfaatkan insulin.',
    example: 'Ibu Siti gula darah sewaktunya 240 mg/dL, perlu diet rendah gula dan kontrol rutin ke dokter.',
    context: 'Penyakit tidak menular prioritas kedua dalam pemantauan kesehatan wilayah.',
  },
  {
    id: 'gds-gdp',
    term: 'Gula Darah Sewaktu / Puasa',
    abbreviation: 'GDS / GDP',
    category: 'Pemeriksaan & Indikator',
    plainLanguage: 'Kadar gula dalam darah saat dites',
    definition: 'Tes cepat menggunakan tetes darah jari untuk melihat berapa banyak gula dalam aliran darah saat itu (Sewaktu = tanpa puasa, Puasa = setelah puasa 8-10 jam).',
    example: 'Kader posyandu menggunakan alat tes stik darah untuk mengecek GDS warga.',
    context: 'Indikator deteksi dini risiko diabetes pada warga usia dewasa.',
  },
  {
    id: 'tensi',
    term: 'Tekanan Darah (Sistolik / Diastolik)',
    abbreviation: 'TD',
    category: 'Pemeriksaan & Indikator',
    plainLanguage: 'Ukuran tekanan pompa jantung (angka atas / angka bawah)',
    definition: 'Sistolik (angka atas) mengukur kekuatan pompa jantung, Diastolik (angka bawah) mengukur tekanan saat jantung istirahat.',
    example: 'Tensi normal biasanya sekitar 120/80 mmHg; jika 160/100 mmHg tergolong tinggi.',
    context: 'Pemeriksaan paling mendasar yang dilakukan di Posyandu dan Puskesmas.',
  },
  {
    id: 'stratifikasi',
    term: 'Stratifikasi Risiko',
    abbreviation: 'Kategori Risiko',
    category: 'Pemeriksaan & Indikator',
    plainLanguage: 'Pengelompokan tingkat bahaya kesehatan warga (Aman, Waspada, Bahaya)',
    definition: 'Sistem pembagian warga ke dalam kelompok warna: Hijau (Sehat/Aman), Kuning (Risiko Sedang/Waspada), Oranye/Merah (Risiko Tinggi/Darurat) berdasarkan hasil tes.',
    example: 'Warga dengan tensi sangat tinggi otomatis masuk kategori Risiko Tinggi agar segera didampingi kader.',
    context: 'Menentukan siapa warga yang harus diprioritaskan terlebih dahulu.',
  },
  {
    id: 'skrining',
    term: 'Skrining Kesehatan',
    abbreviation: 'Skrining',
    category: 'Layanan & Faskes',
    plainLanguage: 'Pemeriksaan awal untuk mendeteksi penyakit sebelum timbul keluhan',
    definition: 'Pemeriksaan massal pada orang yang terlihat sehat untuk menemukan mereka yang sebenarnya sudah memiliki bibit penyakit tanpa disadari.',
    example: 'Pemeriksaan tensi di balai desa menemukan 30 warga yang ternyata punya darah tinggi tanpa pernah merasa pusing.',
    context: 'Langkah awal sebelum penanganan medis di fasilitas kesehatan.',
  },
  {
    id: 'follow-up',
    term: 'Tindak Lanjut & Pendampingan',
    abbreviation: 'Follow-Up / Care Task',
    category: 'Layanan & Faskes',
    plainLanguage: 'Ajakan dan bantuan agar pasien mau berobat ulang dan rutin minum obat',
    definition: 'Serangkaian tugas yang diberikan kepada petugas Puskesmas atau kader untuk menghubungi atau mendatangi warga yang hasil periksanya tidak normal.',
    example: 'Kader mengingatkan Pak Ahmad lewat WhatsApp atau kunjungan rumah bahwa jadwal kontrol tensinya hari Selasa.',
    context: 'Modul penting di menu Tindak Lanjut untuk mencegah pasien terlantar.',
  },
  {
    id: 'kaskade',
    term: 'Kaskade Intervensi',
    abbreviation: 'Kaskade Pelayanan',
    category: 'Sistem & Tata Kelola',
    plainLanguage: 'Tahapan perjalanan pasien dari periksa awal sampai sembuh/terkontrol',
    definition: 'Bagan berundak yang memperlihatkan berapa persen warga yang lolos dari tahap skrining -> datang ke faskes -> dapat obat -> tensi/gula darahnya berhasil normal kembali.',
    example: 'Dari 1.000 warga yang diskrining, 300 orang sakit, 250 orang ke Puskesmas, dan 200 orang berhasil sembuh/terkontrol.',
    context: 'Grafik di dashboard Dinkes untuk melihat di tahap mana pasien banyak yang hilang.',
  },
  {
    id: 'kohort',
    term: 'Kohort Pasien',
    abbreviation: 'Kohort',
    category: 'Sistem & Tata Kelola',
    plainLanguage: 'Daftar kelompok warga yang terus dipantau kesehatannya dalam jangka panjang',
    definition: 'Pencatatan berkelanjutan untuk sekelompok pasien dengan kondisi yang sama (misal: semua penderita darah tinggi di Desa Samuya) dari bulan ke bulan.',
    example: 'Daftar kohort hipertensi memastikan tidak ada pasien darah tinggi yang terlupakan jadwal obatnya.',
    context: 'Menu pemantauan berkala kondisi penderita penyakit kronis.',
  },
  {
    id: 'adherence',
    term: 'Kepatuhan Pengobatan',
    abbreviation: 'Adherence',
    category: 'Klinis & Penyakit',
    plainLanguage: 'Kedisiplinan minum obat sesuai aturan dokter',
    definition: 'Tingkat ketaatan pasien dalam meminum obat resep secara teratur dan tidak berhenti sendiri di tengah jalan.',
    example: 'Kepatuhan 90% berarti dari 30 hari dalam sebulan, pasien meminum obat tepat waktu selama 27 hari.',
    context: 'Faktor penentu utama keberhasilan menurunkan angka komplikasi stroke.',
  },
  {
    id: 'dropout',
    term: 'Putus Berobat / Lost to Follow-Up',
    abbreviation: 'Putus Kontrol',
    category: 'Klinis & Penyakit',
    plainLanguage: 'Pasien berhenti berobat atau tidak datang kontrol lagi',
    definition: 'Keadaan di mana pasien yang seharusnya kontrol berkala sudah melewati jadwal lebih dari 30-60 hari tanpa kabar.',
    example: 'Pasien merasa sudah enakan badannya lalu berhenti minum obat amlodipine tanpa izin dokter.',
    context: 'Target utama yang ingin dicegah oleh aplikasi melalui peringatan dini AI.',
  },
  {
    id: 'outreach',
    term: 'Upaya Kontak & Penjangkauan',
    abbreviation: 'Outreach',
    category: 'Layanan & Faskes',
    plainLanguage: 'Menghubungi warga lewat telepon, WA, atau didatangi ke rumah',
    definition: 'Aktivitas proaktif kader atau tenaga kesehatan untuk mengingatkan dan membujuk warga agar mau memeriksakan diri.',
    example: 'Kader menelepon keluarga pasien atau datang naik sepeda motor ke rumah warga di pelosok desa.',
    context: 'Catatan bukti kerja kader dan petugas lapangan.',
  },
  {
    id: 'imt',
    term: 'Indeks Massa Tubuh',
    abbreviation: 'IMT / BMI',
    category: 'Pemeriksaan & Indikator',
    plainLanguage: 'Ukuran ideal perbandingan berat badan dengan tinggi badan',
    definition: 'Rumus matematika (berat badan dibagi kuadrat tinggi badan) untuk mengetahui apakah seseorang terlalu kurus, normal, gemuk, atau obesitas.',
    example: 'IMT di atas 25 menunjukkan berat badan berlebih yang memicu risiko darah tinggi.',
    context: 'Salah satu dari 5 parameter wajib pada pemeriksaan CKG Kemenkes.',
  },
  {
    id: 'obesitas-sentral',
    term: 'Obesitas Sentral',
    abbreviation: 'Lingkar Perut Berlebih',
    category: 'Klinis & Penyakit',
    plainLanguage: 'Penumpukan lemak di perut (perut buncit berisiko)',
    definition: 'Ukuran lingkar perut yang melebihi batas aman (Pria > 90 cm, Wanita > 80 cm), yang menandakan lemak di sekitar organ dalam berbahaya.',
    example: 'Pak Joko memiliki lingkar perut 98 cm, sehingga perlu olahraga jalan cepat dan kurangi gorengan.',
    context: 'Faktor pemicu utama diabetes tipe 2 dan penyakit jantung koroner.',
  },
  {
    id: 'disparitas',
    term: 'Disparitas Wilayah',
    abbreviation: 'Kesenjangan Wilayah',
    category: 'Sistem & Tata Kelola',
    plainLanguage: 'Perbedaan besar fasilitas atau capaian kesehatan antar desa/kecamatan',
    definition: 'Kondisi di mana desa yang jauh atau di seberang pulau memiliki capaian kesehatan yang jauh lebih tertinggal dibandingkan wilayah ibu kota kabupaten.',
    example: 'Kecamatan Taliabu Utara capaian kontrolnya rendah karena terhalang ombak laut dan jalan rusak.',
    context: 'Bahan pertimbangan utama Dinas Kesehatan dalam mengirim perahu puskesmas keliling.',
  },
  {
    id: 'informed-consent',
    term: 'Persetujuan Tindakan / Warga',
    abbreviation: 'Informed Consent',
    category: 'Sistem & Tata Kelola',
    plainLanguage: 'Surat izin atau persetujuan warga untuk diperiksa dan dicatat datanya',
    definition: 'Pernyataan kesediaan warga secara sadar setelah dijelaskan manfaat pemeriksaan, hak privasi, dan rencana tindak lanjut kesehatannya.',
    example: 'Sebelum kader mengukur tensi, warga dijelaskan maksudnya dan menyatakan setuju untuk dicatat.',
    context: 'Kepatuhan terhadap undang-undang perlindungan data pribadi dan rekam medis.',
  },
  {
    id: 'offline-sync',
    term: 'Sinkronisasi Luring',
    abbreviation: 'Offline / Luring',
    category: 'Sistem & Tata Kelola',
    plainLanguage: 'Aplikasi tetap bisa dipakai tanpa internet, data terkirim otomatis saat ada sinyal',
    definition: 'Kemampuan sistem menyimpan seluruh catatan pemeriksaan di dalam memori HP/laptop saat berada di desa tanpa sinyal, lalu otomatis terkirim ke server ketika mendapat jaringan.',
    example: 'Kader di Dusun Parigi mencatat 50 warga tanpa sinyal; saat sampai di dermaga berjarak 5 km dengan sinyal 4G, data otomatis terunggah.',
    context: 'Fitur kunci yang dirancang khusus untuk kondisi geografis kepulauan Taliabu.',
  },
  {
    id: 'ptm',
    term: 'Penyakit Tidak Menular',
    abbreviation: 'PTM',
    category: 'Klinis & Penyakit',
    plainLanguage: 'Penyakit jangka panjang yang tidak menular dari orang ke orang',
    definition: 'Penyakit kronis yang disebabkan oleh gaya hidup, pola makan, atau keturunan (seperti hipertensi, diabetes, jantung, dan stroke) dan butuh perawatan bertahun-tahun.',
    example: 'Darah tinggi tidak akan menular bila bersalaman, namun penderitanya wajib rutin minum obat.',
    context: 'Fokus utama gerakan posbindu dan transformasi layanan primer Kemenkes.',
  },
];

export const MedicalGlossaryTable: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = [
    { id: 'ALL', label: 'Semua Kategori', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'Klinis & Penyakit', label: 'Klinis & Penyakit', icon: <Stethoscope className="w-3.5 h-3.5" /> },
    { id: 'Layanan & Faskes', label: 'Layanan & Faskes', icon: <Building2 className="w-3.5 h-3.5" /> },
    { id: 'Pemeriksaan & Indikator', label: 'Pemeriksaan & Angka', icon: <Activity className="w-3.5 h-3.5" /> },
    { id: 'Sistem & Tata Kelola', label: 'Sistem & Aturan', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
  ];

  const filteredData = useMemo(() => {
    return GLOSSARY_DATA.filter((item) => {
      const matchCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      if (!query) return matchCategory;

      const matchText =
        item.term.toLowerCase().includes(query) ||
        (item.abbreviation && item.abbreviation.toLowerCase().includes(query)) ||
        item.plainLanguage.toLowerCase().includes(query) ||
        item.definition.toLowerCase().includes(query) ||
        item.example.toLowerCase().includes(query);

      return matchCategory && matchText;
    });
  }, [searchQuery, selectedCategory]);

  const getCategoryBadgeVariant = (category: GlossaryItem['category']) => {
    switch (category) {
      case 'Klinis & Penyakit':
        return 'warning';
      case 'Layanan & Faskes':
        return 'active';
      case 'Pemeriksaan & Indikator':
        return 'info';
      case 'Sistem & Tata Kelola':
        return 'neutral';
      default:
        return 'neutral';
    }
  };

  return (
    <Card className="space-y-4 border-[#D8E5E2]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D8E5E2] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#EBF7F2] text-[#2E7D5B]">
              <BookOpen className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-black">
              Kamus Istilah Medis & Singkatan (Glosarium Ramah Awam)
            </h4>
          </div>
          <p className="text-xs text-[#60716D] mt-1">
            Panduan terjemahan istilah klinis ke dalam bahasa sehari-hari untuk memudahkan staf non-medis, admin, kader, dan pemangku kebijakan.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs bg-amber-50 text-amber-900 px-2.5 py-1 rounded-lg border border-amber-200">
          <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span className="font-semibold">{GLOSSARY_DATA.length} Istilah Resmi Kemenkes</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#60716D] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari istilah, singkatan (misal: CKG, FKTP, Hipertensi), atau arti..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#D8E5E2] rounded-xl text-black placeholder:text-[#8F9E9B] focus:outline-none focus:border-[#2E7D5B] focus:ring-1 focus:ring-[#2E7D5B]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#60716D] hover:text-black"
            >
              Hapus
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-[#00201C] text-white border-[#00201C] shadow-2xs'
                    : 'bg-[#F8FBFA] text-[#60716D] border-[#D8E5E2] hover:bg-white hover:text-black'
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Glossary Table */}
      <div className="border border-[#D8E5E2] rounded-xl overflow-hidden bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#00201C] text-white">
                <th className="px-4 py-3 font-semibold w-1/4">Istilah Medis & Singkatan</th>
                <th className="px-4 py-3 font-semibold w-1/4 text-emerald-200">
                  Bahasa Awam / Arti Sederhana
                </th>
                <th className="px-4 py-3 font-semibold w-2/5 text-teal-100">
                  Penjelasan & Contoh Lapangan
                </th>
                <th className="px-3 py-3 font-semibold w-auto text-right">Kategori</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBF0EF]">
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-[#F8FBFA] transition-colors group"
                  >
                    {/* Term & Abbr */}
                    <td className="px-4 py-3 align-top">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-slate-900 text-sm">
                            {item.term}
                          </span>
                          {item.abbreviation && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#EBF7F2] text-[#1E583F] border border-[#C6EAD9]">
                              {item.abbreviation}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#60716D] leading-tight">
                          {item.context}
                        </p>
                      </div>
                    </td>

                    {/* Plain Language */}
                    <td className="px-4 py-3 align-top bg-emerald-50/30">
                      <div className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-[#2E7D5B] shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-[#1E583F] leading-snug">
                            {item.plainLanguage}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Definition & Practical Example */}
                    <td className="px-4 py-3 align-top">
                      <div className="space-y-1.5">
                        <p className="text-slate-800 leading-relaxed">
                          {item.definition}
                        </p>
                        <div className="p-2 rounded-lg bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-950 flex items-start gap-1.5">
                          <Info className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                          <div>
                            <strong>Contoh di Lapangan:</strong> {item.example}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category Badge */}
                    <td className="px-3 py-3 align-top text-right">
                      <Badge variant={getCategoryBadgeVariant(item.category)} size="sm">
                        {item.category}
                      </Badge>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-[#60716D]">
                    <HelpCircle className="w-8 h-8 text-[#8F9E9B] mx-auto mb-2" />
                    <p className="font-semibold text-black">Istilah tidak ditemukan</p>
                    <p className="text-xs mt-1">Coba gunakan kata kunci lain atau pilih Semua Kategori.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Info Box */}
      <div className="flex items-center gap-2 p-3 bg-[#F0F5F4] rounded-xl border border-[#D8E5E2] text-xs text-[#60716D]">
        <Info className="w-4 h-4 text-[#2E7D5B] shrink-0" />
        <span>
          Glosarium ini secara berkala diselaraskan dengan Keputusan Menteri Kesehatan RI tentang Petunjuk Teknis Integrasi Pelayanan Primer (ILP) dan CKG Nasional.
        </span>
      </div>
    </Card>
  );
};
