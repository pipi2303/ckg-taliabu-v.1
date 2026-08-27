import {
  CitizenHelpRequest,
  CitizenBarrierReport,
  CitizenOtpChallenge,
  CitizenResponseToken,
} from '../types';

const d = (year: number, month: number, day: number, hour = 9, min = 0) =>
  new Date(year, month - 1, day, hour, min, 0).toISOString();

export const INITIAL_OTP_CHALLENGES: CitizenOtpChallenge[] = [
  {
    id: 'OTP-DEMO-01',
    phone: '081248991001', // Hamid La Ode
    code: '123456',
    createdAt: d(2026, 8, 23, 20, 0),
    expiresAt: d(2026, 8, 24, 20, 0),
    attemptCount: 0,
    status: 'PENDING',
  },
  {
    id: 'OTP-DEMO-02',
    phone: '082199882341', // Nuraini binti Hasan
    code: '123456',
    createdAt: d(2026, 8, 23, 20, 0),
    expiresAt: d(2026, 8, 24, 20, 0),
    attemptCount: 0,
    status: 'PENDING',
  },
  {
    id: 'OTP-DEMO-03',
    phone: '081244332211', // Yohanis Karepesina
    code: '123456',
    createdAt: d(2026, 8, 23, 20, 0),
    expiresAt: d(2026, 8, 24, 20, 0),
    attemptCount: 0,
    status: 'PENDING',
  },
];

export const INITIAL_HELP_REQUESTS: CitizenHelpRequest[] = [
  {
    id: 'HELP-2026-001',
    citizenId: 'CIT-8208-0005',
    citizenName: 'Yohanis Karepesina',
    citizenPhone: '081244332211',
    facilityId: 'FASKES-PKM-01',
    facilityName: 'Puskesmas Bobong',
    preferredChannel: 'PHONE',
    category: 'TRANSPORT',
    citizenMessage: 'Perahu motor dari Jorjoga ke Bobong sedang rusak minggu ini. Mohon info jadwal dokter minggu depan.',
    urgencyScreened: false,
    createdAt: d(2026, 8, 22, 10, 15),
    status: 'OPEN',
  },
  {
    id: 'HELP-2026-002',
    citizenId: 'CIT-8208-0002',
    citizenName: 'Nuraini binti Hasan',
    citizenPhone: '082199882341',
    facilityId: 'FASKES-PKM-01',
    facilityName: 'Puskesmas Bobong',
    preferredChannel: 'KADER',
    category: 'GENERAL_FOLLOW_UP',
    citizenMessage: 'Minta tolong kader berkunjung ke rumah untuk jelaskan hasil lab gula darah.',
    urgencyScreened: false,
    createdAt: d(2026, 8, 21, 14, 30),
    status: 'ACKNOWLEDGED',
    resolvedByUserName: 'dr. Siti Fatimah (Puskesmas Bobong)',
    resolutionNotes: 'Kader Aminah ditugaskan untuk kunjungan rumah tanggal 24 Agustus.',
  },
];

export const INITIAL_BARRIER_REPORTS: CitizenBarrierReport[] = [
  {
    id: 'BAR-2026-001',
    citizenId: 'CIT-8208-0005',
    citizenName: 'Yohanis Karepesina',
    facilityId: 'FASKES-PKM-01',
    facilityName: 'Puskesmas Bobong',
    taskId: 'TASK-2026-0005',
    barriers: ['DISTANCE_TRANSPORT', 'WORK_SCHEDULE'],
    notes: 'Terkendala jadwal kapal laut perintis dan musim ombak selatan.',
    reportedAt: d(2026, 8, 22, 10, 10),
    status: 'RECEIVED_BY_PUSKESMAS',
  },
];

export const INITIAL_RESPONSE_TOKENS: CitizenResponseToken[] = [
  {
    id: 'TKN-RESP-001',
    citizenId: 'CIT-8208-0001',
    taskId: 'TASK-2026-0001',
    appointmentId: 'APT-2026-0001',
    purpose: 'CONFIRM_ATTENDANCE',
    expiresAt: d(2026, 9, 1, 23, 59),
  },
  {
    id: 'TKN-RESP-002',
    citizenId: 'CIT-8208-0002',
    taskId: 'TASK-2026-0002',
    appointmentId: 'APT-2026-0002',
    purpose: 'RESCHEDULE',
    expiresAt: d(2026, 9, 1, 23, 59),
  },
];

export interface TaliabuFacilityDetail {
  id: string;
  name: string;
  type: string;
  address: string;
  phone: string;
  serviceDays: string;
  serviceHours: string;
  whatToBring: string[];
  transportNotes: string;
  boatScheduleNote?: string;
  pustuPoskesdesCoverage?: string[];
}

export const TALIABU_FACILITY_DETAILS: Record<string, TaliabuFacilityDetail> = {
  'FASKES-PKM-01': {
    id: 'FASKES-PKM-01',
    name: 'Puskesmas Bobong',
    type: 'Puskesmas Rawat Inap & FKTP',
    address: 'Jl. Merdeka No. 12, Ibu Kota Kabupaten Pulau Taliabu',
    phone: '0812-4001-8899 (Layanan Pasien CKG)',
    serviceDays: 'Senin s/d Sabtu',
    serviceHours: '08:00 - 14:00 WIT (UGD 24 Jam)',
    whatToBring: [
      'KTP / Kartu Keluarga (identitas)',
      'Kartu BPJS Kesehatan / KIS (jika ada)',
      'Buku CKG / Buku Kesehatan (jika ada)',
      'Obat yang sedang diminum saat ini (jika ada)',
    ],
    transportNotes:
      'Dapat diakses melalui jalur darat jalan poros Bobong. Bagi warga pulau seberang (Desa Jorjoga/Talo), tersedia perahu motor nelayan reguler di Pelabuhan Bobong pukul 07:00 dan 13:00 WIT.',
    boatScheduleNote:
      'Kapal perintis laut Bobong - Jorjoga beroperasi setiap Selasa, Kamis, dan Sabtu.',
    pustuPoskesdesCoverage: ['Pustu Talo', 'Poskesdes Wayo', 'Posyandu Mawar Bobong'],
  },
  'FASKES-PKM-02': {
    id: 'FASKES-PKM-02',
    name: 'Puskesmas Lede',
    type: 'Puskesmas Non-Rawat Inap',
    address: 'Jl. Poros Lede - Todoli, Kecamatan Lede',
    phone: '0813-5522-3344',
    serviceDays: 'Senin s/d Jumat',
    serviceHours: '08:30 - 13:30 WIT',
    whatToBring: ['KTP / NIK', 'Kartu BPJS Kesehatan', 'Obat rutin'],
    transportNotes:
      'Jalur darat sepeda motor/mobil perintis. Musim hujan jalan tanah licin, disarankan datang pagi hari.',
    boatScheduleNote: 'Akses laut via speedboat Teluk Lede.',
    pustuPoskesdesCoverage: ['Pustu Todoli', 'Posyandu Melati Lede'],
  },
  'FASKES-RSUD-01': {
    id: 'FASKES-RSUD-01',
    name: 'RSUD Bobong Pulau Taliabu',
    type: 'Rumah Sakit Rujukan FKRTL',
    address: 'Jl. Trans Taliabu, Bobong',
    phone: '0811-9988-7766 (Pusat Rujukan Terpadu)',
    serviceDays: 'Senin s/d Sabtu (Poli Spesialis)',
    serviceHours: '08:00 - 15:00 WIT (IGD & Ambulans Laut 24 Jam)',
    whatToBring: [
      'Surat Rujukan dari Puskesmas (dengan QR code)',
      'KTP Asli',
      'Kartu BPJS Kesehatan / KIS aktif',
      'Hasil Rekam Medis / Hasil Lab Terakhir dari Puskesmas',
    ],
    transportNotes:
      'Tersedia layanan Ambulans Laut PSC 119 Kabupaten Pulau Taliabu untuk rujukan darurat antar pulau.',
    boatScheduleNote: 'Dermaga RSUD Bobong siap melayani sandar kapal 24 jam.',
  },
};
