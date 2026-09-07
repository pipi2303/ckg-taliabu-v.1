# Dokumentasi Peran Pengguna (User Roles & Access Control)
## CKG Smart Care Platform — Kabupaten Pulau Taliabu

> **Platform**: CKG Smart Care Platform (Pemeriksaan Kesehatan Berkala & Pemantauan Penyakit Tidak Menular Berbasis Kepulauan)  
> **Wilayah Kerja**: Dinas Kesehatan Kabupaten Pulau Taliabu, Provinsi Maluku Utara  
> **Standar Kepatuhan**: Kemenkes RI, KMK No. HK.01.07/MENKES/1936/2025, SATUSEHAT, S0–S4 Data Sensitivity Architecture, dan Prinsip Tata Kelola RBAC (Role-Based Access Control)

---

## Daftar Isi
1. [Arsitektur Tata Kelola & Plafon Sensitivitas Data (S0–S4)](#1-arsitektur-tata-kelola--plafon-sensitivitas-data-s0s4)
2. [Ringkasan Seluruh Peran (Role Directory)](#2-ringkasan-seluruh-peran-role-directory)
3. [Dokumentasi Rinci Setiap Peran](#3-dokumentasi-rinci-setiap-peran)
   - [3.1 Admin System (`ADMIN_DINKES`)](#31-admin-system-admin_dinkes)
   - [3.2 Kepala Dinas Kesehatan (`KEPALA_DINAS`)](#32-kepala-dinas-kesehatan-kepala_dinas)
   - [3.3 Analis Kesehatan Dinkes (`ANALYST_DINKES`)](#33-analis-kesehatan-dinkes-analyst_dinkes)
   - [3.4 Bupati / Kepala Daerah (`BUPATI`)](#34-bupati--kepala-daerah-bupati)
   - [3.5 Auditor Eksternal / Pengawas (`AUDITOR`)](#35-auditor-eksternal--pengawas-auditor)
   - [3.6 Direktur RSUD (`DIR_RSUD`)](#36-direktur-rsud-dir_rsud)
   - [3.7 Kepala Puskesmas (`KEPALA_PUSKESMAS`)](#37-kepala-puskesmas-kepala_puskesmas)
   - [3.8 Dokter Puskesmas (`DOCTOR`)](#38-dokter-puskesmas-doctor)
   - [3.9 Perawat / Bidan (`NURSE_MIDWIFE`)](#39-perawat--bidan-nurse_midwife)
   - [3.10 Petugas Farmasi (`PHARMACY_OFFICER`)](#310-petugas-farmasi-pharmacy_officer)
   - [3.11 Petugas Pustu (`PUSTU`)](#311-petugas-pustu-pustu)
   - [3.12 Petugas Posyandu (`POSYANDU`)](#312-petugas-posyandu-posyandu)
   - [3.13 Kader Kesehatan Desa (`KADER`)](#313-kader-kesehatan-desa-kader)
   - [3.14 Warga / Sasaran CKG (`CITIZEN`)](#314-warga--sasaran-ckg-citizen)
4. [Matriks Hak Akses & Kapabilitas (Permission Matrix)](#4-matriks-hak-akses--kapabilitas-permission-matrix)
5. [Panduan Uji Coba & Beralih Akun Demo](#5-panduan-uji-coba--beralih-akun-demo)

---

## 1. Arsitektur Tata Kelola & Plafon Sensitivitas Data (S0–S4)

Platform CKG Smart Care menerapkan prinsip **Least Privilege** dan **Separation of Duties** berbasis Plafon Sensitivitas Data (Sensitivity Ceiling). Setiap data transaksi, rekaman rekam medis, dan analitik diklasifikasikan ke dalam 5 tingkatan sensitivitas:

| Tingkat | Label | Deskripsi Cakupan Data | Contoh Atribut |
|---|---|---|---|
| **S0** | **Publik Internal** | Data referensi umum, wilayah administratif, jejaring faskes, katalog kode layanan, dan definisi peran standar. | Nama Desa, Kecamatan, Daftar 8 Puskesmas, Versi Panduan Klinis |
| **S1** | **Identitas Warga** | Data identitas dasar masyarakat dan demografi tanpa nilai medis/laboratorium. | NIK, Nama Lengkap, Nomor HP/WhatsApp, Alamat Domisili, Jenis Kelamin, Usia |
| **S2** | **Data Operasional** | Status penugasan lapangan, jadwal kunjungan rumah (home visit), checklist tugas pendampingan, dan catatan hasil kontak kader. | Tanggal Kunjungan Rumah, Status Keberadaan Warga, Alasan Kendala Kontak, Status Janji Temu |
| **S3** | **Data Klinis Rutin** | Hasil pemeriksaan fisik & laboratorium skrining PTM, status kepatuhan obat, dan stratifikasi risiko CKG (Hijau / Kuning / Merah). | Tekanan Darah (Sistolik/Diastolik), Gula Darah Sewaktu/Puasa, IMT, Lingkar Perut, Skor Risiko Kardiovaskular |
| **S4** | **Klinis Sangat Rahasia** | Diagnosa definitif dokter FKTP, terapi obat spesifik, resep, data rujukan komplikasi ke RSUD, skrining kejiwaan, dan rekam medis mendalam. | Diagnosa ICD-10 Hipertensi/DM Tipe 2 Komplikasi, Regimen Antihipertensi, Hasil Konsultasi Spesialis RSUD |

### Aturan Keras Keamanan (Hard Security Rules):
1. **Kader Boundary (S2 Ceiling)**: Kader Posyandu **DIBLOKIR KERAS** dari menerima data klinis S3 dan S4 (angka tensi, gula darah, diagnosa) langsung dari server. Kader bertugas pada pendampingan operasional & edukasi.
2. **Executive Aggregate-First (Dinkes & RSUD)**: Kepala Dinas, Bupati, dan Direktur RSUD mengakses data dalam bentuk agregat statistik (OI-08 CKG Impact Index & Jejaring Rujukan). Akses ke identitas individual (S1) hanya melalui mekanisme *Drilldown Terkendali dengan Audit Log*.
3. **Clinical Ownership**: Penegakan diagnosa klinis, penyesuaian resep, dan perubahan terapi hanya dapat dilakukan oleh Dokter Puskesmas (`DOCTOR`) dan tenaga kesehatan berwenang.

---

## 2. Ringkasan Seluruh Peran (Role Directory)

Aplikasi CKG Smart Care mendefinisikan **14 Peran Pengguna** yang terbagi dalam **6 Famili Organisasi**:

| No | Famili | Role ID | Nama Resmi Peran | Plafon Data | Default Landing Page | Cakupan Wilayah Tugas |
|:---:|---|---|---|:---:|---|---|
| 1 | **DINKES** | `ADMIN_DINKES` | Admin System | **S4** | `dashboard` (Beranda Sistem) | Seluruh Kabupaten (8 Kecamatan) |
| 2 | **DINKES** | `KEPALA_DINAS` | Kepala Dinas Kesehatan | **S3** | `dashboard` (Command Center Kadinkes) | Seluruh Kabupaten (8 Kecamatan) |
| 3 | **DINKES** | `ANALYST_DINKES` | Analis Kesehatan Dinkes | **S3** | `dinkes-ringkasan` (Ringkasan Analitik) | Seluruh Kabupaten (8 Kecamatan) |
| 4 | **DINKES** | `BUPATI` | Bupati / Kepala Daerah | **S0** | `dinkes-ringkasan` (Ringkasan Eksekutif) | Seluruh Kabupaten (8 Kecamatan) |
| 5 | **DINKES** | `AUDITOR` | Auditor Eksternal / Pengawas | **S1** | `audit-log` (Jejak Aktivitas & Integritas) | Lintas Faskes se-Kabupaten |
| 6 | **RSUD** | `DIR_RSUD` | Direktur RSUD Bobong | **S3** | `rsud-executive` (Executive RSUD) | Jejaring Rujukan Kabupaten |
| 7 | **PUSKESMAS** | `KEPALA_PUSKESMAS` | Kepala Puskesmas | **S3** | `dashboard` (Beranda Puskesmas) | Wilayah Kerja Puskesmas Induk |
| 8 | **PUSKESMAS** | `DOCTOR` | Dokter Puskesmas | **S4** | `prioritas-harian` (Tugas Prioritas Hari Ini) | Puskesmas Induk & Pasien Terdaftar |
| 9 | **PUSKESMAS** | `NURSE_MIDWIFE` | Perawat / Bidan | **S3** | `prioritas-harian` (Tugas Prioritas Hari Ini) | Puskesmas & Desa Binaan |
| 10 | **PUSKESMAS** | `PHARMACY_OFFICER` | Petugas Farmasi | **S3** | `care-task` (Jadwal & Batas Waktu) | Faskes & Gudang Farmasi |
| 11 | **FIELD** | `PUSTU` | Petugas Pustu (Puskesmas Pembantu) | **S3** | `prioritas-harian` (Tugas Prioritas Harian) | Wilayah Pustu & Desa Binaan |
| 12 | **FIELD** | `POSYANDU` | Petugas Posyandu | **S2** | `dashboard` (Beranda Posyandu) | Lingkup Pos Pelayanan Desa |
| 13 | **FIELD** | `KADER` | Kader Kesehatan Desa | **S2** | `kader-app` (Kader Mobile App) | Desa Binaan & Dusun / RT Terdaftar |
| 14 | **CITIZEN** | `CITIZEN` | Warga / Sasaran CKG | **S1** | `citizen-app` (Aplikasi Sahabat Warga) | Personal & Keluarga |

---

## 3. Dokumentasi Rinci Setiap Peran

---

### 3.1 Admin System (`ADMIN_DINKES`)
- **Famili**: Dinas Kesehatan (`DINKES`)
- **Plafon Sensitivitas**: **S4** (Klinis Sangat Rahasia)
- **Tanggung Jawab**: Bertanggung jawab penuh terhadap administrasi platform, master data wilayah, master data faskes, akun petugas & kader, aturan pembagian peran (RBAC), sinkronisasi sistem SATUSEHAT, serta pemeliharaan kualitas data (data ingestion & cleansing).
- **Default Landing**: `dashboard` (Beranda Tata Kelola Sistem)
- **Hak Istimewa (Privileges)**:
  - Mengelola Akun Pengguna (`canManageUsers: true`)
  - Mengelola Fasilitas Kesehatan (`canManageFacilities: true`)
  - Mengelola Master Wilayah Kecamatan & Desa (`canManageRegions: true`)
  - Mengelola & Menerbitkan Versi Aturan Klinis (`canManageRuleVersions: true`)
  - Meninjau Audit Trail Keseluruhan (`canViewAudit: true`)
  - Mengakses Data Klinis (`canAccessClinicalData: true`)
- **Menu yang Dapat Diakses**:
  1. `dashboard` — Beranda Sistem (`SCR-PKM-A02`)
  2. `dinkes-ringkasan` — Ringkasan Dinas Kesehatan (`SCR-DNK-A02`)
  3. `wilayah` — Kecamatan & Desa (`SCR-DNK-F01`)
  4. `faskes` — Puskesmas, Pustu & RS (`SCR-PKM-E04`)
  5. `layanan` — Katalog Layanan Medis (`SCR-ADM-03`)
  6. `pengguna` — Petugas & Kader (`SCR-PKM-G03`)
  7. `peran` — Peran Pengguna & Matriks Hak Akses (`SCR-ADM-02`)
  8. `cakupan` — Wilayah Tugas (`SCR-DNK-A01`)
  9. `persetujuan` — Persetujuan Warga (Consent) (`SCR-GOV-01`)
  10. `versi-aturan` — Pedoman Klinis Kemenkes (`SCR-DNK-F02`)
  11. `audit-log` — Catatan Riwayat Sistem (`SCR-PKM-G06`)
  12. `kader-app` — Aplikasi Lapangan Kader (`SCR-KDR-B01`)
  13. `sinkronisasi` — Kirim Data (Sinkron) (`SCR-SYS-01`)
  14. `integrasi` — Koneksi SATUSEHAT (`SCR-SYS-02`)
  15. `pengaturan` — Pengaturan & Glosarium (`SCR-SYS-04`)
  16. `ai-tata-kelola` — Tata Kelola & Safety AI (`SCR-DNK-F07`)
  17. `ai-kinerja-model` — Kinerja & Uji Keadilan AI (`SCR-DNK-F07`)
  18. `stratifikasi` — Kategori Risiko Kemenkes (`SCR-PKM-C03`)
  19. `data-quality` — Perbaikan Data / Anomali NIK (`SCR-PKM-C04`)
  20. `duplicate-review` — Pemeriksaan Data Ganda (`SCR-PKM-C05`)
  21. `import-ckg` — Impor Berkas CKG Excel/CSV (`SCR-REG-04`)
  22. `ingestion-monitor` — Status Perekaman Masuk (`SCR-SYS-03`)
  23. `import-history` — Riwayat Impor (`SCR-REG-05`)
  24. `source-mapping` — Format Kolom Berkas (`SCR-REG-06`)
  25. `future-facility` — Kesiapan Faskes, Stok Obat & Nakes (`SCR-PKM-E05`)
  26. `future-ai` — Advanced AI Assistant & Proyeksi PTM (`SCR-AI-10`)
- **Contoh Akun Bawaan**:
  - Nama: `Admin System`
  - Username: `admin.system`
  - Email: `admin.system@taliabukab.go.id`

---

### 3.2 Kepala Dinas Kesehatan (`KEPALA_DINAS`)
- **Famili**: Dinas Kesehatan (`DINKES`)
- **Plafon Sensitivitas**: **S3** (Agregat Wilayah & Analitik Dampak)
- **Tanggung Jawab**: Pengambilan keputusan strategis tingkat kabupaten, monitoring performa 8 Puskesmas, evaluasi CKG Impact Index (Level 1 Cakupan, Level 2 Kontinuitas, Level 3 Pengendalian Klinis), identifikasi kesenjangan akses maritim kepulauan, dan persetujuan penerbitan laporan resmi untuk Kemenkes/Bupati.
- **Default Landing**: `dashboard` (Command Center Eksekutif Kadinkes)
- **Karakteristik Tampilan**:
  - Menu `DINKES COMMAND CENTER` diposisikan di urutan paling atas tepat di bawah Overview.
  - Menu internal teknis/keamanan seperti manajemen akun dan pengaturan teknis disembunyikan.
  - Dilengkapi fitur ekspor laporan eksekutif PDF & Excel ber-Kop Surat Dinas Kesehatan dengan tanda tangan digital resmi Kadinkes.
- **Menu yang Dapat Diakses**:
  1. `dashboard` — Dashboard Eksekutif Kadinkes (`SCR-DNK-A02`)
  2. `dinkes-ringkasan` — Ringkasan Dinas Kesehatan (`SCR-DNK-A02`)
  3. `dinkes-impact-index` — CKG Impact Index Level 1-3 (`SCR-DNK-B01`)
  4. `dinkes-kaskade` — Kaskade Kontinuitas & Drop-off (`SCR-DNK-B02`)
  5. `dinkes-wilayah` — Analisis Wilayah & Peta Risiko Kepulauan (`SCR-DNK-C01`)
  6. `dinkes-gap` — Disparitas & Kesenjangan Tindak Lanjut (`SCR-DNK-C02`)
  7. `dinkes-kinerja-pkm` — Kinerja Tindak Lanjut 8 Puskesmas (`SCR-DNK-D01`)
  8. `dinkes-penyebab-kendala` — Penyebab & Kendala Hambatan Maritim CMP-07 (`SCR-DNK-D02`)
  9. `dinkes-intervensi-populasi` — Penetapan Intervensi Kebijakan Populasi (`SCR-DNK-E01`)
  10. `dinkes-perbandingan-periode` — Perbandingan Tren Periode (`SCR-DNK-B03`)
  11. `dinkes-laporan` — Laporan & Ekspor Resmi (PDF/Excel) (`SCR-DNK-F05`)
  12. `ai-scenario-lab` — Simulasi Skenario Kebijakan Anggaran CKG (`SCR-AI-03`)
  13. `stratifikasi` — Kategori Risiko Kemenkes (`SCR-PKM-C03`)
  14. `wilayah` — Profil Kecamatan & Desa (`SCR-DNK-F01`)
  15. `faskes` — Fasilitas Kesehatan & Jejaring Rujukan (`SCR-PKM-E04`)
- **Contoh Akun Bawaan**:
  - Nama: `Nurbintang Talaohu, S.KM., M.Kes`
  - Username: `kadis.taliabu`
  - Email: `kadis@dinkes.taliabukab.go.id`

---

### 3.3 Analis Kesehatan Dinkes (`ANALYST_DINKES`)
- **Famili**: Dinas Kesehatan (`DINKES`)
- **Plafon Sensitivitas**: **S3** (Agregat & Analitik Lanjutan)
- **Tanggung Jawab**: Analisis epidemiologi kesehatan populasi, pemodelan proyeksi beban penyakit kronis (Hipertensi & Diabetes Melitus), pemantauan kepatuhan terapi, peninjauan kohort pasien, serta pengawasan keadilan (fairness) model AI antar-wilayah terpencil.
- **Default Landing**: `dinkes-ringkasan`
- **Menu yang Dapat Diakses**:
  1. Suite Lengkap `DINKES COMMAND CENTER`: Ringkasan, Impact Index, Kaskade, Analisis Wilayah, Disparitas, Kinerja Puskesmas, Kendala, Intervensi, Perbandingan Periode, dan Laporan Ekspor.
  2. Suite Lengkap `ADVANCED AI INTELLIGENCE`: Tata Kelola AI, Prediksi Dropout, Digital Twin Warga, Proyeksi Beban & Obat, Simulasi Kebijakan, Klaster Populasi, Analisis Kepatuhan Terapi, Audit Kinerja & Keadilan AI, Prioritas Pencegahan Lanjut, Optimasi Rute Maritim Pusling Laut, dan Advanced AI Assistant.
  3. `kohort-kondisi` — Kelompok Kohort Penyakit (`SCR-PKM-F06`)
  4. `tren-outcome` — Perkembangan Hasil Terapi (`SCR-PKM-F07`)
  5. `stratifikasi` — Kategori Risiko Kemenkes (`SCR-PKM-C03`)
  6. `wilayah`, `faskes`, `layanan`, dan `future-facility` (Kesiapan Logistik & Nakes).
- **Contoh Akun Bawaan**:
  - Nama: `Ratna Sari, S.Tr.Keb`
  - Username: `analyst.dinkes`
  - Email: `ratna.sari@dinkes.taliabukab.go.id`

---

### 3.4 Bupati / Kepala Daerah (`BUPATI`)
- **Famili**: Dinas Kesehatan / Pemerintah Daerah (`DINKES`)
- **Plafon Sensitivitas**: **S0** (Eksekutif Agregat Murni — Tanpa Akses Data NIK Individual)
- **Tanggung Jawab**: Tinjauan eksekutif pimpinan tertinggi daerah untuk memantau capaian Standar Pelayanan Minimal (SPM) kesehatan, utilisasi anggaran program CKG, pengentasan daerah blank-spot kesehatan, dan perbandingan performa antar-kecamatan.
- **Default Landing**: `dinkes-ringkasan`
- **Menu yang Dapat Diakses**:
  - Ringkasan Eksekutif Kabupaten
  - CKG Impact Index
  - Rel Kaskade Capaian
  - Analisis Peta Risiko Wilayah
  - Perbandingan Metrik Antar-Periode
  - Simulasi Skenario Kebijakan Anggaran
  - Proyeksi Beban Penyakit & Kebutuhan Obat
  - Master Referensi Wilayah & Fasilitas
- **Catatan Keamanan**: Seluruh fitur drilldown individual (data NIK warga) dinonaktifkan untuk melindungi kerahasiaan identitas masyarakat.

---

### 3.5 Auditor Eksternal / Pengawas (`AUDITOR`)
- **Famili**: Tata Kelola & Pengawasan (`GOVERNANCE`)
- **Plafon Sensitivitas**: **S1** (Audit Trail, Log Integritas, Verifikasi Tanpa Nilai Klinis)
- **Tanggung Jawab**: Memeriksa kepatuhan tata kelola program CKG, integritas data log aktivitas (*append-only audit trail*), audit keabsahan data rujukan, kepatuhan SLA pelayanan faskes, serta audit akuntabilitas model kecerdasan buatan.
- **Default Landing**: `audit-log`
- **Menu yang Dapat Diakses**:
  - `audit-log` — Catatan Riwayat Sistem Komprehensif
  - `integritas-monitoring` — Audit Standar & Kepatuhan Layanan
  - `ai-tata-kelola` & `ai-kinerja-model` — Audit Algoritma & Uji Keadilan AI
  - `versi-aturan` — Tata Kelola Versi Pedoman Klinis
  - `data-quality` & `duplicate-review` — Kualitas Data dan Verifikasi Integritas Identitas

---

### 3.6 Direktur RSUD (`DIR_RSUD`)
- **Famili**: Rumah Sakit Rujukan Kabupaten (`RSUD`)
- **Plafon Sensitivitas**: **S3** (Agregat Jejaring Rujukan Kabupaten)
- **Tanggung Jawab**: Memantau kesiapan pelayanan rawat rujukan tingkat lanjut di RSUD Bobong (Kapasitas Tempat Tidur, Ketersediaan Dokter Spesialis Penyakit Dalam/Jantung, Fasilitas Lab Patologi, Ketersediaan Obat Kronis Lanjutan), memantau waktu tanggap rujukan dari 8 Puskesmas (*Referral Cascade & SLA*), mengelola backlog rujukan kasus merah/kritis, serta memastikan integrasi data SIMRS dengan sistem CKG dan SATUSEHAT.
- **Batasan Khusus (Governance Boundary)**:
  - Mengikuti prinsip: *Executive-first, Aggregate-first, Exception-driven*.
  - Tidak memiliki kewenangan klinis diagnosis FKTP dan tidak mengubah klasifikasi risiko (*Risk Classification*), tugas kader (*Care Task*), atau status pasien milik Puskesmas.
- **Default Landing**: `rsud-executive` (Ringkasan Eksekutif RSUD Bobong)
- **Menu yang Dapat Diakses**:
  1. `rsud-executive` — Ringkasan Eksekutif RSUD: Executive Dashboard, Alerts & Action Tracker (`SCR-RSD-A01`)
  2. `rsud-referral-network` — Referral Network: Kaskade Rujukan, SLA, Backlog & Analisis Penolakan (`SCR-RSD-B01`)
  3. `rsud-service-readiness` — Service Readiness: Kesiapan Layanan, Kapasitas TT, Tenaga Spesialis & Farmasi (`SCR-RSD-C01`)
  4. `rsud-quality-governance` — Quality & Safety: Indikator Mutu, Risk Register CAPA & Kepatuhan (`SCR-RSD-D01`)
  5. `rsud-data-integration` — Data & Integrasi: Bridging SIMRS, SATUSEHAT & Business Continuity (`SCR-RSD-E01`)
  6. `rsud-governance` — Governance & Audit: Laporan Formal, Audit Oversight & Tata Kelola SLA (`SCR-RSD-F01`)
  7. `dinkes-ringkasan` — Ringkasan Wilayah Kabupaten
- **Contoh Akun Bawaan**:
  - Nama: `dr. Alit Darma Asmara`
  - Username: `direktur.rsud`
  - Email: `direktur@rsudbobong.taliabukab.go.id`

---

### 3.7 Kepala Puskesmas (`KEPALA_PUSKESMAS`)
- **Famili**: Puskesmas (`PUSKESMAS`)
- **Plafon Sensitivitas**: **S3** (Operasional & Manajerial Faskes)
- **Tanggung Jawab**: Bertanggung jawab atas seluruh operasional pelayanan CKG di tingkat Puskesmas, pemerataan beban kerja dokter/perawat/kader, pemantauan pencapaian target skrining wilayah kerja faskes, penanganan pasien berisiko putus berobat (lost-to-follow-up), kesiapan logistik faskes, serta supervisi kepatuhan mutu layanan.
- **Default Landing**: `dashboard` (Beranda Puskesmas)
- **Karakteristik Tampilan**:
  - Menu administrasi teknis global (kelola server, katalog layanan, konfigurasi admin) disembunyikan agar fokus pada kepemimpinan faskes.
- **Menu yang Dapat Diakses** (Total 28 Menu):
  - **Overview**: `dashboard`, `dinkes-ringkasan`
  - **Tindak Lanjut & Pendampingan**: `prioritas-harian`, `care-task`, `clinical-followup`, `outreach`, `penugasan-lapangan`, `jadwal-kuota`, `kandidat-putus`, `beban-kerja`
  - **AI Intelligence**: `ai-prediksi-dropout`, `ai-digital-twin`, `ai-proyeksi-beban`, `ai-kepatuhan-obat`, `ai-prioritas-pencegahan`, `ai-nudge-budaya`, `ai-rute-maritim`
  - **Pemantauan Kesehatan**: `pemantauan-aktif`, `kontrol-harian`, `menunggu-evaluasi`, `integritas-monitoring`, `kepatuhan-kendala`, `kohort-kondisi`, `tren-outcome`, `risiko-putus`
  - **Data Warga & Penilaian**: `registry`, `stratifikasi`
  - **Faskes & Logistik**: `future-facility` (Kesiapan Obat, Laboratorium & Petugas)
- **Contoh Akun Bawaan**:
  - Nama: `Anriyanti, A.Md.Kep.`
  - Username: `kapus.bobong`
  - Faskes: `Puskesmas Bobong` (Kecamatan Taliabu Barat)

---

### 3.8 Dokter Puskesmas (`DOCTOR`)
- **Famili**: Puskesmas (`PUSKESMAS`)
- **Plafon Sensitivitas**: **S4** (Klinis Penuh & Resep Medis)
- **Tanggung Jawab**: Penegakan diagnosa medis hasil skrining CKG kategori Kuning dan Merah, penentuan terapi farmakologi antihipertensi & antidiabetes, verifikasi hasil laboratorium darah, penentuan rujukan spesialis ke RSUD Bobong, penetapan status terkendali/belum terkendali, dan interaksi dengan *Clinical Decision Copilot AI*.
- **Default Landing**: `prioritas-harian` (Tugas Prioritas Hari Ini)
- **Menu yang Dapat Diakses** (Total 23 Menu):
  1. `dashboard` — Beranda Puskesmas
  2. `dinkes-ringkasan` — Ringkasan Wilayah
  3. `prioritas-harian` — Tugas Prioritas Pasien Kritis Hari Ini
  4. `care-task` — Jadwal Pelayanan & Batas Waktu Pasien
  5. `clinical-followup` — Pemeriksaan Dokter di Puskesmas (Konsultasi Klinis, Vital Sign, Resep)
  6. `jadwal-kuota` — Kuota Pasien Harian Dokter
  7. `kandidat-putus` — Pasien Menunggak Kontrol Rutin
  8. `ai-clinical-copilot` — Asisten Pendukung Keputusan Klinis Dokter FKTP
  9. `ai-prediksi-dropout` — Prediksi Putus Terapi
  10. `ai-digital-twin` — Simulasi Profil Kardiometabolik Pasien
  11. `ai-kepatuhan-obat` — Efektivitas & Kepatuhan Obat
  12. `ai-prioritas-pencegahan` — Prioritisasi Pencegahan Sekunder
  13. `ai-nudge-budaya` — Edukasi Kontekstual Pasien
  14. `pemantauan-aktif` — Siklus Pemantauan Pasien Berjalan
  15. `kontrol-harian` — Jadwal Pasien Kontrol Hari Ini
  16. `menunggu-evaluasi` — Evaluasi Status Terkendali
  17. `kepatuhan-kendala` — Pencatatan Keluhan Efek Samping Obat
  18. `kohort-kondisi` — Kelompok Penyakit Pasien
  19. `tren-outcome` — Tren Penurunan Tekanan Darah & Gula Darah Pasien
  20. `risiko-putus` — Pencegahan Komplikasi Kardiometabolik
  21. `registry` — Data Warga Lengkap (NIK & Rekam Medis)
  22. `stratifikasi` — Algoritma Penilaian Risiko Kemenkes
  23. `sinkronisasi` — Sinkronisasi Data Pelayanan Luring-Daring
- **Contoh Akun Bawaan**:
  - Nama: `dr. Fauzi Akbar Sanusi`
  - Username: `dr.fauzi`
  - Faskes: `Puskesmas Bobong`

---

### 3.9 Perawat / Bidan (`NURSE_MIDWIFE`)
- **Famili**: Puskesmas (`PUSKESMAS`)
- **Plafon Sensitivitas**: **S3** (Data Klinis Rutin & Asuhan Keperawatan)
- **Tanggung Jawab**: Melakukan pemeriksaan fisik skrining CKG (tensi darah, gula darah sewaktu/puasa, lingkar perut, kolesterol dasar), triase awal pasien di Puskesmas, pendampingan kader desa, tindak lanjut outreach melalui panggilan telepon/pesan, dan penjadwalan kontrol ulang warga.
- **Default Landing**: `prioritas-harian`
- **Menu yang Dapat Diakses** (Total 22 Menu):
  - `dashboard`, `dinkes-ringkasan`
  - `prioritas-harian`, `care-task`, `clinical-followup`, `outreach`, `jadwal-kuota`, `kandidat-putus`
  - `ai-prediksi-dropout`, `ai-digital-twin`, `ai-kepatuhan-obat`, `ai-prioritas-pencegahan`, `ai-nudge-budaya`, `ai-rute-maritim`
  - `pemantauan-aktif`, `kontrol-harian`, `menunggu-evaluasi`, `kepatuhan-kendala`, `risiko-putus`
  - `registry`, `stratifikasi`, `sinkronisasi`
- **Contoh Akun Bawaan**:
  - Nama: `Ns. Fahmi Hidayat, S.Kep` / `Bidan Nur Aini, A.Md.Keb`
  - Username: `perawat.fahmi` / `bidan.nur`
  - Faskes: `Puskesmas Bobong`

---

### 3.10 Petugas Farmasi (`PHARMACY_OFFICER`)
- **Famili**: Puskesmas (`PUSKESMAS`)
- **Plafon Sensitivitas**: **S3** (Kefarmasian, Obat PTM, & Kepatuhan Pasien)
- **Tanggung Jawab**: Verifikasi peresepan obat kronis CKG (Amlodipine, Captopril, Metformin, Glibenclamide, Simvastatin), pemantauan kepatuhan minum obat warga (Medication Adherence Rate), deteksi interaksi obat, penyiapan paket obat untuk kunjungan Pustu/Posyandu, dan pelaporan ketersediaan stok obat faskes.
- **Default Landing**: `care-task` (Jadwal & Batas Waktu)
- **Menu yang Dapat Diakses** (Total 11 Menu):
  1. `dashboard` — Beranda Faskes
  2. `dinkes-ringkasan` — Ringkasan Wilayah
  3. `care-task` — Jadwal Batas Waktu Pengambilan Obat
  4. `clinical-followup` — Verifikasi Resep Dokter
  5. `jadwal-kuota` — Kuota Pelayanan Farmasi
  6. `ai-kepatuhan-obat` — Analisis Kepatuhan & Efektivitas Farmakologi
  7. `ai-proyeksi-beban` — Proyeksi Kebutuhan Obat Wilayah
  8. `pemantauan-aktif` — Siklus Pemantauan Pasien Berjalan
  9. `kontrol-harian` — Pasien Ambil Obat Hari Ini
  10. `future-facility` — Ketersediaan Stok Obat & Buffer Faskes
  11. `sinkronisasi` — Sinkronisasi Pengeluaran Obat
- **Contoh Akun Bawaan**:
  - Nama: `Apt. Dimas Pratama, S.Farm`
  - Username: `farmasi.dimas`
  - Faskes: `Puskesmas Bobong`

---

### 3.11 Petugas Pustu (`PUSTU`)
- **Famili**: Lapangan / Puskesmas Pembantu (`FIELD`)
- **Plafon Sensitivitas**: **S3** (Pelayanan Kesehatan Dasar Desa Binaan)
- **Tanggung Jawab**: Sebagai garda terdepan pelayanan kesehatan di tingkat desa/pulau terluar. Bertanggung jawab menyelenggarakan pemeriksaan CKG di desa, mengoordinasikan penugasan kunjungan kader Posyandu, menangani follow-up pasien rawat jalan, mencatat hasil pemeriksaan secara offline di desa tanpa sinyal, dan menyinkronkan data saat terhubung ke jaringan internet/Puskesmas induk.
- **Default Landing**: `prioritas-harian` (Tugas Prioritas Harian Pustu)
- **Menu yang Dapat Diakses** (Total 25 Menu Terintegrasi):
  1. `dashboard` — Beranda Pelayanan
  2. `dinkes-ringkasan` — Ringkasan Wilayah
  3. `prioritas-harian` — Tugas Prioritas Desa Hari Ini
  4. `care-task` — Jadwal Pelayanan Warga Desa
  5. `clinical-followup` — Pemeriksaan Medis Dasar Pustu
  6. `outreach` — Catatan Kontak & Edukasi Warga
  7. `penugasan-lapangan` — Pembagian Tugas Kader Posyandu Desa
  8. `kader-app` — Mode Pendampingan Aplikasi Lapangan
  9. `jadwal-kuota` — Jadwal Buka Pustu
  10. `kandidat-putus` — Warga Desa Belum Kontrol
  11. `pemantauan-aktif` — Pemantauan Kondisi Pasien Desa
  12. `kontrol-harian` — Warga Terjadwal Kontrol Hari Ini
  13. `menunggu-evaluasi` — Evaluasi Kondisi Pasien
  14. `kepatuhan-kendala` — Kendala Minum Obat Pasien Desa
  15. `kohort-kondisi` — Kohort Hipertensi & Diabetes Desa
  16. `tren-outcome` — Tren Perkembangan Kesehatan Desa
  17. `risiko-putus` — Peringatan Warga Berisiko Drop-out
  18. `registry` — Data Warga Desa Terdaftar
  19. `stratifikasi` — Kriteria Risiko Kemenkes
  20. `wilayah` — Profil Desa Binaan
  21. `faskes` — Jejaring Puskesmas Induk & RS Rujukan
  22. `ai-kepatuhan-obat` — Analisis Kepatuhan Obat
  23. `ai-nudge-budaya` — Edukasi Berbasis Budaya Lokal
  24. `ai-rute-maritim` — Akses Rute Pusling & Perahu
  25. `sinkronisasi` — Sinkronisasi Paket Data Offline Pustu
- **Contoh Akun Bawaan**:
  - Nama: `Nursiti Bongso Rajab`
  - Username: `pustu.nursiti`
  - Faskes: `Pustu Desa Wayo` (Puskesmas Induk: Puskesmas Bobong)

---

### 3.12 Petugas Posyandu (`POSYANDU`)
- **Famili**: Lapangan (`FIELD`)
- **Plafon Sensitivitas**: **S2** (Operasional Pos Pelayanan Terpadu)
- **Tanggung Jawab**: Mendukung penyelenggaraan hari buka Posyandu di balai warga, pembagian jadwal pendataan warga sasaran CKG usia produktif dan lansia, membantu pencatatan identitas dasar warga, dan memfasilitasi sinkronisasi data antar-kader.
- **Default Landing**: `dashboard`
- **Menu yang Dapat Diakses**:
  1. `dashboard` — Beranda Posyandu
  2. `penugasan-lapangan` — Tugas Kunjungan Kader
  3. `kader-app` — Aplikasi Lapangan Kader
  4. `sinkronisasi` — Sinkronisasi Data Posyandu
- **Contoh Akun Bawaan**:
  - Nama: `Ibu Halimah (Kader Posyandu)`
  - Username: `posyandu.mawar`
  - Faskes: `Posyandu Mawar Bobong`

---

### 3.13 Kader Kesehatan Desa (`KADER`)
- **Famili**: Lapangan (`FIELD`)
- **Plafon Sensitivitas**: **S2** (Data Operasional Outreach — **DIBLOKIR DARI NILAI KLINIS**)
- **Tanggung Jawab**: Melakukan kunjungan rumah (*home visit*) dari pintu ke pintu (*door-to-door*), mengonfirmasi keberadaan warga sasaran, mengedukasi warga agar bersedia datang ke Puskesmas/Pustu/Posyandu, mencatat kendala transportasi laut atau kesibukan bertani/melaut, mengumpulkan surat persetujuan (*informed consent*), dan mengoperasikan aplikasi mobile luring.
- **Batasan Keamanan Keras (Strict Sandbox)**:
  - Kader beroperasi pada antarmuka khusus mobile PWA (`KaderAppShell`).
  - Nilai tekanan darah dan kadar gula darah **TIDAK PERNAH** dikirimkan ke perangkat kader. Kader hanya melihat indikator warna kategori tindak lanjut (Perlu Kunjungan / Segera Periksa) tanpa diagnosis medis.
- **Default Landing**: `kader-app` (Aplikasi Lapangan Kader Posyandu)
- **Fitur Utama di Aplikasi Kader**:
  1. **Daftar Kunjungan Hari Ini**: Daftar rumah warga binaan yang perlu dikunjungi.
  2. **Formulir Kunjungan Rumah**: Perekaman konfirmasi keberadaan, alasan belum kontrol (faktor maritim, pekerjaan, lupa), dan komitmen tanggal hadir.
  3. **Persetujuan Warga (Consent Capture)**: Pencatatan izin pendampingan secara langsung atau formulir kertas berbantu kader.
  4. **Edukasi & Nudge Budaya (`ai-nudge-budaya`)**: Materi komunikasi kesehatan dalam bahasa dan konteks budaya lokal Maluku Utara.
  5. **Optimasi Rute Maritim (`ai-rute-maritim`)**: Panduan rute kunjungan warga di pesisir pantai dan muara sungai.
  6. **Sinkronisasi Offline-First (`sinkronisasi`)**: Menyimpan seluruh rekaman kunjungan di penyimpanan lokal (IndexedDB) dan mengunggah otomatis saat ponsel mendapat sinyal.
- **Contoh Akun Bawaan**:
  - Nama: `Kader Marlina`
  - Username: `kader.marlina`
  - Desa Binaan: `Desa Bobong`

---

### 3.14 Warga / Sasaran CKG (`CITIZEN`)
- **Famili**: Warga / Penerima Manfaat (`CITIZEN`)
- **Plafon Sensitivitas**: **S1** (Data Pribadi Mandiri)
- **Tanggung Jawab**: Masyarakat umum penerima manfaat program CKG untuk melihat riwayat skrining kesehatan dirinya sendiri, menerima pengingat jadwal pemeriksaan ulang atau minum obat, mengisi persetujuan tindak lanjut CKG, dan melaporkan kendala kesehatan secara mandiri.
- **Antarmuka Khusus**: Aplikasi Sahabat Warga CKG (`CitizenAppShell` / `SCR-WRG-B01`).
- **Default Landing**: `citizen-app`
- **Fitur Utama**:
  1. **Kartu Status CKG Saya**: Ringkasan status kesehatan dan tanggal pemeriksaan terakhir.
  2. **Jadwal & Pengingat**: Jadwal kontrol berkala dan alarm kepatuhan minum obat harian.
  3. **Persetujuan Mandiri**: Memberikan atau mencabut persetujuan tindak lanjut kader (*Consent Management*).
  4. **Panduan Hidup Sehat**: Edukasi pola makan gizi seimbang (rendah garam, rendah gula), aktivitas fisik, dan berhenti merokok.
- **Contoh Akun Bawaan**:
  - Nama: `Bpk. Rusli Usman (Warga)`
  - Username: `citizen.rusli`
  - Wilayah: `Desa Bobong`

---

## 4. Matriks Hak Akses & Kapabilitas (Permission Matrix)

Berikut adalah matriks hak akses formal terhadap modul sistem berdasarkan `PERMISSION_MATRIX_DATA`:

| Modul & Kapabilitas | `ADMIN_DINKES` | `KEPALA_DINAS` | `ANALYST_DINKES` | `BUPATI` | `DIR_RSUD` | `KEPALA_PUSKESMAS` | `DOCTOR` | `NURSE_MIDWIFE` | `PHARMACY` | `PUSTU` | `KADER` | `CITIZEN` | `AUDITOR` |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Master Wilayah** (Kecamatan & Desa) | **ALLOW** | LIMITED | LIMITED | LIMITED | DENIED | DENIED | DENIED | DENIED | DENIED | DENIED | DENIED | DENIED | DENIED |
| **Fasilitas Kesehatan** (Puskesmas & RS) | **ALLOW** | LIMITED | LIMITED | LIMITED | DENIED | LIMITED | DENIED | DENIED | DENIED | DENIED | DENIED | DENIED | DENIED |
| **Kelola Akun Dinkes & Kapus** | **ALLOW** | DENIED | DENIED | DENIED | DENIED | DENIED | DENIED | DENIED | DENIED | DENIED | DENIED | DENIED | DENIED |
| **Kelola Akun Staf Puskesmas & Kader** | **ALLOW** | DENIED | DENIED | DENIED | DENIED | **ALLOW** | DENIED | DENIED | DENIED | DENIED | DENIED | DENIED | DENIED |
| **Akses Identitas Warga (S1)** | **ALLOW** | LIMITED | LIMITED | DENIED | LIMITED | **ALLOW** | **ALLOW** | **ALLOW** | LIMITED | **ALLOW** | **ALLOW** | LIMITED | LIMITED |
| **Data Kunjungan & Operasional (S2)** | **ALLOW** | **ALLOW** | **ALLOW** | LIMITED | LIMITED | **ALLOW** | **ALLOW** | **ALLOW** | LIMITED | **ALLOW** | **ALLOW** | LIMITED | LIMITED |
| **Akses Data Klinis & Lab (S3/S4)** | **ALLOW** | LIMITED | DENIED | DENIED | DENIED | **ALLOW** | **ALLOW** | **ALLOW** | **ALLOW** | **ALLOW** | ⛔ **DENIED** | LIMITED | DENIED |
| **Kelola Versi Pedoman Klinis** | **ALLOW** | LIMITED | LIMITED | LIMITED | DENIED | DENIED | DENIED | DENIED | DENIED | DENIED | DENIED | DENIED | DENIED |
| **Audit Log & Jejak Aktivitas** | **ALLOW** | **ALLOW** | **ALLOW** | LIMITED | LIMITED | LIMITED | DENIED | DENIED | DENIED | DENIED | DENIED | DENIED | **ALLOW** |
| **Akses Sinkronisasi Luring (PWA)** | **ALLOW** | DENIED | DENIED | DENIED | DENIED | **ALLOW** | **ALLOW** | **ALLOW** | **ALLOW** | **ALLOW** | **ALLOW** | DENIED | DENIED |

**Keterangan Status**:
- **`ALLOW`**: Memiliki hak akses penuh untuk melihat, menambah, mengubah, atau mengeksekusi aksi pada modul tersebut.
- **`LIMITED`**: Akses terbatas, teredaksi, atau hanya dapat membaca dalam bentuk agregat statistik/sesuai lingkup wilayah tugasnya sendiri.
- **`DENIED`**: Dilarang keras / diblokir oleh sistem keamanan aplikasi.

---

## 5. Panduan Uji Coba & Beralih Akun Demo

Aplikasi menyediakan fitur **Quick Role Switcher** yang terletak di bagian kanan atas (Header Profil Pengguna) untuk memudahkan verifikasi dan evaluasi lintas peran:

1. **Buka Menu Profil**: Klik avatar atau nama pengguna yang sedang aktif di pojok kanan atas layar.
2. **Pilih Opsi Ganti Akun / Demo Account**: Akan muncul daftar peran utama:
   - *Kepala Dinas (Dinkes)* — Masuk sebagai `Nurbintang Talaohu, S.KM., M.Kes`
   - *Direktur RSUD* — Masuk sebagai `dr. Alit Darma Asmara`
   - *Kepala Puskesmas* — Masuk sebagai `Anriyanti, A.Md.Kep.`
   - *Dokter Puskesmas* — Masuk sebagai `dr. Fauzi Akbar Sanusi`
   - *Petugas Pustu (Puskesmas Pembantu)* — Masuk sebagai `Nursiti Bongso Rajab`
   - *Kader Posyandu* — Masuk sebagai `Kader Marlina`
   - *Warga / Sasaran* — Masuk sebagai `Bpk. Rusli Usman`
   - *Admin System* — Masuk sebagai `Admin System`
3. **Peralihan Otomatis**:
   - Sidebar dan susunan navigasi akan seketika menyesuaikan diri dengan daftar hak akses peran terpilih.
   - Sesi token lokal akan diperbarui tanpa perlu memuat ulang peramban secara penuh.
   - Apabila memilih peran `KADER` atau `CITIZEN`, sistem otomatis mengarahkan ke antarmuka aplikasi mobile khusus yang bersangkutan.

---

*Dokumen ini disusun dan disinkronisasikan secara langsung dengan basis kode `src/services/permissionService.ts`, `src/mock/initialData.ts`, dan `src/components/layout/Sidebar.tsx`.*
