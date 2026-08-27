import {
  CareTask,
  Appointment,
  Citizen,
  Observation,
  CitizenActionViewModel,
  CitizenAppointmentViewModel,
  CitizenHealthValueDTO,
  CitizenCompanionProfileDTO,
} from '../types';
import { CITIZEN_STATUS_COPY, SAFETY_MESSAGES } from './citizenCopyDictionary';

/**
 * Service to sanitize and translate internal domain models into citizen-safe ViewModels.
 * Hard security boundary: Excludes risk scores, severity formulas, and staff annotations.
 */
export const citizenStatusTranslationService = {
  /**
   * Translates a CareTask to a CitizenActionViewModel
   */
  translateCareTaskToAction(task: CareTask, appointment?: Appointment): CitizenActionViewModel {
    const isOverdue = new Date(task.dueAt).getTime() < Date.now() && task.status !== 'CLOSED';

    let primaryAction: CitizenActionViewModel['primaryAction'] = 'SCHEDULE';
    let title = 'Pemeriksaan Lanjutan di Puskesmas';
    let description = 'Periksa ulang di fasilitas kesehatan untuk memastikan kondisi kesehatan Anda.';

    if (appointment && (appointment.status === 'CONFIRMED' || appointment.status === 'PENDING')) {
      primaryAction = 'VIEW_APPOINTMENT';
      title = 'Kunjungan Telah Dijadwalkan';
      description = `Jadwal Anda pada ${appointment.scheduledDate} (${appointment.scheduledTime || 'Pagi'}) di ${task.facilityName || 'Puskesmas'}.`;
    } else if (task.status === 'IN_PROGRESS' || task.status === 'ASSIGNED') {
      primaryAction = 'CONFIRM';
      title = 'Pilih & Konfirmasi Jadwal';
      description = 'Silakan tentukan hari yang paling sesuai bagi Anda untuk berkunjung.';
    } else if (isOverdue) {
      primaryAction = 'RESCHEDULE';
      title = 'Jadwalkan Kunjungan Baru';
      description = 'Kunjungan ini belum sempat dilakukan. Silakan tentukan jadwal baru yang lebih nyaman.';
    }

    const dueFormatted = new Date(task.dueAt).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const preparationItems: string[] = ['Membawa KTP / identitas diri'];
    if (task.actionText?.toLowerCase().includes('puasa') || task.completionCriteria?.toLowerCase().includes('puasa')) {
      preparationItems.push('Puasa 8-10 jam sebelum pemeriksaan (hanya boleh minum air putih)');
    }
    if (task.actionText?.toLowerCase().includes('lab') || task.actionText?.toLowerCase().includes('gula')) {
      preparationItems.push('Membawa obat yang sedang rutin dikonsumsi (jika ada)');
    }

    return {
      taskId: task.id,
      title,
      description,
      dueText: isOverdue ? `Batas waktu sebelumnya: ${dueFormatted}` : `Disarankan sebelum: ${dueFormatted}`,
      dueAt: task.dueAt,
      facilityName: task.facilityName || 'Puskesmas Bobong',
      locationText: task.villageName ? `Wilayah Desa ${task.villageName}` : undefined,
      preparationItems,
      primaryAction,
    };
  },

  /**
   * Translates an internal Appointment to a CitizenAppointmentViewModel
   */
  translateAppointment(appointment: Appointment, task?: CareTask): CitizenAppointmentViewModel {
    const prepNotes: string[] = ['Bawa KTP / kartu identitas'];
    if (task?.actionText?.toLowerCase().includes('puasa') || task?.completionCriteria?.toLowerCase().includes('puasa')) {
      prepNotes.push('Disarankan puasa 8-10 jam (boleh minum air putih)');
    }
    prepNotes.push('Datang 15 menit sebelum jam pelayanan dimulai');

    return {
      id: appointment.id,
      taskId: appointment.taskId,
      facilityId: appointment.facilityId,
      facilityName: appointment.facilityName || 'Puskesmas Bobong',
      scheduledDate: appointment.scheduledDate,
      scheduledTimeSlot: appointment.scheduledTime || '08:30 - 10:00 WIT',
      serviceName: appointment.serviceType || 'Pemeriksaan Tindak Lanjut CKG',
      status:
        appointment.status === 'CONFIRMED'
          ? 'CONFIRMED'
          : appointment.status === 'CANCELLED'
          ? 'CANCELLED'
          : appointment.status === 'ATTENDED'
          ? 'ATTENDED'
          : 'CONFIRMED',
      preparationNotes: prepNotes,
      transportNote:
        'Tersedia parkir kendaraan dan akses mudah bagi pejalan kaki atau ojek dari dermaga/pelabuhan.',
      facilityPhone: '0812-4001-8899',
      facilityAddress: 'Jl. Merdeka No. 12, Bobong, Pulau Taliabu',
    };
  },

  /**
   * Translates observations to citizen-safe health value DTOs
   */
  translateObservations(observations: Observation[]): CitizenHealthValueDTO[] {
    const labelMap: Record<string, string> = {
      SYSTOLIC_BP: 'Tekanan Darah (Sistolik)',
      DIASTOLIC_BP: 'Tekanan Darah (Diastolik)',
      BLOOD_PRESSURE: 'Tekanan Darah',
      FASTING_GLUCOSE: 'Gula Darah Puasa (GDP)',
      RANDOM_GLUCOSE: 'Gula Darah Sewaktu (GDS)',
      TOTAL_CHOLESTEROL: 'Kolesterol Total',
      TRIGLYCERIDES: 'Trigliserida',
      BMI: 'Indeks Massa Tubuh (IMT)',
      WAIST_CIRCUMFERENCE: 'Lingkar Perut',
      URINE_PROTEIN: 'Pemeriksaan Protein Urine',
    };

    return observations.map((obs) => {
      const label = labelMap[obs.measureCode] || obs.measureCode;
      const isConfirmed = obs.isConfirmatory || obs.sourceType === 'CLINICAL';

      let displayValue: string | number = obs.valueNumeric ?? obs.valueCode ?? '-';
      if (obs.measureCode === 'SYSTOLIC_BP' || obs.measureCode === 'DIASTOLIC_BP') {
        displayValue = `${displayValue} ${obs.unit || 'mmHg'}`;
      } else if (obs.unit) {
        displayValue = `${displayValue} ${obs.unit}`;
      }

      const sourceLabel =
        obs.sourceType === 'CLINICAL'
          ? 'Pemeriksaan Dokter Faskes'
          : obs.sourceType === 'KADER_FIELD'
          ? 'Pemeriksaan Kader Lapangan'
          : 'Pemeriksaan Skrining CKG Awal';

      return {
        label,
        value: displayValue,
        unit: obs.unit,
        measuredAt: obs.measuredAt,
        sourceLabel,
        confirmationState: isConfirmed ? 'CONFIRMED' : 'UNCONFIRMED',
        note: !isConfirmed ? SAFETY_MESSAGES.UNCONFIRMED_VALUE : undefined,
      };
    });
  },

  /**
   * Assembles a complete CitizenCompanionProfileDTO
   */
  buildProfileDTO(
    citizen: Citizen,
    activeTasks: CareTask[],
    appointments: Appointment[],
    hasConsent: boolean,
    consentVersion?: string,
    consentGrantedAt?: string,
    optOutMessaging = false
  ): CitizenCompanionProfileDTO {
    // Determine the single next primary action
    const dominantTask = activeTasks.length > 0 ? activeTasks[0] : undefined;
    const secondaryTasks = activeTasks.slice(1);

    const activeAppointment = appointments.find(
      (a) => a.status === 'CONFIRMED' || a.status === 'PENDING'
    );

    let nextAction: CitizenActionViewModel | undefined;
    if (dominantTask) {
      nextAction = this.translateCareTaskToAction(dominantTask, activeAppointment);
    }

    const secondaryActions = secondaryTasks.map((t) => this.translateCareTaskToAction(t));

    // Status Timeline Step & Text calculation
    let statusTimelineStep = 1;
    let followUpStatusText = CITIZEN_STATUS_COPY.NO_ACTIVE_TASK;

    if (!dominantTask && activeTasks.length === 0) {
      statusTimelineStep = 5;
      followUpStatusText = CITIZEN_STATUS_COPY.NO_ACTIVE_TASK;
    } else if (activeAppointment && activeAppointment.status === 'CONFIRMED') {
      statusTimelineStep = 3;
      followUpStatusText = CITIZEN_STATUS_COPY.SCHEDULED;
    } else if (dominantTask?.status === 'OPEN' || dominantTask?.status === 'ASSIGNED') {
      statusTimelineStep = 2;
      followUpStatusText = CITIZEN_STATUS_COPY.AWAITING_CONFIRMATION;
    } else if (dominantTask?.status === 'CLOSED') {
      statusTimelineStep = 4;
      followUpStatusText = CITIZEN_STATUS_COPY.ATTENDED;
    }

    // Mask NIK safely if available
    const nikMasked = '8208************';

    return {
      citizenId: citizen.id,
      displayName: citizen.fullName,
      phone: citizen.phonePrimary || '-',
      nikMasked,
      facilityId: citizen.facilityId,
      facilityName: citizen.facilityName || 'Puskesmas Bobong',
      villageName: citizen.villageName || 'Desa Bobong',
      followUpStatusText,
      statusTimelineStep,
      nextAction,
      secondaryActions: secondaryActions.length > 0 ? secondaryActions : undefined,
      appointment: activeAppointment ? this.translateAppointment(activeAppointment, dominantTask) : undefined,
      lastUpdatedAt: new Date().toISOString(),
      availableDetailSections: ['RESULTS', 'FACILITY_INFO', 'SCHEDULE', 'HELP'],
      optOutMessaging,
      hasConsent,
      consentVersion,
      consentGrantedAt,
    };
  },
};
