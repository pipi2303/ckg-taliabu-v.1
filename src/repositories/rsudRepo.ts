import {
  HospitalReferral,
  RsudServiceReadiness,
  RsudQualityEvent,
  RsudRiskCapaItem,
  RsudIntegrationChannelStatus,
  RsudReconciliationIssue,
  RsudExecutiveAction,
  RsudExecutiveActionStatus,
  RsudSlaDefinition,
  RsudEscalationLevel,
} from '../types';
import { rawStorage, simulateNetworkDelay } from './storage';
import { auditRepo } from './auditRepo';

// Tahap cascade referral yang dapat ditandai manual dari halaman Referral Network.
// Urutan mengikuti Gap Closure §2.4 Closed-Loop Referral.
export type ReferralCascadeStage =
  | 'acceptedAt'
  | 'scheduledAt'
  | 'attendedAt'
  | 'serviceCompletedAt'
  | 'resultReceivedAt'
  | 'replySentAt'
  | 'replyReceivedAt'
  | 'reviewedByPuskesmasAt';

export const rsudRepo = {
  // Referral cascade — dibaca lewat clinicalRepo.getReferrals() yang sudah ada; di sini hanya
  // menambahkan operasi "tandai tahap" yang belum ada di clinicalRepo.
  async getAllReferrals(): Promise<HospitalReferral[]> {
    await simulateNetworkDelay();
    return rawStorage.getHospitalReferrals();
  },

  async updateReferralCascade(
    id: string,
    stage: ReferralCascadeStage,
    actor: { id: string; name: string },
    timestamp?: string
  ): Promise<HospitalReferral> {
    await simulateNetworkDelay();
    const list = rawStorage.getHospitalReferrals();
    const index = list.findIndex((r) => r.id === id);
    if (index === -1) throw new Error('Rujukan tidak ditemukan.');

    const now = timestamp || new Date().toISOString();
    const updated: HospitalReferral = { ...list[index], [stage]: now, updatedAt: now };
    list[index] = updated;
    rawStorage.setHospitalReferrals([...list]);

    await auditRepo.log({
      action: 'UPDATE_REFERRAL_STATUS',
      entityType: 'HOSPITAL_REFERRAL',
      entityId: id,
      targetLabel: `Tandai Tahap Rujukan ${updated.referralLetterNumber}: ${stage}`,
      citizenId: updated.citizenId,
      facilityId: updated.targetHospitalId,
      facilityName: updated.targetHospitalName,
      details: { stage, timestamp: now },
      userId: actor.id,
      userName: actor.name,
    });

    return updated;
  },

  // Service Readiness
  async getServiceReadiness(): Promise<RsudServiceReadiness[]> {
    await simulateNetworkDelay();
    return rawStorage.getRsudServiceReadiness();
  },

  // Quality Events
  async getQualityEvents(): Promise<RsudQualityEvent[]> {
    await simulateNetworkDelay();
    return rawStorage.getRsudQualityEvents();
  },

  // Risk Register & CAPA
  async getRiskCapaItems(): Promise<RsudRiskCapaItem[]> {
    await simulateNetworkDelay();
    return rawStorage.getRsudRiskCapa();
  },

  async updateRiskCapaItem(id: string, updates: Partial<RsudRiskCapaItem>, actor: { id: string; name: string }): Promise<RsudRiskCapaItem> {
    await simulateNetworkDelay();
    const list = rawStorage.getRsudRiskCapa();
    const index = list.findIndex((item) => item.id === id);
    if (index === -1) throw new Error('Item risiko/CAPA tidak ditemukan.');
    const updated: RsudRiskCapaItem = { ...list[index], ...updates, updatedAt: new Date().toISOString() };
    list[index] = updated;
    rawStorage.setRsudRiskCapa([...list]);

    await auditRepo.log({
      action: 'UPDATE',
      entityType: 'EXECUTIVE_ACTION',
      entityId: id,
      targetLabel: `Update Risk Register/CAPA: ${updated.riskTitle}`,
      details: { updates },
      userId: actor.id,
      userName: actor.name,
    });

    return updated;
  },

  // Integration Status (SIMRS / SATUSEHAT)
  async getIntegrationStatus(): Promise<RsudIntegrationChannelStatus[]> {
    await simulateNetworkDelay();
    return rawStorage.getRsudIntegrationStatus();
  },

  // Data Reconciliation
  async getReconciliationIssues(): Promise<RsudReconciliationIssue[]> {
    await simulateNetworkDelay();
    return rawStorage.getRsudReconciliationIssues();
  },

  // Executive Action Tracker — eksplisit BUKAN CareTask (Gap Closure item 48 Hard Lock).
  async getExecutiveActions(): Promise<RsudExecutiveAction[]> {
    await simulateNetworkDelay();
    return rawStorage.getRsudExecutiveActions();
  },

  async createExecutiveAction(
    data: { title: string; decisionNote: string; picUserName: string; dueDate: string },
    actor: { id: string; name: string }
  ): Promise<RsudExecutiveAction> {
    await simulateNetworkDelay();
    const list = rawStorage.getRsudExecutiveActions();
    const now = new Date().toISOString();
    const newAction: RsudExecutiveAction = {
      id: `REA-${Date.now().toString(36).toUpperCase()}`,
      ...data,
      progressPercent: 0,
      status: 'OPEN',
      createdByUserName: actor.name,
      createdAt: now,
      updatedAt: now,
    };
    rawStorage.setRsudExecutiveActions([newAction, ...list]);

    await auditRepo.log({
      action: 'CREATE',
      entityType: 'EXECUTIVE_ACTION',
      entityId: newAction.id,
      targetLabel: `Tindakan Eksekutif Baru: ${newAction.title}`,
      details: { picUserName: newAction.picUserName, dueDate: newAction.dueDate },
      userId: actor.id,
      userName: actor.name,
    });

    return newAction;
  },

  async updateExecutiveActionProgress(
    id: string,
    updates: { progressPercent?: number; status?: RsudExecutiveActionStatus; evidenceNote?: string; reviewNote?: string },
    actor: { id: string; name: string }
  ): Promise<RsudExecutiveAction> {
    await simulateNetworkDelay();
    const list = rawStorage.getRsudExecutiveActions();
    const index = list.findIndex((item) => item.id === id);
    if (index === -1) throw new Error('Tindakan eksekutif tidak ditemukan.');
    const updated: RsudExecutiveAction = { ...list[index], ...updates, updatedAt: new Date().toISOString() };
    list[index] = updated;
    rawStorage.setRsudExecutiveActions([...list]);

    await auditRepo.log({
      action: 'UPDATE',
      entityType: 'EXECUTIVE_ACTION',
      entityId: id,
      targetLabel: `Update Progres Tindakan Eksekutif: ${updated.title}`,
      details: { updates },
      userId: actor.id,
      userName: actor.name,
    });

    return updated;
  },

  // SLA Governance & Escalation Ladder — versioned, read-only display (Gap Closure item 31-32).
  async getSlaDefinitions(): Promise<RsudSlaDefinition[]> {
    await simulateNetworkDelay();
    return rawStorage.getRsudSlaDefinitions();
  },

  async getEscalationLevels(): Promise<RsudEscalationLevel[]> {
    await simulateNetworkDelay();
    return rawStorage.getRsudEscalationLevels();
  },
};
