/**
 * Mock Database Storage Engine
 * Persists application state in localStorage with reactive subscribers & simulated network latency.
 */

import {
  AuditEvent,
  Citizen,
  CitizenAreaHistory,
  CitizenIdentifier,
  ClassificationBatch,
  ClassificationReviewItem,
  ConsentRecord,
  DataQualityIssue,
  Desa,
  HealthFacility,
  HealthService,
  IdentityMatchCandidate,
  IdentityMergeHistory,
  ImportFileHistory,
  IngestionRun,
  Kecamatan,
  Observation,
  OfflineQueueItem,
  OutboundIntegrationQueueItem,
  PriorityWeightVersion,
  RiskClassification,
  RiskCluster,
  RuleVersion,
  ScreeningResult,
  ScreeningSession,
  SourceMapping,
  SystemSettings,
  TriggeredRule,
  User,
  CareTask,
  TaskAssignment,
  ContactAttempt,
  Appointment,
  ServiceQuota,
  WaitlistEntry,
  OutreachLadderVersion,
  TaskClosure,
  DropoutCandidate,
  MessageTemplate,
  ClinicalEncounter,
  HospitalReferral,
  ProlanisEnrollment,
  CitizenOtpChallenge,
  CitizenHelpRequest,
  CitizenBarrierReport,
  CitizenResponseToken,
  CitizenOfflineCacheData,
  MonitoringCycle,
  AdherenceAssessment,
  OutcomeEvaluation,
  NonAdherenceCause,
  PopulationIntervention,
  PopulationAttentionSignal,
  PopulationDataCompleteness,
  MetricDefinition,
  SmallCellSuppressionPolicy,
  RsudServiceReadiness,
  RsudQualityEvent,
  RsudRiskCapaItem,
  RsudIntegrationChannelStatus,
  RsudReconciliationIssue,
  RsudExecutiveAction,
  RsudSlaDefinition,
  RsudEscalationLevel,
} from '../types';
import {
  INITIAL_AUDIT_LOGS,
  INITIAL_CONSENT_RECORDS,
  INITIAL_DESA,
  INITIAL_FACILITIES,
  INITIAL_KECAMATAN,
  INITIAL_RULE_VERSIONS,
  INITIAL_SERVICES,
  INITIAL_SETTINGS,
  INITIAL_USERS,
} from '../mock/initialData';
import {
  INITIAL_POPULATION_INTERVENTIONS,
  INITIAL_POPULATION_ATTENTIONS,
  INITIAL_POPULATION_COMPLETENESS,
  INITIAL_METRIC_DEFINITIONS,
  INITIAL_SMALL_CELL_POLICY,
} from '../mock/initialPopulationData';
import {
  INITIAL_OTP_CHALLENGES,
  INITIAL_HELP_REQUESTS,
  INITIAL_BARRIER_REPORTS,
  INITIAL_RESPONSE_TOKENS,
} from '../mock/initialCitizenData';
import {
  INITIAL_MONITORING_CYCLES,
  INITIAL_ADHERENCE_ASSESSMENTS,
  INITIAL_OUTCOME_EVALUATIONS,
} from '../mock/initialMonitoringData';
import {
  INITIAL_AREA_HISTORIES,
  INITIAL_CITIZEN_IDENTIFIERS,
  INITIAL_CITIZENS,
  INITIAL_DATA_QUALITY_ISSUES,
  INITIAL_DUPLICATE_CANDIDATES,
  INITIAL_IMPORT_HISTORIES,
  INITIAL_INGESTION_RUNS,
  INITIAL_MERGE_HISTORIES,
  INITIAL_OBSERVATIONS,
  INITIAL_SCREENING_RESULTS,
  INITIAL_SCREENING_SESSIONS,
  INITIAL_SOURCE_MAPPINGS,
} from '../mock/initialCkgData';
import {
  INITIAL_CLASSIFICATION_BATCHES,
  INITIAL_CLASSIFICATION_REVIEWS,
  INITIAL_PRIORITY_WEIGHT_VERSIONS,
  INITIAL_RISK_CLASSIFICATIONS,
  INITIAL_RISK_CLUSTERS,
  INITIAL_TRIGGERED_RULES,
} from '../mock/initialRiskData';
import {
  INITIAL_APPOINTMENTS,
  INITIAL_CARE_TASKS,
  INITIAL_CONTACT_ATTEMPTS,
  INITIAL_DROPOUT_CANDIDATES,
  INITIAL_MESSAGE_TEMPLATES,
  INITIAL_OUTREACH_LADDER_VERSIONS,
  INITIAL_SERVICE_QUOTAS,
  INITIAL_TASK_ASSIGNMENTS,
  INITIAL_TASK_CLOSURES,
  INITIAL_WAITLIST,
} from '../mock/initialCareTaskData';
import {
  INITIAL_CLINICAL_ENCOUNTERS,
  INITIAL_HOSPITAL_REFERRALS,
  INITIAL_PROLANIS_ENROLLMENTS,
} from '../mock/initialClinicalData';
import {
  INITIAL_RSUD_SERVICE_READINESS,
  INITIAL_RSUD_QUALITY_EVENTS,
  INITIAL_RSUD_RISK_CAPA,
  INITIAL_RSUD_INTEGRATION_STATUS,
  INITIAL_RSUD_RECONCILIATION_ISSUES,
  INITIAL_RSUD_EXECUTIVE_ACTIONS,
  INITIAL_RSUD_SLA_DEFINITIONS,
  INITIAL_RSUD_ESCALATION_LEVELS,
} from '../mock/initialRsudData';

const STORAGE_KEYS = {
  USERS: 'ckg_users_v1',
  FACILITIES: 'ckg_facilities_v1',
  KECAMATAN: 'ckg_kecamatan_v1',
  DESA: 'ckg_desa_v1',
  SERVICES: 'ckg_services_v1',
  CONSENTS: 'ckg_consents_v1',
  AUDIT: 'ckg_audit_v1',
  RULE_VERSIONS: 'ckg_rule_versions_v1',
  SYNC_QUEUE: 'ckg_sync_queue_v1',
  SETTINGS: 'ckg_settings_v1',
  CURRENT_SESSION: 'ckg_session_v1',
  // MVP 2 Storage Keys
  CITIZENS: 'ckg_citizens_v2',
  CITIZEN_IDENTIFIERS: 'ckg_citizen_identifiers_v2',
  AREA_HISTORIES: 'ckg_area_histories_v2',
  SCREENING_SESSIONS: 'ckg_screening_sessions_v2',
  SCREENING_RESULTS: 'ckg_screening_results_v2',
  OBSERVATIONS: 'ckg_observations_v2',
  INGESTION_RUNS: 'ckg_ingestion_runs_v2',
  DATA_QUALITY_ISSUES: 'ckg_data_quality_issues_v2',
  DUPLICATE_CANDIDATES: 'ckg_duplicate_candidates_v2',
  MERGE_HISTORIES: 'ckg_merge_histories_v2',
  SOURCE_MAPPINGS: 'ckg_source_mappings_v2',
  IMPORT_HISTORIES: 'ckg_import_histories_v2',
  OUTBOUND_QUEUE: 'ckg_outbound_queue_v2',
  INGESTION_WATERMARK: 'ckg_watermark_v2',
  // MVP 3 Storage Keys
  RISK_CLASSIFICATIONS: 'ckg_risk_classifications_v3',
  TRIGGERED_RULES: 'ckg_triggered_rules_v3',
  RISK_CLUSTERS: 'ckg_risk_clusters_v3',
  PRIORITY_WEIGHT_VERSIONS: 'ckg_priority_weights_v3',
  CLASSIFICATION_REVIEWS: 'ckg_classification_reviews_v3',
  CLASSIFICATION_BATCHES: 'ckg_classification_batches_v3',
  // MVP 4 Storage Keys
  CARE_TASKS: 'ckg_care_tasks_v4',
  TASK_ASSIGNMENTS: 'ckg_task_assignments_v4',
  CONTACT_ATTEMPTS: 'ckg_contact_attempts_v4',
  APPOINTMENTS: 'ckg_appointments_v4',
  SERVICE_QUOTAS: 'ckg_service_quotas_v4',
  WAITLIST: 'ckg_waitlist_v4',
  OUTREACH_LADDERS: 'ckg_outreach_ladders_v4',
  TASK_CLOSURES: 'ckg_task_closures_v4',
  DROPOUT_CANDIDATES: 'ckg_dropout_candidates_v4',
  MESSAGE_TEMPLATES: 'ckg_message_templates_v4',
  // MVP 6 Storage Keys
  CLINICAL_ENCOUNTERS: 'ckg_clinical_encounters_v6',
  HOSPITAL_REFERRALS: 'ckg_hospital_referrals_v6',
  PROLANIS_ENROLLMENTS: 'ckg_prolanis_enrollments_v6',
  // MVP 7 Citizen Storage Keys
  CITIZEN_OTP_CHALLENGES: 'ckg_citizen_otp_v7',
  CITIZEN_HELP_REQUESTS: 'ckg_citizen_help_v7',
  CITIZEN_BARRIERS: 'ckg_citizen_barriers_v7',
  CITIZEN_RESPONSE_TOKENS: 'ckg_citizen_tokens_v7',
  CITIZEN_CURRENT_SESSION: 'ckg_citizen_session_v7',
  CITIZEN_OFFLINE_CACHE: 'ckg_citizen_offline_cache_v7',
  // MVP 8 Outcome Monitoring Storage Keys
  MONITORING_CYCLES: 'ckg_monitoring_cycles_v8',
  ADHERENCE_ASSESSMENTS: 'ckg_adherence_assessments_v8',
  OUTCOME_EVALUATIONS: 'ckg_outcome_evaluations_v8',
  // MVP 9 Population Health Command Center Storage Keys
  POPULATION_INTERVENTIONS: 'ckg_population_interventions_v9',
  POPULATION_ATTENTIONS: 'ckg_population_attentions_v9',
  POPULATION_COMPLETENESS: 'ckg_population_completeness_v9',
  METRIC_DEFINITIONS: 'ckg_metric_definitions_v9',
  SMALL_CELL_POLICY: 'ckg_small_cell_policy_v9',
  // RSUD Executive Referral & Hospital Readiness (Direktur RSUD role) Storage Keys
  RSUD_SERVICE_READINESS: 'ckg_rsud_service_readiness_v11',
  RSUD_QUALITY_EVENTS: 'ckg_rsud_quality_events_v11',
  RSUD_RISK_CAPA: 'ckg_rsud_risk_capa_v11',
  RSUD_INTEGRATION_STATUS: 'ckg_rsud_integration_status_v11',
  RSUD_RECONCILIATION_ISSUES: 'ckg_rsud_reconciliation_issues_v11',
  RSUD_EXECUTIVE_ACTIONS: 'ckg_rsud_executive_actions_v11',
  RSUD_SLA_DEFINITIONS: 'ckg_rsud_sla_definitions_v11',
  RSUD_ESCALATION_LEVELS: 'ckg_rsud_escalation_levels_v11',
};

type Listener = () => void;
const listeners = new Set<Listener>();

function notifyListeners() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (err) {
      console.error('Storage listener error:', err);
    }
  });
}

export function subscribeToStorage(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    notifyListeners();
  } catch (err) {
    console.error(`Failed to save ${key} in localStorage`, err);
  }
}

export function getSettings(): SystemSettings {
  return getItem<SystemSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
}

export function saveSettings(settings: SystemSettings): void {
  setItem(STORAGE_KEYS.SETTINGS, settings);
}

// Latency simulator helper
export async function simulateNetworkDelay(): Promise<void> {
  const settings = getSettings();
  if (settings.networkMode === 'OFFLINE') {
    // Offline mode does not throw error if offline queue handles it, but for direct online API calls:
    return;
  }
  const delay = settings.networkMode === 'SLOW' ? Math.max(1200, settings.simulatedLatencyMs * 3) : settings.simulatedLatencyMs;
  if (delay > 0) {
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
}

// Raw storage getters & setters
export const rawStorage = {
  getUsers: (): User[] => {
    let users = getItem<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
    // Ensure deleted users (usr-10, usr-14, usr-15) are pruned if previously saved in local storage
    const excludedIds = ['usr-10', 'usr-14', 'usr-15'];
    let changed = false;
    if (users.some((u) => excludedIds.includes(u.id))) {
      users = users.filter((u) => !excludedIds.includes(u.id));
      changed = true;
    }
    // Ensure new initial users are merged in and core demo user names/credentials are updated
    for (const initUser of INITIAL_USERS) {
      const idx = users.findIndex((u) => u.id === initUser.id);
      if (idx === -1) {
        users.push(initUser);
        changed = true;
      } else {
        // Sync system demo names and usernames if updated in INITIAL_USERS
        if (
          ['usr-2', 'usr-4', 'usr-6', 'usr-11', 'usr-16'].includes(initUser.id) &&
          (users[idx].name !== initUser.name || users[idx].username !== initUser.username || users[idx].email !== initUser.email)
        ) {
          users[idx] = {
            ...users[idx],
            name: initUser.name,
            username: initUser.username,
            email: initUser.email,
            roleName: initUser.roleName,
          };
          changed = true;
        }
      }
    }
    if (changed) {
      setItem(STORAGE_KEYS.USERS, users);
    }
    return users;
  },
  setUsers: (users: User[]) => setItem(STORAGE_KEYS.USERS, users),

  getFacilities: (): HealthFacility[] => getItem(STORAGE_KEYS.FACILITIES, INITIAL_FACILITIES),
  setFacilities: (f: HealthFacility[]) => setItem(STORAGE_KEYS.FACILITIES, f),

  getKecamatan: (): Kecamatan[] => getItem(STORAGE_KEYS.KECAMATAN, INITIAL_KECAMATAN),
  setKecamatan: (k: Kecamatan[]) => setItem(STORAGE_KEYS.KECAMATAN, k),

  getDesa: (): Desa[] => getItem(STORAGE_KEYS.DESA, INITIAL_DESA),
  setDesa: (d: Desa[]) => setItem(STORAGE_KEYS.DESA, d),

  getServices: (): HealthService[] => getItem(STORAGE_KEYS.SERVICES, INITIAL_SERVICES),
  setServices: (s: HealthService[]) => setItem(STORAGE_KEYS.SERVICES, s),

  getConsents: (): ConsentRecord[] => getItem(STORAGE_KEYS.CONSENTS, INITIAL_CONSENT_RECORDS),
  setConsents: (c: ConsentRecord[]) => setItem(STORAGE_KEYS.CONSENTS, c),

  getAuditLogs: (): AuditEvent[] => getItem(STORAGE_KEYS.AUDIT, INITIAL_AUDIT_LOGS),
  // Audit is APPEND ONLY
  appendAuditLog: (event: AuditEvent) => {
    const existing = rawStorage.getAuditLogs();
    setItem(STORAGE_KEYS.AUDIT, [event, ...existing]);
  },

  getRuleVersions: (): RuleVersion[] => getItem(STORAGE_KEYS.RULE_VERSIONS, INITIAL_RULE_VERSIONS),
  setRuleVersions: (r: RuleVersion[]) => setItem(STORAGE_KEYS.RULE_VERSIONS, r),

  getSyncQueue: (): OfflineQueueItem[] => getItem(STORAGE_KEYS.SYNC_QUEUE, []),
  setSyncQueue: (q: OfflineQueueItem[]) => setItem(STORAGE_KEYS.SYNC_QUEUE, q),

  // MVP 2 Storage Handlers
  getCitizens: (): Citizen[] => getItem(STORAGE_KEYS.CITIZENS, INITIAL_CITIZENS),
  setCitizens: (c: Citizen[]) => setItem(STORAGE_KEYS.CITIZENS, c),

  getCitizenIdentifiers: (): CitizenIdentifier[] => getItem(STORAGE_KEYS.CITIZEN_IDENTIFIERS, INITIAL_CITIZEN_IDENTIFIERS),
  setCitizenIdentifiers: (i: CitizenIdentifier[]) => setItem(STORAGE_KEYS.CITIZEN_IDENTIFIERS, i),

  getAreaHistories: (): CitizenAreaHistory[] => getItem(STORAGE_KEYS.AREA_HISTORIES, INITIAL_AREA_HISTORIES),
  setAreaHistories: (h: CitizenAreaHistory[]) => setItem(STORAGE_KEYS.AREA_HISTORIES, h),

  getScreeningSessions: (): ScreeningSession[] => getItem(STORAGE_KEYS.SCREENING_SESSIONS, INITIAL_SCREENING_SESSIONS),
  setScreeningSessions: (s: ScreeningSession[]) => setItem(STORAGE_KEYS.SCREENING_SESSIONS, s),

  getScreeningResults: (): ScreeningResult[] => getItem(STORAGE_KEYS.SCREENING_RESULTS, INITIAL_SCREENING_RESULTS),
  setScreeningResults: (r: ScreeningResult[]) => setItem(STORAGE_KEYS.SCREENING_RESULTS, r),

  getObservations: (): Observation[] => getItem(STORAGE_KEYS.OBSERVATIONS, INITIAL_OBSERVATIONS),
  setObservations: (o: Observation[]) => setItem(STORAGE_KEYS.OBSERVATIONS, o),

  getIngestionRuns: (): IngestionRun[] => getItem(STORAGE_KEYS.INGESTION_RUNS, INITIAL_INGESTION_RUNS),
  setIngestionRuns: (r: IngestionRun[]) => setItem(STORAGE_KEYS.INGESTION_RUNS, r),

  getDataQualityIssues: (): DataQualityIssue[] => getItem(STORAGE_KEYS.DATA_QUALITY_ISSUES, INITIAL_DATA_QUALITY_ISSUES),
  setDataQualityIssues: (i: DataQualityIssue[]) => setItem(STORAGE_KEYS.DATA_QUALITY_ISSUES, i),

  getDuplicateCandidates: (): IdentityMatchCandidate[] => getItem(STORAGE_KEYS.DUPLICATE_CANDIDATES, INITIAL_DUPLICATE_CANDIDATES),
  setDuplicateCandidates: (c: IdentityMatchCandidate[]) => setItem(STORAGE_KEYS.DUPLICATE_CANDIDATES, c),

  getMergeHistories: (): IdentityMergeHistory[] => getItem(STORAGE_KEYS.MERGE_HISTORIES, INITIAL_MERGE_HISTORIES),
  setMergeHistories: (m: IdentityMergeHistory[]) => setItem(STORAGE_KEYS.MERGE_HISTORIES, m),

  getSourceMappings: (): SourceMapping[] => getItem(STORAGE_KEYS.SOURCE_MAPPINGS, INITIAL_SOURCE_MAPPINGS),
  setSourceMappings: (m: SourceMapping[]) => setItem(STORAGE_KEYS.SOURCE_MAPPINGS, m),

  getImportHistories: (): ImportFileHistory[] => getItem(STORAGE_KEYS.IMPORT_HISTORIES, INITIAL_IMPORT_HISTORIES),
  setImportHistories: (h: ImportFileHistory[]) => setItem(STORAGE_KEYS.IMPORT_HISTORIES, h),

  getOutboundQueue: (): OutboundIntegrationQueueItem[] => getItem(STORAGE_KEYS.OUTBOUND_QUEUE, []),
  setOutboundQueue: (q: OutboundIntegrationQueueItem[]) => setItem(STORAGE_KEYS.OUTBOUND_QUEUE, q),

  // MVP 3 Storage Handlers
  getRiskClassifications: (): RiskClassification[] =>
    getItem(STORAGE_KEYS.RISK_CLASSIFICATIONS, INITIAL_RISK_CLASSIFICATIONS),
  setRiskClassifications: (c: RiskClassification[]) => setItem(STORAGE_KEYS.RISK_CLASSIFICATIONS, c),

  getTriggeredRules: (): TriggeredRule[] =>
    getItem(STORAGE_KEYS.TRIGGERED_RULES, INITIAL_TRIGGERED_RULES),
  setTriggeredRules: (t: TriggeredRule[]) => setItem(STORAGE_KEYS.TRIGGERED_RULES, t),

  getRiskClusters: (): RiskCluster[] =>
    getItem(STORAGE_KEYS.RISK_CLUSTERS, INITIAL_RISK_CLUSTERS),
  setRiskClusters: (rc: RiskCluster[]) => setItem(STORAGE_KEYS.RISK_CLUSTERS, rc),

  getPriorityWeightVersions: (): PriorityWeightVersion[] =>
    getItem(STORAGE_KEYS.PRIORITY_WEIGHT_VERSIONS, INITIAL_PRIORITY_WEIGHT_VERSIONS),
  setPriorityWeightVersions: (pv: PriorityWeightVersion[]) =>
    setItem(STORAGE_KEYS.PRIORITY_WEIGHT_VERSIONS, pv),

  getClassificationReviews: (): ClassificationReviewItem[] =>
    getItem(STORAGE_KEYS.CLASSIFICATION_REVIEWS, INITIAL_CLASSIFICATION_REVIEWS),
  setClassificationReviews: (cr: ClassificationReviewItem[]) =>
    setItem(STORAGE_KEYS.CLASSIFICATION_REVIEWS, cr),

  getClassificationBatches: (): ClassificationBatch[] =>
    getItem(STORAGE_KEYS.CLASSIFICATION_BATCHES, INITIAL_CLASSIFICATION_BATCHES),
  setClassificationBatches: (b: ClassificationBatch[]) =>
    setItem(STORAGE_KEYS.CLASSIFICATION_BATCHES, b),

  // MVP 4 Storage Handlers
  getCareTasks: (): CareTask[] =>
    getItem(STORAGE_KEYS.CARE_TASKS, INITIAL_CARE_TASKS),
  setCareTasks: (tasks: CareTask[]) => setItem(STORAGE_KEYS.CARE_TASKS, tasks),

  getTaskAssignments: (): TaskAssignment[] =>
    getItem(STORAGE_KEYS.TASK_ASSIGNMENTS, INITIAL_TASK_ASSIGNMENTS),
  setTaskAssignments: (asg: TaskAssignment[]) => setItem(STORAGE_KEYS.TASK_ASSIGNMENTS, asg),

  getContactAttempts: (): ContactAttempt[] =>
    getItem(STORAGE_KEYS.CONTACT_ATTEMPTS, INITIAL_CONTACT_ATTEMPTS),
  setContactAttempts: (att: ContactAttempt[]) => setItem(STORAGE_KEYS.CONTACT_ATTEMPTS, att),

  getAppointments: (): Appointment[] =>
    getItem(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS),
  setAppointments: (apts: Appointment[]) => setItem(STORAGE_KEYS.APPOINTMENTS, apts),

  getServiceQuotas: (): ServiceQuota[] =>
    getItem(STORAGE_KEYS.SERVICE_QUOTAS, INITIAL_SERVICE_QUOTAS),
  setServiceQuotas: (quotas: ServiceQuota[]) => setItem(STORAGE_KEYS.SERVICE_QUOTAS, quotas),

  getWaitlist: (): WaitlistEntry[] =>
    getItem(STORAGE_KEYS.WAITLIST, INITIAL_WAITLIST),
  setWaitlist: (wl: WaitlistEntry[]) => setItem(STORAGE_KEYS.WAITLIST, wl),

  getOutreachLadders: (): OutreachLadderVersion[] =>
    getItem(STORAGE_KEYS.OUTREACH_LADDERS, INITIAL_OUTREACH_LADDER_VERSIONS),
  setOutreachLadders: (ladders: OutreachLadderVersion[]) => setItem(STORAGE_KEYS.OUTREACH_LADDERS, ladders),

  getTaskClosures: (): TaskClosure[] =>
    getItem(STORAGE_KEYS.TASK_CLOSURES, INITIAL_TASK_CLOSURES),
  setTaskClosures: (closures: TaskClosure[]) => setItem(STORAGE_KEYS.TASK_CLOSURES, closures),

  getDropoutCandidates: (): DropoutCandidate[] =>
    getItem(STORAGE_KEYS.DROPOUT_CANDIDATES, INITIAL_DROPOUT_CANDIDATES),
  setDropoutCandidates: (candidates: DropoutCandidate[]) => setItem(STORAGE_KEYS.DROPOUT_CANDIDATES, candidates),

  getMessageTemplates: (): MessageTemplate[] =>
    getItem(STORAGE_KEYS.MESSAGE_TEMPLATES, INITIAL_MESSAGE_TEMPLATES),
  setMessageTemplates: (templates: MessageTemplate[]) => setItem(STORAGE_KEYS.MESSAGE_TEMPLATES, templates),

  // MVP 6 Storage Handlers (Clinical Follow-Up & Closed Loop)
  getClinicalEncounters: (): ClinicalEncounter[] =>
    getItem(STORAGE_KEYS.CLINICAL_ENCOUNTERS, INITIAL_CLINICAL_ENCOUNTERS),
  setClinicalEncounters: (enc: ClinicalEncounter[]) => setItem(STORAGE_KEYS.CLINICAL_ENCOUNTERS, enc),

  getHospitalReferrals: (): HospitalReferral[] =>
    getItem(STORAGE_KEYS.HOSPITAL_REFERRALS, INITIAL_HOSPITAL_REFERRALS),
  setHospitalReferrals: (ref: HospitalReferral[]) => setItem(STORAGE_KEYS.HOSPITAL_REFERRALS, ref),

  getProlanisEnrollments: (): ProlanisEnrollment[] =>
    getItem(STORAGE_KEYS.PROLANIS_ENROLLMENTS, INITIAL_PROLANIS_ENROLLMENTS),
  setProlanisEnrollments: (prol: ProlanisEnrollment[]) => setItem(STORAGE_KEYS.PROLANIS_ENROLLMENTS, prol),

  // MVP 7 Citizen Storage Methods
  getCitizenOtpChallenges: (): CitizenOtpChallenge[] =>
    getItem(STORAGE_KEYS.CITIZEN_OTP_CHALLENGES, INITIAL_OTP_CHALLENGES),
  setCitizenOtpChallenges: (otps: CitizenOtpChallenge[]) =>
    setItem(STORAGE_KEYS.CITIZEN_OTP_CHALLENGES, otps),

  getCitizenHelpRequests: (): CitizenHelpRequest[] =>
    getItem(STORAGE_KEYS.CITIZEN_HELP_REQUESTS, INITIAL_HELP_REQUESTS),
  setCitizenHelpRequests: (reqs: CitizenHelpRequest[]) =>
    setItem(STORAGE_KEYS.CITIZEN_HELP_REQUESTS, reqs),

  getCitizenBarriers: (): CitizenBarrierReport[] =>
    getItem(STORAGE_KEYS.CITIZEN_BARRIERS, INITIAL_BARRIER_REPORTS),
  setCitizenBarriers: (barriers: CitizenBarrierReport[]) =>
    setItem(STORAGE_KEYS.CITIZEN_BARRIERS, barriers),

  getCitizenResponseTokens: (): CitizenResponseToken[] =>
    getItem(STORAGE_KEYS.CITIZEN_RESPONSE_TOKENS, INITIAL_RESPONSE_TOKENS),
  setCitizenResponseTokens: (tokens: CitizenResponseToken[]) =>
    setItem(STORAGE_KEYS.CITIZEN_RESPONSE_TOKENS, tokens),

  getCitizenCurrentSession: (): { citizenId: string; phone: string; token: string } | null =>
    getItem(STORAGE_KEYS.CITIZEN_CURRENT_SESSION, null),
  setCitizenCurrentSession: (session: { citizenId: string; phone: string; token: string } | null) =>
    setItem(STORAGE_KEYS.CITIZEN_CURRENT_SESSION, session),

  getCitizenOfflineCache: (citizenId: string): CitizenOfflineCacheData | null => {
    const map = getItem<Record<string, CitizenOfflineCacheData>>(STORAGE_KEYS.CITIZEN_OFFLINE_CACHE, {});
    return map[citizenId] || null;
  },
  setCitizenOfflineCache: (citizenId: string, data: CitizenOfflineCacheData) => {
    const map = getItem<Record<string, CitizenOfflineCacheData>>(STORAGE_KEYS.CITIZEN_OFFLINE_CACHE, {});
    map[citizenId] = data;
    setItem(STORAGE_KEYS.CITIZEN_OFFLINE_CACHE, map);
  },

  // MVP 8 Outcome Monitoring Storage
  getMonitoringCycles: (): MonitoringCycle[] =>
    getItem(STORAGE_KEYS.MONITORING_CYCLES, INITIAL_MONITORING_CYCLES),
  setMonitoringCycles: (cycles: MonitoringCycle[]) =>
    setItem(STORAGE_KEYS.MONITORING_CYCLES, cycles),

  getAdherenceAssessments: (): AdherenceAssessment[] =>
    getItem(STORAGE_KEYS.ADHERENCE_ASSESSMENTS, INITIAL_ADHERENCE_ASSESSMENTS),
  setAdherenceAssessments: (assessments: AdherenceAssessment[]) =>
    setItem(STORAGE_KEYS.ADHERENCE_ASSESSMENTS, assessments),

  getOutcomeEvaluations: (): OutcomeEvaluation[] =>
    getItem(STORAGE_KEYS.OUTCOME_EVALUATIONS, INITIAL_OUTCOME_EVALUATIONS),
  setOutcomeEvaluations: (evals: OutcomeEvaluation[]) =>
    setItem(STORAGE_KEYS.OUTCOME_EVALUATIONS, evals),

  // MVP 9 Population Health Command Center Storage
  getPopulationInterventions: (): PopulationIntervention[] =>
    getItem(STORAGE_KEYS.POPULATION_INTERVENTIONS, INITIAL_POPULATION_INTERVENTIONS),
  setPopulationInterventions: (interventions: PopulationIntervention[]) =>
    setItem(STORAGE_KEYS.POPULATION_INTERVENTIONS, interventions),

  getPopulationAttentions: (): PopulationAttentionSignal[] =>
    getItem(STORAGE_KEYS.POPULATION_ATTENTIONS, INITIAL_POPULATION_ATTENTIONS),
  setPopulationAttentions: (signals: PopulationAttentionSignal[]) =>
    setItem(STORAGE_KEYS.POPULATION_ATTENTIONS, signals),

  getPopulationCompleteness: (): PopulationDataCompleteness[] =>
    getItem(STORAGE_KEYS.POPULATION_COMPLETENESS, INITIAL_POPULATION_COMPLETENESS),
  setPopulationCompleteness: (completeness: PopulationDataCompleteness[]) =>
    setItem(STORAGE_KEYS.POPULATION_COMPLETENESS, completeness),

  getMetricDefinitions: (): MetricDefinition[] =>
    getItem(STORAGE_KEYS.METRIC_DEFINITIONS, INITIAL_METRIC_DEFINITIONS),
  setMetricDefinitions: (defs: MetricDefinition[]) =>
    setItem(STORAGE_KEYS.METRIC_DEFINITIONS, defs),

  getSmallCellPolicy: (): SmallCellSuppressionPolicy =>
    getItem(STORAGE_KEYS.SMALL_CELL_POLICY, INITIAL_SMALL_CELL_POLICY),
  setSmallCellPolicy: (policy: SmallCellSuppressionPolicy) =>
    setItem(STORAGE_KEYS.SMALL_CELL_POLICY, policy),

  // RSUD Executive Referral & Hospital Readiness Storage (Direktur RSUD role)
  getRsudServiceReadiness: (): RsudServiceReadiness[] =>
    getItem(STORAGE_KEYS.RSUD_SERVICE_READINESS, INITIAL_RSUD_SERVICE_READINESS),
  setRsudServiceReadiness: (r: RsudServiceReadiness[]) => setItem(STORAGE_KEYS.RSUD_SERVICE_READINESS, r),

  getRsudQualityEvents: (): RsudQualityEvent[] =>
    getItem(STORAGE_KEYS.RSUD_QUALITY_EVENTS, INITIAL_RSUD_QUALITY_EVENTS),
  setRsudQualityEvents: (e: RsudQualityEvent[]) => setItem(STORAGE_KEYS.RSUD_QUALITY_EVENTS, e),

  getRsudRiskCapa: (): RsudRiskCapaItem[] =>
    getItem(STORAGE_KEYS.RSUD_RISK_CAPA, INITIAL_RSUD_RISK_CAPA),
  setRsudRiskCapa: (r: RsudRiskCapaItem[]) => setItem(STORAGE_KEYS.RSUD_RISK_CAPA, r),

  getRsudIntegrationStatus: (): RsudIntegrationChannelStatus[] =>
    getItem(STORAGE_KEYS.RSUD_INTEGRATION_STATUS, INITIAL_RSUD_INTEGRATION_STATUS),
  setRsudIntegrationStatus: (s: RsudIntegrationChannelStatus[]) => setItem(STORAGE_KEYS.RSUD_INTEGRATION_STATUS, s),

  getRsudReconciliationIssues: (): RsudReconciliationIssue[] =>
    getItem(STORAGE_KEYS.RSUD_RECONCILIATION_ISSUES, INITIAL_RSUD_RECONCILIATION_ISSUES),
  setRsudReconciliationIssues: (i: RsudReconciliationIssue[]) => setItem(STORAGE_KEYS.RSUD_RECONCILIATION_ISSUES, i),

  getRsudExecutiveActions: (): RsudExecutiveAction[] =>
    getItem(STORAGE_KEYS.RSUD_EXECUTIVE_ACTIONS, INITIAL_RSUD_EXECUTIVE_ACTIONS),
  setRsudExecutiveActions: (a: RsudExecutiveAction[]) => setItem(STORAGE_KEYS.RSUD_EXECUTIVE_ACTIONS, a),

  getRsudSlaDefinitions: (): RsudSlaDefinition[] =>
    getItem(STORAGE_KEYS.RSUD_SLA_DEFINITIONS, INITIAL_RSUD_SLA_DEFINITIONS),
  setRsudSlaDefinitions: (s: RsudSlaDefinition[]) => setItem(STORAGE_KEYS.RSUD_SLA_DEFINITIONS, s),

  getRsudEscalationLevels: (): RsudEscalationLevel[] =>
    getItem(STORAGE_KEYS.RSUD_ESCALATION_LEVELS, INITIAL_RSUD_ESCALATION_LEVELS),
  setRsudEscalationLevels: (l: RsudEscalationLevel[]) => setItem(STORAGE_KEYS.RSUD_ESCALATION_LEVELS, l),

  getWatermark: (facilityId: string): string => {
    const map = getItem<Record<string, string>>(STORAGE_KEYS.INGESTION_WATERMARK, {
      'FASKES-PKM-01': '2026-08-24T06:30:00.000Z',
      'FASKES-PKM-02': '2026-08-23T18:30:00.000Z',
      'FASKES-PKM-03': '2026-08-22T12:00:00.000Z',
    });
    return map[facilityId] || '2026-08-01T00:00:00.000Z';
  },
  setWatermark: (facilityId: string, watermark: string) => {
    const map = getItem<Record<string, string>>(STORAGE_KEYS.INGESTION_WATERMARK, {});
    map[facilityId] = watermark;
    setItem(STORAGE_KEYS.INGESTION_WATERMARK, map);
  },

  resetToInitial: () => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(STORAGE_KEYS.FACILITIES, JSON.stringify(INITIAL_FACILITIES));
    localStorage.setItem(STORAGE_KEYS.KECAMATAN, JSON.stringify(INITIAL_KECAMATAN));
    localStorage.setItem(STORAGE_KEYS.DESA, JSON.stringify(INITIAL_DESA));
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(INITIAL_SERVICES));
    localStorage.setItem(STORAGE_KEYS.CONSENTS, JSON.stringify(INITIAL_CONSENT_RECORDS));
    localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(INITIAL_AUDIT_LOGS));
    localStorage.setItem(STORAGE_KEYS.RULE_VERSIONS, JSON.stringify(INITIAL_RULE_VERSIONS));
    localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
    // MVP 2 Resets
    localStorage.setItem(STORAGE_KEYS.CITIZENS, JSON.stringify(INITIAL_CITIZENS));
    localStorage.setItem(STORAGE_KEYS.CITIZEN_IDENTIFIERS, JSON.stringify(INITIAL_CITIZEN_IDENTIFIERS));
    localStorage.setItem(STORAGE_KEYS.AREA_HISTORIES, JSON.stringify(INITIAL_AREA_HISTORIES));
    localStorage.setItem(STORAGE_KEYS.SCREENING_SESSIONS, JSON.stringify(INITIAL_SCREENING_SESSIONS));
    localStorage.setItem(STORAGE_KEYS.SCREENING_RESULTS, JSON.stringify(INITIAL_SCREENING_RESULTS));
    localStorage.setItem(STORAGE_KEYS.OBSERVATIONS, JSON.stringify(INITIAL_OBSERVATIONS));
    localStorage.setItem(STORAGE_KEYS.INGESTION_RUNS, JSON.stringify(INITIAL_INGESTION_RUNS));
    localStorage.setItem(STORAGE_KEYS.DATA_QUALITY_ISSUES, JSON.stringify(INITIAL_DATA_QUALITY_ISSUES));
    localStorage.setItem(STORAGE_KEYS.DUPLICATE_CANDIDATES, JSON.stringify(INITIAL_DUPLICATE_CANDIDATES));
    localStorage.setItem(STORAGE_KEYS.MERGE_HISTORIES, JSON.stringify(INITIAL_MERGE_HISTORIES));
    localStorage.setItem(STORAGE_KEYS.SOURCE_MAPPINGS, JSON.stringify(INITIAL_SOURCE_MAPPINGS));
    localStorage.setItem(STORAGE_KEYS.IMPORT_HISTORIES, JSON.stringify(INITIAL_IMPORT_HISTORIES));
    localStorage.setItem(STORAGE_KEYS.OUTBOUND_QUEUE, JSON.stringify([]));
    // MVP 3 Resets
    localStorage.setItem(STORAGE_KEYS.RISK_CLASSIFICATIONS, JSON.stringify(INITIAL_RISK_CLASSIFICATIONS));
    localStorage.setItem(STORAGE_KEYS.TRIGGERED_RULES, JSON.stringify(INITIAL_TRIGGERED_RULES));
    localStorage.setItem(STORAGE_KEYS.RISK_CLUSTERS, JSON.stringify(INITIAL_RISK_CLUSTERS));
    localStorage.setItem(STORAGE_KEYS.PRIORITY_WEIGHT_VERSIONS, JSON.stringify(INITIAL_PRIORITY_WEIGHT_VERSIONS));
    localStorage.setItem(STORAGE_KEYS.CLASSIFICATION_REVIEWS, JSON.stringify(INITIAL_CLASSIFICATION_REVIEWS));
    localStorage.setItem(STORAGE_KEYS.CLASSIFICATION_BATCHES, JSON.stringify(INITIAL_CLASSIFICATION_BATCHES));
    // MVP 4 Resets
    localStorage.setItem(STORAGE_KEYS.CARE_TASKS, JSON.stringify(INITIAL_CARE_TASKS));
    localStorage.setItem(STORAGE_KEYS.TASK_ASSIGNMENTS, JSON.stringify(INITIAL_TASK_ASSIGNMENTS));
    localStorage.setItem(STORAGE_KEYS.CONTACT_ATTEMPTS, JSON.stringify(INITIAL_CONTACT_ATTEMPTS));
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(INITIAL_APPOINTMENTS));
    localStorage.setItem(STORAGE_KEYS.SERVICE_QUOTAS, JSON.stringify(INITIAL_SERVICE_QUOTAS));
    localStorage.setItem(STORAGE_KEYS.WAITLIST, JSON.stringify(INITIAL_WAITLIST));
    localStorage.setItem(STORAGE_KEYS.OUTREACH_LADDERS, JSON.stringify(INITIAL_OUTREACH_LADDER_VERSIONS));
    localStorage.setItem(STORAGE_KEYS.TASK_CLOSURES, JSON.stringify(INITIAL_TASK_CLOSURES));
    localStorage.setItem(STORAGE_KEYS.DROPOUT_CANDIDATES, JSON.stringify(INITIAL_DROPOUT_CANDIDATES));
    localStorage.setItem(STORAGE_KEYS.MESSAGE_TEMPLATES, JSON.stringify(INITIAL_MESSAGE_TEMPLATES));
    // MVP 6 Resets
    localStorage.setItem(STORAGE_KEYS.CLINICAL_ENCOUNTERS, JSON.stringify(INITIAL_CLINICAL_ENCOUNTERS));
    localStorage.setItem(STORAGE_KEYS.HOSPITAL_REFERRALS, JSON.stringify(INITIAL_HOSPITAL_REFERRALS));
    localStorage.setItem(STORAGE_KEYS.PROLANIS_ENROLLMENTS, JSON.stringify(INITIAL_PROLANIS_ENROLLMENTS));
    // MVP 7 Resets
    localStorage.setItem(STORAGE_KEYS.CITIZEN_OTP_CHALLENGES, JSON.stringify(INITIAL_OTP_CHALLENGES));
    localStorage.setItem(STORAGE_KEYS.CITIZEN_HELP_REQUESTS, JSON.stringify(INITIAL_HELP_REQUESTS));
    localStorage.setItem(STORAGE_KEYS.CITIZEN_BARRIERS, JSON.stringify(INITIAL_BARRIER_REPORTS));
    localStorage.setItem(STORAGE_KEYS.CITIZEN_RESPONSE_TOKENS, JSON.stringify(INITIAL_RESPONSE_TOKENS));
    localStorage.setItem(STORAGE_KEYS.CITIZEN_CURRENT_SESSION, JSON.stringify(null));
    localStorage.setItem(STORAGE_KEYS.CITIZEN_OFFLINE_CACHE, JSON.stringify({}));
    // MVP 8 Resets
    localStorage.setItem(STORAGE_KEYS.MONITORING_CYCLES, JSON.stringify(INITIAL_MONITORING_CYCLES));
    localStorage.setItem(STORAGE_KEYS.ADHERENCE_ASSESSMENTS, JSON.stringify(INITIAL_ADHERENCE_ASSESSMENTS));
    localStorage.setItem(STORAGE_KEYS.OUTCOME_EVALUATIONS, JSON.stringify(INITIAL_OUTCOME_EVALUATIONS));
    // MVP 9 Resets
    localStorage.setItem(STORAGE_KEYS.POPULATION_INTERVENTIONS, JSON.stringify(INITIAL_POPULATION_INTERVENTIONS));
    localStorage.setItem(STORAGE_KEYS.POPULATION_ATTENTIONS, JSON.stringify(INITIAL_POPULATION_ATTENTIONS));
    localStorage.setItem(STORAGE_KEYS.POPULATION_COMPLETENESS, JSON.stringify(INITIAL_POPULATION_COMPLETENESS));
    localStorage.setItem(STORAGE_KEYS.METRIC_DEFINITIONS, JSON.stringify(INITIAL_METRIC_DEFINITIONS));
    localStorage.setItem(STORAGE_KEYS.SMALL_CELL_POLICY, JSON.stringify(INITIAL_SMALL_CELL_POLICY));
    // RSUD Resets
    localStorage.setItem(STORAGE_KEYS.RSUD_SERVICE_READINESS, JSON.stringify(INITIAL_RSUD_SERVICE_READINESS));
    localStorage.setItem(STORAGE_KEYS.RSUD_QUALITY_EVENTS, JSON.stringify(INITIAL_RSUD_QUALITY_EVENTS));
    localStorage.setItem(STORAGE_KEYS.RSUD_RISK_CAPA, JSON.stringify(INITIAL_RSUD_RISK_CAPA));
    localStorage.setItem(STORAGE_KEYS.RSUD_INTEGRATION_STATUS, JSON.stringify(INITIAL_RSUD_INTEGRATION_STATUS));
    localStorage.setItem(STORAGE_KEYS.RSUD_RECONCILIATION_ISSUES, JSON.stringify(INITIAL_RSUD_RECONCILIATION_ISSUES));
    localStorage.setItem(STORAGE_KEYS.RSUD_EXECUTIVE_ACTIONS, JSON.stringify(INITIAL_RSUD_EXECUTIVE_ACTIONS));
    localStorage.setItem(STORAGE_KEYS.RSUD_SLA_DEFINITIONS, JSON.stringify(INITIAL_RSUD_SLA_DEFINITIONS));
    localStorage.setItem(STORAGE_KEYS.RSUD_ESCALATION_LEVELS, JSON.stringify(INITIAL_RSUD_ESCALATION_LEVELS));
    notifyListeners();
  },
};
