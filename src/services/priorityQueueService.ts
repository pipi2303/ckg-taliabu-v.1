import { CareTask } from '../types';
import { rawStorage } from '../repositories/storage';

export interface PriorityQueueItem {
  task: CareTask;
  rank: number;
  whyPrioritized: {
    isCritical: boolean;
    priorityScore: number;
    daysSinceFinding: number;
    dueStatus: 'OVERDUE' | 'DUE_SOON' | 'ON_TIME';
    sourceRule: string;
    summary: string;
  };
}

export interface PriorityQueueSummary {
  todayTasksCount: number;
  criticalCount: number;
  overdueCount: number;
  unassignedCount: number;
  awaitingConfirmationCount: number;
  todayAppointmentsCount: number;
  totalActiveTasks: number;
  capacityLimit: number;
}

export const priorityQueueService = {
  getDailyQueue(facilityId?: string, limit: number = 25): { items: PriorityQueueItem[]; summary: PriorityQueueSummary } {
    const allTasks = rawStorage.getCareTasks();
    const activeTasks = allTasks.filter(
      (t) => (t.status === 'OPEN' || t.status === 'ASSIGNED' || t.status === 'IN_PROGRESS') &&
             (!facilityId || t.facilityId === facilityId)
    );

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // Summary calculations
    const criticalCount = activeTasks.filter((t) => t.isCritical).length;
    const unassignedCount = activeTasks.filter((t) => !t.assignedToUserId).length;
    const overdueCount = activeTasks.filter((t) => new Date(t.dueAt).getTime() < now.getTime()).length;
    const awaitingConfirmationCount = activeTasks.filter(
      (t) => t.taskType === 'CLINICAL_CONFIRMATION'
    ).length;

    const appointments = rawStorage.getAppointments();
    const todayAppointmentsCount = appointments.filter(
      (a) => a.scheduledDate === todayStr && a.status === 'CONFIRMED' && (!facilityId || a.facilityId === facilityId)
    ).length;

    // Stable Sorting:
    // 1. Critical findings
    // 2. Priority score (desc)
    // 3. Time since creation / finding (desc)
    // 4. Stable alphabetical name tie breaker
    const sorted = [...activeTasks].sort((a, b) => {
      if (a.isCritical && !b.isCritical) return -1;
      if (!a.isCritical && b.isCritical) return 1;

      const scoreA = a.priorityScore || 0;
      const scoreB = b.priorityScore || 0;
      if (scoreB !== scoreA) return scoreB - scoreA;

      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      if (timeA !== timeB) return timeA - timeB; // earlier created = longer waiting

      return (a.citizenName || '').localeCompare(b.citizenName || '');
    });

    const topItems = sorted.slice(0, limit);

    const items: PriorityQueueItem[] = topItems.map((task, index) => {
      const dueTime = new Date(task.dueAt).getTime();
      const diffHours = (dueTime - now.getTime()) / (1000 * 60 * 60);
      let dueStatus: 'OVERDUE' | 'DUE_SOON' | 'ON_TIME' = 'ON_TIME';
      if (diffHours < 0) dueStatus = 'OVERDUE';
      else if (diffHours <= 48) dueStatus = 'DUE_SOON';

      const daysSinceFinding = Math.max(
        0,
        Math.floor((now.getTime() - new Date(task.createdAt).getTime()) / (1000 * 60 * 60 * 24))
      );

      let summary = '';
      if (task.isCritical) {
        summary = 'Kedaruratan Medis (Temuan Kritis) - Memerlukan penanganan klinis segera tanpa jeda bertingkat.';
      } else if (dueStatus === 'OVERDUE') {
        summary = `Batas waktu intervensi terlewati (${daysSinceFinding} hari sejak temuan). Prioritas eskalasi.`;
      } else {
        summary = `Skor Prioritas Operasional ${task.priorityScore || 0}/100 berdasarkan stratifikasi multisektoral CRS v0.9.`;
      }

      return {
        task,
        rank: index + 1,
        whyPrioritized: {
          isCritical: !!task.isCritical,
          priorityScore: task.priorityScore || 0,
          daysSinceFinding,
          dueStatus,
          sourceRule: task.sourceRuleCode || 'CR-CRS',
          summary,
        },
      };
    });

    return {
      items,
      summary: {
        todayTasksCount: items.length,
        criticalCount,
        overdueCount,
        unassignedCount,
        awaitingConfirmationCount,
        todayAppointmentsCount,
        totalActiveTasks: activeTasks.length,
        capacityLimit: limit,
      },
    };
  },
};
