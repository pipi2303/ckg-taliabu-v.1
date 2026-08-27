/**
 * Centralized Citizen Copy Dictionary (UX-OI-01 & UX-OI-03)
 * Isolates all citizen-facing wording to allow field validation & localization updates.
 *
 * HARD RULE:
 * Never contain internal risk colors (Green/Yellow/Orange/Red), CRS codes, or disease diagnostic conclusions.
 */

import { SharedBarrierReason } from '../types';

export const CITIZEN_STATUS_COPY: Record<string, string> = {
  AWAITING_CONFIRMATION: 'Hasilnya perlu dipastikan dulu melalui pemeriksaan di fasilitas kesehatan.',
  SCHEDULED: 'Kunjungan Anda sudah dijadwalkan.',
  ATTENDED: 'Anda sudah datang untuk pemeriksaan lanjutan.',
  ON_TREATMENT: 'Anda sedang menjalani tindak lanjut dari tenaga kesehatan.',
  REFERRAL_ISSUED: 'Rujukan ke rumah sakit telah disiapkan untuk Anda.',
  REFERRAL_MISSED: 'Kunjungan rujukan Anda perlu dijadwalkan kembali.',
  OVERDUE: 'Kunjungan ini belum sempat dilakukan. Silakan pilih jadwal baru.',
  NO_ACTIVE_TASK: 'Saat ini tidak ada tindakan tindak lanjut yang aktif di platform.',
  DATA_PENDING: 'Data pemeriksaan CKG Anda sedang disiapkan oleh fasilitas kesehatan.',
  CLOSED_CONTROLLED: 'Pemeriksaan tindak lanjut telah selesai dengan hasil terkendali.',
};

export const CITIZEN_ACTION_TITLES: Record<string, string> = {
  SCHEDULE_FOLLOW_UP: 'Pilih Jadwal Pemeriksaan Lanjutan',
  CONFIRM_ATTENDANCE: 'Konfirmasi Kehadiran Kunjungan',
  RESCHEDULE_FOLLOW_UP: 'Pilih Jadwal Pengganti',
  VISIT_FACILITY: 'Kunjungi Fasilitas Kesehatan',
  WAIT_CONFIRMATION: 'Menunggu Hasil Pemeriksaan',
  HOSPITAL_REFERRAL: 'Kunjungan Rujukan Rumah Sakit',
};

export const BARRIER_REASON_LABELS: Record<SharedBarrierReason, { label: string; desc: string }> = {
  DISTANCE_TRANSPORT: {
    label: 'Jarak & Transportasi',
    desc: 'Sulit transportasi darat/perahu laut atau lokasi faskes jauh dari tempat tinggal.',
  },
  SERVICE_COST: {
    label: 'Biaya Perjalanan / Operasional',
    desc: 'Kendala biaya ongkos transportasi, makan, atau keperluan selama perjalanan.',
  },
  NO_COMPANION: {
    label: 'Tidak Ada Pendamping',
    desc: 'Memerlukan keluarga atau tetangga untuk menemani saat bepergian ke faskes.',
  },
  WORK_SCHEDULE: {
    label: 'Jadwal Kerja / Urusan Keluarga',
    desc: 'Sedang ada pekerjaan di kebun, melaut, atau urusan penting yang tidak bisa ditinggal.',
  },
  FEELS_HEALTHY: {
    label: 'Merasa Sudah Cukup Sehat',
    desc: 'Tidak merasakan keluhan fisik yang mengganggu saat ini.',
  },
  FEAR_SHAME: {
    label: 'Khawatir / Ragu untuk Memeriksakan Diri',
    desc: 'Merasa cemas akan hasil pemeriksaan atau prosedur di faskes.',
  },
  UNAWARE: {
    label: 'Belum Mengetahui Jadwal / Prosedur',
    desc: 'Belum mendapat informasi lengkap mengenai waktu dan tempat pemeriksaan lanjutan.',
  },
  OTHER: {
    label: 'Kendala Lainnya',
    desc: 'Alasan lain yang belum tercantum di atas.',
  },
};

export const HELP_CATEGORY_LABELS: Record<string, string> = {
  SCHEDULING: 'Jadwal & Waktu Kunjungan',
  TRANSPORT: 'Transportasi & Akses Perjalanan',
  ACCESS: 'Lokasi & Pelayanan Faskes',
  GENERAL_FOLLOW_UP: 'Pertanyaan Umum Seputar Tindak Lanjut',
  OTHER: 'Bantuan Lainnya',
};

export const PREFERRED_CHANNEL_LABELS: Record<string, string> = {
  PHONE: 'Telepon saya langsung',
  MESSAGE: 'Hubungi melalui pesan WhatsApp / SMS',
  KADER: 'Minta bantuan kader Posyandu berkunjung ke rumah',
};

export const SAFETY_MESSAGES = {
  EMERGENCY_HEADER: 'Pemberitahuan Keselamatan Penting',
  EMERGENCY_BODY:
    'Layanan Bantuan ini bukan layanan gawat darurat atau konsultasi medis langsung. Jika Anda merasakan nyeri dada hebat, sesak napas berat, kelemahan separuh badan mendadak, atau penurunan kesadaran, SEGERA datangi UGD Puskesmas atau RSUD terdekat.',
  UNCONFIRMED_VALUE:
    'Hasil pemeriksaan ini masih memerlukan pemeriksaan konfirmasi oleh dokter di fasilitas kesehatan sebelum dapat disimpulkan.',
  NON_BLAMING_OVERDUE:
    'Kunjungan ini belum sempat dilakukan. Kami siap membantu Anda menjadwalkan ulang sesuai waktu yang nyaman.',
  CONSENT_NO_DARK_PATTERN:
    'Anda tetap dapat memperoleh pelayanan kesehatan secara penuh di Puskesmas meskipun tidak memberikan persetujuan untuk pendampingan melalui aplikasi ini.',
};
