/**
 * Core Type Definitions for CKG Smart Care Platform (MVP 1)
 */

export type RoleId =
  | 'ADMIN_DINKES'
  | 'KEPALA_DINAS'
  | 'ANALYST_DINKES'
  | 'KEPALA_PUSKESMAS'
  | 'PJ_CKG'
  | 'DOCTOR'
  | 'NURSE_MIDWIFE'
  | 'PHARMACY_OFFICER'
  | 'KADER'
  | 'PUSTU'
  | 'POSYANDU'
  | 'CITIZEN'
  | 'AUDITOR'
  | 'BUPATI';

export type Status = 'ACTIVE' | 'INACTIVE';

export type SensitivityLevel = 'S0' | 'S1' | 'S2' | 'S3' | 'S4';

export interface RoleDefinition {
  id: RoleId;
  name: string;
  category: 'DINKES' | 'PUSKESMAS' | 'FIELD' | 'CITIZEN' | 'GOVERNANCE';
  description: string;
  dataCeiling: SensitivityLevel;
  canManageUsers: boolean;
  canManageFacilities: boolean;
  canManageRegions: boolean;
  canViewAudit: boolean;
  canManageRuleVersions: boolean;
  canAccessClinicalData: boolean;
  permissions?: string[];
  isPredefined: true;
}

export type EntityType = AuditEntityType;
export type SyncQueueItem = OfflineQueueItem;

export type PermissionLevel = 'ALLOW' | 'LIMITED' | 'DENIED';

export interface PermissionMatrixRow {
  module: string;
  capability: string;
  description: string;
  permissions: Record<RoleId, PermissionLevel>;
}

export interface Kecamatan {
  id: string;
  code: string;
  name: string;
  villageCount: number;
  status: Status;
  updatedAt: string;
}

export interface Desa {
  id: string;
  code: string;
  name: string;
  kecamatanId: string;
  kecamatanName: string;
  puskesmasId: string;
  puskesmasName: string;
  status: Status;
  updatedAt: string;
}

export type Village = Desa;

export type FacilityType = 'PUSKESMAS' | 'PUSTU' | 'POSYANDU' | 'RSUD_RUJUKAN';

export interface HealthFacility {
  id: string;
  code: string;
  name: string;
  type: FacilityType;
  kecamatanId: string;
  kecamatanName: string;
  desaId: string;
  desaName: string;
  parentFacilityId?: string;
  parentFacilityName?: string;
  serviceLevel: string;
  status: Status;
  address: string;
  phone?: string;
  connectedFacilitiesCount?: number;
  activeUsersCount?: number;
  updatedAt: string;
}

export interface HealthService {
  id: string;
  code: string;
  name: string;
  category: 'CKG_SCREENING' | 'FOLLOW_UP' | 'SPECIALIST' | 'LABORATORY' | 'HOME_VISIT';
  targetDemographic: string;
  status: Status;
  description: string;
  sensitivity: SensitivityLevel;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  roleId: RoleId;
  roleName: string;
  facilityId: string;
  facilityName: string;
  areaScopes: string[]; // List of Kecamatan or Desa IDs
  areaScopeNames: string[];
  villageAssignment?: string; // mandatory if role is KADER
  villageAssignmentName?: string;
  status: Status;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  userId: string;
  userName: string;
  roleId: RoleId;
  roleName: string;
  facilityId: string;
  facilityName: string;
  areaScopes: string[];
  loginAt: string;
  expiresAt: string;
  token: string;
}

export type ConsentChannel = 'APP' | 'ASSISTED_KADER' | 'PAPER' | 'SATUSEHAT';

export type ConsentScope = 'FOLLOW_UP_PROCESSING' | 'KADER_HOME_VISIT' | 'MESSAGE_CONTACT';

export type ConsentStatus = 'ACTIVE' | 'REVOKED' | 'PENDING_SYNC';

export interface ConsentRecord {
  id: string;
  citizenId: string;
  citizenName: string;
  citizenNik: string; // S1 data
  consentTextVersion: string;
  channel: ConsentChannel;
  scope: ConsentScope;
  grantedAt: string;
  revokedAt?: string;
  assistedByUserId?: string;
  assistedByUserName?: string;
  status: ConsentStatus;
  notes?: string;
}

export type AuditAction =
  | 'VIEW'
  | 'CREATE'
  | 'UPDATE'
  | 'DEACTIVATE'
  | 'REACTIVATE'
  | 'EXPORT'
  | 'DRILLDOWN'
  | 'OVERRIDE'
  | 'MERGE'
  | 'PUBLISH'
  | 'SUBMIT_REVIEW'
  | 'APPROVE'
  | 'REVOKE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'EXECUTE_BATCH'
  | 'DOWNGRADE_CRITICAL'
  | 'CHANGE_WEIGHTS'
  | 'RESOLVE_REVIEW'
  | 'ASSIGN_TASK'
  | 'REASSIGN_TASK'
  | 'RECORD_CONTACT'
  | 'CREATE_APPOINTMENT'
  | 'RESCHEDULE_APPOINTMENT'
  | 'CANCEL_APPOINTMENT'
  | 'CLOSE_TASK'
  | 'MANUAL_CLOSE_TASK'
  | 'SET_LTFU'
  | 'REVERSE_LTFU'
  | 'UPDATE_OUTREACH_CONFIG'
  | 'UPDATE_QUOTA'
  | 'ESCALATE_TASK'
  | 'PACKAGE_DOWNLOADED'
  | 'SECURITY_VIOLATION_DETECTED'
  | 'FIELD_VISIT_SYNCED'
  | 'URGENT_OBSERVATION_FLAGGED'
  | 'CREATE_CLINICAL_ENCOUNTER'
  | 'UPDATE_CLINICAL_ENCOUNTER'
  | 'ISSUE_PRESCRIPTION'
  | 'CREATE_HOSPITAL_REFERRAL'
  | 'UPDATE_REFERRAL_STATUS'
  | 'ENROLL_PROLANIS'
  | 'CLOSED_LOOP_RESOLUTION'
  | 'ACCESS_DENIED'
  | 'RECORD_INTERVENTION'
  | 'UPDATE_INTERVENTION'
  | 'CANCEL_INTERVENTION';

export type AuditEntityType =
  | 'USER'
  | 'HEALTH_FACILITY'
  | 'REGION_KECAMATAN'
  | 'REGION_DESA'
  | 'HEALTH_SERVICE'
  | 'CONSENT_RECORD'
  | 'RULE_VERSION'
  | 'SESSION'
  | 'SYNC_QUEUE'
  | 'SYSTEM_SETTINGS'
  | 'CITIZEN'
  | 'CITIZEN_IDENTIFIER'
  | 'SCREENING_SESSION'
  | 'DATA_QUALITY_ISSUE'
  | 'IDENTITY_MERGE'
  | 'INGESTION_RUN'
  | 'IMPORT_FILE'
  | 'RISK_CLASSIFICATION'
  | 'TRIGGERED_RULE'
  | 'PRIORITY_WEIGHT_VERSION'
  | 'CLASSIFICATION_BATCH'
  | 'CLASSIFICATION_REVIEW'
  | 'CARE_TASK'
  | 'TASK_ASSIGNMENT'
  | 'CONTACT_ATTEMPT'
  | 'APPOINTMENT'
  | 'SERVICE_QUOTA'
  | 'TASK_CLOSURE'
  | 'OUTREACH_LADDER_VERSION'
  | 'FIELD_WORK_PACKAGE'
  | 'SECURITY_POLICY'
  | 'CLINICAL_ENCOUNTER'
  | 'HOSPITAL_REFERRAL'
  | 'PROLANIS_ENROLLMENT'
  | 'PRESCRIPTION'
  | 'POPULATION_INTERVENTION'
  | 'POPULATION_REPORT';

export type VitalStatus = 'ALIVE' | 'DECEASED';

export interface Citizen {
  id: string;
  fullName: string;
  birthDate: string; // YYYY-MM-DD
  sex: 'MALE' | 'FEMALE';
  phonePrimary?: string;
  phoneVerifiedAt?: string;
  addressText?: string;
  villageId: string;
  villageName?: string;
  kecamatanId?: string;
  kecamatanName?: string;
  facilityId: string;
  facilityName?: string;
  vitalStatus: VitalStatus;
  mergedIntoId?: string;
  createdAt: string;
  updatedAt: string;
}

export type IdentifierType = 'NIK' | 'SATUSEHAT_ID' | 'SOURCE_SYSTEM_ID';

export interface CitizenIdentifier {
  id: string;
  citizenId: string;
  identifierType: IdentifierType;
  identifierValue: string;
  sourceSystem: string;
  validFrom?: string;
  validTo?: string;
}

export interface CitizenAreaHistory {
  id: string;
  citizenId: string;
  villageId: string;
  villageName?: string;
  facilityId: string;
  facilityName?: string;
  validFrom: string;
  validTo?: string;
  changeReason?: string;
  confirmedByUserId?: string;
  confirmedByUserName?: string;
}

export type VenueType = 'FACILITY' | 'POSYANDU' | 'COMMUNITY' | 'SCHOOL';

export interface ScreeningSession {
  id: string;
  citizenId: string;
  screenedAt: string;
  ingestedAt: string;
  venueType: VenueType;
  facilityId?: string;
  facilityName?: string;
  isComplete: boolean;
  sourceSystem: string;
  sourceRecordId?: string;
}

export interface ScreeningResult {
  id: string;
  sessionId: string;
  citizenId?: string;
  measureCode: string;
  measureName?: string;
  valueNumeric?: number;
  valueCode?: string;
  unit?: string;
  measuredAt: string;
  sequenceInSession: number;
  isAnomalous: boolean;
  sourceSystem: string;
}

export type ObservationSourceType = 'CLINICAL' | 'KADER_FIELD' | 'SELF_REPORTED';

export interface Observation {
  id: string;
  citizenId: string;
  measureCode: string;
  valueNumeric?: number;
  valueCode?: string;
  unit?: string;
  measuredAt: string;
  sourceType: ObservationSourceType;
  recordedByUserId?: string;
  encounterId?: string;
  isConfirmatory: boolean;
  pairedObservationId?: string;
}

export type IngestionRunStatus = 'RUNNING' | 'SUCCESS' | 'PARTIAL_FAILED' | 'FAILED';
export type IngestionFailureType =
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'CREDENTIAL_REJECTED'
  | 'PAYLOAD_SCHEMA_CHANGED'
  | 'RATE_LIMIT'
  | 'VALIDATION_ERROR';

export interface IngestionRun {
  id: string;
  sourceSystem: string;
  facilityId?: string;
  facilityName?: string;
  startedAt: string;
  completedAt?: string;
  watermarkFrom?: string;
  watermarkTo?: string;
  receivedCount: number;
  acceptedCount: number;
  rejectedCount: number;
  qualityQueueCount: number;
  aggregateOnlyCount: number;
  status: IngestionRunStatus;
  errorType?: IngestionFailureType;
  errorMessage?: string;
}

export interface IngestionCursor {
  sourceSystem: string;
  facilityId: string;
  lastSuccessfulWatermark?: string;
}

export type DataQualityProblemType =
  | 'INVALID_NIK'
  | 'SAME_NIK_DIFFERENT_NAME'
  | 'IDENTITY_AMBIGUOUS'
  | 'MISSING_BIRTH_DATE'
  | 'INVALID_VILLAGE'
  | 'UNKNOWN_FACILITY'
  | 'DUPLICATE_CANDIDATE'
  | 'OUTSIDE_WORK_AREA'
  | 'INVALID_MEASURE'
  | 'MISSING_UNIT'
  | 'SOURCE_SCHEMA_ERROR';

export type DataQualityStatus = 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'REJECTED';

export interface DataQualityIssue {
  id: string;
  sourceRecordId: string;
  sourceSystem: string;
  screeningDate: string;
  citizenName: string;
  identifierValue?: string;
  problemType: DataQualityProblemType;
  problemDescription: string;
  facilityId?: string;
  facilityName?: string;
  villageCode?: string;
  rawRecord: any;
  candidateCitizenIds?: string[];
  status: DataQualityStatus;
  createdAt: string;
  resolvedAt?: string;
  resolvedByUserId?: string;
  resolvedByUserName?: string;
  resolutionNotes?: string;
  matchedCitizenId?: string;
}

export type MatchConfidence = 'EXACT' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
export type MatchMethod =
  | 'NIK_EXACT'
  | 'DEMOGRAPHIC_EXACT'
  | 'DEMOGRAPHIC_SIMILAR'
  | 'MANUAL'
  | 'NEW_IDENTITY';

export interface IdentityMatchDecision {
  id: string;
  sourceRecordId: string;
  citizenId?: string;
  confidence: MatchConfidence;
  method: MatchMethod;
  decidedBy?: string;
  decidedAt: string;
}

export interface IdentityMatchCandidate {
  id: string;
  citizenAId: string;
  citizenBId: string;
  citizenAName: string;
  citizenBName: string;
  citizenANik: string;
  citizenBNik: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  similarityScore?: number;
  matchingFields: string[];
  differentFields: string[];
  sourceSystem: string;
  status: 'PENDING_REVIEW' | 'MERGED' | 'DISMISSED';
  createdAt: string;
}

export interface IdentityMergeHistory {
  id: string;
  sourceCitizenId: string;
  targetCitizenId: string;
  sourceCitizenName: string;
  targetCitizenName: string;
  reason: string;
  mergedByUserId: string;
  mergedByUserName: string;
  mergedAt: string;
  isUnmerged: boolean;
  unmergedAt?: string;
  unmergedByUserId?: string;
  unmergedReason?: string;
}

export interface SourceMapping {
  id: string;
  sourceSystem: string;
  sourceField: string;
  targetField: string;
  targetDataType?: string;
  transformationRule: string;
  isRequired: boolean;
  sampleValue: string;
  status: Status;
}

export interface ImportFileHistory {
  id: string;
  fileName: string;
  fileChecksum?: string;
  fileSizeBytes?: number;
  fileSize?: number;
  uploadedAt: string;
  uploadedByUserId: string;
  uploadedByUserName: string;
  sourceSystem: string;
  facilityId?: string;
  facilityName?: string;
  totalRows: number;
  validRows?: number;
  acceptedCount: number;
  qualityQueueCount: number;
  aggregateOnlyCount: number;
  rejectedCount: number;
  status: 'SUCCESS' | 'PARTIAL' | 'FAILED' | 'COMPLETED';
  notes?: string;
  errorLogSummary?: string;
}

export interface OutboundIntegrationQueueItem {
  id: string;
  citizenId: string;
  entityType: string;
  entityId: string;
  status: 'PENDING' | 'SENDING' | 'SENT' | 'FAILED';
  retryCount: number;
  createdAt: string;
  sentAt?: string;
}

export interface NormalizedScreeningValue {
  measureCode: string;
  measureName?: string;
  valueNumeric?: number;
  valueCode?: string;
  unit?: string;
  isAnomalous: boolean;
}

export interface NormalizedCkgRecord {
  sourceSystem: string;
  sourceRecordId: string;
  nik?: string;
  fullName: string;
  birthDate: string;
  sex: 'MALE' | 'FEMALE';
  phone?: string;
  address?: string;
  villageCode?: string;
  villageName?: string;
  facilityCode?: string;
  facilityName?: string;
  screeningDate: string;
  venueType: VenueType;
  isComplete: boolean;
  results: NormalizedScreeningValue[];
}

export interface AuditEvent {
  id: string;
  actorUserId?: string;
  actorName?: string;
  actorRole?: RoleId;
  userId?: string;
  userName?: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId?: string;
  targetLabel?: string;
  description?: string;
  citizenId?: string;
  facilityId?: string;
  facilityName?: string;
  purposeCode?: string;
  rowCount?: number;
  filterCriteria?: string;
  occurredAt: string;
  details?: Record<string, any>;
  ipAddress?: string;
}

export type RuleVersionStatus = 'DRAFT' | 'REVIEW' | 'APPROVED' | 'PUBLISHED' | 'RETIRED';

export interface RuleVersion {
  id: string;
  version: string;
  status: RuleVersionStatus;
  sourceDocument: string;
  effectiveDate: string;
  publishedAt?: string;
  publishedBy?: string;
  approvedBy?: string;
  notes: string;
  rulesCount: number;
  checksum: string;
  createdAt: string;
  updatedAt: string;
}

export type SyncOperation = 'CREATE' | 'UPDATE' | 'DEACTIVATE' | 'REACTIVATE' | 'CONSENT';

export type SyncStatus = 'PENDING' | 'SYNCING' | 'SYNCED' | 'FAILED' | 'CONFLICT';

export interface OfflineQueueItem {
  id: string;
  idempotencyKey: string;
  entityType: AuditEntityType;
  operation: SyncOperation;
  payload: any;
  createdAt: string;
  retryCount: number;
  syncStatus: SyncStatus;
  errorMessage?: string;
  lastAttemptAt?: string;
}

export type NetworkMode = 'ONLINE' | 'OFFLINE' | 'SLOW';

export interface SystemSettings {
  appName: string;
  kabupaten: string;
  province: string;
  timezone: string;
  locale: string;
  networkMode: NetworkMode;
  simulatedLatencyMs: number;
  offlineQueueEnabled: boolean;
  version: string;
}

// ==========================================
// MVP 3: Risk Stratification & Next-Best-Action Engine Types
// ==========================================

export type ClinicalExecutionMode = 'SIMULATION' | 'APPROVED_PRODUCTION';

export type ClinicalRiskCategory =
  | 'GREEN'
  | 'YELLOW'
  | 'ORANGE'
  | 'RED'
  | 'DARK_RED'
  | 'UNDETERMINED';

export type JuknisCategory =
  | 'NORMAL_NO_RISK_FACTOR'
  | 'NORMAL_WITH_RISK_FACTOR'
  | 'PRE_DISEASE'
  | 'DISEASE_FPKTP_COMPETENCE'
  | 'DISEASE_REQUIRES_FKRTL';

export type ClinicalDomainCode = 'BP' | 'GD' | 'LP' | 'GZ' | 'PL';

export type DomainEvaluationStatus =
  | 'EVALUATED'
  | 'NOT_EVALUATED_MISSING_DATA'
  | 'NOT_EVALUATED_OPEN_RULE'
  | 'AWAITING_CONFIRMATION'
  | 'OUTSIDE_MVP_SCOPE';

export interface DomainEvaluationResult {
  domain: ClinicalDomainCode;
  domainName: string;
  status: DomainEvaluationStatus;
  category?: ClinicalRiskCategory;
  ruleCode?: string;
  ruleVersion: string;
  inputValues: Record<string, any>;
  reason?: string;
  openIssueCode?: string;
  requiresConfirmation?: boolean;
  initialValue?: string | number;
  repeatValue?: string | number;
}

export interface UndeterminedDomain {
  domain: ClinicalDomainCode;
  domainName: string;
  reason: string;
  openIssueCode?: string;
}

export interface RiskClassification {
  id: string;
  citizenId: string;
  citizenName?: string;
  citizenNik?: string;
  villageName?: string;
  facilityName?: string;
  facilityId?: string;
  sessionId?: string;
  screeningDate?: string;
  classificationStage: 'SCREENING' | 'CONFIRMED';
  finalCategory: ClinicalRiskCategory;
  juknisCategory: JuknisCategory;
  ruleVersion: string;
  isCritical: boolean;
  criticalRuleCode?: string;
  priorityScore: number;
  priorityComponents: {
    riskCategory: number;
    accompanyingFactors: number;
    daysSinceFinding: number;
    missedVisits: number;
    criticalFinding: number;
    accessibility?: number;
  };
  domainResults: DomainEvaluationResult[];
  undeterminedDomains: UndeterminedDomain[];
  clusterCode?: string;
  clusterLabel?: string;
  nextBestActions: NextBestAction[];
  
  // Clinician Override Tracking
  overriddenByUserId?: string;
  overriddenByUserName?: string;
  overrideRole?: RoleId;
  overridePreviousCategory?: ClinicalRiskCategory;
  overrideReason?: string;
  overrideNotes?: string;
  overriddenAt?: string;

  // Immutability trace
  supersededById?: string;
  createdAt: string;
}

export interface TriggeredRule {
  id: string;
  classificationId: string;
  citizenId: string;
  ruleCode: string;
  domain: ClinicalDomainCode;
  inputValues: Record<string, unknown>;
  resultingCategory: ClinicalRiskCategory;
  ruleVersion: string;
  isCritical?: boolean;
  createdAt: string;
}

export interface RiskCluster {
  id: string;
  citizenId: string;
  classificationId: string;
  clusterCode: string;
  domainCodes: ClinicalDomainCode[];
  label: string;
  createdAt: string;
}

export interface NextBestAction {
  id: string;
  citizenId: string;
  classificationId: string;
  actionType: string;
  actionText: string;
  suggestedRole: string;
  intervalValue?: number;
  intervalUnit?: string;
  sourceRuleCode: string;
  ruleVersion: string;
  status: 'PROPOSED' | 'BLOCKED_OPEN_RULE' | 'AWAITING_CONFIRMATION';
  blockReason?: string;
  openIssueCode?: string;
}

export interface ClinicalOpenIssue {
  code: string; // e.g. 'OI-01'
  domain: ClinicalDomainCode;
  title: string;
  description: string;
  status: 'OPEN' | 'RESOLVED';
  affectedRules: string[];
}

export interface RuleCondition {
  field: string;
  operator: 'GT' | 'GTE' | 'LT' | 'LTE' | 'EQ' | 'BETWEEN' | 'IN';
  value: any;
  secondaryValue?: any;
}

export interface RuleAction {
  actionType: string;
  actionText: string;
  suggestedRole: string;
  intervalValue?: number;
  intervalUnit?: string;
}

export interface ClinicalRuleDefinition {
  ruleCode: string;
  domain: ClinicalDomainCode;
  domainName: string;
  name: string;
  description: string;
  ageGroup?: string;
  minAge?: number;
  maxAge?: number;
  conditions: RuleCondition[];
  resultingCategory?: ClinicalRiskCategory;
  juknisCategory?: JuknisCategory;
  nextActions?: RuleAction[];
  critical?: boolean;
  requiresConfirmation?: boolean;
  status: 'ACTIVE' | 'OPEN' | 'DISABLED';
  openIssueCode?: string;
}

export interface ClinicalRulePackage {
  version: string;
  status: RuleVersionStatus;
  clinicalReviewStatus: 'NOT_REVIEWED' | 'REVIEWED';
  rules: ClinicalRuleDefinition[];
  openIssues: ClinicalOpenIssue[];
}

export interface PriorityWeightVersion {
  id: string;
  version: string;
  weights: {
    riskCategory: number;
    accompanyingFactors: number;
    daysSinceFinding: number;
    missedVisits: number;
    criticalFinding: number;
    accessibility?: number;
  };
  activeFrom: string;
  createdBy: string;
  status: Status;
  notes?: string;
}

export interface ClassificationBatch {
  id: string;
  ruleVersion: string;
  startedAt: string;
  completedAt?: string;
  total: number;
  completed: number;
  awaitingConfirmationCount: number;
  undeterminedCount: number;
  criticalCount: number;
  failed: number;
  status: 'QUEUED' | 'RUNNING' | 'SUCCESS' | 'PARTIAL_FAILED' | 'FAILED';
  errorMessage?: string;
}

export interface ClassificationReviewItem {
  id: string;
  citizenId: string;
  citizenName: string;
  citizenNik: string;
  villageName?: string;
  facilityName?: string;
  screeningDate: string;
  issueType:
    | 'OPEN_RULE_GAP'
    | 'UNRESOLVED_INPUT'
    | 'SOURCE_CORRECTION'
    | 'BMI_GAP'
    | 'CONFIRMATION_GAP'
    | 'INTEGRITY_ANOMALY';
  domain: ClinicalDomainCode;
  ruleVersion: string;
  description: string;
  rawValues: Record<string, any>;
  status: 'OPEN' | 'RESOLVED' | 'IGNORED';
  createdAt: string;
  resolvedAt?: string;
  resolvedByUserName?: string;
  resolutionNotes?: string;
}

/**
 * ============================================================================
 * MVP 4: CARE TASK ORCHESTRATION & ACTIVE OUTREACH TYPES
 * ============================================================================
 */

export type TaskType =
  | 'OUTREACH_CONTACT'
  | 'FIELD_VISIT'
  | 'SCHEDULE_VISIT'
  | 'CLINICAL_CONFIRMATION'
  | 'TREATMENT_INITIATION'
  | 'MEDICATION_RESUPPLY'
  | 'REFERRAL_CHASE'
  | 'MONITORING_CONTROL'
  | 'ADHERENCE_SUPPORT'
  | 'UKM_COUNSELING'
  | 'DATA_QUALITY_REVIEW'
  | 'MERGE_REVIEW'
  | 'SYNC_CONFLICT_REVIEW';

export type TaskStatus =
  | 'OPEN'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'CLOSED'
  | 'CANCELLED';

export interface CareTask {
  id: string;
  citizenId: string;
  citizenName?: string;
  citizenNik?: string;
  citizenPhone?: string;
  villageId?: string;
  villageName?: string;
  facilityId?: string;
  facilityName?: string;
  classificationId?: string;
  riskCategory?: ClinicalRiskCategory;
  isCritical?: boolean;
  priorityScore?: number;
  taskType: TaskType;
  actionText: string;
  sourceRuleCode?: string;
  ruleVersion?: string;
  suggestedRole?: string;
  dueAt: string; // ISO String calculated from clinical date + interval
  dueShiftedReason?: string;
  completionCriteria: string;
  status: TaskStatus;
  escalationLevel: 0 | 1 | 2;
  assignedToUserId?: string;
  assignedToUserName?: string;
  assignedToRole?: RoleId;
  assignedFacilityId?: string;
  assignedFacilityName?: string;
  assignedAt?: string;
  contactAttemptsCount: number;
  lastContactAttemptAt?: string;
  lastContactOutcome?: string;
  appointmentId?: string;
  nbaId?: string;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskAssignment {
  id: string;
  taskId: string;
  assignedToUserId?: string;
  assignedToUserName?: string;
  assignedToRole?: RoleId;
  assignedFacilityId?: string;
  assignedFacilityName?: string;
  assignedByUserId: string;
  assignedByUserName: string;
  assignedAt: string;
  reassignedAt?: string;
  reassignmentReason?: string;
  status: 'ACTIVE' | 'REASSIGNED' | 'COMPLETED';
}

export type OutreachChannel = 'WHATSAPP' | 'SMS' | 'PHONE' | 'KADER_VISIT' | 'FIELD_VISIT' | 'APP';

export type ContactOutcome =
  | 'CONNECTED_AGREED'
  | 'CONNECTED_DECLINED'
  | 'CONNECTED_POSTPONED'
  | 'NO_ANSWER'
  | 'NUMBER_INACTIVE'
  | 'WRONG_PERSON'
  | 'NOT_AT_HOME'
  | 'ADDRESS_NOT_FOUND';

export type DeclineDelayReason =
  | 'DISTANCE_TRANSPORT'
  | 'SERVICE_COST'
  | 'FEELS_HEALTHY'
  | 'NO_COMPANION'
  | 'FEAR_SHAME'
  | 'WORK_SCHEDULE'
  | 'UNAWARE'
  | 'MEDICATION_SIDE_EFFECT'
  | 'MEDICATION_UNAVAILABLE'
  | 'FORGOT'
  | 'OTHER';

export interface ContactAttempt {
  id: string;
  taskId: string;
  citizenId: string;
  citizenName?: string;
  channel: OutreachChannel;
  ladderStep: number;
  attemptedAt: string;
  attemptedByUserId?: string;
  attemptedByUserName?: string;
  outcome: ContactOutcome;
  declineReason?: DeclineDelayReason;
  deliveryFailed: boolean;
  deliveryStatus?: 'SENT' | 'DELIVERED' | 'FAILED' | 'READ';
  messageContent?: string;
  freeTextResponse?: string;
  flaggedForReview?: boolean;
  notes?: string;
}

export type AppointmentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'ATTENDED'
  | 'MISSED';

export interface Appointment {
  id: string;
  citizenId: string;
  citizenName?: string;
  citizenNik?: string;
  citizenPhone?: string;
  taskId?: string;
  facilityId: string;
  facilityName?: string;
  serviceType: string;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime?: string; // e.g. "08:00 - 10:00"
  status: AppointmentStatus;
  source: 'PUSKESMAS' | 'CITIZEN' | 'KADER';
  rescheduleReason?: string;
  cancelReason?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ServiceQuota {
  id: string;
  facilityId: string;
  facilityName?: string;
  serviceType: string;
  date: string; // YYYY-MM-DD
  capacity: number;
  bookedCount: number;
  active: boolean;
}

export interface WaitlistEntry {
  id: string;
  citizenId: string;
  citizenName: string;
  facilityId: string;
  serviceType: string;
  priorityScore: number;
  isCritical: boolean;
  requestedDate: string;
  taskId?: string;
  status: 'WAITING' | 'OFFERED' | 'FULFILLED' | 'CANCELLED';
  createdAt: string;
}

export interface OutreachStep {
  order: number;
  channel: OutreachChannel;
  delayValue: number;
  delayUnit: 'WORKING_DAY' | 'CALENDAR_DAY';
  automated: boolean;
}

export interface OutreachLadderVersion {
  id: string;
  version: string;
  activeFrom: string;
  steps: OutreachStep[];
  createdBy: string;
  createdByName?: string;
  changeReason: string;
  status: Status;
}

export interface TaskClosure {
  id: string;
  taskId: string;
  citizenId: string;
  closureType: 'EVIDENCE_BASED' | 'MANUAL';
  evidenceType?: 'ATTENDANCE' | 'FIELD_VISIT' | 'CLINICAL_RECORD';
  evidenceRefId?: string;
  manualReason?: string;
  closedByUserId: string;
  closedByUserName?: string;
  closedAt: string;
}

export type CascadeStatus =
  | 'STRATIFIED'
  | 'QUEUED'
  | 'CONTACTED'
  | 'CONTACT_RETRIED'
  | 'CONTACT_ATTEMPTED'
  | 'ASSIGNED_OUTREACH'
  | 'SCHEDULED'
  | 'LOST_TO_FOLLOWUP'
  | 'REFUSED'
  | 'MOVED'
  | 'DECEASED';

export interface CitizenCareJourneyEvent {
  id: string;
  citizenId: string;
  stage: string;
  title: string;
  description: string;
  timestamp: string;
  actorName?: string;
  refType?: string;
  refId?: string;
}

export interface DropoutCandidate {
  id: string;
  citizenId: string;
  citizenName: string;
  citizenNik?: string;
  citizenPhone?: string;
  villageName?: string;
  facilityId: string;
  facilityName: string;
  cascadeStatus: CascadeStatus;
  lastContactAt?: string;
  contactAttemptsCount: number;
  missedAppointmentsCount: number;
  hasHumanContactAttempt: boolean;
  reasonPattern: string;
  currentTaskId?: string;
  currentTaskType?: TaskType;
  priorityScore: number;
  isCritical: boolean;
  candidateSince: string;
}

export interface MessageTemplate {
  id: string;
  code: string;
  title: string;
  channel: OutreachChannel;
  templateText: string;
  requiredVariables: string[];
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'RETIRED';
  version: string;
}

// ==========================================
// MVP 5: KADER FIELD APP (OFFLINE-FIRST PWA)
// ==========================================

export interface OfflineKaderSession {
  userId: string;
  villageId: string;
  villageName?: string;
  packageId?: string;
  sessionIssuedAt: string;
  sessionExpiresAt: string;
  offlineAllowed: boolean;
}

export interface KaderAssignmentPayload {
  taskId: string;
  citizenId: string;
  citizenName: string;
  age?: number;
  sex?: 'L' | 'P';
  villageName: string;
  addressText: string;
  actionText: string;
  dueAt: string; // ISO string
  facilityName: string;
  serviceDays?: string[];
  routeNote?: string;
  previousFieldVisitSummary?: string;
  urgentOperationalFlag?: boolean;
  serverPriorityOrder: number;
  dusunOrHamlet?: string;
}

export interface FieldWorkPackage {
  id: string;
  assignedUserId: string;
  villageId: string;
  villageName: string;
  downloadedAt: string;
  expiresAt: string;
  ruleVersion: string;
  payloadSizeBytes: number;
  assignmentCount: number;
  purgedAt?: string;
  assignments: KaderAssignmentPayload[];
}

export type FieldVisitOutcome =
  | 'AGREED_TO_ATTEND'
  | 'DECLINED'
  | 'POSTPONED'
  | 'NOT_AT_HOME'
  | 'MOVED_AWAY'
  | 'DECEASED'
  | 'ADDRESS_NOT_FOUND';

export type FieldVisitSyncStatus =
  | 'PENDING'
  | 'SYNCING'
  | 'SYNCED'
  | 'FAILED'
  | 'CONFLICT';

export interface FieldVisit {
  id: string; // UUID - Idempotency key
  packageId: string;
  taskId: string;
  citizenId: string;
  citizenName?: string;
  userId: string;
  userName?: string;
  outcome: FieldVisitOutcome;
  declineReasons?: DeclineDelayReason[];
  dangerSignFlagged: boolean;
  deviceRecordedAt: string;
  serverReceivedAt?: string;
  clockSkewFlagged: boolean;
  notes?: string;
  syncStatus: FieldVisitSyncStatus;
  syncError?: string;
}

export interface OfflineSchedulingRequest {
  id: string; // UUID
  taskId: string;
  citizenId: string;
  citizenName?: string;
  preferredFacilityId: string;
  preferredFacilityName?: string;
  preferredServiceType: string;
  preferredDate?: string;
  cachedSlotId?: string;
  deviceRecordedAt: string;
  serverReceivedAt?: string;
  syncStatus: FieldVisitSyncStatus;
  syncError?: string;
}

export interface UrgentFieldEscalation {
  id: string; // UUID
  taskId: string;
  citizenId: string;
  citizenName?: string;
  fieldVisitId?: string;
  observations: string[];
  notes?: string;
  deviceRecordedAt: string;
  serverReceivedAt?: string;
  syncPriority: 'HIGHEST';
  syncStatus: FieldVisitSyncStatus;
  syncError?: string;
}

export interface KaderAssignmentResponse {
  id: string;
  taskId: string;
  userId: string;
  citizenId: string;
  citizenName: string;
  response: 'ACCEPTED' | 'REJECTED';
  rejectionReason?: string;
  respondedAt: string;
  syncStatus: FieldVisitSyncStatus;
}

export type LocalQueueEntityType =
  | 'FIELD_VISIT'
  | 'SCHEDULING_REQUEST'
  | 'URGENT_ESCALATION'
  | 'ASSIGNMENT_RESPONSE';

export interface LocalQueueItem {
  id: string;
  userId: string;
  entityType: LocalQueueEntityType;
  payload: any;
  createdAt: string;
  syncPriority: 'NORMAL' | 'HIGH' | 'HIGHEST';
  retryCount: number;
  syncStatus: FieldVisitSyncStatus;
  lastError?: string;
}

export interface SyncConflict {
  id: string;
  queueItemId: string;
  conflictType:
    | 'DUPLICATE_ASSIGNMENT'
    | 'STALE_APPOINTMENT_SLOT'
    | 'TASK_CANCELLED'
    | 'CITIZEN_MOVED'
    | 'SERVER_STATE_CHANGED'
    | 'OTHER';
  serverSummary: string;
  localSummary: string;
  resolutionState:
    | 'AUTO_RESOLVED'
    | 'NEEDS_SERVER_REVIEW'
    | 'NEEDS_KADER_ACTION'
    | 'RESOLVED';
  occurredAt: string;
}

export interface KaderDeviceState {
  simulatedStorageMode: 'NORMAL' | 'NEARLY_FULL' | 'FULL';
  simulatedClockSkewMinutes: number;
  lastSyncBytesUsed: number;
  totalSyncBytesUsed: number;
  dangerSignGuidanceStatus: 'CLINICALLY_APPROVED' | 'PENDING_REVIEW';
  packageValidityDays: number;
}

// ==========================================
// MVP 6: CLINICAL FOLLOW-UP & CLOSED-LOOP RESOLUTION
// ==========================================

export type EncounterType =
  | 'CKG_CONFIRMATORY'
  | 'ROUTINE_CONTROL'
  | 'URGENT_TRIAGE'
  | 'POST_HOSPITAL'
  | 'SPECIALIST_CONSULT';

export type ClinicianRole =
  | 'DOKTER_PUSKESMAS'
  | 'PERAWAT_PUSKESMAS'
  | 'ANALIS_LAB'
  | 'DOKTER_SPESIALIS';

export type UrineProteinLevel =
  | 'NEGATIVE'
  | 'TRACE'
  | '1_PLUS'
  | '2_PLUS'
  | '3_PLUS'
  | '4_PLUS';

export type EcgFinding =
  | 'NORMAL'
  | 'SINUS_BRADYCARDIA'
  | 'SINUS_TACHYCARDIA'
  | 'LVH'
  | 'ISCHEMIA'
  | 'INFARCT'
  | 'ARRHYTHMIA'
  | 'OTHER';

export type ClinicalSeverity = 'MILD' | 'MODERATE' | 'SEVERE' | 'CRITICAL';

export interface DiagnosisItem {
  code: string; // ICD-10 e.g. "I10"
  name: string; // e.g. "Essential (primary) hypertension"
  isChronic: boolean;
  notes?: string;
}

export interface PrescriptionItem {
  id: string;
  drugName: string;
  dosage: string; // e.g. "5 mg"
  frequency: string; // e.g. "1 x 1 tablet pagi sesudah makan"
  route: 'ORAL' | 'INJECTION' | 'TOPICAL' | 'OTHER';
  durationDays: number;
  quantity: number;
  instructions?: string;
}

export type ReferralSpecialty =
  | 'SPESIALIS_PENYAKIT_DALAM'
  | 'SPESIALIS_JANTUNG'
  | 'SPESIALIS_SARAF'
  | 'SPESIALIS_MATA'
  | 'SPESIALIS_BEDAH'
  | 'SPESIALIS_KANDUNGAN'
  | 'SPESIALIS_ANAK';

export type ReferralUrgency = 'ROUTINE' | 'URGENT_24H' | 'EMERGENCY_IMMEDIATE';

export type ReferralStatus =
  | 'DRAFT'
  | 'SENT'
  | 'RECEIVED_BY_RSUD'
  | 'CONSULTED'
  | 'RETURNED_TO_PUSKESMAS' // PRB (Program Rujuk Balik)
  | 'REJECTED';

// IS-CKG §4 (INT-05): three interaction-maturity tiers for the RSUD/FKRTL side, since no
// hospital-side application exists — this is what the platform can actually observe about
// how a reply arrived, not a guarantee about what the hospital did internally.
export type ReferralReplyChannel =
  | 'MANUAL_LETTER' // Tingkat 1 — wajib sejak awal pilot: surat balasan dipindai & diunggah manual
  | 'DIGITAL_ASSISTED' // Tingkat 2 — kanal digital disepakati (WA/email/portal), dicatat petugas
  | 'SYSTEM_TO_SYSTEM'; // Tingkat 3 — belum untuk pilot: pertukaran otomatis dengan SIMRS RSUD

export interface HospitalReferral {
  id: string; // REF-2026-XXXX
  referralLetterNumber: string;
  citizenId: string;
  citizenName: string;
  citizenNik: string;
  citizenPhone?: string;
  citizenBirthDate?: string;
  citizenAge?: number;
  citizenSex?: 'MALE' | 'FEMALE';
  citizenAddress?: string;
  originFacilityId: string;
  originFacilityName: string;
  targetHospitalId: string;
  targetHospitalName: string; // e.g. "RSUD Bobong Kabupaten Pulau Taliabu"
  specialty: ReferralSpecialty;
  urgency: ReferralUrgency;
  primaryDiagnosis: DiagnosisItem;
  secondaryDiagnoses: DiagnosisItem[];
  clinicalAnamnesis: string;
  vitalSignsSummary: string;
  labFindingsSummary: string;
  initialTherapyGiven: string;
  reasonForReferral: string;
  transportConsiderations?: string; // Sea ambulance / speedboat requirement in Taliabu
  doctorName: string;
  doctorSip: string;
  status: ReferralStatus;
  issuedAt: string;
  scheduledConsultDate?: string;
  rsudResponseNote?: string;
  // How the RSUD/FKRTL reply actually arrived — IS-CKG's 3 interaction-maturity tiers
  // (Tingkat 1 wajib sejak awal pilot; Tingkat 3 belum untuk pilot).
  replyChannel?: ReferralReplyChannel;
  rsudConsultedAt?: string;
  rsudConsultantName?: string;
  prbFeedbackNote?: string;
  prbMedicationRegimen?: string;
  taskId?: string;
  encounterId?: string;
  createdAt: string;
  updatedAt: string;
}

export type ProlanisProgramType = 'PROLANIS_HT' | 'PROLANIS_DM' | 'PROLANIS_COMBO';

export interface ProlanisEnrollment {
  id: string;
  citizenId: string;
  citizenName: string;
  citizenNik: string;
  citizenPhone?: string;
  villageName: string;
  facilityId: string;
  facilityName: string;
  programType: ProlanisProgramType;
  prolanisCardNumber: string;
  enrolledAt: string;
  enrolledByUserName: string;
  baselineSystolicBp?: number;
  baselineDiastolicBp?: number;
  baselineFastingBloodGlucose?: number;
  baselineHba1c?: number;
  targetSystolicBp: number;
  targetDiastolicBp: number;
  targetFastingGlucose: number;
  lastControlDate?: string;
  nextScheduledControlDate: string;
  adherenceRatePercent: number;
  status: 'ACTIVE' | 'GRADUATED_CONTROLLED' | 'TRANSFERRED' | 'INACTIVE';
  monthlyVisitsCount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type ResolutionOutcome =
  | 'CONFIRMED_CONTROLLED'
  | 'CONFIRMED_THERAPY_INITIATED'
  | 'REFERRED_TO_SPECIALIST'
  | 'FALSE_POSITIVE_NORMAL'
  | 'REFUSED_THERAPY';

export interface ClinicalEncounter {
  id: string; // ENC-2026-XXXX
  citizenId: string;
  citizenName: string;
  citizenNik: string;
  citizenPhone?: string;
  citizenAge?: number;
  citizenSex?: 'MALE' | 'FEMALE';
  villageName?: string;
  facilityId: string;
  facilityName: string;
  taskId?: string; // Connected CareTask ID
  appointmentId?: string;
  encounterDate: string; // ISO
  encounterType: EncounterType;
  examinerUserId: string;
  examinerName: string;
  examinerRole: ClinicianRole;
  examinerSip: string; // STR/SIP license number
  
  // Subjective / Anamnesis
  chiefComplaint: string;
  historyOfPresentIllness: string;
  pastMedicalHistory: string[];
  currentMedicationsText?: string;
  allergyHistory?: string;
  lifestyleFactors?: {
    smoking: boolean;
    highSaltDiet: boolean;
    sedentary: boolean;
    alcohol: boolean;
  };

  // Objective / Physical Exam
  systolicBp: number;
  diastolicBp: number;
  repeatSystolicBp?: number;
  repeatDiastolicBp?: number;
  heartRate: number;
  respiratoryRate: number;
  temperature: number;
  weightKg: number;
  heightCm: number;
  bmi: number;
  waistCircumferenceCm?: number;
  physicalExamFindings?: string;

  // Objective / Confirmatory Lab
  fastingBloodGlucose?: number; // GDP (mg/dL)
  randomBloodGlucose?: number; // GDS (mg/dL)
  postPrandialGlucose?: number; // GD2PP (mg/dL)
  hba1c?: number; // %
  totalCholesterol?: number; // mg/dL
  triglycerides?: number; // mg/dL
  hdlCholesterol?: number; // mg/dL
  ldlCholesterol?: number; // mg/dL
  uricAcid?: number; // mg/dL
  serumCreatinine?: number; // mg/dL
  egfr?: number; // mL/min/1.73m²
  urineProtein?: UrineProteinLevel;
  ecgFinding?: EcgFinding;
  labNotes?: string;

  // Assessment / Diagnoses
  primaryDiagnosis: DiagnosisItem;
  secondaryDiagnoses: DiagnosisItem[];
  clinicalSeverity: ClinicalSeverity;
  clinicalAssessmentSummary: string;

  // Plan / Therapy & Interventions
  prescriptions: PrescriptionItem[];
  nonPharmacologicalAdvice: string[];
  
  // Program & Referral
  enrolledInProlanis: boolean;
  prolanisProgramType?: ProlanisProgramType;
  prolanisEnrollmentId?: string;

  referredToHospital: boolean;
  hospitalReferralId?: string;
  referralDetails?: {
    targetHospital: string;
    specialty: ReferralSpecialty;
    urgency: ReferralUrgency;
    referralLetterNumber: string;
  };

  // Follow-up & Closed Loop
  nextControlDate?: string;
  resolutionOutcome: ResolutionOutcome;
  closedLoopNotes: string;
  linkedFieldVisitId?: string; // Evidence from Kader MVP 5

  createdAt: string;
  updatedAt: string;
}

export interface ClosedLoopResolutionAudit {
  taskId: string;
  citizenId: string;
  citizenName: string;
  sourceScreeningDate: string;
  initialRiskCategory: ClinicalRiskCategory;
  fieldOutreachDate?: string;
  fieldKaderName?: string;
  fieldVisitOutcome?: string;
  clinicalEncounterDate: string;
  doctorName: string;
  confirmedDiagnosis: string;
  resolutionOutcome: ResolutionOutcome;
  resolvedAt: string;
  daysToResolution: number;
  prolanisStatus?: string;
  referralHospitalName?: string;
}

// ==========================================
// MVP 7: CITIZEN COMPANION APP TYPES
// ==========================================

export type SharedBarrierReason =
  | 'DISTANCE_TRANSPORT'
  | 'SERVICE_COST'
  | 'NO_COMPANION'
  | 'WORK_SCHEDULE'
  | 'FEELS_HEALTHY'
  | 'FEAR_SHAME'
  | 'UNAWARE'
  | 'OTHER';

export interface CitizenOtpChallenge {
  id: string;
  phone: string;
  createdAt: string;
  expiresAt: string;
  verifiedAt?: string;
  attemptCount: number;
  status: 'PENDING' | 'VERIFIED' | 'EXPIRED' | 'BLOCKED';
  code: string; // for mock demo verification
}

export interface CitizenActionViewModel {
  taskId: string;
  title: string;
  description: string;
  dueText: string;
  dueAt: string;
  facilityName?: string;
  locationText?: string;
  preparationItems?: string[];
  primaryAction:
    | 'SCHEDULE'
    | 'CONFIRM'
    | 'RESCHEDULE'
    | 'CONTACT_FACILITY'
    | 'WAIT'
    | 'VIEW_APPOINTMENT';
}

export interface CitizenAppointmentViewModel {
  id: string;
  taskId: string;
  facilityId: string;
  facilityName: string;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTimeSlot: string; // e.g. "08:30 - 10:00 WIT"
  serviceName: string;
  status: 'CONFIRMED' | 'RESCHEDULED' | 'CANCELLED' | 'ATTENDED';
  preparationNotes?: string[];
  transportNote?: string;
  facilityPhone?: string;
  facilityAddress?: string;
}

export interface CitizenHealthValueDTO {
  label: string;
  value: string | number;
  unit?: string;
  measuredAt: string;
  sourceLabel: string;
  confirmationState: 'CONFIRMED' | 'UNCONFIRMED';
  note?: string;
}

export interface CitizenCompanionProfileDTO {
  citizenId: string;
  displayName: string;
  phone: string;
  nikMasked?: string;
  facilityId: string;
  facilityName: string;
  villageName: string;
  followUpStatusText: string;
  statusTimelineStep: number; // 1 to 5
  nextAction?: CitizenActionViewModel;
  secondaryActions?: CitizenActionViewModel[];
  appointment?: CitizenAppointmentViewModel;
  lastUpdatedAt: string;
  availableDetailSections: string[];
  optOutMessaging?: boolean;
  hasConsent: boolean;
  consentVersion?: string;
  consentGrantedAt?: string;
}

export interface CitizenResponseToken {
  id: string;
  citizenId: string;
  taskId?: string;
  appointmentId?: string;
  purpose: 'CONFIRM_ATTENDANCE' | 'RESCHEDULE' | 'REPORT_BARRIER';
  expiresAt: string;
  consumedAt?: string;
}

export interface CitizenHelpRequest {
  id: string;
  citizenId: string;
  citizenName: string;
  citizenPhone?: string;
  facilityId: string;
  facilityName: string;
  preferredChannel: 'PHONE' | 'MESSAGE' | 'KADER';
  category: 'SCHEDULING' | 'TRANSPORT' | 'ACCESS' | 'GENERAL_FOLLOW_UP' | 'OTHER';
  citizenMessage?: string;
  urgencyScreened: boolean;
  isEmergencyWarningShown?: boolean;
  createdAt: string;
  status: 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED';
  resolvedByUserName?: string;
  resolutionNotes?: string;
}

export interface CitizenBarrierReport {
  id: string;
  citizenId: string;
  citizenName?: string;
  facilityId?: string;
  facilityName?: string;
  taskId?: string;
  appointmentId?: string;
  barriers: SharedBarrierReason[];
  notes?: string;
  reportedAt: string;
  status: 'RECEIVED_BY_PUSKESMAS' | 'REVIEWED' | 'ACTIONED';
}

export interface CitizenOfflineCacheData {
  profile: CitizenCompanionProfileDTO;
  values: CitizenHealthValueDTO[];
  facilityInfo: {
    id: string;
    name: string;
    address: string;
    phone: string;
    serviceDays: string;
    serviceHours: string;
    whatToBring: string[];
    transportNotes: string;
  };
  cachedAt: string;
}

// ==========================================
// MVP 8: OUTCOME MONITORING & CONTROL STATUS
// ==========================================

export type ControlEvaluationMode = 'BLOCKED_OI_08' | 'APPROVED_CR_OC';

export type ControlStatus = 'CONTROLLED' | 'NOT_CONTROLLED' | 'NOT_YET_ASSESSABLE';

export type MonitoringCycleStatus =
  | 'PLANNED'
  | 'ACTIVE'
  | 'AWAITING_CONTROL'
  | 'AWAITING_MEASUREMENT'
  | 'AWAITING_EVALUATION'
  | 'COMPLETED'
  | 'INTERRUPTED'
  | 'AT_RISK_DROPOUT';

export interface MonitoringCycle {
  id: string; // MC-2026-XXXX
  citizenId: string;
  citizenName: string;
  citizenNik: string;
  citizenPhone?: string;
  facilityId: string;
  facilityName: string;
  villageName: string;
  condition: string; // e.g. "Hipertensi Derajat 1 (I10)", "Diabetes Mellitus Tipe 2 (E11)", "Prediabetes"
  cycleNumber: number; // 1, 2, 3...
  plannedControlAt: string; // ISO YYYY-MM-DD
  actualControlAt?: string;
  intervalSourceRule: string; // e.g. "CR-IV-01 (Interval 30 Hari Kontrol Rutin Puskesmas)"
  cycleStatus: MonitoringCycleStatus;
  requiredParameters: string[]; // e.g. ["Tekanan Darah (CR-KF-01)", "Kepatuhan Minum Obat"]
  treatmentPlanId?: string;
  encounterId?: string;
  appointmentId?: string;
  taskId?: string;
  adherenceAssessmentId?: string;
  outcomeEvaluationId?: string;
  dropoutRiskFlagged?: boolean;
  missedControlDays?: number;
  estimatedRunoutDate?: string;
  isContinuingFkrtl?: boolean; // PRB / Specialist care in RSUD Bobong
  transferredFromVillage?: string;
  notes?: string;
  createdAt: string;
  completedAt?: string;
  updatedAt?: string;
}

export type AdherenceLevel = 'REGULAR' | 'PARTIAL' | 'IRREGULAR' | 'NOT_ASSESSABLE';

export type AdherenceEvidenceStrength = 'STRONG' | 'MODERATE' | 'LIMITED' | 'UNKNOWN';

export type CauseProvenance = 'CLINICIAN' | 'CITIZEN' | 'KADER' | 'SYSTEM_CONTEXT';

export type ExtendedBarrierCause =
  | SharedBarrierReason
  | 'MEDICATION_SIDE_EFFECT'
  | 'MEDICATION_UNAVAILABLE'
  | 'FORGOT'
  | 'DOSE_CONFUSION'
  | 'SUPPLY_EXHAUSTED'
  | 'FEELS_HEALTHY'
  | 'DISTANCE_TRANSPORT'
  | 'SERVICE_COST';

export interface NonAdherenceCause {
  id: string;
  assessmentId: string;
  cycleId?: string;
  citizenId?: string;
  causeCode: ExtendedBarrierCause;
  causeLabel: string;
  reportedVia: CauseProvenance;
  reportedByUserName?: string;
  clinicalNotes?: string;
  suggestedInterventionCategory: 'CLINICAL' | 'COMMUNITY' | 'SYSTEM_SUPPLY' | 'SUPPORT';
  createdAt: string;
}

export interface AdherenceAssessment {
  id: string; // ADH-2026-XXXX
  cycleId: string;
  citizenId: string;
  citizenName?: string;
  adherenceLevel: AdherenceLevel;
  evidenceStrength: AdherenceEvidenceStrength;
  assessedByUserId?: string;
  assessedByUserName?: string;
  assessedAt: string;
  systemContextFlags?: string[]; // e.g. ["OBAT_TIDAK_TERSEDIA_DI_FASKES"]
  notes?: string;
  causes: NonAdherenceCause[];
}

export interface OutcomeEvaluation {
  id: string; // OUT-2026-XXXX
  cycleId: string;
  citizenId: string;
  citizenName?: string;
  controlStatus: ControlStatus;
  evaluationMode: ControlEvaluationMode;
  governanceNotice?: string; // e.g. "OI-08: Kriteria numerik CR-OC belum diverifikasi dalam rule package aktif. Status evaluasi otomatis diatur Belum Dapat Dinilai."
  currentObservationId?: string;
  currentObservationSummary?: string;
  comparatorObservationId?: string;
  comparatorObservationSummary?: string;
  ruleVersion?: string;
  isManualDetermination: boolean;
  determinedManuallyBy?: string;
  determinedManuallyRole?: string;
  manualReason?: string;
  supportingEvidence?: string;
  abnormalImprovementFlag?: boolean;
  createdAt: string;
  supersededById?: string;
}

export interface MonitoringGapItem {
  citizenId: string;
  citizenName: string;
  citizenNik?: string;
  facilityId: string;
  facilityName: string;
  villageName: string;
  lastClinicalEvent?: string;
  lastCycleNumber?: number;
  lastAppointmentDate?: string;
  currentStatus: string;
  gapReason: string;
  recommendedAction: string;
  detectedAt: string;
}

export interface ConditionCohortSummary {
  conditionId: string;
  conditionName: string;
  totalInTreatment: number;
  activeMonitoringCount: number;
  dueThisWeekCount: number;
  missedControlCount: number;
  atRiskDropoutCount: number;
  notYetAssessableCount: number;
  controlledCount: number;
  notControlledCount: number;
  averageCycleNumber: number;
  cyclesDistribution: Record<number, number>;
}

export interface OutcomeTrendPoint {
  cycleNumber: number;
  cycleDate: string;
  encounterDate?: string;
  systolicBp?: number;
  diastolicBp?: number;
  bloodGlucose?: number;
  adherenceLevel: AdherenceLevel;
  interventionSummary?: string;
  treatmentAdjustmentSummary?: string;
  controlStatus: ControlStatus;
  isManual: boolean;
  missedVisit?: boolean;
}

/**
 * MVP 9 — POPULATION HEALTH COMMAND CENTER & EXECUTIVE DECISION LAYER
 */

export type MetricCompleteness = 'COMPLETE' | 'PARTIAL' | 'NOT_ASSESSABLE' | 'STALE';

export interface QualifiedMetric {
  metricCode: string;
  label: string;
  numerator?: number;
  denominator?: number;
  value?: number;
  percentage?: number;
  periodStart: string;
  periodEnd: string;
  dataCutoffAt: string;
  definitionVersion: string;
  completeness: MetricCompleteness;
  qualificationMessages: string[];
  suppressed: boolean;
  suppressionReason?: string;
}

export interface MetricDefinition {
  metricCode: string;
  label: string;
  category: 'IMPACT_INDEX' | 'CASCADE' | 'QUALITY' | 'OPERATIONAL' | 'BARRIER';
  numeratorDefinition: string;
  denominatorDefinition: string;
  inclusionCriteria: string;
  exclusionCriteria: string;
  dataSource: string;
  version: string;
  updatedAt: string;
}

export type FacilityReportingStatus = 'REPORTING_COMPLETE' | 'REPORTING_PARTIAL' | 'STALE' | 'NOT_REPORTING';

export interface PopulationDataCompleteness {
  facilityId: string;
  facilityName: string;
  kecamatanName: string;
  reportingStatus: FacilityReportingStatus;
  lastIngestionAt?: string;
  lastOperationalUpdateAt?: string;
  pendingKaderSyncCount: number;
  dqQueueCount: number;
  notes?: string;
  impactOnMetrics?: string;
}

export interface PopulationDashboardSnapshot {
  id: string;
  periodStart: string;
  periodEnd: string;
  dataCutoffAt: string;
  metricDefinitionVersion: string;
  ruleVersions: string[];
  sourceCompleteness: PopulationDataCompleteness[];
  generatedAt: string;
}

export interface CascadePresentationStage {
  stageId: string;
  code: string;
  label: string;
  count: number;
  denominator?: number;
  percentage?: number;
  shrinkageCount?: number;
  shrinkagePercentage?: number;
  isLargestDrop?: boolean;
  description: string;
}

export interface CascadeExits {
  lostToFollowUp: number;
  refused: number;
  moved: number;
  deceased: number;
  totalExits: number;
}

export interface CascadeAggregation {
  stages: CascadePresentationStage[];
  awaitingConfirmationCount: number;
  exits: CascadeExits;
  manualTaskClosureCount: number;
  manualTaskClosureRatio: number; // Sinyal penutupan tugas manual
  qualificationMessages: string[];
  dataCutoffAt: string;
}

export interface DrilldownPurposeDefinition {
  id: string;
  code: string;
  label: string;
  description: string;
  allowedRoles: RoleId[];
}

export interface DrilldownRequest {
  purposeCode: string;
  purposeLabel: string;
  filterCriteria: Record<string, any>;
  targetContext: string;
}

export interface PopulationAttentionSignal {
  id: string;
  targetFacilityId: string;
  targetFacilityName: string;
  gapType: 'CAPACITY_GAP' | 'CITIZEN_ACCESS_GAP' | 'FOLLOW_UP_DELAY';
  affectedCount: number;
  period: string;
  message: string;
  createdAt: string;
  createdByUserName: string;
  status: 'SENT' | 'ACKNOWLEDGED' | 'RESOLVED';
}

export interface SmallCellSuppressionPolicy {
  status: 'UNCONFIGURED' | 'APPROVED';
  threshold?: number; // DS-OI-06 configurable (e.g. 5)
  rationale: string;
}

export type PopulationPhase = 'PHASE_1' | 'PILOT_PHASE_2';

export interface PopulationIntervention {
  id: string;
  title: string;
  description: string;
  targetRegionId: string;
  targetRegionName: string;
  ownerUserId: string;
  ownerUserName: string;
  startDate: string;
  dueDate: string;
  sourceMetricCode: string;
  sourceMetricLabel: string;
  successMetricCode: string;
  successMetricLabel: string;
  baselineSnapshotId?: string;
  baselineValueSummary: string;
  currentValueSummary?: string;
  status: 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  progressNotes: { id: string; timestamp: string; authorName: string; note: string }[];
  createdByUserId: string;
  createdAt: string;
  completedAt?: string;
}

export interface FacilityPerformanceSummary {
  facilityId: string;
  facilityName: string;
  kecamatanName: string;
  isRemoteIsland: boolean;
  accessibilityContext: string;
  screenedCount: number;
  eligibleFollowUpCount: number;
  attendedFollowUpCount: number;
  continuityRate: number;
  manualClosureCount: number;
  manualClosureRatio: number;
  dataCompleteness: 'COMPLETE' | 'PARTIAL' | 'STALE';
  pendingKaderSyncCount: number;
  topBarriers: { causeCode: string; count: number }[];
  notes: string[];
}

export interface PopulationBarrierSummary {
  causeCode: string;
  causeLabel: string;
  category: 'COMMUNITY' | 'CLINICAL' | 'SYSTEM_SUPPLY';
  reportedCount: number;
  totalAssessments: number;
  percentage: number;
  suppressed: boolean;
  reportingFacilities: string[];
}

export interface PopulationGapItem {
  id: string;
  citizenId: string;
  citizenName?: string;
  citizenNik?: string;
  facilityId: string;
  facilityName: string;
  kecamatanName: string;
  villageName: string;
  cascadeStage: string;
  gapCategory: 'CAPACITY_GAP' | 'CITIZEN_ACCESS_GAP';
  daysStuck: number;
  primaryBarrier?: string;
  lastOperationalEvent: string;
  recommendedDinkesAttention: string;
}

export interface PeriodComparisonResult {
  periodA: {
    label: string;
    start: string;
    end: string;
    metric: QualifiedMetric;
    completeness: string;
  };
  periodB: {
    label: string;
    start: string;
    end: string;
    metric: QualifiedMetric;
    completeness: string;
  };
  absoluteChange: number;
  percentagePointChange?: number;
  denominatorChanged: boolean;
  definitionChanged: boolean;
  notes: string[];
}

// ==========================================
// MVP 10: ADVANCED AI, PREDICTIVE INTELLIGENCE & DIGITAL TWIN
// ==========================================

export type AIIntelligenceMode = 'OFF' | 'SHADOW' | 'GOVERNED_ACTIVE';
export type ModelLifecycleStatus = 'DRAFT' | 'VALIDATING' | 'SHADOW' | 'ACTIVE' | 'PAUSED' | 'RETIRED';
export type PredictionLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'NOT_PREDICTABLE';
export type ScenarioSimulationMode = 'OFF' | 'RESEARCH_SIMULATION' | 'GOVERNED_POPULATION_SIMULATION';

export interface AIModelDefinition {
  id: string;
  modelCode: string;
  modelName: string;
  purpose:
    | 'DROPOUT_RISK'
    | 'PREVENTION_PRIORITY'
    | 'POPULATION_BURDEN'
    | 'LEARNED_CLUSTER'
    | 'ADHERENCE_PATTERN';
  version: string;
  lifecycleStatus: ModelLifecycleStatus;
  trainingPeriodStart?: string;
  trainingPeriodEnd?: string;
  trainingPopulationDescription: string;
  intendedUse: string;
  prohibitedUses: string[];
  knownLimitations: string[];
  minimumDataRequirements: string[];
  reviewDueAt?: string;
  activatedAt?: string;
  activatedByUserId?: string;
  disabledAt?: string;
  disabledByUserId?: string;
  disableReason?: string;
  createdAt: string;
}

export interface ModelTrainingSnapshot {
  id: string;
  modelId: string;
  periodStart: string;
  periodEnd: string;
  populationSize: number;
  featureSchemaVersion: string;
  datasetDefinitionVersion: string;
  exclusionCriteria: string[];
  extraordinaryPeriodsExcluded: string[];
  createdAt: string;
}

export interface PredictionFactor {
  featureCode: string;
  displayLabel: string;
  contributionDirection: 'INCREASES' | 'DECREASES' | 'NEUTRAL';
  explanationText: string;
}

export interface PredictionUncertainty {
  confidenceInterval: string;
  entropyScore?: number;
  dataQualityPenalty?: number;
}

export interface ModelPrediction {
  id: string;
  modelId: string;
  modelVersion: string;
  citizenId?: string;
  regionId?: string;
  predictionType:
    | 'DROPOUT_RISK'
    | 'PREVENTION_PRIORITY'
    | 'POPULATION_BURDEN'
    | 'LEARNED_CLUSTER'
    | 'ADHERENCE_PATTERN';
  predictionLevel: PredictionLevel;
  generatedAt: string;
  featureSnapshotId: string;
  topFactors: PredictionFactor[];
  uncertainty?: PredictionUncertainty;
  actualOutcome?: string;
  actualOutcomeAt?: string;
  modelMode: 'SHADOW' | 'ACTIVE';
}

export interface ModelFeatureDefinition {
  featureCode: string;
  label: string;
  dataSource: string;
  sensitivityLevel: 'PUBLIC' | 'OPERATIONAL' | 'SENSITIVE' | 'RESTRICTED';
  approvedForModels: string[];
  purposeJustification: string;
  enabled: boolean;
  introducedAt: string;
}

export interface PopulationForecast {
  id: string;
  modelId: string;
  modelVersion: string;
  regionId: string;
  regionName: string;
  metricCode: string;
  metricLabel: string;
  forecastPeriodStart: string;
  forecastPeriodEnd: string;
  pointEstimate: number;
  lowerBound: number;
  upperBound: number;
  generatedAt: string;
  assumptions: string[];
  limitations: string[];
}

export interface ObservedHealthState {
  screeningCount: number;
  lastSystolic?: number;
  lastDiastolic?: number;
  lastBloodSugar?: number;
  lastHbA1c?: number;
  confirmedDiagnoses: string[];
  lastAttendedDate?: string;
  medicationDispensesCount: number;
  latestOutcomeStatus?: string;
}

export interface CareJourneyState {
  crsCategory: ClinicalRiskCategory;
  activeCareTasksCount: number;
  lastOutreachStage?: string;
  nextFollowUpDue?: string;
  monitoringCycleNumber: number;
  controlStatus: 'TERKONTROL' | 'BELUM_TERKONTROL' | 'PERLU_KONFIRMASI' | 'TIDAK_DIKETAHUI';
}

export interface LongitudinalFactor {
  date: string;
  event: string;
  impact: string;
  source: 'FASKES' | 'POSYANDU' | 'KADER' | 'LAB' | 'CITIZEN';
}

export interface InterventionSummary {
  id: string;
  date: string;
  type: string;
  actor: string;
  result: string;
}

export interface OutcomeSummary {
  date: string;
  parameter: string;
  value: string;
  status: string;
}

export interface PredictiveSignalSummary {
  type: string;
  level: PredictionLevel;
  keyFactor: string;
  generatedAt: string;
}

export interface CitizenHealthTwin {
  citizenId: string;
  citizenName: string;
  nikMasked: string;
  desaName: string;
  kecamatanName: string;
  asOf: string;
  observedState: ObservedHealthState;
  careState: CareJourneyState;
  longitudinalFactors: LongitudinalFactor[];
  interventionHistory: InterventionSummary[];
  outcomeHistory: OutcomeSummary[];
  predictiveSignals: PredictiveSignalSummary[];
  dataCompleteness: 'LENGKAP' | 'PARSIAL' | 'TERBATAS';
  twinVersion: string;
  staleStatus: boolean;
}

export interface ScenarioSimulation {
  id: string;
  name: string;
  mode: ScenarioSimulationMode;
  regionId: string;
  regionName: string;
  baselinePeriod: string;
  hypotheticalDescription: string;
  assumptions: string[];
  estimatedDirection: 'MEMBAIK' | 'STABIL' | 'MENURUN';
  expectedRange: {
    baselineRate: number;
    projectedRateMin: number;
    projectedRateMax: number;
    metricLabel: string;
  };
  uncertaintyRating: 'TINGGI' | 'SEDANG' | 'RENDAH';
  dataLimitations: string[];
  createdAt: string;
}

export interface LearnedPopulationCluster {
  id: string;
  clusterCode: string;
  clusterLabel: string;
  description: string;
  citizenCount: number;
  primaryRiskDrivers: string[];
  suggestedOperationalPathway: string;
  regionDistribution: Record<string, number>;
  generatedAt: string;
}

export interface AdherenceEvidenceSource {
  sourceType: 'STAFF_ASSESSMENT' | 'MEDICATION_DISPENSE' | 'CITIZEN_SELF_REPORT' | 'KADER_REPORT';
  reportedAt: string;
  status: string;
  notes?: string;
}

export interface AdherenceIntelligenceResult {
  id: string;
  citizenId: string;
  citizenName: string;
  cycleId: string;
  level: 'REGULAR' | 'PARTIAL' | 'IRREGULAR' | 'NOT_ASSESSABLE';
  evidenceStrength: 'KUAT' | 'SEDANG' | 'MINIMAL' | 'BELUM_CUKUP';
  evidenceSources: AdherenceEvidenceSource[];
  dominantCauses: string[];
  systemFactorsIdentified: string[];
  generatedAt: string;
  modelVersion?: string;
}

export interface ModelPerformanceSnapshot {
  id: string;
  modelId: string;
  modelVersion: string;
  evaluationPeriodStart: string;
  evaluationPeriodEnd: string;
  sampleSize: number;
  metrics: {
    accuracy?: number;
    precision?: number;
    recall?: number;
    brierScore?: number;
    aucRoc?: number;
    unscorableRate?: number;
  };
  inputDriftDetected: boolean;
  performanceDegradationDetected: boolean;
  createdAt: string;
}

export interface ModelFairnessFinding {
  id: string;
  modelId: string;
  modelVersion: string;
  comparisonDimension: 'KECAMATAN' | 'AGE_GROUP' | 'SEX' | 'GEOGRAPHY_ISLAND';
  affectedGroup: string;
  findingSummary: string;
  severity: 'REVIEW' | 'SIGNIFICANT';
  detectedAt: string;
  remediationDueAt?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
}

export interface ModelPredictionFeedback {
  id: string;
  predictionId: string;
  citizenId?: string;
  userId: string;
  userName: string;
  userRole: string;
  facilityName: string;
  feedback: 'AGREE' | 'DISAGREE' | 'UNCERTAIN';
  reason?: string;
  createdAt: string;
}

export interface PredictionAttentionSignal {
  predictionId: string;
  citizenId: string;
  level: 'MEDIUM' | 'HIGH';
  contribution: number;
  createdAt: string;
}

// Legacy MVP 10 types compatibility
export type AIConfidenceLevel = 'HIGH' | 'MODERATE' | 'LOW';
export type AIApprovalStatus = 'PENDING_REVIEW' | 'APPROVED_BY_CLINICIAN' | 'REJECTED_BY_CLINICIAN' | 'MODIFIED_BY_CLINICIAN';

export interface AIPopulationForecast {
  id: string;
  generatedAt: string;
  facilityId?: string;
  facilityName?: string;
  kecamatanName?: string;
  forecastMonths: {
    monthLabel: string;
    screenedProjected: number;
    abnormalRiskProjected: number;
    dropoutEstimated: number;
    controlledProjected: number;
    medicationDemand: {
      amlodipine10mgUnits: number;
      metformin500mgUnits: number;
      captopril25mgUnits: number;
    };
    maritimeRiskFactor: number;
    seasonalWeatherNote?: string;
  }[];
  keyRiskDrivers: string[];
  recommendedStockActions: string[];
  modelMetadata: {
    modelName: string;
    modelVersion: string;
    confidenceScore: number;
    trainingDataCutoff: string;
    isSimulationData: boolean;
  };
}

export interface AIDropoutPrediction {
  citizenId: string;
  citizenName: string;
  nikMasked: string;
  facilityName: string;
  desaName: string;
  riskScorePercent: number;
  riskTier: 'HIGH_PREDICTED_DROPOUT' | 'MODERATE_PREDICTED_DROPOUT' | 'LOW_PREDICTED_DROPOUT';
  topPredictiveFactors: {
    factor: string;
    impactWeight: number;
    category: 'GEOGRAPHY' | 'ADHERENCE_HISTORY' | 'SOCIO_ECONOMIC' | 'CLINICAL_BURDEN';
  }[];
  recommendedPreventiveActions: string[];
  aiConfidence: AIConfidenceLevel;
  lastAssessedAt: string;
}

export interface AIClinicalRecommendation {
  id: string;
  citizenId: string;
  patientName: string;
  age: number;
  gender: string;
  encounterId?: string;
  observedFindings: {
    systolic: number;
    diastolic: number;
    randomBloodSugar?: number;
    fastingBloodSugar?: number;
    hba1c?: number;
    bmi?: number;
    smokingStatus?: boolean;
    comorbidities: string[];
  };
  suggestedWorkingDiagnosis: {
    icd10Code: string;
    diagnosisName: string;
    stageOrGrade: string;
    confidencePercent: number;
  };
  guidelineEvidence: {
    sourceGuideline: string;
    referenceSection: string;
    rationaleExplanation: string;
  };
  recommendedTherapy: {
    firstLineDrug: string;
    initialDose: string;
    frequency: string;
    specialInstructions: string;
  }[];
  safetyAlerts: {
    type: 'CONTRAINDICATION' | 'DRUG_INTERACTION' | 'RENAL_ADJUSTMENT' | 'PREGNANCY_WARNING' | 'WARNING' | 'INFO';
    severity: 'CRITICAL' | 'WARNING' | 'INFO';
    message: string;
  }[];
  lifestylePrescription: string[];
  humanReviewStatus: AIApprovalStatus;
  reviewedByDoctorName?: string;
  reviewedAt?: string;
  clinicianNotes?: string;
}

export interface AIAdaptiveNudge {
  id: string;
  citizenId: string;
  citizenName: string;
  targetDialect: 'BAHASA_INDONESIA_SANTUN' | 'MELAYU_TALIABU' | 'BAHASA_SEDERHANA_LANSIA';
  nudgeObjective: 'PENGINGAT_MINUM_OBAT' | 'JADWAL_KONTROL_PUSKESMAS' | 'MOTIVASI_POLA_MAKAN' | 'ATASI_KECEMASAN';
  generatedMessage: string;
  empathyTone: string;
  channel: 'WHATSAPP_KADER' | 'SMS_SAHABAT_WARGA' | 'KUNJUNGAN_TATAP_MUKA';
  readinessScore: number;
  createdAt: string;
  status: 'DRAFT' | 'SENT' | 'RESPONSE_RECEIVED';
  citizenResponseNote?: string;
}

export interface AIRouteOptimization {
  id: string;
  kaderId: string;
  kaderName: string;
  desaCoverage: string;
  planDate: string;
  seaWaveCondition: 'TENANG' | 'GELOMBANG_SEDANG' | 'GELOMBANG_TINGGI_WASPADA';
  weatherAlert?: string;
  optimizedWaypoints: {
    order: number;
    citizenId: string;
    citizenName: string;
    dusunOrRt: string;
    priorityReason: string;
    estimatedTravelMinutes: number;
    recommendedTransport: 'JALAN_KAKI' | 'MOTOR' | 'PERAHU_MOTOR_TEMPEL';
    isUrgentCase: boolean;
  }[];
  totalEstimatedHours: number;
  safetyAdvisory: string;
}

export interface AIGovernanceConfig {
  aiModelProvider: string;
  activeModelName: string;
  isHumanInTheLoopEnforced: boolean;
  maxDailyInferences: number;
  auditRetentionDays: number;
  allowedRolesForClinicalCopilot: RoleId[];
  safetyGuardrailStrictness: 'STRICT_CLINICAL' | 'MODERATE' | 'PERMISSIVE';
  disclaimerText: string;
}




