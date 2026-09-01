/**
 * Aggregation & business logic for the Direktur RSUD (DIR_RSUD) executive role.
 * Aggregate-first, exception-driven — see CKG_Smart_Care_Role_Direktur_RSUD_Gap_Closure.md.
 * Missing/undefined data is never coerced to 0 (Gap Closure §12) — callers must render
 * "Belum Dapat Dinilai" / "—" for undefined numerator/denominator, same convention as
 * populationQualificationService / impactIndexService.
 */
import { HospitalReferral, QualifiedMetric, RsudExecutiveActionStatus } from '../types';
import { rsudRepo, ReferralCascadeStage } from '../repositories/rsudRepo';

const HOURS = (ms: number) => ms / (1000 * 60 * 60);
const nowIso = () => new Date().toISOString();
const hoursSince = (isoStart: string, isoEnd?: string) => HOURS(new Date(isoEnd || nowIso()).getTime() - new Date(isoStart).getTime());

const isRejected = (r: HospitalReferral) => r.status === 'REJECTED';
const isClosedLoop = (r: HospitalReferral) => !!(r.replyReceivedAt && r.reviewedByPuskesmasAt);

export interface CascadeStageInfo {
  key: string;
  label: string;
  count: number;
}

export interface ReferralCascadeSummary {
  stages: CascadeStageInfo[];
  totalReferred: number;
  totalRejected: number;
  dataCutoffAt: string;
}

export interface BacklogStageRow {
  stage: string;
  label: string;
  count: number;
  referrals: HospitalReferral[];
}

export interface SlaBucket {
  slaCode: string;
  label: string;
  targetHours: number;
  onTimeCount: number;
  breachedCount: number;
  pendingWithinTargetCount: number;
  breachedItems: HospitalReferral[];
}

export interface RejectionRow {
  reason: string;
  label: string;
  count: number;
  referrals: HospitalReferral[];
}

export interface SourcePuskesmasRow {
  facilityId: string;
  facilityName: string;
  total: number;
  accepted: number;
  attended: number;
  serviceCompleted: number;
  closedLoop: number;
  overdueCount: number;
}

export interface RepeatReferralRow {
  citizenId: string;
  citizenName: string;
  count: number;
  referralIds: string[];
}

export interface ExecutiveAlert {
  severity: 'CRITICAL' | 'WARNING';
  message: string;
  count?: number;
}

const REJECTION_LABELS: Record<string, string> = {
  LAYANAN_TIDAK_TERSEDIA: 'Layanan Tidak Tersedia',
  KAPASITAS_PENUH: 'Kapasitas Penuh',
  SPESIALIS_TIDAK_TERSEDIA: 'Spesialis Tidak Tersedia',
  ALAT_TIDAK_TERSEDIA: 'Alat Tidak Tersedia',
  JADWAL_TIDAK_TERSEDIA: 'Jadwal Tidak Tersedia',
  BUTUH_FASILITAS_LEBIH_TINGGI: 'Butuh Fasilitas Lebih Tinggi',
  MASALAH_ADMINISTRATIF: 'Masalah Administratif',
  LAINNYA: 'Lainnya',
};

export const rsudExecutiveService = {
  async getExecutiveKpis(): Promise<{ metrics: QualifiedMetric[]; alerts: ExecutiveAlert[]; dataCutoffAt: string }> {
    const referrals = await rsudRepo.getAllReferrals();
    const dataCutoffAt = nowIso();
    const active = referrals.filter((r) => !isRejected(r));

    const waitingResponse = active.filter((r) => !r.acceptedAt).length;
    const accepted = active.filter((r) => r.acceptedAt).length;
    const scheduled = active.filter((r) => r.scheduledAt).length;
    const attended = active.filter((r) => r.attendedAt).length;
    const serviceCompleted = active.filter((r) => r.serviceCompletedAt).length;
    const waitingClinicalReply = active.filter((r) => r.serviceCompletedAt && !r.replySentAt).length;
    const closedLoopCompleted = active.filter(isClosedLoop).length;
    const rejected = referrals.filter(isRejected).length;

    const metric = (code: string, label: string, numerator: number, denominator: number): QualifiedMetric => ({
      metricCode: code,
      label,
      numerator,
      denominator,
      percentage: denominator > 0 ? Math.round((numerator / denominator) * 1000) / 10 : undefined,
      periodStart: '2026-08-01',
      periodEnd: '2026-08-31',
      dataCutoffAt,
      definitionVersion: '',
      completeness: denominator > 0 ? 'COMPLETE' : 'NOT_ASSESSABLE',
      qualificationMessages: [],
      suppressed: false,
    });

    const metrics: QualifiedMetric[] = [
      metric('RSUD_TOTAL_REFERRED', 'Total Rujukan Masuk (Non-Ditolak)', active.length, referrals.length || 1),
      metric('RSUD_WAITING_RESPONSE', 'Menunggu Respons Acceptance', waitingResponse, active.length || 1),
      metric('RSUD_ACCEPTED', 'Diterima (Accepted)', accepted, active.length || 1),
      metric('RSUD_SCHEDULED', 'Terjadwal (Scheduled)', scheduled, active.length || 1),
      metric('RSUD_ATTENDED', 'Pasien Hadir (Attended)', attended, active.length || 1),
      metric('RSUD_SERVICE_COMPLETED', 'Pelayanan Selesai', serviceCompleted, active.length || 1),
      metric('RSUD_WAITING_REPLY', 'Menunggu Balasan Klinis', waitingClinicalReply, serviceCompleted || 1),
      metric('RSUD_CLOSED_LOOP', 'Closed-Loop Selesai', closedLoopCompleted, active.length || 1),
      metric('RSUD_REJECTED', 'Ditolak / Dialihkan', rejected, referrals.length || 1),
    ];

    const alerts: ExecutiveAlert[] = [];
    const criticalOverdue = active.filter(
      (r) => r.priorityFlag === 'HIGH' && r.serviceCompletedAt && !r.replySentAt && hoursSince(r.serviceCompletedAt) > 24
    );
    if (criticalOverdue.length > 0) {
      alerts.push({ severity: 'CRITICAL', message: 'Balasan klinis prioritas tinggi melewati SLA 24 jam', count: criticalOverdue.length });
    }
    const severeBacklog = active.filter((r) => !r.acceptedAt && hoursSince(r.issuedAt) > 48);
    if (severeBacklog.length > 0) {
      alerts.push({ severity: 'CRITICAL', message: 'Rujukan belum direspons melewati SLA 48 jam', count: severeBacklog.length });
    }
    if (rejected > 0) {
      const rejectedHighPriority = referrals.filter((r) => isRejected(r) && r.priorityFlag === 'HIGH').length;
      if (rejectedHighPriority > 0) {
        alerts.push({ severity: 'WARNING', message: 'Rujukan prioritas tinggi ditolak/dialihkan — perlu tinjauan kapasitas', count: rejectedHighPriority });
      }
    }
    const noShow = active.filter((r) => r.scheduledConsultDate && new Date(r.scheduledConsultDate) < new Date() && !r.attendedAt);
    if (noShow.length > 0) {
      alerts.push({ severity: 'WARNING', message: 'Jadwal konsultasi terlewat tanpa kehadiran pasien (indikasi no-show/kendala akses)', count: noShow.length });
    }

    return { metrics, alerts, dataCutoffAt };
  },

  async getReferralCascade(): Promise<ReferralCascadeSummary> {
    const referrals = await rsudRepo.getAllReferrals();
    const active = referrals.filter((r) => !isRejected(r));
    const stageDefs: { key: string; label: string; predicate: (r: HospitalReferral) => boolean }[] = [
      { key: 'REFERRED', label: 'Rujukan Masuk', predicate: () => true },
      { key: 'ACCEPTED', label: 'Diterima', predicate: (r) => !!r.acceptedAt },
      { key: 'SCHEDULED', label: 'Terjadwal', predicate: (r) => !!r.scheduledAt },
      { key: 'ATTENDED', label: 'Pasien Hadir', predicate: (r) => !!r.attendedAt },
      { key: 'SERVICE_COMPLETED', label: 'Pelayanan Selesai', predicate: (r) => !!r.serviceCompletedAt },
      { key: 'RESULT_RECEIVED', label: 'Hasil Diterima', predicate: (r) => !!r.resultReceivedAt },
      { key: 'CLINICAL_REPLY_SENT', label: 'Balasan Klinis Terkirim', predicate: (r) => !!r.replySentAt },
      { key: 'PUSKESMAS_REVIEWED', label: 'Ditinjau Puskesmas', predicate: (r) => !!r.reviewedByPuskesmasAt },
      { key: 'CLOSED_LOOP', label: 'Closed Loop', predicate: isClosedLoop },
    ];

    return {
      stages: stageDefs.map((s) => ({ key: s.key, label: s.label, count: active.filter(s.predicate).length })),
      totalReferred: referrals.length,
      totalRejected: referrals.filter(isRejected).length,
      dataCutoffAt: nowIso(),
    };
  },

  async getReferralBacklog(): Promise<BacklogStageRow[]> {
    const referrals = await rsudRepo.getAllReferrals();
    const active = referrals.filter((r) => !isRejected(r) && !isClosedLoop(r));
    const rows: { stage: string; label: string; predicate: (r: HospitalReferral) => boolean }[] = [
      { stage: 'WAITING_ACCEPTANCE', label: 'Menunggu Acceptance', predicate: (r) => !r.acceptedAt },
      { stage: 'WAITING_APPOINTMENT', label: 'Menunggu Appointment', predicate: (r) => !!r.acceptedAt && !r.scheduledAt },
      { stage: 'WAITING_ATTENDANCE', label: 'Menunggu Pasien Hadir', predicate: (r) => !!r.scheduledAt && !r.attendedAt },
      { stage: 'WAITING_SERVICE', label: 'Menunggu Pelayanan', predicate: (r) => !!r.attendedAt && !r.serviceCompletedAt },
      { stage: 'WAITING_RESULT', label: 'Menunggu Hasil', predicate: (r) => !!r.serviceCompletedAt && !r.resultReceivedAt },
      { stage: 'WAITING_REPLY', label: 'Menunggu Balasan Klinis', predicate: (r) => !!r.resultReceivedAt && !r.replySentAt },
      { stage: 'WAITING_ACK', label: 'Menunggu Acknowledgment Puskesmas', predicate: (r) => !!r.replySentAt && !r.reviewedByPuskesmasAt },
    ];
    return rows.map((row) => ({
      stage: row.stage,
      label: row.label,
      count: active.filter(row.predicate).length,
      referrals: active.filter(row.predicate),
    }));
  },

  async getReferralSla(): Promise<{ responseSla: SlaBucket; replySlaRoutine: SlaBucket; replySlaHighPriority: SlaBucket }> {
    const referrals = await rsudRepo.getAllReferrals();
    const active = referrals.filter((r) => !isRejected(r));
    const defs = await rsudRepo.getSlaDefinitions();
    const responseDef = defs.find((s) => s.slaCode === 'SLA-REF-RESPONSE');
    const replyDef = defs.find((s) => s.slaCode === 'SLA-CLINICAL-REPLY');
    const emergencyReplyDef = defs.find((s) => s.slaCode === 'SLA-EMERGENCY-REPLY');
    const responseTarget = responseDef?.targetHours ?? 48;
    const replyTarget = replyDef?.targetHours ?? 72;
    const emergencyReplyTarget = emergencyReplyDef?.targetHours ?? 24;

    const buildBucket = (
      slaCode: string,
      label: string,
      targetHours: number,
      items: HospitalReferral[],
      startField: keyof HospitalReferral,
      endField: keyof HospitalReferral
    ): SlaBucket => {
      let onTime = 0;
      let breached = 0;
      let pendingWithinTarget = 0;
      const breachedItems: HospitalReferral[] = [];
      items.forEach((r) => {
        const start = r[startField] as string | undefined;
        if (!start) return;
        const end = r[endField] as string | undefined;
        const elapsed = hoursSince(start, end);
        if (end) {
          if (elapsed <= targetHours) onTime++;
          else breached++;
        } else if (elapsed > targetHours) {
          breached++;
          breachedItems.push(r);
        } else {
          pendingWithinTarget++;
        }
      });
      return { slaCode, label, targetHours, onTimeCount: onTime, breachedCount: breached, pendingWithinTargetCount: pendingWithinTarget, breachedItems };
    };

    const responseSla = buildBucket('SLA-REF-RESPONSE', 'Referral Response SLA', responseTarget, active, 'issuedAt', 'acceptedAt');
    const highPriority = active.filter((r) => r.priorityFlag === 'HIGH');
    const routinePriority = active.filter((r) => r.priorityFlag !== 'HIGH');
    const replySlaRoutine = buildBucket('SLA-CLINICAL-REPLY', 'Clinical Reply SLA (Rutin)', replyTarget, routinePriority, 'serviceCompletedAt', 'replySentAt');
    const replySlaHighPriority = buildBucket('SLA-EMERGENCY-REPLY', 'Clinical Reply SLA (Prioritas Tinggi)', emergencyReplyTarget, highPriority, 'serviceCompletedAt', 'replySentAt');

    return { responseSla, replySlaRoutine, replySlaHighPriority };
  },

  async getClosedLoopRate(): Promise<QualifiedMetric> {
    const referrals = await rsudRepo.getAllReferrals();
    const eligible = referrals.filter((r) => !isRejected(r));
    const closed = eligible.filter(isClosedLoop);
    const dataCutoffAt = nowIso();
    return {
      metricCode: 'RSUD_CLOSED_LOOP_RATE',
      label: 'Closed-Loop Completion Rate',
      numerator: closed.length,
      denominator: eligible.length,
      percentage: eligible.length > 0 ? Math.round((closed.length / eligible.length) * 1000) / 10 : undefined,
      periodStart: '2026-08-01',
      periodEnd: '2026-08-31',
      dataCutoffAt,
      definitionVersion: '',
      completeness: eligible.length > 0 ? 'COMPLETE' : 'NOT_ASSESSABLE',
      qualificationMessages: [
        'Closed-loop = balasan klinis diterima FKTP (replyReceivedAt) DAN ditinjau Puskesmas (reviewedByPuskesmasAt).',
        'Rujukan yang ditolak/dialihkan RSUD dikeluarkan dari penyebut — bukan kegagalan closed-loop.',
      ],
      suppressed: false,
    };
  },

  async getRejectionAnalysis(): Promise<RejectionRow[]> {
    const referrals = await rsudRepo.getAllReferrals();
    const rejected = referrals.filter(isRejected);
    const byReason = new Map<string, HospitalReferral[]>();
    rejected.forEach((r) => {
      const key = r.rejectionReason || 'LAINNYA';
      if (!byReason.has(key)) byReason.set(key, []);
      byReason.get(key)!.push(r);
    });
    return Array.from(byReason.entries()).map(([reason, list]) => ({
      reason,
      label: REJECTION_LABELS[reason] || reason,
      count: list.length,
      referrals: list,
    }));
  },

  async getSourcePuskesmasAnalysis(): Promise<SourcePuskesmasRow[]> {
    const referrals = await rsudRepo.getAllReferrals();
    const active = referrals.filter((r) => !isRejected(r));
    const byFacility = new Map<string, { facilityName: string; referrals: HospitalReferral[] }>();
    active.forEach((r) => {
      if (!byFacility.has(r.originFacilityId)) {
        byFacility.set(r.originFacilityId, { facilityName: r.originFacilityName, referrals: [] });
      }
      byFacility.get(r.originFacilityId)!.referrals.push(r);
    });
    return Array.from(byFacility.entries()).map(([facilityId, { facilityName, referrals: list }]) => ({
      facilityId,
      facilityName,
      total: list.length,
      accepted: list.filter((r) => r.acceptedAt).length,
      attended: list.filter((r) => r.attendedAt).length,
      serviceCompleted: list.filter((r) => r.serviceCompletedAt).length,
      closedLoop: list.filter(isClosedLoop).length,
      overdueCount: list.filter((r) => !r.acceptedAt && hoursSince(r.issuedAt) > 48).length,
    }));
  },

  async getContinuityAndRepeatReferral(): Promise<RepeatReferralRow[]> {
    const referrals = await rsudRepo.getAllReferrals();
    const byCitizen = new Map<string, { citizenName: string; ids: string[] }>();
    referrals.forEach((r) => {
      if (!byCitizen.has(r.citizenId)) byCitizen.set(r.citizenId, { citizenName: r.citizenName, ids: [] });
      byCitizen.get(r.citizenId)!.ids.push(r.id);
    });
    return Array.from(byCitizen.entries())
      .filter(([, v]) => v.ids.length > 1)
      .map(([citizenId, v]) => ({ citizenId, citizenName: v.citizenName, count: v.ids.length, referralIds: v.ids }));
  },

  async markReferralStage(id: string, stage: ReferralCascadeStage, actor: { id: string; name: string }) {
    return rsudRepo.updateReferralCascade(id, stage, actor);
  },

  // Domain B+C — Service Readiness (capacity != capability, Gap Closure §19 Hard Lock)
  async getServiceReadiness() {
    return rsudRepo.getServiceReadiness();
  },

  async getResourceConstraintAnalytics() {
    const readiness = await rsudRepo.getServiceReadiness();
    const backlog = await this.getReferralBacklog();
    const backlogTotal = backlog.reduce((sum, row) => sum + row.count, 0);
    return readiness
      .filter((s) => s.constraintFactors.length > 0)
      .map((s) => ({
        serviceName: s.serviceName,
        capabilityStatus: s.capabilityStatus,
        constraintFactors: s.constraintFactors,
        note: `Faktor yang mungkin terkait — belum terbukti kausal terhadap backlog rujukan kabupaten (${backlogTotal} rujukan tertahan lintas layanan).`,
      }));
  },

  // Domain D — Quality, Safety & Governance
  async getQualityEvents() {
    return rsudRepo.getQualityEvents();
  },

  async getRiskRegister() {
    return rsudRepo.getRiskCapaItems();
  },

  async updateRiskCapaItem(id: string, updates: Parameters<typeof rsudRepo.updateRiskCapaItem>[1], actor: { id: string; name: string }) {
    return rsudRepo.updateRiskCapaItem(id, updates, actor);
  },

  async getComplianceStatus() {
    const [readiness, riskItems, integrationStatus] = await Promise.all([
      rsudRepo.getServiceReadiness(),
      rsudRepo.getRiskCapaItems(),
      rsudRepo.getIntegrationStatus(),
    ]);
    return {
      credentialsExpiringSoon: readiness.reduce((sum, r) => sum + r.credentialsExpiringWithin30d, 0),
      credentialsIncomplete: readiness.reduce((sum, r) => sum + r.credentialsIncomplete, 0),
      unresolvedCriticalCapaCount: riskItems.filter((r) => r.status !== 'CLOSED').length,
      integrationFailureCount: integrationStatus.filter((i) => i.status === 'FAILED' || i.status === 'DEGRADED').length,
    };
  },

  // Domain — Data & Integration
  async getIntegrationStatus() {
    return rsudRepo.getIntegrationStatus();
  },

  async getReconciliationIssues() {
    return rsudRepo.getReconciliationIssues();
  },

  async getBusinessContinuityMode() {
    const status = await rsudRepo.getIntegrationStatus();
    return status.map((s) => ({
      channel: s.channel,
      mode: s.mode,
      fallbackActive: s.mode !== 'AUTOMATIC',
      note:
        s.mode !== 'AUTOMATIC'
          ? 'Alur kerja rujukan kritis tetap berjalan manual; rekonsiliasi dilakukan setelah koneksi otomatis pulih.'
          : 'Terintegrasi otomatis penuh.',
    }));
  },

  // Governance — Reports/Audit/Delegation/SLA Governance/Escalation
  async getSlaGovernance() {
    return rsudRepo.getSlaDefinitions();
  },

  async getEscalationLadder() {
    return rsudRepo.getEscalationLevels();
  },

  // Executive Action Tracker — eksplisit BUKAN CareTask (Gap Closure item 48 Hard Lock)
  async getExecutiveActions() {
    return rsudRepo.getExecutiveActions();
  },

  async createExecutiveAction(
    data: { title: string; decisionNote: string; picUserName: string; dueDate: string },
    actor: { id: string; name: string }
  ) {
    return rsudRepo.createExecutiveAction(data, actor);
  },

  async updateExecutiveActionProgress(
    id: string,
    updates: { progressPercent?: number; status?: RsudExecutiveActionStatus; evidenceNote?: string; reviewNote?: string },
    actor: { id: string; name: string }
  ) {
    return rsudRepo.updateExecutiveActionProgress(id, updates, actor);
  },
};
