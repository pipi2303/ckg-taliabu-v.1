# Dokumen Fitur per Peran — CKG Smart Care Platform

> Kabupaten Pulau Taliabu, Provinsi Maluku Utara — Dinas Kesehatan & Intramedika Platform

Dokumen ini mencatat **menu/fitur yang benar-benar dapat diakses tiap peran saat ini**, diambil langsung dari `src/services/permissionService.ts` (`getAllowedNavIds`) dan label/kode spesifikasi di `src/components/layout/Sidebar.tsx`. Berbeda dari `Katalog-Fitur-per-Peran.pdf` (yang mendeskripsikan spesifikasi/PRD secara konseptual), dokumen ini adalah **snapshot implementasi aktual** — hasil setelah audit kesesuaian menu-per-peran yang baru selesai dilakukan.

Peran dikelompokkan ke 6 famili yang sama seperti katalog PDF sumber (Warga, Pustu/Kader/Posyandu, Puskesmas, Dokter, Rumah Sakit, Dinas Kesehatan), karena beberapa peran teknis di aplikasi (mis. `PJ_CKG`, `NURSE_MIDWIFE`) adalah pemecahan lebih rinci dari satu persona di dokumen sumber.

## Cara membaca

- **Kode** mengacu ke kode spesifikasi layar asli (`SCR-PKM-*`, `SCR-DNK-*`, `SCR-KDR-*`, `SCR-WRG-*`, `SCR-AI-*`, `SCR-SYS-*`, `SCR-ADM-*`, `SCR-GOV-*`, `SCR-REG-*`) sebagaimana tercantum di tooltip sidebar aplikasi.
- **Plafon** = batas sensitivitas data tertinggi yang boleh diakses peran tersebut (S0 publik/internal → S4 klinis sangat rahasia). Lihat tabel Plafon di bawah.
- ~~Baris bertanda **🔜 Roadmap** bukan fitur aktif~~ — section Roadmap Tahap Lanjut sudah dibongkar (lihat Riwayat Audit Putaran 6): `future-facility` dan `future-ai` kini halaman kerja sungguhan, `future-monitoring` dipensiunkan karena sudah terpenuhi fitur nyata lain.
- **Landing default** = halaman pertama yang dibuka begitu peran ini login (`getDefaultNavForRole`).

### Skala Plafon Data (S0–S4)

| Plafon | Nama | Cakupan |
|---|---|---|
| S0 | Publik Internal | Data referensi wilayah, faskes, kode layanan, daftar peran standar |
| S1 | Identitas Warga | NIK, nama lengkap, nomor HP, alamat domisili, data demografis dasar |
| S2 | Data Operasional | Jadwal kunjungan rumah, status follow-up, penugasan kader, ringkasan tugas outreach |
| S3 | Data Klinis Rutin | Tekanan darah, gula darah, IMT, lingkar perut, kategori risiko CKG |
| S4 | Klinis Sangat Rahasia | Diagnosa dokter, hasil rujukan RSUD, obat-obatan, kesehatan jiwa, riwayat infeksi menular |

## Ringkasan Peran

| Famili | Peran (RoleId) | Nama Tampilan | Plafon | Jumlah Menu | Landing Default |
|---|---|---|---|---|---|
| Warga | `CITIZEN` | Warga / Sasaran CKG | S1 | 1 | Citizen Sahabat Warga |
| Pustu/Kader/Posyandu | `KADER` | Kader Kesehatan Desa | S2 | 8 | Kader Field App |
| Pustu/Kader/Posyandu | `PUSTU` | Petugas Pustu | S3 | 8 | Beranda Puskesmas |
| Pustu/Kader/Posyandu | `POSYANDU` | Petugas Posyandu | S2 | 6 | Beranda Puskesmas |
| Puskesmas | `KEPALA_PUSKESMAS` | Kepala Puskesmas | S3 | 36 | Beranda Puskesmas |
| Puskesmas | `PJ_CKG` | Penanggung Jawab CKG Puskesmas | S3 | 35 | Prioritas Hari Ini |
| Puskesmas | `NURSE_MIDWIFE` | Perawat / Bidan | S3 | 21 | Prioritas Hari Ini |
| Puskesmas | `PHARMACY_OFFICER` | Petugas Farmasi | S3 | 9 | Papan Tenggat & SLA |
| Dokter | `DOCTOR` | Dokter Puskesmas | S4 | 22 | Prioritas Hari Ini |
| Rumah Sakit | *(tidak ada login)* | — sistem eksternal, dijangkau via rujukan | — | — | — |
| Dinas Kesehatan | `ADMIN_DINKES` | Admin System | S4 | 25 | Beranda Puskesmas |
| Dinas Kesehatan | `KEPALA_DINAS` | Kepala Dinas Kesehatan | S3 | 25 | Dashboard Eksekutif |
| Dinas Kesehatan | `ANALYST_DINKES` | Analis Kesehatan Dinkes | S2 | 42 | Ringkasan Kabupaten |
| Dinas Kesehatan | `AUDITOR` | Auditor Eksternal / Pengawas | S1 | 13 | Jejak Audit Puskesmas |
| Dinas Kesehatan | `BUPATI` | Bupati / Kepala Daerah | S0 | 12 | Tampilan Kepala Daerah |

---

## 1. Warga

### `CITIZEN` — Warga / Sasaran CKG
Akun masyarakat penerima manfaat CKG untuk akses riwayat personal dan persetujuan tindak lanjut. Plafon **S1**.

| Menu | Kode | Spesifikasi |
|---|---|---|
| Citizen Sahabat Warga | SCR-WRG-B01 | Aplikasi Sahabat Warga CKG (SCR-WRG-A01 s.d F03 · 17 Layar) |

Warga hanya punya satu titik masuk: aplikasi mobile Sahabat Warga itu sendiri (bukan sidebar desktop). Di dalamnya tersedia riwayat CKG, jadwal, consent, dan pelaporan kendala tindak lanjut miliknya sendiri.

---

## 2. Pustu / Kader / Posyandu

### `KADER` — Kader Kesehatan Desa
Petugas lapangan untuk outreach & pendampingan warga. Dibatasi pada Plafon **S2** — tidak pernah menerima nilai klinis/tensi/gula dari server, bahkan jika ada nav id yang secara teknis mengizinkannya.

| Menu | Kode | Spesifikasi |
|---|---|---|
| Kader Field App | SCR-KDR-B01 | Aplikasi Lapangan Kader Posyandu (SCR-KDR-A01 s.d E02) · F1 · Plafon S2 |
| Prioritas Hari Ini | SCR-PKM-B01 | Prioritas Hari Ini (Antrean Kapasitas Layanan) · F1 · Plafon S4 · UC PKM-06, PKM-07 |
| Penugasan Outreach | SCR-PKM-B02 | Penugasan Outreach Kader Posyandu/Pustu · F1 · Plafon S2 · UC PKM-08 |
| Hasil Kontak & Outreach | SCR-PKM-B03 | Hasil Kontak & Eskalasi Outreach · F1 ⚠ UX-OI-03 · Plafon S2 · UC PKM-09/10 |
| Citizen Sahabat Warga | SCR-WRG-B01 | Aplikasi Sahabat Warga CKG — dipakai untuk "Mode Terbantu" mendampingi warga tanpa ponsel |
| Edukasi & Nudge Budaya | SCR-AI-08 | Nudge Komunikasi & Edukasi Kontekstual Budaya Lokal |
| Optimasi Rute Maritim | SCR-AI-09 | Optimasi Rute Pusling Laut & Akses Maritim Antar-Pulau |
| Sinkronisasi | SCR-SYS-01 | Sinkronisasi Data Offline-to-Online PWA Lapangan |

Kader login lewat shell mobile `KaderAppShell`, bukan sidebar desktop biasa — daftar di atas adalah nav id yang diizinkan untuknya secara backend.

### `PUSTU` — Petugas Pustu
Petugas Puskesmas Pembantu dengan cakupan wilayah operasional desa binaan. Plafon **S3**. Sejak audit menu-per-peran, disamakan dengan amplop akses `KADER` — katalog sumber menggabungkan Pustu/Kader/Posyandu sebagai satu persona ("kader melihat sesedikit mungkin"), tanpa membedakan tingkatan.

| Menu | Kode | Spesifikasi |
|---|---|---|
| Beranda Puskesmas | SCR-PKM-A02 | Beranda Puskesmas · F1 · Plafon S3 · UC PKM-21, PKM-06 |
| Prioritas Hari Ini | SCR-PKM-B01 | Prioritas Hari Ini (Antrean Kapasitas Layanan) · F1 · Plafon S4 · UC PKM-06, PKM-07 |
| Hasil Kontak & Outreach | SCR-PKM-B03 | Hasil Kontak & Eskalasi Outreach · F1 ⚠ UX-OI-03 · Plafon S2 · UC PKM-09/10 |
| Penugasan Outreach | SCR-PKM-B02 | Penugasan Outreach Kader Posyandu/Pustu · F1 · Plafon S2 · UC PKM-08 |
| Kader Field App | SCR-KDR-B01 | Aplikasi Lapangan Kader Posyandu (SCR-KDR-A01 s.d E02) · F1 · Plafon S2 |
| Edukasi & Nudge Budaya | SCR-AI-08 | Nudge Komunikasi & Edukasi Kontekstual Budaya Lokal |
| Optimasi Rute Maritim | SCR-AI-09 | Optimasi Rute Pusling Laut & Akses Maritim Antar-Pulau |
| Sinkronisasi | SCR-SYS-01 | Sinkronisasi Data Offline-to-Online PWA Lapangan |

### `POSYANDU` — Petugas Posyandu
Petugas pos pelayanan terpadu dengan cakupan lingkup pos pelayanan. Plafon **S2**.

| Menu | Kode | Spesifikasi |
|---|---|---|
| Beranda Puskesmas | SCR-PKM-A02 | Beranda Puskesmas · F1 · Plafon S3 · UC PKM-21, PKM-06 |
| Prioritas Hari Ini | SCR-PKM-B01 | Prioritas Hari Ini (Antrean Kapasitas Layanan) · F1 · Plafon S4 · UC PKM-06, PKM-07 |
| Hasil Kontak & Outreach | SCR-PKM-B03 | Hasil Kontak & Eskalasi Outreach · F1 ⚠ UX-OI-03 · Plafon S2 · UC PKM-09/10 |
| Penugasan Outreach | SCR-PKM-B02 | Penugasan Outreach Kader Posyandu/Pustu · F1 · Plafon S2 · UC PKM-08 |
| Kader Field App | SCR-KDR-B01 | Aplikasi Lapangan Kader Posyandu (SCR-KDR-A01 s.d E02) · F1 · Plafon S2 |
| Sinkronisasi | SCR-SYS-01 | Sinkronisasi Data Offline-to-Online PWA Lapangan |

---

## 3. Puskesmas

### `KEPALA_PUSKESMAS` — Kepala Puskesmas
Akses manajerial Puskesmas untuk mengelola staf lokal, penugasan wilayah kader, dan audit operasional faskes. Plafon **S3**. Sejak audit, tidak lagi melihat layar Command Center kabupaten lintas-8-Puskesmas milik Dinkes (lihat Catatan Teknis).

**Care Orchestration**

| Menu | Kode | Spesifikasi |
|---|---|---|
| Beranda Puskesmas | SCR-PKM-A02 | Beranda Puskesmas · F1 · Plafon S3 · UC PKM-21, PKM-06 |
| Prioritas Hari Ini | SCR-PKM-B01 | Prioritas Hari Ini (Antrean Kapasitas Layanan) · F1 · Plafon S4 · UC PKM-06, PKM-07 |
| Papan Tenggat & SLA | SCR-PKM-B05 | Papan Tenggat & Jenjang Pengingat · F1 · Plafon S2 · UC PKM-09 |
| Layanan Klinis & FKTP | SCR-PKM-D01 | Layanan Klinis & Konfirmasi FKTP (D01-D07) · F1 · Plafon S4 · UC PKM-12-16 |
| Hasil Kontak & Outreach | SCR-PKM-B03 | Hasil Kontak & Eskalasi Outreach · F1 ⚠ UX-OI-03 · Plafon S2 · UC PKM-09/10 |
| Penugasan Outreach | SCR-PKM-B02 | Penugasan Outreach Kader Posyandu/Pustu · F1 · Plafon S2 · UC PKM-08 |
| Kader Field App | SCR-KDR-B01 | Aplikasi Lapangan Kader Posyandu (SCR-KDR-A01 s.d E02) · F1 · Plafon S2 |
| Jadwal & Kuota | SCR-PKM-G01 | Jadwal & Kuota Layanan FKTP · F1 · Plafon S0 · UC PKM-23 |
| Kandidat Putus Perawatan | SCR-PKM-B04 | Drop-out & Kandidat Putus Perawatan · F1 · Plafon S3 · UC PKM-11 |
| Beban Kerja Tim | SCR-PKM-G02 | Distribusi Beban Kerja Petugas & Kader · F2 · Plafon S2 · UC PKM-22 |
| Konfigurasi Jenjang | SCR-PKM-B05 | Konfigurasi Jenjang Eskalasi & SLA Outreach · F1 · Plafon S2 · UC PKM-09 |

**Advanced AI Intelligence**

| Menu | Kode | Spesifikasi |
|---|---|---|
| Prediksi Putus Berobat | SCR-AI-01 | Model Prediktif Risiko Drop-out Perawatan Kronis |
| Digital Twin Warga | SCR-AI-02 | Digital Twin Profil Kardiometabolik Warga CKG |
| Proyeksi Beban & Obat | SCR-DNK-E03 | Proyeksi Beban Wilayah & Kebutuhan Obat · F3 · Plafon S3 Agregat |
| Kepatuhan & Efektivitas | SCR-AI-05 | Analisis Kepatuhan & Efektivitas Terapi Farmakologi |
| Prioritas Pencegahan Lanjut | SCR-AI-06 | Prioritisasi Intervensi Pencegahan Primer & Sekunder |
| Edukasi & Nudge Budaya | SCR-AI-08 | Nudge Komunikasi & Edukasi Kontekstual Budaya Lokal |
| Optimasi Rute Maritim | SCR-AI-09 | Optimasi Rute Pusling Laut & Akses Maritim Antar-Pulau |

**Pemantauan & Outcome**

| Menu | Kode | Spesifikasi |
|---|---|---|
| Siklus Pemantauan | SCR-PKM-F01 | Siklus Pemantauan Berjalan · F1 · Plafon S3 · UC PKM-20 |
| Kunjungan Kontrol | SCR-PKM-F02 | Kunjungan Kontrol Ulang Terjadwal · F1 · Plafon S4 · UC PKM-18 |
| Evaluasi Status Terkendali | SCR-PKM-F04 | Penetapan Status Terkendali · F1 ⚠ OI-08 · Plafon S4 · UC PKM-18 |
| Integritas & Audit PKM | SCR-PKM-G06 | Jejak Audit & Integritas Puskesmas CMP-09 · F1 · Plafon S1 · UC DNK-12 |
| Kepatuhan & Penyebab | SCR-PKM-F03 | Kepatuhan Minum Obat & Penyebab CMP-07 · F1 ⚠ UX-OI-03 · Plafon S4 · UC PKM-19 |
| Kohort per Penyakit | SCR-PKM-F06 | Kohort Penyakit Kronis (HT, DM, Dislipidemia) · F2 · Plafon S3 · UC PKM-20 |
| Tren Outcome Pasien | SCR-PKM-F07 | Tren Outcome Pasien Longitudinal Bersama Terapi · F2 · Plafon S4 · UC PKM-18 |
| Risiko Putus Perawatan | SCR-PKM-B04 | Deteksi Dini & Pencegahan Drop-out Perawatan · F1 · Plafon S3 · UC PKM-11 |

**Registry, Stratifikasi, Organisasi & Tata Kelola**

| Menu | Kode | Spesifikasi |
|---|---|---|
| Registry Wilayah Kerja | SCR-PKM-C01 | Registry Wilayah Kerja CKG · F1 · Plafon S4 · UC PKM-02 |
| Antrean Data Bermasalah | SCR-PKM-C04 | Antrean Data Bermasalah (NIK/Anomali) · F1 · Plafon S3 · UC PKM-05 |
| Dasar Klasifikasi CRS | SCR-PKM-C03 | Dasar Klasifikasi & Aturan Deterministik CRS · F1 · Plafon S4 · UC PKM-03/04 |
| Fasilitas & Rujukan | SCR-PKM-E04 | Daftar Jejaring Fasilitas Rujukan FKTP · F2 · Plafon S0 · UC PKM-17, DNK-11 |
| Layanan | SCR-ADM-03 | Katalog Layanan & Prosedur FKTP/FKRTL |
| Akun Staf & Kader | SCR-PKM-G03 | Akun & Peran Puskesmas · F1 · Plafon S1 · UC PKM-24 |
| Cakupan Wilayah | SCR-DNK-A01 | Penetapan Identitas & Cakupan Wilayah Pengguna · F1 · Plafon S0 · UC DNK-12 |
| Persetujuan | SCR-GOV-01 | Persetujuan Tindakan & Consent Medis Warga · S0 |
| Jejak Audit Puskesmas | SCR-PKM-G06 | Jejak Audit Puskesmas CMP-09 · F1 · Plafon S1 · UC DNK-12 turunan |
| Sinkronisasi | SCR-SYS-01 | Sinkronisasi Data Offline-to-Online PWA Lapangan |

### `PJ_CKG` — Penanggung Jawab CKG Puskesmas
Koordinator operasional tindak lanjut Cek Kesehatan Gratis tingkat Puskesmas dan jaringan desa. Plafon **S3**.

**Care Orchestration**

| Menu | Kode | Spesifikasi |
|---|---|---|
| Beranda Puskesmas | SCR-PKM-A02 | Beranda Puskesmas · F1 · Plafon S3 · UC PKM-21, PKM-06 |
| Prioritas Hari Ini | SCR-PKM-B01 | Prioritas Hari Ini (Antrean Kapasitas Layanan) · F1 · Plafon S4 · UC PKM-06, PKM-07 |
| Papan Tenggat & SLA | SCR-PKM-B05 | Papan Tenggat & Jenjang Pengingat · F1 · Plafon S2 · UC PKM-09 |
| Layanan Klinis & FKTP | SCR-PKM-D01 | Layanan Klinis & Konfirmasi FKTP (D01-D07) · F1 · Plafon S4 · UC PKM-12-16 |
| Hasil Kontak & Outreach | SCR-PKM-B03 | Hasil Kontak & Eskalasi Outreach · F1 ⚠ UX-OI-03 · Plafon S2 · UC PKM-09/10 |
| Penugasan Outreach | SCR-PKM-B02 | Penugasan Outreach Kader Posyandu/Pustu · F1 · Plafon S2 · UC PKM-08 |
| Kader Field App | SCR-KDR-B01 | Aplikasi Lapangan Kader Posyandu (SCR-KDR-A01 s.d E02) · F1 · Plafon S2 |
| Jadwal & Kuota | SCR-PKM-G01 | Jadwal & Kuota Layanan FKTP · F1 · Plafon S0 · UC PKM-23 |
| Kandidat Putus Perawatan | SCR-PKM-B04 | Drop-out & Kandidat Putus Perawatan · F1 · Plafon S3 · UC PKM-11 |
| Beban Kerja Tim | SCR-PKM-G02 | Distribusi Beban Kerja Petugas & Kader · F2 · Plafon S2 · UC PKM-22 |
| Konfigurasi Jenjang | SCR-PKM-B05 | Konfigurasi Jenjang Eskalasi & SLA Outreach · F1 · Plafon S2 · UC PKM-09 |

**Advanced AI Intelligence**

| Menu | Kode | Spesifikasi |
|---|---|---|
| Prediksi Putus Berobat | SCR-AI-01 | Model Prediktif Risiko Drop-out Perawatan Kronis |
| Digital Twin Warga | SCR-AI-02 | Digital Twin Profil Kardiometabolik Warga CKG |
| Proyeksi Beban & Obat | SCR-DNK-E03 | Proyeksi Beban Wilayah & Kebutuhan Obat · F3 · Plafon S3 Agregat |
| Kepatuhan & Efektivitas | SCR-AI-05 | Analisis Kepatuhan & Efektivitas Terapi Farmakologi |
| Prioritas Pencegahan Lanjut | SCR-AI-06 | Prioritisasi Intervensi Pencegahan Primer & Sekunder |
| Edukasi & Nudge Budaya | SCR-AI-08 | Nudge Komunikasi & Edukasi Kontekstual Budaya Lokal |
| Optimasi Rute Maritim | SCR-AI-09 | Optimasi Rute Pusling Laut & Akses Maritim Antar-Pulau |

Tidak lagi memiliki akses *Citizen Sahabat Warga* — tidak ada mandat eksplisit di katalog sumber bagi koordinator CKG Puskesmas untuk membuka aplikasi warga (beda dengan Kader yang punya "Mode Terbantu").

**Pemantauan, Registry & Tata Kelola**

| Menu | Kode | Spesifikasi |
|---|---|---|
| Siklus Pemantauan | SCR-PKM-F01 | Siklus Pemantauan Berjalan · F1 · Plafon S3 · UC PKM-20 |
| Kunjungan Kontrol | SCR-PKM-F02 | Kunjungan Kontrol Ulang Terjadwal · F1 · Plafon S4 · UC PKM-18 |
| Evaluasi Status Terkendali | SCR-PKM-F04 | Penetapan Status Terkendali · F1 ⚠ OI-08 · Plafon S4 · UC PKM-18 |
| Integritas & Audit PKM | SCR-PKM-G06 | Jejak Audit & Integritas Puskesmas CMP-09 · F1 · Plafon S1 · UC DNK-12 |
| Kepatuhan & Penyebab | SCR-PKM-F03 | Kepatuhan Minum Obat & Penyebab CMP-07 · F1 ⚠ UX-OI-03 · Plafon S4 · UC PKM-19 |
| Kohort per Penyakit | SCR-PKM-F06 | Kohort Penyakit Kronis (HT, DM, Dislipidemia) · F2 · Plafon S3 · UC PKM-20 |
| Tren Outcome Pasien | SCR-PKM-F07 | Tren Outcome Pasien Longitudinal Bersama Terapi · F2 · Plafon S4 · UC PKM-18 |
| Risiko Putus Perawatan | SCR-PKM-B04 | Deteksi Dini & Pencegahan Drop-out Perawatan · F1 · Plafon S3 · UC PKM-11 |
| Registry Wilayah Kerja | SCR-PKM-C01 | Registry Wilayah Kerja CKG · F1 · Plafon S4 · UC PKM-02 |
| Antrean Data Bermasalah | SCR-PKM-C04 | Antrean Data Bermasalah (NIK/Anomali) · F1 · Plafon S3 · UC PKM-05 |
| Peninjauan Duplikat | SCR-PKM-C05 | Peninjauan & Resolusi Duplikasi Identitas · F2 · Plafon S3 · UC PKM-05 |
| Import Data CKG | SCR-REG-04 | Ingestion & Impor Berkas CSV/Excel CKG · F1 |
| Ingestion Monitor | SCR-SYS-03 | Monitoring Pipeline Ingestion Realtime |
| Riwayat Import | SCR-REG-05 | Riwayat & Audit Log Impor Berkas CKG |
| Dasar Klasifikasi CRS | SCR-PKM-C03 | Dasar Klasifikasi & Aturan Deterministik CRS · F1 · Plafon S4 · UC PKM-03/04 |
| Persetujuan | SCR-GOV-01 | Persetujuan Tindakan & Consent Medis Warga · S0 |
| Sinkronisasi | SCR-SYS-01 | Sinkronisasi Data Offline-to-Online PWA Lapangan |

### `NURSE_MIDWIFE` — Perawat / Bidan
Tenaga kesehatan pelaksana skrining lanjutan, pemeriksaan vital, dan pendampingan kader. Plafon **S3**.

| Menu | Kode | Spesifikasi |
|---|---|---|
| Beranda Puskesmas | SCR-PKM-A02 | Beranda Puskesmas · F1 · Plafon S3 · UC PKM-21, PKM-06 |
| Prioritas Hari Ini | SCR-PKM-B01 | Prioritas Hari Ini (Antrean Kapasitas Layanan) · F1 · Plafon S4 · UC PKM-06, PKM-07 |
| Papan Tenggat & SLA | SCR-PKM-B05 | Papan Tenggat & Jenjang Pengingat · F1 · Plafon S2 · UC PKM-09 |
| Layanan Klinis & FKTP | SCR-PKM-D01 | Layanan Klinis & Konfirmasi FKTP (D01-D07) · F1 · Plafon S4 · UC PKM-12-16 |
| Hasil Kontak & Outreach | SCR-PKM-B03 | Hasil Kontak & Eskalasi Outreach · F1 ⚠ UX-OI-03 · Plafon S2 · UC PKM-09/10 |
| Jadwal & Kuota | SCR-PKM-G01 | Jadwal & Kuota Layanan FKTP · F1 · Plafon S0 · UC PKM-23 |
| Kandidat Putus Perawatan | SCR-PKM-B04 | Drop-out & Kandidat Putus Perawatan · F1 · Plafon S3 · UC PKM-11 |
| Prediksi Putus Berobat | SCR-AI-01 | Model Prediktif Risiko Drop-out Perawatan Kronis |
| Digital Twin Warga | SCR-AI-02 | Digital Twin Profil Kardiometabolik Warga CKG |
| Kepatuhan & Efektivitas | SCR-AI-05 | Analisis Kepatuhan & Efektivitas Terapi Farmakologi |
| Prioritas Pencegahan Lanjut | SCR-AI-06 | Prioritisasi Intervensi Pencegahan Primer & Sekunder |
| Edukasi & Nudge Budaya | SCR-AI-08 | Nudge Komunikasi & Edukasi Kontekstual Budaya Lokal |
| Optimasi Rute Maritim | SCR-AI-09 | Optimasi Rute Pusling Laut & Akses Maritim Antar-Pulau |
| Siklus Pemantauan | SCR-PKM-F01 | Siklus Pemantauan Berjalan · F1 · Plafon S3 · UC PKM-20 |
| Kunjungan Kontrol | SCR-PKM-F02 | Kunjungan Kontrol Ulang Terjadwal · F1 · Plafon S4 · UC PKM-18 |
| Evaluasi Status Terkendali | SCR-PKM-F04 | Penetapan Status Terkendali · F1 ⚠ OI-08 · Plafon S4 · UC PKM-18 |
| Kepatuhan & Penyebab | SCR-PKM-F03 | Kepatuhan Minum Obat & Penyebab CMP-07 · F1 ⚠ UX-OI-03 · Plafon S4 · UC PKM-19 |
| Risiko Putus Perawatan | SCR-PKM-B04 | Deteksi Dini & Pencegahan Drop-out Perawatan · F1 · Plafon S3 · UC PKM-11 |
| Registry Wilayah Kerja | SCR-PKM-C01 | Registry Wilayah Kerja CKG · F1 · Plafon S4 · UC PKM-02 |
| Dasar Klasifikasi CRS | SCR-PKM-C03 | Dasar Klasifikasi & Aturan Deterministik CRS · F1 · Plafon S4 · UC PKM-03/04 |
| Sinkronisasi | SCR-SYS-01 | Sinkronisasi Data Offline-to-Online PWA Lapangan |

### `PHARMACY_OFFICER` — Petugas Farmasi
Petugas kefarmasian untuk verifikasi obat dan logistik skrining PTM. Plafon **S3**. Dihilangkan dari dropdown "Ganti Peran" atas permintaan eksplisit, dan sejak audit tidak lagi memiliki akses Digital Twin Warga (profil klinis penuh di luar cakupan farmasi).

| Menu | Kode | Spesifikasi |
|---|---|---|
| Beranda Puskesmas | SCR-PKM-A02 | Beranda Puskesmas · F1 · Plafon S3 · UC PKM-21, PKM-06 |
| Papan Tenggat & SLA | SCR-PKM-B05 | Papan Tenggat & Jenjang Pengingat · F1 · Plafon S2 · UC PKM-09 |
| Layanan Klinis & FKTP | SCR-PKM-D01 | Layanan Klinis & Konfirmasi FKTP (D01-D07) · F1 · Plafon S4 · UC PKM-12-16 |
| Jadwal & Kuota | SCR-PKM-G01 | Jadwal & Kuota Layanan FKTP · F1 · Plafon S0 · UC PKM-23 |
| Kepatuhan & Efektivitas | SCR-AI-05 | Analisis Kepatuhan & Efektivitas Terapi Farmakologi |
| Proyeksi Beban & Obat | SCR-DNK-E03 | Proyeksi Beban Wilayah & Kebutuhan Obat · F3 · Plafon S3 Agregat |
| Siklus Pemantauan | SCR-PKM-F01 | Siklus Pemantauan Berjalan · F1 · Plafon S3 · UC PKM-20 |
| Kunjungan Kontrol | SCR-PKM-F02 | Kunjungan Kontrol Ulang Terjadwal · F1 · Plafon S4 · UC PKM-18 |
| Sinkronisasi | SCR-SYS-01 | Sinkronisasi Data Offline-to-Online PWA Lapangan |

---

## 4. Dokter

### `DOCTOR` — Dokter Puskesmas
Tenaga medis klinis penanggung jawab verifikasi diagnosa dan tindakan tindak lanjut CKG. Plafon **S4** — satu-satunya peran non-Dinkes dengan plafon tertinggi, konsisten dengan katalog sumber: *"satu-satunya peran yang boleh menegakkan diagnosis, menetapkan terapi, dan menimpa keluaran mesin aturan."*

| Menu | Kode | Spesifikasi |
|---|---|---|
| Beranda Puskesmas | SCR-PKM-A02 | Beranda Puskesmas · F1 · Plafon S3 · UC PKM-21, PKM-06 |
| Prioritas Hari Ini | SCR-PKM-B01 | Prioritas Hari Ini (Antrean Kapasitas Layanan) · F1 · Plafon S4 · UC PKM-06, PKM-07 |
| Papan Tenggat & SLA | SCR-PKM-B05 | Papan Tenggat & Jenjang Pengingat · F1 · Plafon S2 · UC PKM-09 |
| Layanan Klinis & FKTP | SCR-PKM-D01 | Layanan Klinis & Konfirmasi FKTP (D01-D07) · F1 · Plafon S4 · UC PKM-12-16 |
| Jadwal & Kuota | SCR-PKM-G01 | Jadwal & Kuota Layanan FKTP · F1 · Plafon S0 · UC PKM-23 |
| Kandidat Putus Perawatan | SCR-PKM-B04 | Drop-out & Kandidat Putus Perawatan · F1 · Plafon S3 · UC PKM-11 |
| Prediksi Putus Berobat | SCR-AI-01 | Model Prediktif Risiko Drop-out Perawatan Kronis |
| Digital Twin Warga | SCR-AI-02 | Digital Twin Profil Kardiometabolik Warga CKG |
| Kepatuhan & Efektivitas | SCR-AI-05 | Analisis Kepatuhan & Efektivitas Terapi Farmakologi |
| Prioritas Pencegahan Lanjut | SCR-AI-06 | Prioritisasi Intervensi Pencegahan Primer & Sekunder |
| Clinical Decision Copilot | SCR-AI-07 | Asisten Pendukung Keputusan Klinis Dokter FKTP |
| Edukasi & Nudge Budaya | SCR-AI-08 | Nudge Komunikasi & Edukasi Kontekstual Budaya Lokal |
| Siklus Pemantauan | SCR-PKM-F01 | Siklus Pemantauan Berjalan · F1 · Plafon S3 · UC PKM-20 |
| Kunjungan Kontrol | SCR-PKM-F02 | Kunjungan Kontrol Ulang Terjadwal · F1 · Plafon S4 · UC PKM-18 |
| Evaluasi Status Terkendali | SCR-PKM-F04 | Penetapan Status Terkendali · F1 ⚠ OI-08 · Plafon S4 · UC PKM-18 |
| Kepatuhan & Penyebab | SCR-PKM-F03 | Kepatuhan Minum Obat & Penyebab CMP-07 · F1 ⚠ UX-OI-03 · Plafon S4 · UC PKM-19 |
| Kohort per Penyakit | SCR-PKM-F06 | Kohort Penyakit Kronis (HT, DM, Dislipidemia) · F2 · Plafon S3 · UC PKM-20 |
| Tren Outcome Pasien | SCR-PKM-F07 | Tren Outcome Pasien Longitudinal Bersama Terapi · F2 · Plafon S4 · UC PKM-18 |
| Risiko Putus Perawatan | SCR-PKM-B04 | Deteksi Dini & Pencegahan Drop-out Perawatan · F1 · Plafon S3 · UC PKM-11 |
| Registry Wilayah Kerja | SCR-PKM-C01 | Registry Wilayah Kerja CKG · F1 · Plafon S4 · UC PKM-02 |
| Dasar Klasifikasi CRS | SCR-PKM-C03 | Dasar Klasifikasi & Aturan Deterministik CRS · F1 · Plafon S4 · UC PKM-03/04 |
| Sinkronisasi | SCR-SYS-01 | Sinkronisasi Data Offline-to-Online PWA Lapangan |

`ai-clinical-copilot` (Clinical Decision Copilot) sejak audit hanya tersedia untuk `DOCTOR` dan `ADMIN_DINKES` — dicabut dari Kepala Puskesmas karena hak menegakkan diagnosis eksklusif milik Dokter.

---

## 5. Rumah Sakit

Tidak ada peran login untuk Rumah Sakit — ini keputusan desain yang dinyatakan eksplisit di katalog sumber, bukan kelalaian. RSUD/FKRTL diperlakukan sebagai **sistem eksternal** yang dijangkau lewat rujukan terlacak dari sisi Puskesmas/Dokter (menu *Layanan Klinis & FKTP*, tab Rujukan), dengan field `replyChannel` pada `HospitalReferral` yang mencatat tingkat kematangan interaksinya (Manual → Semi-otomatis → Otomatis).

---

## 6. Dinas Kesehatan

### `ADMIN_DINKES` — Admin System
Akses penuh administrasi sistem, master data, wilayah, faskes, akun pengguna, peran, dan tata kelola platform. Plafon **S4**. Diperlakukan sebagai peran **super-admin** di luar 6 persona katalog sumber — tapi sejak audit lanjutan, dibatasi ketat ke fungsi konfigurasi platform saja (persis kalimat deskripsi perannya sendiri), bukan lagi akses penuh ke seluruh aplikasi. Semua kerja klinis, operasional, dan analitik-eksekutif kini murni milik peran spesialis masing-masing (Puskesmas, Dokter, Dinkes eksekutif) — Admin System tidak lagi bisa membuka Registry, Command Center, atau alat AI operasional.

| Menu | Kode | Spesifikasi |
|---|---|---|
| Beranda Puskesmas | SCR-PKM-A02 | Beranda Puskesmas · F1 · Plafon S3 · UC PKM-21, PKM-06 |
| Wilayah Binaan | SCR-DNK-F01 | Master Data Wilayah & Desa Binaan · F1 · Plafon S1 · UC DNK-11 |
| Fasilitas & Rujukan | SCR-PKM-E04 | Daftar Jejaring Fasilitas Rujukan FKTP · F2 · Plafon S0 · UC PKM-17, DNK-11 |
| Layanan | SCR-ADM-03 | Katalog Layanan & Prosedur FKTP/FKRTL |
| Akun Staf & Kader | SCR-PKM-G03 | Akun & Peran Puskesmas · F1 · Plafon S1 · UC PKM-24 |
| Peran & Hak Akses | SCR-ADM-02 | Manajemen Peran & Kebijakan Hak Akses RBAC · F1 |
| Cakupan Wilayah | SCR-DNK-A01 | Penetapan Identitas & Cakupan Wilayah Pengguna · F1 · Plafon S0 · UC DNK-12 |
| Persetujuan | SCR-GOV-01 | Persetujuan Tindakan & Consent Medis Warga · S0 |
| Versi Aturan CRS | SCR-DNK-F02 | Tata Kelola Versi Aturan Klinis CRS & Simulasi Dampak · F1 · Plafon S0 · UC DNK-11 |
| Jejak Audit Puskesmas | SCR-PKM-G06 | Jejak Audit Puskesmas CMP-09 · F1 · Plafon S1 · UC DNK-12 turunan |
| Sinkronisasi | SCR-SYS-01 | Sinkronisasi Data Offline-to-Online PWA Lapangan |
| Integrasi | SCR-SYS-02 | Monitoring Konektor API & Integrasi SATUSEHAT |
| Pengaturan | SCR-SYS-04 | Pengaturan Konfigurasi Parameter Sistem |
| Tata Kelola & Safety AI | SCR-DNK-F07 | Tata Kelola Model AI & Kill Switch · F3 · Plafon S0 · UC SYS-11/12 |
| Kinerja & Uji Keadilan AI | SCR-DNK-F07 | Audit Kinerja, Drift, & Uji Keadilan Antar-Wilayah Maritim · F3 |
| Dasar Klasifikasi CRS | SCR-PKM-C03 | Dasar Klasifikasi & Aturan Deterministik CRS · F1 · Plafon S4 · UC PKM-03/04 |
| Antrean Data Bermasalah | SCR-PKM-C04 | Antrean Data Bermasalah (NIK/Anomali) · F1 · Plafon S3 · UC PKM-05 |
| Peninjauan Duplikat | SCR-PKM-C05 | Peninjauan & Resolusi Duplikasi Identitas · F2 · Plafon S3 · UC PKM-05 |
| Import Data CKG | SCR-REG-04 | Ingestion & Impor Berkas CSV/Excel CKG · F1 |
| Ingestion Monitor | SCR-SYS-03 | Monitoring Pipeline Ingestion Realtime |
| Riwayat Import | SCR-REG-05 | Riwayat & Audit Log Impor Berkas CKG |
| Pemetaan Kolom | SCR-REG-06 | Pemetaan Kolom & Schema Matching Ingestion |

*Alokasi Logistik Faskes* dan *Advanced AI Assistant* kini halaman kerja nyata (lihat Riwayat Audit Putaran 6), bukan lagi placeholder Roadmap.

`ai-tata-kelola` dan `ai-kinerja-model` sengaja dipertahankan karena keduanya literal "tata kelola" (kill switch model AI, audit bias) — bukan alat analitik operasional. Modul ingestion (Import/Monitor/Riwayat/Pemetaan/Data Bermasalah/Duplikat) dipertahankan karena termasuk administrasi *master data*, bukan kerja klinis harian.

### `KEPALA_DINAS` — Kepala Dinas Kesehatan
Akses eksekutif untuk melihat konfigurasi organisasi, pemantauan governance, dan status kesiapan sistem kesehatan wilayah. Plafon **S3**. Sejak audit, tidak lagi memiliki akses *Registry Wilayah Kerja* (menu operasional milik Puskesmas) — penelusuran individu kini hanya lewat *Audit Penelusuran* yang wajib mencantumkan keperluan & tercatat audit.

**Dinkes Command Center**

| Menu | Kode | Spesifikasi |
|---|---|---|
| Dashboard Eksekutif | SCR-DNK-A02 | Command Center Kabupaten · F1 · Plafon S3 Agregat · UC DNK-01 |
| Command Center Eksekutif | SCR-DNK-A03 | Command Center untuk Pimpinan Daerah · F1 · Plafon S3 Agregat · UC DNK-01 |
| Ringkasan Kabupaten | SCR-DNK-A02 | Command Center Kabupaten · F1 · Plafon S3 Agregat · UC DNK-01 |
| CKG Impact Index | SCR-DNK-B01 | CKG Impact Index (Level 1-3) · F1 (OI-08) · Plafon S3 Agregat · UC DNK-02 |
| Kaskade Tindak Lanjut | SCR-DNK-B02 | Rel Kaskade & Analisis Drop-off · F1 · Plafon S3 Agregat · UC DNK-02/05 |
| Analisis Wilayah | SCR-DNK-C01 | Peta Risiko Desa & Kecamatan · F1 (DS-OI-06) · Plafon S3 Agregat · UC DNK-03 |
| Disparitas Tindak Lanjut | SCR-DNK-C02 | Daftar Disparitas & Gap Wilayah · F1 · Plafon S3 Agregat · UC DNK-05 |
| Kinerja Puskesmas | SCR-DNK-D01 | Kinerja Tindak Lanjut per Puskesmas · F1 · Plafon S3 Agregat · UC DNK-04 |
| Penyebab & Kendala | SCR-DNK-D02 | Sebaran Penyebab & Kendala CMP-07 · F2 (UX-OI-03) · Plafon S3 Agregat · UC DNK-07 |
| Intervensi Populasi | SCR-DNK-E01 | Penetapan & Pelacakan Intervensi Populasi · F2 · Plafon S3 Agregat · UC DNK-07 |
| Perbandingan Periode | SCR-DNK-B03 | Perbandingan Metrik Antar-Periode · F3 · Plafon S3 Agregat · UC DNK-09 |
| Kualitas & Integrasi | SCR-DNK-F03 | Status Integrasi INT-01 s.d INT-06 & Kualitas Data · F1 · Plafon S0 · UC SYS-01/09 |
| Tampilan Kepala Daerah | SCR-DNK-F06 | Ringkasan Eksekutif Kepala Daerah / Bupati · F2 · Plafon S3 Agregat · UC DNK-01 |
| Laporan & Ekspor | SCR-DNK-F05 | Ekspor Laporan Bupati & Kemenkes (PDF/Excel) · F2 · Plafon S3 Agregat · UC DNK-10 |
| Audit Penelusuran | SCR-DNK-C03 | Penelusuran Agregat ke Individu Terkendali CMP-09 · F2 · Plafon S1 · UC DNK-06 |

**Pemantauan, Stratifikasi & Organisasi**

| Menu | Kode | Spesifikasi |
|---|---|---|
| Siklus Pemantauan | SCR-PKM-F01 | Siklus Pemantauan Berjalan · F1 · Plafon S3 · UC PKM-20 |
| Integritas & Audit PKM | SCR-PKM-G06 | Jejak Audit & Integritas Puskesmas CMP-09 · F1 · Plafon S1 · UC DNK-12 |
| Kohort per Penyakit | SCR-PKM-F06 | Kohort Penyakit Kronis (HT, DM, Dislipidemia) · F2 · Plafon S3 · UC PKM-20 |
| Tren Outcome Pasien | SCR-PKM-F07 | Tren Outcome Pasien Longitudinal Bersama Terapi · F2 · Plafon S4 · UC PKM-18 |
| Risiko Putus Perawatan | SCR-PKM-B04 | Deteksi Dini & Pencegahan Drop-out Perawatan · F1 · Plafon S3 · UC PKM-11 |
| Dasar Klasifikasi CRS | SCR-PKM-C03 | Dasar Klasifikasi & Aturan Deterministik CRS · F1 · Plafon S4 · UC PKM-03/04 |
| Wilayah Binaan | SCR-DNK-F01 | Master Data Wilayah & Desa Binaan · F1 · Plafon S1 · UC DNK-11 |
| Fasilitas & Rujukan | SCR-PKM-E04 | Daftar Jejaring Fasilitas Rujukan FKTP · F2 · Plafon S0 · UC PKM-17, DNK-11 |
| Layanan | SCR-ADM-03 | Katalog Layanan & Prosedur FKTP/FKRTL |

Juga memiliki *Alokasi Logistik Faskes* dan *Advanced AI Assistant* (kini halaman kerja nyata, lihat Riwayat Audit Putaran 6). *Outcome & Command Center* dipensiunkan.

### `ANALYST_DINKES` — Analis Kesehatan Dinkes
Akses analitik agregat, monitoring master data, dan audit kepatuhan tanpa hak mengubah konfigurasi master. Plafon **S2**. Sejak audit, tidak lagi memiliki akses *Registry Wilayah Kerja* (alasan sama seperti Kepala Dinas).

Memiliki 42 menu mencakup: seluruh **Dinkes Command Center** (13 dari 14 — kecuali *Tampilan Kepala Daerah*), 9 menu **AI Intelligence** (termasuk 2 menu tata kelola model AI khusus Dinkes: *Tata Kelola & Safety AI*, *Kinerja & Uji Keadilan AI*), **Pemantauan** (4 menu), **Ingestion/Data Quality** (6 menu: Antrean Data Bermasalah, Peninjauan Duplikat, Import Data CKG, Ingestion Monitor, Riwayat Import, Pemetaan Kolom), **Organisasi** (Wilayah Binaan, Fasilitas & Rujukan, Layanan), **Governance** (Versi Aturan CRS, Jejak Audit Puskesmas — *Persetujuan dicabut, lihat Riwayat Audit Putaran 3*), Integrasi, Dasar Klasifikasi CRS, dan *Advanced AI Assistant* (kini halaman kerja nyata, lihat Riwayat Audit Putaran 6).

### `AUDITOR` — Auditor Eksternal / Pengawas
Akses khusus peninjauan jejak audit kepatuhan tanpa hak akses data klinis personal langsung. Plafon **S1**.

| Menu | Kode | Spesifikasi |
|---|---|---|
| Beranda Puskesmas | SCR-PKM-A02 | Beranda Puskesmas · F1 · Plafon S3 · UC PKM-21, PKM-06 |
| Tata Kelola & Safety AI | SCR-DNK-F07 | Tata Kelola Model AI & Kill Switch · F3 · Plafon S0 · UC SYS-11/12 |
| Kinerja & Uji Keadilan AI | SCR-DNK-F07 | Audit Kinerja, Drift, & Uji Keadilan Antar-Wilayah Maritim · F3 |
| Integritas & Audit PKM | SCR-PKM-G06 | Jejak Audit & Integritas Puskesmas CMP-09 · F1 · Plafon S1 · UC DNK-12 |
| Ringkasan Kabupaten | SCR-DNK-A02 | Command Center Kabupaten · F1 · Plafon S3 Agregat · UC DNK-01 |
| Audit Penelusuran | SCR-DNK-C03 | Penelusuran Agregat ke Individu Terkendali CMP-09 · F2 · Plafon S1 · UC DNK-06 |
| Registry Wilayah Kerja | SCR-PKM-C01 | Registry Wilayah Kerja CKG · F1 · Plafon S4 · UC PKM-02 |
| Antrean Data Bermasalah | SCR-PKM-C04 | Antrean Data Bermasalah (NIK/Anomali) · F1 · Plafon S3 · UC PKM-05 |
| Peninjauan Duplikat | SCR-PKM-C05 | Peninjauan & Resolusi Duplikasi Identitas · F2 · Plafon S3 · UC PKM-05 |
| Versi Aturan CRS | SCR-DNK-F02 | Tata Kelola Versi Aturan Klinis CRS & Simulasi Dampak · F1 · Plafon S0 · UC DNK-11 |
| Jejak Audit Puskesmas | SCR-PKM-G06 | Jejak Audit Puskesmas CMP-09 · F1 · Plafon S1 · UC DNK-12 turunan |

Juga memiliki *Advanced AI Assistant* (kini halaman kerja nyata). *Outcome & Command Center* dipensiunkan.

Tidak lagi memiliki akses *Persetujuan* — lihat Riwayat Audit Putaran 3.

### `BUPATI` — Bupati / Kepala Daerah
Akses eksekutif Kepala Daerah untuk ringkasan agregat capaian CKG dan wilayah prioritas **tanpa akses data individual NIK/identitas**. Plafon **S0** — plafon terendah dari semua peran, konsisten dengan posisinya sebagai pembaca ringkasan murni.

| Menu | Kode | Spesifikasi |
|---|---|---|
| Tampilan Kepala Daerah | SCR-DNK-F06 | Ringkasan Eksekutif Kepala Daerah / Bupati · F2 · Plafon S3 Agregat · UC DNK-01 |
| Command Center Eksekutif | SCR-DNK-A03 | Command Center untuk Pimpinan Daerah · F1 · Plafon S3 Agregat · UC DNK-01 |
| Ringkasan Kabupaten | SCR-DNK-A02 | Command Center Kabupaten · F1 · Plafon S3 Agregat · UC DNK-01 |
| CKG Impact Index | SCR-DNK-B01 | CKG Impact Index (Level 1-3) · F1 (OI-08) · Plafon S3 Agregat · UC DNK-02 |
| Kaskade Tindak Lanjut | SCR-DNK-B02 | Rel Kaskade & Analisis Drop-off · F1 · Plafon S3 Agregat · UC DNK-02/05 |
| Analisis Wilayah | SCR-DNK-C01 | Peta Risiko Desa & Kecamatan · F1 (DS-OI-06) · Plafon S3 Agregat · UC DNK-03 |
| Perbandingan Periode | SCR-DNK-B03 | Perbandingan Metrik Antar-Periode · F3 · Plafon S3 Agregat · UC DNK-09 |
| Laporan & Ekspor | SCR-DNK-F05 | Ekspor Laporan Bupati & Kemenkes (PDF/Excel) · F2 · Plafon S3 Agregat · UC DNK-10 |
| Simulasi Skenario Kebijakan | SCR-AI-03 | Laboratorium Simulasi Kebijakan & Intervensi Anggaran |
| Proyeksi Beban & Obat | SCR-DNK-E03 | Proyeksi Beban Wilayah & Kebutuhan Obat · F3 · Plafon S3 Agregat |
| Wilayah Binaan | SCR-DNK-F01 | Master Data Wilayah & Desa Binaan · F1 · Plafon S1 · UC DNK-11 |
| Fasilitas & Rujukan | SCR-PKM-E04 | Daftar Jejaring Fasilitas Rujukan FKTP · F2 · Plafon S0 · UC PKM-17, DNK-11 |

Bupati tidak memiliki menu `dashboard` biasa — landing default-nya langsung ke *Tampilan Kepala Daerah*, dan tombol aksi lintas-populasi di beberapa kartu Command Center dinonaktifkan khusus untuknya (guard `isBupati` di kode).

---

## Riwayat Audit

- **Putaran 1**: 6 menu Dinkes Command Center + Clinical Decision Copilot dicabut dari Kepala Puskesmas; Registry Wilayah Kerja dicabut dari Kepala Dinas, Analis Dinkes, dan Petugas Posyandu; Petugas Pustu diciutkan ke amplop akses Kader; Prediksi Putus Berobat dicabut dari Kader; Digital Twin Warga dicabut dari Petugas Farmasi.
- **Putaran 2**: Citizen Sahabat Warga dicabut dari PJ_CKG (tidak ada mandat eksplisit); cakupan Admin System diciutkan dari 69 menu (akses penuh) menjadi 25 menu (murni administrasi platform), sesuai deskripsi perannya sendiri.
- **Putaran 3**: Persetujuan (Consent) dicabut dari Analis Dinkes dan Auditor Eksternal. Ditemukan bahwa `consentService.ts` (`createConsent`/`revokeConsent`) tidak memiliki pengaman `permissionService.canManageX()` sama sekali — berbeda dari `regionService`/`facilityService`/`ruleVersionService` yang semuanya benar-benar menegakkan izin di service layer. Siapa pun yang memegang menu ini bisa langsung mencabut/menambah persetujuan warga tanpa hambatan, bertentangan langsung dengan deskripsi kedua peran ini sendiri ("tanpa hak mengubah konfigurasi master" untuk Analis, "tanpa hak akses data klinis personal langsung" untuk Auditor). Menghilangkan menu adalah satu-satunya garis pertahanan yang ada saat ini untuk kedua peran tersebut — perbaikan akar masalah (menambahkan guard di `consentService.ts`, mengikuti pola yang sudah ada di service lain) belum dilakukan karena di luar cakupan permintaan "hide menu".
- **Putaran 4** (deep analysis narasi/teks lintas peran): Disisir seluruh kemunculan kata "Bupati" (12 file) dan nama demo user yang mungkin ter-hardcode — sebagian besar sudah benar (memakai `isBupati`/`currentUser?.roleId` yang tepat, atau memang teks dokumen resmi dua-tanda-tangan). Ditemukan dan diperbaiki dua regresi nyata di `DashboardPage.tsx`, keduanya konsekuensi langsung dari Putaran 1–3:
  - Tombol pratinjau "Beralih ke Dashboard Eksekutif Kadinkes" pada akun Admin System **dihapus** — sebelumnya membuka kembali seluruh Dashboard Eksekutif Kepala Dinas (termasuk ekspor PDF/Excel "Laporan Eksekutif Bupati & Kadinkes"), membuat pembatasan Putaran 2 percuma.
  - ~29 kartu/tombol aksi cepat di dashboard umum (Beranda Puskesmas) sebelumnya mengarah ke nav id yang untuk banyak peran sudah tidak lagi mereka miliki (Registry, Stratifikasi, Wilayah, Command Center, dll.) — jadi tautan mati. Diperbaiki dengan helper `can(navId)` yang menonaktifkan afordansi klik (bukan menyembunyikan datanya) saat peran tidak berhak, panel "Aksi Cepat" (sebelumnya berlabel "Aksi Cepat Administrator" — judul keliru karena ditampilkan ke banyak peran non-admin) kini otomatis tersembunyi total jika tak satu pun aksinya relevan bagi peran yang login.
- **Putaran 6** (bangun fitur nyata untuk section "Roadmap Tahap Lanjut"): Riset paralel mengonfirmasi 2 dari 3 placeholder ("Alokasi Logistik Faskes", "Advanced AI Assistant") benar-benar belum ada kode apa pun, sedangkan "Outcome & Command Center" sudah sepenuhnya terpenuhi fitur nyata (`kohort-kondisi`, `tren-outcome`, suite `dinkes-command-center`) — bahkan Kepala Dinas & Analis Dinkes sudah punya akses ke versi nyata *dan* placeholder-nya sekaligus. Hasil: (1) `future-facility` dibangun jadi "Alokasi Logistik Faskes" — kapasitas lab, stok obat PTM per-faskes (baru: `FacilityLogisticsSnapshot`, `facilityLogisticsService.ts`), dan kecukupan tenaga, digranted ke `KEPALA_DINAS`, `KEPALA_PUSKESMAS`, `PJ_CKG`, `PHARMACY_OFFICER` selain `ADMIN_DINKES`; (2) `future-ai` dibangun jadi "Advanced AI Assistant — Tren PTM Wilayah" — proyeksi hipertensi/diabetes per kecamatan (baru: `RegionalPtmForecast`, `regionalPtmForecastService.ts`, memakai `KECAMATAN_PROFILES` yang sama dengan Command Center), ditambahkan ke `KEPALA_DINAS`; (3) `future-monitoring` dipensiunkan total — dicabut dari sidebar & 3 peran yang memilikinya, tidak ada kode baru. Section "ROADMAP TAHAP LANJUT" dan seluruh mesin `isFuture`/modal "coming soon" di `Sidebar.tsx` dihapus karena sudah tidak ada anggotanya.
- **Putaran 5** (verifikasi ulang mendalam atas permintaan eksplisit "apakah memang sudah sesuai?"): Ditemukan celah keamanan data nyata, bukan cuma masalah tampilan.
  - **`KADER` bisa bypass sandbox mobile-nya dan melihat data klinis S4 lintas-Puskesmas.** `KaderAppShell.tsx` punya tombol "Portal" (kembali ke tampilan desktop) yang keluar dari shell mobile sepenuhnya. Begitu di desktop, sidebar menampilkan menu persis sesuai `getAllowedNavIds('KADER')` — termasuk `prioritas-harian` (berlabel **Plafon S4** di badge-nya sendiri) dan `outreach`. Halaman `DailyPriorityQueuePage` yang dirender hanya memfilter berdasarkan `facilityId`, tanpa scoping per-kader atau redaksi field — bertentangan langsung dengan aturan yang tertulis eksplisit di `permissionService.ts`: *"HARD RULE: KADER CEILING IS S2. KADER CAN NEVER ACCESS S3 OR S4."* Diverifikasi langsung: setelah klik "Portal", "Prioritas Hari Ini" & "Hasil Kontak & Outreach" memang muncul dan bisa diklik. **Diperbaiki**: `prioritas-harian` dan `outreach` dicabut dari daftar izin Kader — dikonfirmasi `KaderAppShell.tsx` tidak pernah memakai kedua nav id ini secara internal (fitur setara di dalam shell mobile berdiri sendiri), jadi tidak ada fungsi sah yang hilang.
  - Dibersihkan sekalian: blok `case 'AUDITOR':` duplikat (dead code, tidak pernah tereksekusi karena JS switch hanya mencocokkan blok pertama) dihapus dari `getAllowedNavIds` — berpotensi menyesatkan siapa pun yang mengedit izin Auditor di masa depan.
  - **Temuan arsitektural lebih besar, belum ditindaklanjuti — perlu keputusan terpisah**: `DailyPriorityQueuePage.tsx` (dan kemungkinan besar halaman lain berbadge Plafon tinggi) sama sekali tidak melakukan redaksi field berdasarkan `hasSensitivityAccess()` milik peran yang login — satu-satunya penegakan Plafon S0-S4 di seluruh aplikasi adalah gerbang nav-id per-halaman (semua-atau-tidak-sama-sekali), dan gerbang itu sendiri tidak konsisten dengan Plafon yang tertulis di badge sidebar. `KEPALA_PUSKESMAS`, `PJ_CKG`, `NURSE_MIDWIFE`, `PUSTU` (Plafon S3) dan `POSYANDU` (Plafon S2) semuanya masih memiliki akses `prioritas-harian` yang berlabel Plafon S4 — tanpa aturan keras tertulis seperti milik Kader, jadi belum diperbaiki secara sepihak. Ini pertanyaan cakupan yang lebih besar (redesain halaman untuk redaksi field vs. terima gerbang nav-id sebagai satu-satunya penegakan) — menunggu arahan.

## Catatan Teknis

- **Duplikasi kasus `AUDITOR`**: `permissionService.ts` memiliki dua blok `case 'AUDITOR':` di dalam switch yang sama (baris ~223 dan ~309 pada versi saat dokumen ini dibuat). JavaScript hanya mengeksekusi blok pertama yang ditemui — blok kedua adalah kode mati (unreachable). Daftar di dokumen ini memakai perilaku nyata (blok pertama). Belum diperbaiki karena di luar cakupan permintaan "hide menu" — perlu konfirmasi terpisah sebelum disentuh.
- **Menu Roadmap (bekas)**: `future-facility` dan `future-ai` tidak lagi placeholder — dibangun menjadi halaman kerja nyata pada Putaran 6 (lihat Riwayat Audit). `future-monitoring` dipensiunkan sepenuhnya (dicabut dari sidebar & izin peran) karena janjinya sudah terpenuhi oleh `kohort-kondisi`, `tren-outcome`, dan seluruh suite `dinkes-command-center`.
- **Dasar dokumen**: seluruh daftar di atas ditarik langsung dari kode per 27 Agustus 2026 (`getAllowedNavIds` di `src/services/permissionService.ts`, label/kode di `src/components/layout/Sidebar.tsx`), bukan dari `Katalog-Fitur-per-Peran.pdf`. Jika `permissionService.ts` berubah lagi, dokumen ini perlu diperbarui manual — tidak generate otomatis.
