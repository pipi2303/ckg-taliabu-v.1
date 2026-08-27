import { auditRepo } from '../repositories/auditRepo';

export class SecuritySensitivityViolationError extends Error {
  constructor(public readonly violationField: string, message: string) {
    super(message);
    this.name = 'SecuritySensitivityViolationError';
  }
}

// Strictly forbidden keys for S2 Kader boundary
const FORBIDDEN_S3_S4_KEYS = new Set([
  'bloodpressure',
  'systolic',
  'diastolic',
  'tensi',
  'gds',
  'gdp',
  'bloodsugar',
  'guladarah',
  'bmi',
  'imt',
  'waistcircumference',
  'lingkarperut',
  'riskcategory',
  'finalcategory',
  'crsrulecode',
  'triggeredrules',
  'diagnosis',
  'diagnosa',
  'medication',
  'obat',
  'treatmenthistory',
  'riwayatterapi',
  'referralreason',
  'referralresult',
  'alasanrujukan',
  'clinicalrisk',
  'labvalues',
  'hasilpemeriksaan',
]);

// Strictly forbidden value patterns in strings (like clinical risk codes or categories)
const FORBIDDEN_VALUE_PATTERNS = [
  /\b(DARK_RED|RED|ORANGE|YELLOW|GREEN)\b/i,
  /\b(CRS-\d+|RULE-\d+)\b/i,
  /\b(Hipertensi Tingkat|Diabetes Melitus|Gula Darah Sewaktu)\b/i,
];

/**
 * Asserts that a Kader Field Work Package or Assignment payload does not contain
 * any clinical personal data (S3) or diagnosis/treatment (S4) attributes.
 *
 * MUST BE EXECUTED BEFORE ANY NETWORK PAYLOAD DELIVERY.
 * If any violation is found, throws error and logs security incident.
 */
export function assertKaderPayloadSensitivity(payload: any, path = 'root'): void {
  if (payload === null || payload === undefined) {
    return;
  }

  if (Array.isArray(payload)) {
    payload.forEach((item, idx) => {
      assertKaderPayloadSensitivity(item, `${path}[${idx}]`);
    });
    return;
  }

  if (typeof payload === 'object') {
    for (const [key, val] of Object.entries(payload)) {
      const lowerKey = key.toLowerCase();

      // Check if key is forbidden
      if (FORBIDDEN_S3_S4_KEYS.has(lowerKey)) {
        logAndThrowViolation(key, `${path}.${key}`, `Forbidden S3/S4 clinical attribute key detected`);
      }

      // If value is a string, check if it contains raw clinical risk markers (unless it's an actionText or standard safe field)
      if (typeof val === 'string' && key !== 'actionText' && key !== 'previousFieldVisitSummary') {
        for (const pattern of FORBIDDEN_VALUE_PATTERNS) {
          if (pattern.test(val)) {
            logAndThrowViolation(
              key,
              `${path}.${key}`,
              `Forbidden S3/S4 clinical value pattern "${val}" detected in field "${key}"`
            );
          }
        }
      }

      // Recurse into nested objects
      assertKaderPayloadSensitivity(val, `${path}.${key}`);
    }
  }
}

function logAndThrowViolation(field: string, fullPath: string, reason: string): never {
  const message = `[S2 Security Hard Lock] ${reason} at ${fullPath}. Package generation aborted.`;
  console.error('CRITICAL PRIVACY VIOLATION:', message);

  // Append to audit log
  auditRepo.log({
    actorUserId: 'system-security',
    actorName: 'S2 Sensitivity Filter Guardian',
    actorRole: 'ADMIN_DINKES',
    action: 'SECURITY_VIOLATION_DETECTED',
    entityType: 'SECURITY_POLICY',
    entityId: field,
    description: `Pelanggaran kebocoran data klinis S3/S4 terdeteksi pada pembuatan paket kader: ${field} (${fullPath})`,
    details: { violationField: field, path: fullPath, reason },
  }).catch(() => {});

  throw new SecuritySensitivityViolationError(field, message);
}

/**
 * Diagnostic tool for running automated test on a package payload
 */
export function runSecurityPayloadAuditTest(payload: any): { passed: boolean; error?: string } {
  try {
    assertKaderPayloadSensitivity(payload);
    return { passed: true };
  } catch (err: any) {
    return { passed: false, error: err.message };
  }
}
