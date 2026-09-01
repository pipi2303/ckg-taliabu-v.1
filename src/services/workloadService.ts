import { CareTask, ContactAttempt, User } from '../types';
import { rawStorage } from '../repositories/storage';

const UNREACHABLE_OUTCOMES = new Set(['NO_ANSWER', 'NUMBER_INACTIVE', 'WRONG_PERSON', 'NOT_AT_HOME', 'ADDRESS_NOT_FOUND']);
const CAPACITY_DECLINE_REASONS = new Set(['MEDICATION_UNAVAILABLE', 'SERVICE_COST']);

/**
 * Groups overdue tasks by cause when knowable (CO-12) from real ContactAttempt records
 * (declineReason / outcome) instead of a fixed placeholder count.
 */
function computeOverdueReasonBreakdown(overdueTasks: CareTask[]): WorkloadOverview['overdueReasonBreakdown'] {
  const allContactAttempts = rawStorage.getContactAttempts();
  const attemptsByTask = new Map<string, ContactAttempt[]>();
  allContactAttempts.forEach((a) => {
    const list = attemptsByTask.get(a.taskId) || [];
    list.push(a);
    attemptsByTask.set(a.taskId, list);
  });

  const breakdown = {
    transport: 0,
    unreachableCitizen: 0,
    capacity: 0,
    communication: 0,
    unassigned: 0,
    other: 0,
  };

  overdueTasks.forEach((t) => {
    if (!t.assignedToUserId) {
      breakdown.unassigned++;
      return;
    }

    const latest = (attemptsByTask.get(t.id) || []).sort(
      (a, b) => new Date(b.attemptedAt).getTime() - new Date(a.attemptedAt).getTime()
    )[0];

    if (t.taskType === 'MEDICATION_RESUPPLY' || (latest?.declineReason && CAPACITY_DECLINE_REASONS.has(latest.declineReason))) {
      breakdown.capacity++;
    } else if (latest?.declineReason === 'DISTANCE_TRANSPORT') {
      breakdown.transport++;
    } else if (latest && UNREACHABLE_OUTCOMES.has(latest.outcome)) {
      breakdown.unreachableCitizen++;
    } else if (latest?.outcome === 'CONNECTED_POSTPONED' || (t.contactAttemptsCount || 0) === 0) {
      breakdown.communication++;
    } else {
      breakdown.other++;
    }
  });

  return breakdown;
}

export interface UserWorkloadItem {
  user: User;
  activeTasks: number;
  overdueTasks: number;
  escalatedTasks: number;
  isHighWorkload: boolean;
  tasks: CareTask[];
}

export interface VillageOverdueSummary {
  villageId: string;
  villageName: string;
  overdueCount: number;
  totalActive: number;
}

export interface WorkloadOverview {
  staffWorkloads: UserWorkloadItem[];
  kaderWorkloads: UserWorkloadItem[];
  villageOverdues: VillageOverdueSummary[];
  totalActiveTasks: number;
  totalUnassignedTasks: number;
  totalEscalatedTasks: number;
  totalOverdueTasks: number;
  overdueReasonBreakdown: {
    transport: number;
    unreachableCitizen: number;
    capacity: number;
    communication: number;
    unassigned: number;
    other: number;
  };
}

export const workloadService = {
  getWorkloadOverview(facilityId?: string): WorkloadOverview {
    const allUsers = rawStorage.getUsers().filter((u) => u.status === 'ACTIVE');
    const allTasks = rawStorage.getCareTasks();
    const activeTasks = allTasks.filter(
      (t) =>
        (t.status === 'OPEN' || t.status === 'ASSIGNED' || t.status === 'IN_PROGRESS') &&
        (!facilityId || t.facilityId === facilityId)
    );

    const now = new Date();

    const staffUsers = allUsers.filter(
      (u) =>
        u.roleId === 'DOCTOR' ||
        u.roleId === 'NURSE_MIDWIFE' ||
        u.roleId === 'KEPALA_PUSKESMAS'
    );

    const kaderUsers = allUsers.filter(
      (u) => u.roleId === 'KADER' || u.roleId === 'PUSTU' || u.roleId === 'POSYANDU'
    );

    const buildUserWorkload = (users: User[]): UserWorkloadItem[] => {
      return users.map((u) => {
        const userTasks = activeTasks.filter((t) => t.assignedToUserId === u.id);
        const overdue = userTasks.filter((t) => new Date(t.dueAt).getTime() < now.getTime()).length;
        const escalated = userTasks.filter((t) => (t.escalationLevel || 0) > 0).length;

        return {
          user: u,
          activeTasks: userTasks.length,
          overdueTasks: overdue,
          escalatedTasks: escalated,
          isHighWorkload: userTasks.length >= 10,
          tasks: userTasks,
        };
      });
    };

    // Village overdue grouping
    const villages = rawStorage.getDesa();
    const villageOverdues: VillageOverdueSummary[] = villages.map((v) => {
      const vTasks = activeTasks.filter((t) => t.villageId === v.id);
      const vOverdue = vTasks.filter((t) => new Date(t.dueAt).getTime() < now.getTime()).length;
      return {
        villageId: v.id,
        villageName: v.name,
        overdueCount: vOverdue,
        totalActive: vTasks.length,
      };
    });

    const unassignedTasks = activeTasks.filter((t) => !t.assignedToUserId);
    const escalatedTasks = activeTasks.filter((t) => (t.escalationLevel || 0) > 0);
    const overdueTasks = activeTasks.filter((t) => new Date(t.dueAt).getTime() < now.getTime());

    return {
      staffWorkloads: buildUserWorkload(staffUsers),
      kaderWorkloads: buildUserWorkload(kaderUsers),
      villageOverdues: villageOverdues.filter((v) => v.totalActive > 0),
      totalActiveTasks: activeTasks.length,
      totalUnassignedTasks: unassignedTasks.length,
      totalEscalatedTasks: escalatedTasks.length,
      totalOverdueTasks: overdueTasks.length,
      overdueReasonBreakdown: computeOverdueReasonBreakdown(overdueTasks),
    };
  },
};
