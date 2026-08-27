import {
  ControlEvaluationMode,
  ControlStatus,
  Observation,
  OutcomeEvaluation,
} from '../types';

export interface EvaluationInput {
  currentObservation?: {
    id?: string;
    label: string;
    valueSummary: string;
    systolic?: number;
    diastolic?: number;
    glucose?: number;
    measuredAt: string;
  };
  comparatorObservation?: {
    id?: string;
    label: string;
    valueSummary: string;
    systolic?: number;
    diastolic?: number;
    glucose?: number;
    measuredAt: string;
  };
  condition: string;
  ruleVersion?: string;
}

export interface EvaluationResult {
  controlStatus: ControlStatus;
  evaluationMode: ControlEvaluationMode;
  governanceNotice: string;
  abnormalImprovementFlag: boolean;
  canDetermineManually: boolean;
  requiresComparator: boolean;
  explanation: string;
}

class ControlStatusEngine {
  private currentMode: ControlEvaluationMode = 'BLOCKED_OI_08';

  getEvaluationMode(): ControlEvaluationMode {
    return this.currentMode;
  }

  setEvaluationMode(mode: ControlEvaluationMode) {
    this.currentMode = mode;
  }

  /**
   * Evaluates control status deterministically according to active governance locks.
   * Under OI-08, system-automated determination of CONTROLLED or NOT_CONTROLLED is strictly locked.
   */
  evaluate(input: EvaluationInput): EvaluationResult {
    // 1. Check for abnormal improvement anomaly flag (clinical data quality review)
    let abnormalImprovementFlag = false;
    if (
      input.currentObservation?.systolic &&
      input.comparatorObservation?.systolic &&
      input.comparatorObservation.systolic - input.currentObservation.systolic > 60
    ) {
      abnormalImprovementFlag = true;
    }

    // 2. Hard Governance Lock: OI-08 Active
    if (this.currentMode === 'BLOCKED_OI_08') {
      return {
        controlStatus: 'NOT_YET_ASSESSABLE',
        evaluationMode: 'BLOCKED_OI_08',
        governanceNotice:
          'OI-08: Kriteria numerik batas kontrol (CR-OC) belum disetujui dalam rule package aktif. Sistem dilarang menetapkan status terkendali/belum terkendali secara otomatis berdasarkan pedoman eksternal.',
        abnormalImprovementFlag,
        canDetermineManually: true,
        requiresComparator: true,
        explanation:
          'Kriteria terkendali masih menunggu aturan klinis resmi yang telah diverifikasi (OI-08). Tenaga medis penanggung jawab dapat melakukan penetapan klinis manual bila memenuhi bukti komparator.',
      };
    }

    // 3. Future Approved CR-OC Engine Path (Placeholder for future rule release)
    if (!input.currentObservation) {
      return {
        controlStatus: 'NOT_YET_ASSESSABLE',
        evaluationMode: 'APPROVED_CR_OC',
        governanceNotice: 'Pengukuran terkonfirmasi belum tersedia pada siklus ini.',
        abnormalImprovementFlag: false,
        canDetermineManually: true,
        requiresComparator: true,
        explanation: 'Belum ada data pengukuran untuk dievaluasi.',
      };
    }

    if (!input.comparatorObservation?.id) {
      return {
        controlStatus: 'NOT_YET_ASSESSABLE',
        evaluationMode: 'APPROVED_CR_OC',
        governanceNotice: 'Komparator observasi baseline awal belum terhubung.',
        abnormalImprovementFlag: false,
        canDetermineManually: true,
        requiresComparator: true,
        explanation: 'Evaluasi status terkendali mewajibkan adanya komparator observasi sebelumnya.',
      };
    }

    // Future approved calculation logic will be placed here once CR-OC is officially ratified
    return {
      controlStatus: 'NOT_YET_ASSESSABLE',
      evaluationMode: 'APPROVED_CR_OC',
      governanceNotice: 'Rule CR-OC aktif.',
      abnormalImprovementFlag,
      canDetermineManually: true,
      requiresComparator: true,
      explanation: 'Evaluasi otomatis memerlukan verifikasi akhir tenaga medis.',
    };
  }

  /**
   * Validates manual doctor determination.
   * Invariant: CONTROLLED strictly requires a valid comparator observation.
   */
  validateManualDetermination(params: {
    status: ControlStatus;
    hasComparator: boolean;
    reason?: string;
    role?: string;
  }): { valid: boolean; error?: string } {
    if (params.role && params.role !== 'DOCTOR' && params.role !== 'KEPALA_PUSKESMAS') {
      return {
        valid: false,
        error: 'Penetapan manual status hasil kontrol hanya dapat dilakukan oleh Dokter Penanggung Jawab.',
      };
    }

    if (!params.reason || params.reason.trim().length < 10) {
      return {
        valid: false,
        error: 'Alasan pertimbangan klinis manual wajib diisi secara komprehensif (minimal 10 karakter).',
      };
    }

    if (params.status === 'CONTROLLED' && !params.hasComparator) {
      return {
        valid: false,
        error: 'Penetapan status TERKENDALI mewajibkan adanya bukti komparator observasi sebelumnya (Baseline/Siklus Lalu).',
      };
    }

    return { valid: true };
  }
}

export const controlStatusEngine = new ControlStatusEngine();
