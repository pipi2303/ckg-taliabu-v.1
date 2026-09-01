import {
  Citizen,
  ClinicalDomainCode,
  ClinicalOpenIssue,
  ClinicalRiskCategory,
  ClinicalRuleDefinition,
  ClinicalRulePackage,
  DomainEvaluationResult,
  DomainEvaluationStatus,
  JuknisCategory,
  NextBestAction,
  Observation,
  PriorityWeightVersion,
  RiskClassification,
  RiskCluster,
  ScreeningResult,
  ScreeningSession,
  TriggeredRule,
  UndeterminedDomain,
} from '../../../types';
import { CRS_CKG_V0_9 } from '../rules/crsPackageV0_9';
import { DEFAULT_PRIORITY_WEIGHTS, priorityEngine } from './priorityEngine';

/**
 * Calculates age at screening date (NOT current date today!)
 */
export function ageAt(birthDateStr: string, screeningDateStr: string): number {
  const birth = new Date(birthDateStr);
  const screening = new Date(screeningDateStr);
  let age = screening.getFullYear() - birth.getFullYear();
  const m = screening.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && screening.getDate() < birth.getDate())) {
    age--;
  }
  return Math.max(0, age);
}

const CATEGORY_SEVERITY_ORDER: Record<ClinicalRiskCategory, number> = {
  UNDETERMINED: 0,
  GREEN: 1,
  YELLOW: 2,
  ORANGE: 3,
  RED: 4,
  DARK_RED: 5,
};

export const clinicalRuleEngine = {
  /**
   * Evaluates BP Domain (Blood Pressure)
   */
  evaluateBPDomain(
    observations: Observation[],
    screeningResults: ScreeningResult[],
    citizen: Citizen,
    screeningDate: string,
    rulePackage: ClinicalRulePackage
  ): { result: DomainEvaluationResult; triggeredRule?: TriggeredRule } {
    // Extract Systolic and Diastolic
    let systolic: number | undefined;
    let diastolic: number | undefined;
    let isConfirmatory = false;

    // Check observations first (clinical grade)
    const obsSys = observations.find((o) => o.measureCode === 'BP_SYS' || o.measureCode === 'SYSTOLIC');
    const obsDia = observations.find((o) => o.measureCode === 'BP_DIA' || o.measureCode === 'DIASTOLIC');

    if (obsSys?.valueNumeric !== undefined && obsDia?.valueNumeric !== undefined) {
      systolic = obsSys.valueNumeric;
      diastolic = obsDia.valueNumeric;
      isConfirmatory = obsSys.isConfirmatory || false;
    } else {
      // Fallback to screening results
      const resSys = screeningResults.find((r) => r.measureCode === 'BP_SYS' || r.measureCode === 'SYSTOLIC');
      const resDia = screeningResults.find((r) => r.measureCode === 'BP_DIA' || r.measureCode === 'DIASTOLIC');
      if (resSys?.valueNumeric !== undefined && resDia?.valueNumeric !== undefined) {
        systolic = resSys.valueNumeric;
        diastolic = resDia.valueNumeric;
      }
    }

    if (systolic === undefined || diastolic === undefined) {
      return {
        result: {
          domain: 'BP',
          domainName: 'Tekanan Darah',
          status: 'NOT_EVALUATED_MISSING_DATA',
          ruleVersion: rulePackage.version,
          inputValues: {},
          reason: 'Data pengukuran tekanan darah (sistolik/diastolik) belum tersedia.',
        },
      };
    }

    const inputValues = { systolic, diastolic, isConfirmatory };

    // 1. Check Critical First: Systolic >= 180 OR Diastolic >= 120
    if (systolic >= 180 || diastolic >= 120) {
      return {
        result: {
          domain: 'BP',
          domainName: 'Tekanan Darah',
          status: 'EVALUATED',
          category: 'DARK_RED',
          ruleCode: 'CR-BP-CRIT-01',
          ruleVersion: rulePackage.version,
          inputValues,
          requiresConfirmation: false,
          reason: `Tekanan darah krisis: ${systolic}/${diastolic} mmHg (Sistolik >= 180 atau Diastolik >= 120).`,
        },
        triggeredRule: {
          id: `TR-BP-${Date.now()}`,
          classificationId: '',
          citizenId: citizen.id,
          ruleCode: 'CR-BP-CRIT-01',
          domain: 'BP',
          inputValues,
          resultingCategory: 'DARK_RED',
          ruleVersion: rulePackage.version,
          isCritical: true,
          createdAt: new Date().toISOString(),
        },
      };
    }

    // 2. Check Stage 2 Hypertension: Systolic >= 160 OR Diastolic >= 100
    if (systolic >= 160 || diastolic >= 100) {
      const status: DomainEvaluationStatus = isConfirmatory ? 'EVALUATED' : 'AWAITING_CONFIRMATION';
      return {
        result: {
          domain: 'BP',
          domainName: 'Tekanan Darah',
          status,
          category: 'DARK_RED',
          ruleCode: 'CR-BP-04',
          ruleVersion: rulePackage.version,
          inputValues,
          requiresConfirmation: !isConfirmatory,
          reason: isConfirmatory
            ? `Hipertensi Derajat 2 terkonfirmasi (${systolic}/${diastolic} mmHg).`
            : `Nilai awal tekanan darah ${systolic}/${diastolic} mmHg menunjukkan Hipertensi Derajat 2 dan membutuhkan pengukuran konfirmasi ulang.`,
        },
        triggeredRule: {
          id: `TR-BP-${Date.now()}`,
          classificationId: '',
          citizenId: citizen.id,
          ruleCode: 'CR-BP-04',
          domain: 'BP',
          inputValues,
          resultingCategory: 'DARK_RED',
          ruleVersion: rulePackage.version,
          createdAt: new Date().toISOString(),
        },
      };
    }

    // 3. Check Stage 1 Hypertension: Systolic 140-159 OR Diastolic 90-99 (Test A: e.g. 135/92 -> RED because Diastolic 92 is RED)
    if ((systolic >= 140 && systolic < 160) || (diastolic >= 90 && diastolic < 100)) {
      const status: DomainEvaluationStatus = isConfirmatory ? 'EVALUATED' : 'AWAITING_CONFIRMATION';
      return {
        result: {
          domain: 'BP',
          domainName: 'Tekanan Darah',
          status,
          category: 'RED',
          ruleCode: 'CR-BP-03',
          ruleVersion: rulePackage.version,
          inputValues,
          requiresConfirmation: !isConfirmatory,
          reason: isConfirmatory
            ? `Hipertensi Derajat 1 terkonfirmasi (${systolic}/${diastolic} mmHg).`
            : `Nilai awal tekanan darah ${systolic}/${diastolic} mmHg menunjukkan Hipertensi Derajat 1 dan membutuhkan pengukuran konfirmasi ulang.`,
        },
        triggeredRule: {
          id: `TR-BP-${Date.now()}`,
          classificationId: '',
          citizenId: citizen.id,
          ruleCode: 'CR-BP-03',
          domain: 'BP',
          inputValues,
          resultingCategory: 'RED',
          ruleVersion: rulePackage.version,
          createdAt: new Date().toISOString(),
        },
      };
    }

    // 4. Check Pre-Hypertension: Systolic 120-139 OR Diastolic 80-89
    if ((systolic >= 120 && systolic < 140) || (diastolic >= 80 && diastolic < 90)) {
      return {
        result: {
          domain: 'BP',
          domainName: 'Tekanan Darah',
          status: 'EVALUATED',
          category: 'YELLOW',
          ruleCode: 'CR-BP-02',
          ruleVersion: rulePackage.version,
          inputValues,
          requiresConfirmation: false,
          reason: `Pre-hipertensi: ${systolic}/${diastolic} mmHg.`,
        },
        triggeredRule: {
          id: `TR-BP-${Date.now()}`,
          classificationId: '',
          citizenId: citizen.id,
          ruleCode: 'CR-BP-02',
          domain: 'BP',
          inputValues,
          resultingCategory: 'YELLOW',
          ruleVersion: rulePackage.version,
          createdAt: new Date().toISOString(),
        },
      };
    }

    // 5. Normal: Systolic < 120 AND Diastolic < 80
    return {
      result: {
        domain: 'BP',
        domainName: 'Tekanan Darah',
        status: 'EVALUATED',
        category: 'GREEN',
        ruleCode: 'CR-BP-01',
        ruleVersion: rulePackage.version,
        inputValues,
        requiresConfirmation: false,
        reason: `Tekanan darah optimal: ${systolic}/${diastolic} mmHg.`,
      },
      triggeredRule: {
        id: `TR-BP-${Date.now()}`,
        classificationId: '',
        citizenId: citizen.id,
        ruleCode: 'CR-BP-01',
        domain: 'BP',
        inputValues,
        resultingCategory: 'GREEN',
        ruleVersion: rulePackage.version,
        createdAt: new Date().toISOString(),
      },
    };
  },

  /**
   * Evaluates GD Domain (Blood Glucose)
   */
  evaluateGDDomain(
    observations: Observation[],
    screeningResults: ScreeningResult[],
    citizen: Citizen,
    screeningDate: string,
    rulePackage: ClinicalRulePackage
  ): { result: DomainEvaluationResult; triggeredRule?: TriggeredRule } {
    let gds: number | undefined;
    let gdp: number | undefined;
    let isConfirmatory = false;

    const obsGds = observations.find((o) => o.measureCode === 'BLOOD_SUGAR' || o.measureCode === 'GLUCOSE_RANDOM');
    const obsGdp = observations.find((o) => o.measureCode === 'GLUCOSE_FASTING');

    if (obsGds?.valueNumeric !== undefined) {
      gds = obsGds.valueNumeric;
      isConfirmatory = obsGds.isConfirmatory || false;
    }
    if (obsGdp?.valueNumeric !== undefined) {
      gdp = obsGdp.valueNumeric;
      isConfirmatory = obsGdp.isConfirmatory || isConfirmatory;
    }

    if (gds === undefined && gdp === undefined) {
      const resGds = screeningResults.find((r) => r.measureCode === 'BLOOD_SUGAR' || r.measureCode === 'GLUCOSE_RANDOM');
      const resGdp = screeningResults.find((r) => r.measureCode === 'GLUCOSE_FASTING');
      if (resGds?.valueNumeric !== undefined) gds = resGds.valueNumeric;
      if (resGdp?.valueNumeric !== undefined) gdp = resGdp.valueNumeric;
    }

    if (gds === undefined && gdp === undefined) {
      return {
        result: {
          domain: 'GD',
          domainName: 'Gula Darah',
          status: 'NOT_EVALUATED_MISSING_DATA',
          ruleVersion: rulePackage.version,
          inputValues: {},
          reason: 'Data pemeriksaan gula darah (GDS/GDP) belum tersedia.',
        },
      };
    }

    const inputValues = { gds, gdp, isConfirmatory };

    // 1. Check Critical First: GDS >= 400 OR GDS < 54
    if ((gds !== undefined && (gds >= 400 || gds < 54))) {
      return {
        result: {
          domain: 'GD',
          domainName: 'Gula Darah',
          status: 'EVALUATED',
          category: 'DARK_RED',
          ruleCode: 'CR-GD-CRIT-01',
          ruleVersion: rulePackage.version,
          inputValues,
          requiresConfirmation: false,
          reason: `Temuan Kritis: Kadar GDS ${gds} mg/dL berada pada rentang krisis glikemik berat / hipoglikemia.`,
        },
        triggeredRule: {
          id: `TR-GD-${Date.now()}`,
          classificationId: '',
          citizenId: citizen.id,
          ruleCode: 'CR-GD-CRIT-01',
          domain: 'GD',
          inputValues,
          resultingCategory: 'DARK_RED',
          ruleVersion: rulePackage.version,
          isCritical: true,
          createdAt: new Date().toISOString(),
        },
      };
    }

    // 2. Suspected Diabetes: GDS >= 200 OR GDP >= 126
    if ((gds !== undefined && gds >= 200) || (gdp !== undefined && gdp >= 126)) {
      const status: DomainEvaluationStatus = isConfirmatory ? 'EVALUATED' : 'AWAITING_CONFIRMATION';
      const valStr = gds !== undefined ? `GDS ${gds} mg/dL` : `GDP ${gdp} mg/dL`;
      return {
        result: {
          domain: 'GD',
          domainName: 'Gula Darah',
          status,
          category: 'RED',
          ruleCode: 'CR-GD-03',
          ruleVersion: rulePackage.version,
          inputValues,
          requiresConfirmation: !isConfirmatory,
          reason: isConfirmatory
            ? `Diabetes Melitus terkonfirmasi (${valStr}).`
            : `Kadar gula darah awal (${valStr}) terduga Diabetes Melitus dan membutuhkan pemeriksaan konfirmasi laboratorium.`,
        },
        triggeredRule: {
          id: `TR-GD-${Date.now()}`,
          classificationId: '',
          citizenId: citizen.id,
          ruleCode: 'CR-GD-03',
          domain: 'GD',
          inputValues,
          resultingCategory: 'RED',
          ruleVersion: rulePackage.version,
          createdAt: new Date().toISOString(),
        },
      };
    }

    // 3. Pre-Diabetes: GDS 140-199 OR GDP 100-125
    if ((gds !== undefined && gds >= 140 && gds < 200) || (gdp !== undefined && gdp >= 100 && gdp < 126)) {
      const valStr = gds !== undefined ? `GDS ${gds} mg/dL` : `GDP ${gdp} mg/dL`;
      return {
        result: {
          domain: 'GD',
          domainName: 'Gula Darah',
          status: 'EVALUATED',
          category: 'ORANGE',
          ruleCode: 'CR-GD-02',
          ruleVersion: rulePackage.version,
          inputValues,
          requiresConfirmation: false,
          reason: `Pre-diabetes (Toleransi Glukosa Terganggu): ${valStr}.`,
        },
        triggeredRule: {
          id: `TR-GD-${Date.now()}`,
          classificationId: '',
          citizenId: citizen.id,
          ruleCode: 'CR-GD-02',
          domain: 'GD',
          inputValues,
          resultingCategory: 'ORANGE',
          ruleVersion: rulePackage.version,
          createdAt: new Date().toISOString(),
        },
      };
    }

    // 4. Normal: GDP < 100 OR GDS < 140
    const valStr = gds !== undefined ? `GDS ${gds} mg/dL` : `GDP ${gdp} mg/dL`;
    return {
      result: {
        domain: 'GD',
        domainName: 'Gula Darah',
        status: 'EVALUATED',
        category: 'GREEN',
        ruleCode: 'CR-GD-01',
        ruleVersion: rulePackage.version,
        inputValues,
        requiresConfirmation: false,
        reason: `Kadar gula darah normal (${valStr}).`,
      },
      triggeredRule: {
        id: `TR-GD-${Date.now()}`,
        classificationId: '',
        citizenId: citizen.id,
        ruleCode: 'CR-GD-01',
        domain: 'GD',
        inputValues,
        resultingCategory: 'GREEN',
        ruleVersion: rulePackage.version,
        createdAt: new Date().toISOString(),
      },
    };
  },

  /**
   * Evaluates GZ Domain (Nutrition & Anthropometry)
   */
  evaluateGZDomain(
    observations: Observation[],
    screeningResults: ScreeningResult[],
    citizen: Citizen,
    screeningDate: string,
    rulePackage: ClinicalRulePackage
  ): { result: DomainEvaluationResult; triggeredRule?: TriggeredRule } {
    let bmi: number | undefined;
    let waist: number | undefined;
    let weight: number | undefined;
    let height: number | undefined;

    const obsBmi = observations.find((o) => o.measureCode === 'BMI');
    const obsWaist = observations.find((o) => o.measureCode === 'WAIST' || o.measureCode === 'WAIST_CIRCUMFERENCE');
    const obsWeight = observations.find((o) => o.measureCode === 'WEIGHT');
    const obsHeight = observations.find((o) => o.measureCode === 'HEIGHT');

    if (obsBmi?.valueNumeric !== undefined) bmi = obsBmi.valueNumeric;
    if (obsWaist?.valueNumeric !== undefined) waist = obsWaist.valueNumeric;
    if (obsWeight?.valueNumeric !== undefined) weight = obsWeight.valueNumeric;
    if (obsHeight?.valueNumeric !== undefined) height = obsHeight.valueNumeric;

    if (bmi === undefined) {
      const resBmi = screeningResults.find((r) => r.measureCode === 'BMI');
      const resWaist = screeningResults.find((r) => r.measureCode === 'WAIST' || r.measureCode === 'WAIST_CIRCUMFERENCE');
      const resWeight = screeningResults.find((r) => r.measureCode === 'WEIGHT');
      const resHeight = screeningResults.find((r) => r.measureCode === 'HEIGHT');

      if (resBmi?.valueNumeric !== undefined) bmi = resBmi.valueNumeric;
      if (resWaist?.valueNumeric !== undefined) waist = resWaist.valueNumeric;
      if (resWeight?.valueNumeric !== undefined) weight = resWeight.valueNumeric;
      if (resHeight?.valueNumeric !== undefined) height = resHeight.valueNumeric;
    }

    // Auto-calculate BMI if weight & height exist
    if (bmi === undefined && weight !== undefined && height !== undefined && height > 0) {
      const heightM = height > 3 ? height / 100 : height;
      bmi = parseFloat((weight / (heightM * heightM)).toFixed(1));
    }

    if (bmi === undefined && waist === undefined) {
      return {
        result: {
          domain: 'GZ',
          domainName: 'Status Gizi & Antropometri',
          status: 'NOT_EVALUATED_MISSING_DATA',
          ruleVersion: rulePackage.version,
          inputValues: {},
          reason: 'Data antropometri (IMT/Berat/Tinggi/Lingkar Perut) belum tersedia.',
        },
      };
    }

    const inputValues = { bmi, waist, weight, height, sex: citizen.sex };
    const isCentralObesity =
      waist !== undefined &&
      ((citizen.sex === 'MALE' && waist >= 90) || (citizen.sex === 'FEMALE' && waist >= 80));

    // 0. Open Issue OI-05: Juknis defines Obesitas I as 25.0-29.9 and Obesitas II as "> 30",
    // leaving the exact value 30.0 uncovered by either range. Until a clinical reviewer closes
    // this gap, IMT === 30.0 must be routed to review, never auto-classified (RS-11) — unless
    // central obesity (an independent, unambiguous criterion) already justifies CR-GZ-04 below.
    if (bmi !== undefined && bmi === 30.0 && !isCentralObesity) {
      return {
        result: {
          domain: 'GZ',
          domainName: 'Status Gizi & Antropometri',
          status: 'NOT_EVALUATED_OPEN_RULE',
          ruleVersion: rulePackage.version,
          openIssueCode: 'OI-05',
          inputValues,
          category: undefined,
          reason: `Nilai IMT tepat 30,0 kg/m² berada pada celah batas Obesitas I (25,0-29,9) dan Obesitas II (>30) yang belum ditutup peninjau klinis (Open Issue OI-05). Nilai disimpan untuk tinjauan, tidak diklasifikasikan otomatis.`,
        },
      };
    }

    // 1. Obesitas Tingkat II (Morbid): BMI > 30 (exactly 30.0 is handled above under OI-05)
    if (bmi !== undefined && bmi > 30.0) {
      return {
        result: {
          domain: 'GZ',
          domainName: 'Status Gizi & Antropometri',
          status: 'EVALUATED',
          category: 'RED',
          ruleCode: 'CR-GZ-05',
          ruleVersion: rulePackage.version,
          inputValues,
          requiresConfirmation: false,
          reason: `Obesitas Tingkat II (IMT ${bmi} kg/m²).`,
        },
        triggeredRule: {
          id: `TR-GZ-${Date.now()}`,
          classificationId: '',
          citizenId: citizen.id,
          ruleCode: 'CR-GZ-05',
          domain: 'GZ',
          inputValues,
          resultingCategory: 'RED',
          ruleVersion: rulePackage.version,
          createdAt: new Date().toISOString(),
        },
      };
    }

    // 2. Obesitas Tingkat I / Sentral: BMI 25.0 - 29.9 OR Central Obesity
    if ((bmi !== undefined && bmi >= 25.0 && bmi < 30.0) || isCentralObesity) {
      const reasonText = isCentralObesity
        ? `Obesitas Sentral (Lingkar Perut ${waist} cm${bmi !== undefined ? `, IMT ${bmi} kg/m²` : ''}).`
        : `Obesitas Tingkat I (IMT ${bmi} kg/m²).`;

      return {
        result: {
          domain: 'GZ',
          domainName: 'Status Gizi & Antropometri',
          status: 'EVALUATED',
          category: 'ORANGE',
          ruleCode: 'CR-GZ-04',
          ruleVersion: rulePackage.version,
          inputValues,
          requiresConfirmation: false,
          reason: reasonText,
        },
        triggeredRule: {
          id: `TR-GZ-${Date.now()}`,
          classificationId: '',
          citizenId: citizen.id,
          ruleCode: 'CR-GZ-04',
          domain: 'GZ',
          inputValues,
          resultingCategory: 'ORANGE',
          ruleVersion: rulePackage.version,
          createdAt: new Date().toISOString(),
        },
      };
    }

    // 3. Kelebihan Berat Badan (Overweight): BMI 23.0 - 24.9
    if (bmi !== undefined && bmi >= 23.0 && bmi < 25.0) {
      return {
        result: {
          domain: 'GZ',
          domainName: 'Status Gizi & Antropometri',
          status: 'EVALUATED',
          category: 'YELLOW',
          ruleCode: 'CR-GZ-03',
          ruleVersion: rulePackage.version,
          inputValues,
          requiresConfirmation: false,
          reason: `Kelebihan berat badan / Overweight (IMT ${bmi} kg/m²).`,
        },
        triggeredRule: {
          id: `TR-GZ-${Date.now()}`,
          classificationId: '',
          citizenId: citizen.id,
          ruleCode: 'CR-GZ-03',
          domain: 'GZ',
          inputValues,
          resultingCategory: 'YELLOW',
          ruleVersion: rulePackage.version,
          createdAt: new Date().toISOString(),
        },
      };
    }

    // 4. Gizi Kurang (Underweight): BMI < 18.5
    if (bmi !== undefined && bmi < 18.5) {
      return {
        result: {
          domain: 'GZ',
          domainName: 'Status Gizi & Antropometri',
          status: 'EVALUATED',
          category: 'YELLOW',
          ruleCode: 'CR-GZ-02',
          ruleVersion: rulePackage.version,
          inputValues,
          requiresConfirmation: false,
          reason: `Status gizi kurang / Underweight (IMT ${bmi} kg/m²).`,
        },
        triggeredRule: {
          id: `TR-GZ-${Date.now()}`,
          classificationId: '',
          citizenId: citizen.id,
          ruleCode: 'CR-GZ-02',
          domain: 'GZ',
          inputValues,
          resultingCategory: 'YELLOW',
          ruleVersion: rulePackage.version,
          createdAt: new Date().toISOString(),
        },
      };
    }

    // 5. Gizi Normal: BMI 18.5 - 22.9
    return {
      result: {
        domain: 'GZ',
        domainName: 'Status Gizi & Antropometri',
        status: 'EVALUATED',
        category: 'GREEN',
        ruleCode: 'CR-GZ-01',
        ruleVersion: rulePackage.version,
        inputValues,
        requiresConfirmation: false,
        reason: `Status gizi normal (IMT ${bmi || '—'} kg/m²${waist !== undefined ? `, LP ${waist} cm` : ''}).`,
      },
      triggeredRule: {
        id: `TR-GZ-${Date.now()}`,
        classificationId: '',
        citizenId: citizen.id,
        ruleCode: 'CR-GZ-01',
        domain: 'GZ',
        inputValues,
        resultingCategory: 'GREEN',
        ruleVersion: rulePackage.version,
        createdAt: new Date().toISOString(),
      },
    };
  },

  /**
   * Evaluates PL Domain (Perilaku / Lifestyle)
   */
  evaluatePLDomain(
    observations: Observation[],
    screeningResults: ScreeningResult[],
    citizen: Citizen,
    screeningDate: string,
    rulePackage: ClinicalRulePackage
  ): { result: DomainEvaluationResult; triggeredRule?: TriggeredRule } {
    let smoking: string | undefined;
    let physical: string | undefined;

    const obsSmoke = observations.find((o) => o.measureCode === 'SMOKING' || o.measureCode === 'SMOKING_STATUS');
    const obsPhys = observations.find((o) => o.measureCode === 'PHYSICAL_ACTIVITY');

    if (obsSmoke?.valueCode) smoking = obsSmoke.valueCode;
    if (obsPhys?.valueCode) physical = obsPhys.valueCode;

    if (!smoking && !physical) {
      const resSmoke = screeningResults.find((r) => r.measureCode === 'SMOKING' || r.measureCode === 'SMOKING_STATUS');
      const resPhys = screeningResults.find((r) => r.measureCode === 'PHYSICAL_ACTIVITY');
      if (resSmoke?.valueCode) smoking = resSmoke.valueCode;
      if (resPhys?.valueCode) physical = resPhys.valueCode;
    }

    if (!smoking && !physical) {
      return {
        result: {
          domain: 'PL',
          domainName: 'Perilaku & Gaya Hidup',
          status: 'NOT_EVALUATED_MISSING_DATA',
          ruleVersion: rulePackage.version,
          inputValues: {},
          reason: 'Data kuesioner perilaku (merokok / aktivitas fisik) belum tersedia.',
        },
      };
    }

    const inputValues = { smoking, physical };
    const isSmoker = smoking === 'DAILY' || smoking === 'DAILY_SMOKER' || smoking === 'YES';
    const isInactive = physical === 'INSUFFICIENT' || physical === 'SEDENTARY' || physical === 'LOW';

    if (isSmoker || isInactive) {
      return {
        result: {
          domain: 'PL',
          domainName: 'Perilaku & Gaya Hidup',
          status: 'EVALUATED',
          category: 'YELLOW',
          ruleCode: 'CR-PL-02',
          ruleVersion: rulePackage.version,
          inputValues,
          requiresConfirmation: false,
          reason: `Ditemukan faktor risiko perilaku (${isSmoker ? 'Perokok aktif harian' : ''}${isSmoker && isInactive ? ' & ' : ''}${isInactive ? 'Aktivitas fisik kurang' : ''}).`,
        },
        triggeredRule: {
          id: `TR-PL-${Date.now()}`,
          classificationId: '',
          citizenId: citizen.id,
          ruleCode: 'CR-PL-02',
          domain: 'PL',
          inputValues,
          resultingCategory: 'YELLOW',
          ruleVersion: rulePackage.version,
          createdAt: new Date().toISOString(),
        },
      };
    }

    return {
      result: {
        domain: 'PL',
        domainName: 'Perilaku & Gaya Hidup',
        status: 'EVALUATED',
        category: 'GREEN',
        ruleCode: 'CR-PL-01',
        ruleVersion: rulePackage.version,
        inputValues,
        requiresConfirmation: false,
        reason: 'Perilaku hidup sehat: tidak merokok dan aktivitas fisik cukup.',
      },
      triggeredRule: {
        id: `TR-PL-${Date.now()}`,
        classificationId: '',
        citizenId: citizen.id,
        ruleCode: 'CR-PL-01',
        domain: 'PL',
        inputValues,
        resultingCategory: 'GREEN',
        ruleVersion: rulePackage.version,
        createdAt: new Date().toISOString(),
      },
    };
  },

  /**
   * Evaluates LP Domain (Profil Lipid) — Strictly BLOCKED by Open Issue OI-01!
   * TEST D REQUIREMENT: Raw cholesterol is preserved, but LP = NOT_EVALUATED_OPEN_RULE, NO lipid risk category calculated!
   */
  evaluateLPDomain(
    observations: Observation[],
    screeningResults: ScreeningResult[],
    citizen: Citizen,
    screeningDate: string,
    rulePackage: ClinicalRulePackage
  ): { result: DomainEvaluationResult; triggeredRule?: TriggeredRule } {
    let cholesterolTotal: number | undefined;

    const obsChol = observations.find((o) => o.measureCode === 'CHOLESTEROL' || o.measureCode === 'TOTAL_CHOLESTEROL');
    if (obsChol?.valueNumeric !== undefined) {
      cholesterolTotal = obsChol.valueNumeric;
    } else {
      const resChol = screeningResults.find((r) => r.measureCode === 'CHOLESTEROL' || r.measureCode === 'TOTAL_CHOLESTEROL');
      if (resChol?.valueNumeric !== undefined) {
        cholesterolTotal = resChol.valueNumeric;
      }
    }

    const inputValues = cholesterolTotal !== undefined ? { cholesterolTotal } : {};

    return {
      result: {
        domain: 'LP',
        domainName: 'Profil Lipid',
        status: 'NOT_EVALUATED_OPEN_RULE',
        ruleCode: 'CR-LP-01',
        ruleVersion: rulePackage.version,
        openIssueCode: 'OI-01',
        inputValues,
        category: undefined, // Explicitly undefined!
        reason: 'Ambang profil lipid belum terverifikasi pada CRS aktif (Open Issue OI-01). Hasil mentah disimpan untuk telaah klinis dokter tanpa pembentukan klasifikasi otomatis.',
      },
    };
  },

  /**
   * Aggregates evaluated domains into final clinical category and Juknis category.
   *
   * RS-03: a single unconfirmed reading must never, by itself, produce a confirmed disease
   * classification (e.g. one unconfirmed 170/105 mmHg reading must not surface as "Hipertensi
   * Derajat 2"). By default this excludes domains still AWAITING_CONFIRMATION from the
   * severity computation that drives the persisted finalCategory/juknisCategory. Pass
   * `includeAwaitingConfirmation: true` to get the provisional (unconfirmed-inclusive) severity
   * used only to drive operational triage urgency (see evaluateCitizen's priority scoring),
   * never to set the classification record itself.
   */
  aggregateFinalCategory(
    domainResults: DomainEvaluationResult[],
    options?: { includeAwaitingConfirmation?: boolean }
  ): {
    finalCategory: ClinicalRiskCategory;
    juknisCategory: JuknisCategory;
    isAwaitingConfirmation: boolean;
  } {
    const includeAwaitingConfirmation = options?.includeAwaitingConfirmation ?? false;
    const evaluatedResults = domainResults.filter(
      (d) => d.category !== undefined && (includeAwaitingConfirmation || d.status !== 'AWAITING_CONFIRMATION')
    );

    // Computed from the FULL domain set (not the filtered evaluatedResults above) so that a
    // citizen whose only elevated finding is still AWAITING_CONFIRMATION is correctly flagged
    // as awaiting confirmation, even though that finding is excluded from finalCategory itself.
    const isAwaitingConfirmation = domainResults.some(
      (d) => d.status === 'AWAITING_CONFIRMATION' || d.requiresConfirmation === true
    );

    if (evaluatedResults.length === 0) {
      return {
        finalCategory: 'UNDETERMINED',
        juknisCategory: 'NORMAL_NO_RISK_FACTOR',
        isAwaitingConfirmation,
      };
    }

    // Find highest severity category
    let highestCategory: ClinicalRiskCategory = 'UNDETERMINED';
    let highestSeverity = 0;

    for (const res of evaluatedResults) {
      if (res.category) {
        const sev = CATEGORY_SEVERITY_ORDER[res.category] || 0;
        if (sev > highestSeverity) {
          highestSeverity = sev;
          highestCategory = res.category;
        }
      }
    }

    // Map to Juknis category
    let juknisCategory: JuknisCategory = 'NORMAL_NO_RISK_FACTOR';
    switch (highestCategory) {
      case 'DARK_RED':
        juknisCategory = 'DISEASE_REQUIRES_FKRTL';
        break;
      case 'RED':
        juknisCategory = 'DISEASE_FPKTP_COMPETENCE';
        break;
      case 'ORANGE':
        juknisCategory = 'PRE_DISEASE';
        break;
      case 'YELLOW':
        juknisCategory = 'NORMAL_WITH_RISK_FACTOR';
        break;
      case 'GREEN':
      default:
        juknisCategory = 'NORMAL_NO_RISK_FACTOR';
        break;
    }

    return {
      finalCategory: highestCategory,
      juknisCategory,
      isAwaitingConfirmation,
    };
  },

  /**
   * Detects Critical Finding based strictly on CRS critical rules
   */
  detectCriticalFinding(domainResults: DomainEvaluationResult[]): {
    isCritical: boolean;
    criticalRuleCode?: string;
  } {
    const crit = domainResults.find(
      (d) => d.ruleCode === 'CR-BP-CRIT-01' || d.ruleCode === 'CR-GD-CRIT-01'
    );
    if (crit) {
      return {
        isCritical: true,
        criticalRuleCode: crit.ruleCode,
      };
    }
    return {
      isCritical: false,
    };
  },

  /**
   * Generates deterministic Multimorbidity Clusters (NOT Machine Learning!)
   */
  generateClusters(
    citizenId: string,
    classificationId: string,
    domainResults: DomainEvaluationResult[]
  ): RiskCluster | undefined {
    const riskDomains = domainResults
      .filter((d) => d.category && ['YELLOW', 'ORANGE', 'RED', 'DARK_RED'].includes(d.category))
      .map((d) => d.domain);

    if (riskDomains.length === 0) return undefined;

    const clusterCode = `CLUSTER_${riskDomains.sort().join('_')}`;
    const domainNames = domainResults
      .filter((d) => riskDomains.includes(d.domain))
      .map((d) => d.domainName);

    const label =
      riskDomains.length > 1
        ? `Multi-faktor: ${domainNames.join(' + ')}`
        : `Faktor Tunggal: ${domainNames[0]}`;

    return {
      id: `RC-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      citizenId,
      classificationId,
      clusterCode,
      domainCodes: riskDomains,
      label,
      createdAt: new Date().toISOString(),
    };
  },

  /**
   * Generates Next-Best-Actions (NBA) derived strictly from CRS rule package
   */
  generateNextBestActions(
    citizenId: string,
    classificationId: string,
    domainResults: DomainEvaluationResult[],
    rulePackage: ClinicalRulePackage
  ): NextBestAction[] {
    const actions: NextBestAction[] = [];

    for (const dom of domainResults) {
      // 1. If Domain is Blocked by Open Issue (e.g. LP OI-01)
      if (dom.status === 'NOT_EVALUATED_OPEN_RULE') {
        actions.push({
          id: `NBA-BLOCKED-${dom.domain}-${Date.now()}`,
          citizenId,
          classificationId,
          actionType: 'BLOCKED_BY_OPEN_RULE',
          actionText: `Tindakan otomatis belum dapat dibentuk karena aturan terkait ${dom.domainName} belum terverifikasi (${dom.openIssueCode || 'OI'}).`,
          suggestedRole: 'Komite Medis / Dinkes',
          sourceRuleCode: dom.ruleCode || 'CR-OPEN',
          ruleVersion: rulePackage.version,
          status: 'BLOCKED_OPEN_RULE',
          openIssueCode: dom.openIssueCode,
          blockReason: 'Menunggu pengesahan ambang batas klinis definitif.',
        });
        continue;
      }

      // 2. If Domain is Awaiting Confirmation
      if (dom.status === 'AWAITING_CONFIRMATION') {
        actions.push({
          id: `NBA-CONFIRM-${dom.domain}-${Date.now()}`,
          citizenId,
          classificationId,
          actionType: 'CLINICAL_REPEAT_MEASUREMENT',
          actionText: `Pengukuran konfirmasi ulang ${dom.domainName} diperlukan di FPKTP dalam 14 hari sebelum penetapan diagnosis definitif.`,
          suggestedRole: 'Perawat FPKTP / Dokter',
          intervalValue: 14,
          intervalUnit: 'DAYS',
          sourceRuleCode: dom.ruleCode || 'CR-CONFIRM',
          ruleVersion: rulePackage.version,
          status: 'AWAITING_CONFIRMATION',
        });
        continue;
      }

      // 3. Normal Active Rule Match
      if (dom.ruleCode) {
        const ruleDef = rulePackage.rules.find((r) => r.ruleCode === dom.ruleCode);
        if (ruleDef && ruleDef.nextActions && ruleDef.nextActions.length > 0) {
          for (const act of ruleDef.nextActions) {
            actions.push({
              id: `NBA-${ruleDef.ruleCode}-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
              citizenId,
              classificationId,
              actionType: act.actionType,
              actionText: act.actionText,
              suggestedRole: act.suggestedRole,
              intervalValue: act.intervalValue,
              intervalUnit: act.intervalUnit,
              sourceRuleCode: ruleDef.ruleCode,
              ruleVersion: rulePackage.version,
              status: 'PROPOSED',
            });
          }
        }
      }
    }

    return actions;
  },

  /**
   * Complete Deterministic Citizen Evaluation Pipeline
   */
  evaluateCitizen(
    citizen: Citizen,
    latestSession: ScreeningSession | undefined,
    screeningResults: ScreeningResult[],
    observations: Observation[],
    rulePackage: ClinicalRulePackage = CRS_CKG_V0_9,
    weightConfig: PriorityWeightVersion = DEFAULT_PRIORITY_WEIGHTS
  ): {
    classification: RiskClassification;
    triggeredRules: TriggeredRule[];
    cluster?: RiskCluster;
  } {
    const classificationId = `RC-${citizen.id}-${Date.now()}`;
    const screeningDate = latestSession?.screenedAt || new Date().toISOString();

    // 1. Evaluate All 5 Domains Deterministically
    const triggeredRules: TriggeredRule[] = [];

    const bpEval = this.evaluateBPDomain(observations, screeningResults, citizen, screeningDate, rulePackage);
    if (bpEval.triggeredRule) triggeredRules.push({ ...bpEval.triggeredRule, classificationId });

    const gdEval = this.evaluateGDDomain(observations, screeningResults, citizen, screeningDate, rulePackage);
    if (gdEval.triggeredRule) triggeredRules.push({ ...gdEval.triggeredRule, classificationId });

    const gzEval = this.evaluateGZDomain(observations, screeningResults, citizen, screeningDate, rulePackage);
    if (gzEval.triggeredRule) triggeredRules.push({ ...gzEval.triggeredRule, classificationId });

    const plEval = this.evaluatePLDomain(observations, screeningResults, citizen, screeningDate, rulePackage);
    if (plEval.triggeredRule) triggeredRules.push({ ...plEval.triggeredRule, classificationId });

    const lpEval = this.evaluateLPDomain(observations, screeningResults, citizen, screeningDate, rulePackage);
    if (lpEval.triggeredRule) triggeredRules.push({ ...lpEval.triggeredRule, classificationId });

    const domainResults: DomainEvaluationResult[] = [
      bpEval.result,
      gdEval.result,
      gzEval.result,
      plEval.result,
      lpEval.result,
    ];

    // Collect Undetermined / Open Domains
    const undeterminedDomains: UndeterminedDomain[] = domainResults
      .filter((d) => d.status === 'NOT_EVALUATED_MISSING_DATA' || d.status === 'NOT_EVALUATED_OPEN_RULE')
      .map((d) => ({
        domain: d.domain,
        domainName: d.domainName,
        reason: d.reason || 'Data belum tersedia.',
        openIssueCode: d.openIssueCode,
      }));

    // 2. Aggregate Final Category (confirmed-only — RS-03: never let an unconfirmed reading
    // become the persisted classification's finalCategory/juknisCategory)
    const aggregation = this.aggregateFinalCategory(domainResults);

    // 2b. Provisional severity (includes AWAITING_CONFIRMATION domains) — used only to drive
    // operational triage urgency below, so a citizen who needs urgent confirmatory
    // remeasurement still surfaces near the top of the daily priority queue.
    const provisionalAggregation = this.aggregateFinalCategory(domainResults, {
      includeAwaitingConfirmation: true,
    });

    // 3. Detect Critical Finding
    const criticalCheck = this.detectCriticalFinding(domainResults);

    // 4. Generate Multimorbidity Cluster
    const cluster = this.generateClusters(citizen.id, classificationId, domainResults);

    // 5. Calculate Operational Priority Score (uses provisional severity, see 2b)
    const priorityResult = priorityEngine.calculate(
      citizen,
      {
        finalCategory: provisionalAggregation.finalCategory,
        isCritical: criticalCheck.isCritical,
        domainResults,
        screeningDate,
      },
      observations,
      weightConfig
    );

    // 6. Generate Next-Best-Actions (NBA)
    const nextBestActions = this.generateNextBestActions(
      citizen.id,
      classificationId,
      domainResults,
      rulePackage
    );

    const classification: RiskClassification = {
      id: classificationId,
      citizenId: citizen.id,
      citizenName: citizen.fullName,
      villageName: citizen.villageName,
      facilityName: citizen.facilityName,
      facilityId: citizen.facilityId,
      sessionId: latestSession?.id,
      screeningDate,
      classificationStage: aggregation.isAwaitingConfirmation ? 'SCREENING' : 'CONFIRMED',
      finalCategory: aggregation.finalCategory,
      juknisCategory: aggregation.juknisCategory,
      ruleVersion: rulePackage.version,
      isCritical: criticalCheck.isCritical,
      criticalRuleCode: criticalCheck.criticalRuleCode,
      priorityScore: priorityResult.totalScore,
      priorityComponents: priorityResult.components,
      domainResults,
      undeterminedDomains,
      clusterCode: cluster?.clusterCode,
      clusterLabel: cluster?.label,
      nextBestActions,
      createdAt: new Date().toISOString(),
    };

    return {
      classification,
      triggeredRules,
      cluster,
    };
  },
};
