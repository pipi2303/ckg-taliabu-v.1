import { CareTask, RoleId, User } from '../types';
import { rawStorage } from '../repositories/storage';
import { careTaskRepo } from '../repositories/careTaskRepo';

export interface AssigneeOption {
  user: User;
  activeTasksCount: number;
  isOverloaded: boolean;
  isSameVillage: boolean;
  workloadLabel: string;
}

export interface KaderTaskPayload {
  taskId: string;
  citizenName: string;
  addressText?: string;
  villageName?: string;
  actionText: string;
  dueAt: string;
  dueShiftedReason?: string;
  completionCriteria: string;
}

export const taskAssignmentService = {
  /**
   * Retrieves candidate assignees for a given CareTask filtered and scoped by area.
   */
  async getCandidateAssignees(taskId: string): Promise<AssigneeOption[]> {
    const task = await careTaskRepo.getById(taskId);
    if (!task) throw new Error('Tugas tidak ditemukan.');

    const users = rawStorage.getUsers().filter((u) => u.status === 'ACTIVE');
    const careTasks = rawStorage.getCareTasks();

    const candidates: AssigneeOption[] = [];

    for (const user of users) {
      // Filter by role appropriateness
      const isField = user.roleId === 'KADER' || user.roleId === 'PUSTU' || user.roleId === 'POSYANDU';
      const isClinicalOrAdmin =
        user.roleId === 'DOCTOR' ||
        user.roleId === 'NURSE_MIDWIFE' ||
        user.roleId === 'KEPALA_PUSKESMAS';

      if (!isField && !isClinicalOrAdmin) continue;

      // Area-scope validation:
      // If user is KADER/PUSTU, they must cover citizen's village
      const coversVillage =
        !task.villageId ||
        user.areaScopes.includes(task.villageId) ||
        user.villageAssignment === task.villageId ||
        user.facilityId === task.facilityId;

      // Calculate active task workload
      const userActiveTasks = careTasks.filter(
        (t) =>
          t.assignedToUserId === user.id &&
          (t.status === 'ASSIGNED' || t.status === 'IN_PROGRESS')
      ).length;

      const isOverloaded = userActiveTasks >= 10;
      let workloadLabel = `${userActiveTasks} tugas aktif`;
      if (isOverloaded) {
        workloadLabel = `${userActiveTasks} tugas aktif — beban tinggi`;
      }

      candidates.push({
        user,
        activeTasksCount: userActiveTasks,
        isOverloaded,
        isSameVillage: coversVillage,
        workloadLabel,
      });
    }

    // Sort: Same village first, then lowest workload first
    return candidates.sort((a, b) => {
      if (a.isSameVillage && !b.isSameVillage) return -1;
      if (!a.isSameVillage && b.isSameVillage) return 1;
      return a.activeTasksCount - b.activeTasksCount;
    });
  },

  /**
   * Generates Minimum Necessary Payload (S0-S2 only) for Kader Field App preview.
   * Strips all clinical measurements (BP, Glucose, BMI), diagnosis, risk color, and triggered rules.
   */
  getKaderPayload(task: CareTask): KaderTaskPayload {
    return {
      taskId: task.id,
      citizenName: task.citizenName || 'Warga CKG',
      addressText: task.citizenNik ? undefined : 'Wilayah Desa',
      villageName: task.villageName,
      actionText: task.actionText, // S2 operational instruction
      dueAt: task.dueAt,
      dueShiftedReason: task.dueShiftedReason,
      completionCriteria: task.completionCriteria,
    };
  },
};
