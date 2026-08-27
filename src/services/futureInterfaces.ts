import {
  ClinicalRiskCategory,
  NextBestAction,
  RiskClassification,
} from '../types';
import { classificationRepo } from '../repositories/classificationRepo';

/**
 * Clean interfaces exposed for future MVP 4 (Care Orchestration, Task Assignment, Outreach)
 */

export async function getCurrentClassification(
  citizenId: string
): Promise<RiskClassification | undefined> {
  const result = await classificationRepo.getByCitizenId(citizenId);
  return result.current;
}

export async function getPriorityScore(citizenId: string): Promise<number> {
  const current = await getCurrentClassification(citizenId);
  return current ? current.priorityScore : 0;
}

export async function getCriticalStatus(citizenId: string): Promise<boolean> {
  const current = await getCurrentClassification(citizenId);
  return current ? current.isCritical : false;
}

export async function getNextBestActions(
  citizenId: string
): Promise<NextBestAction[]> {
  const current = await getCurrentClassification(citizenId);
  return current ? current.nextBestActions : [];
}

export async function getRiskCategory(
  citizenId: string
): Promise<ClinicalRiskCategory> {
  const current = await getCurrentClassification(citizenId);
  return current ? current.finalCategory : 'UNDETERMINED';
}

/**
 * MVP 5 interfaces exposed for future MVP 6 (Clinical Follow-Up & Closed-Loop Clinical Care)
 */
import { kaderSyncService } from './kaderSyncService';

export function getSyncedFieldVisits(citizenId: string) {
  return kaderSyncService.getSyncedFieldVisits(citizenId);
}

export function getFieldVisitEvidence(taskId: string) {
  return kaderSyncService.getFieldVisitEvidence(taskId);
}

export function getSchedulingRequests(citizenId: string) {
  return kaderSyncService.getSchedulingRequests(citizenId);
}

export function getUrgentFieldEscalations(citizenId: string) {
  return kaderSyncService.getUrgentFieldEscalations(citizenId);
}
