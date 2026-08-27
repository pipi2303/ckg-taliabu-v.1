import { CareTask, TaskAssignment, TaskClosure, TaskStatus, TaskType } from '../types';
import { rawStorage, simulateNetworkDelay } from './storage';
import { auditRepo } from './auditRepo';

export interface CareTaskFilterParams {
  search?: string;
  facilityId?: string;
  villageId?: string;
  status?: 'ALL' | TaskStatus;
  taskType?: 'ALL' | TaskType;
  escalationLevel?: 'ALL' | 0 | 1 | 2;
  isCritical?: boolean;
  assignedToUserId?: string;
  unassignedOnly?: boolean;
  dueStatus?: 'ALL' | 'OVERDUE' | 'DUE_SOON' | 'ON_TIME';
}

export const careTaskRepo = {
  async getAll(): Promise<CareTask[]> {
    await simulateNetworkDelay();
    return rawStorage.getCareTasks();
  },

  async getById(id: string): Promise<CareTask | null> {
    await simulateNetworkDelay();
    const tasks = rawStorage.getCareTasks();
    return tasks.find((t) => t.id === id) || null;
  },

  async getByCitizenId(citizenId: string): Promise<CareTask[]> {
    await simulateNetworkDelay();
    const tasks = rawStorage.getCareTasks();
    return tasks.filter((t) => t.citizenId === citizenId);
  },

  async query(params: CareTaskFilterParams = {}): Promise<CareTask[]> {
    await simulateNetworkDelay();
    let tasks = rawStorage.getCareTasks();
    const now = new Date();

    if (params.search) {
      const q = params.search.toLowerCase();
      tasks = tasks.filter(
        (t) =>
          t.citizenName?.toLowerCase().includes(q) ||
          t.citizenNik?.includes(q) ||
          t.citizenPhone?.includes(q) ||
          t.actionText.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q) ||
          t.sourceRuleCode?.toLowerCase().includes(q)
      );
    }

    if (params.facilityId) {
      tasks = tasks.filter((t) => t.facilityId === params.facilityId);
    }

    if (params.villageId) {
      tasks = tasks.filter((t) => t.villageId === params.villageId);
    }

    if (params.status && params.status !== 'ALL') {
      tasks = tasks.filter((t) => t.status === params.status);
    }

    if (params.taskType && params.taskType !== 'ALL') {
      tasks = tasks.filter((t) => t.taskType === params.taskType);
    }

    if (params.escalationLevel !== undefined && params.escalationLevel !== 'ALL') {
      tasks = tasks.filter((t) => t.escalationLevel === params.escalationLevel);
    }

    if (params.isCritical !== undefined) {
      tasks = tasks.filter((t) => t.isCritical === params.isCritical);
    }

    if (params.unassignedOnly) {
      tasks = tasks.filter((t) => !t.assignedToUserId && t.status !== 'CLOSED' && t.status !== 'CANCELLED');
    } else if (params.assignedToUserId) {
      tasks = tasks.filter((t) => t.assignedToUserId === params.assignedToUserId);
    }

    if (params.dueStatus && params.dueStatus !== 'ALL') {
      tasks = tasks.filter((t) => {
        if (t.status === 'CLOSED' || t.status === 'CANCELLED') return false;
        const due = new Date(t.dueAt).getTime();
        const diffHours = (due - now.getTime()) / (1000 * 60 * 60);

        if (params.dueStatus === 'OVERDUE') {
          return diffHours < 0;
        } else if (params.dueStatus === 'DUE_SOON') {
          return diffHours >= 0 && diffHours <= 48; // within 48 hours
        } else if (params.dueStatus === 'ON_TIME') {
          return diffHours > 48;
        }
        return true;
      });
    }

    return tasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async create(task: Omit<CareTask, 'id' | 'createdAt' | 'updatedAt' | 'contactAttemptsCount'>): Promise<CareTask> {
    await simulateNetworkDelay();
    const tasks = rawStorage.getCareTasks();
    const id = `TASK-${new Date().getFullYear()}-${String(tasks.length + 1).padStart(3, '0')}`;
    const now = new Date().toISOString();

    const newTask: CareTask = {
      ...task,
      id,
      contactAttemptsCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    tasks.unshift(newTask);
    rawStorage.setCareTasks(tasks);
    return newTask;
  },

  async update(id: string, updates: Partial<CareTask>): Promise<CareTask> {
    await simulateNetworkDelay();
    const tasks = rawStorage.getCareTasks();
    const idx = tasks.findIndex((t) => t.id === id);
    if (idx === -1) {
      throw new Error(`CareTask ${id} tidak ditemukan.`);
    }

    const updated: CareTask = {
      ...tasks[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    tasks[idx] = updated;
    rawStorage.setCareTasks(tasks);
    return updated;
  },

  async assign(
    taskId: string,
    assignee: { userId: string; userName: string; role: any; facilityId?: string; facilityName?: string },
    actor: { id: string; name: string }
  ): Promise<CareTask> {
    await simulateNetworkDelay();
    const task = await this.getById(taskId);
    if (!task) throw new Error('Task not found');

    const now = new Date().toISOString();
    const updatedTask = await this.update(taskId, {
      assignedToUserId: assignee.userId,
      assignedToUserName: assignee.userName,
      assignedToRole: assignee.role,
      assignedFacilityId: assignee.facilityId || task.facilityId,
      assignedFacilityName: assignee.facilityName || task.facilityName,
      assignedAt: now,
      status: task.status === 'OPEN' ? 'ASSIGNED' : task.status,
    });

    // Create Assignment Record
    const assignments = rawStorage.getTaskAssignments();
    const newAssignment: TaskAssignment = {
      id: `ASG-${Date.now().toString(36).toUpperCase()}`,
      taskId,
      assignedToUserId: assignee.userId,
      assignedToUserName: assignee.userName,
      assignedToRole: assignee.role,
      assignedFacilityId: assignee.facilityId || task.facilityId,
      assignedFacilityName: assignee.facilityName || task.facilityName,
      assignedByUserId: actor.id,
      assignedByUserName: actor.name,
      assignedAt: now,
      status: 'ACTIVE',
    };
    assignments.unshift(newAssignment);
    rawStorage.setTaskAssignments(assignments);

    await auditRepo.log({
      action: 'ASSIGN_TASK',
      entityType: 'CARE_TASK',
      entityId: taskId,
      details: {
        taskType: task.taskType,
        assignedTo: assignee.userName,
        assignedRole: assignee.role,
      },
      userId: actor.id,
      userName: actor.name,
    });

    return updatedTask;
  },

  async reassign(
    taskId: string,
    newAssignee: { userId: string; userName: string; role: any; facilityId?: string; facilityName?: string },
    reason: string,
    actor: { id: string; name: string }
  ): Promise<CareTask> {
    await simulateNetworkDelay();
    const task = await this.getById(taskId);
    if (!task) throw new Error('Task not found');
    if (!reason || reason.trim().length < 5) {
      throw new Error('Alasan pengalihan tugas wajib diisi minimal 5 karakter.');
    }

    const now = new Date().toISOString();
    const assignments = rawStorage.getTaskAssignments();

    // Mark previous active assignment as REASSIGNED
    assignments.forEach((a) => {
      if (a.taskId === taskId && a.status === 'ACTIVE') {
        a.status = 'REASSIGNED';
        a.reassignedAt = now;
        a.reassignmentReason = reason;
      }
    });

    // Create new active assignment
    const newAssignment: TaskAssignment = {
      id: `ASG-${Date.now().toString(36).toUpperCase()}`,
      taskId,
      assignedToUserId: newAssignee.userId,
      assignedToUserName: newAssignee.userName,
      assignedToRole: newAssignee.role,
      assignedFacilityId: newAssignee.facilityId || task.facilityId,
      assignedFacilityName: newAssignee.facilityName || task.facilityName,
      assignedByUserId: actor.id,
      assignedByUserName: actor.name,
      assignedAt: now,
      status: 'ACTIVE',
    };
    assignments.unshift(newAssignment);
    rawStorage.setTaskAssignments(assignments);

    const updatedTask = await this.update(taskId, {
      assignedToUserId: newAssignee.userId,
      assignedToUserName: newAssignee.userName,
      assignedToRole: newAssignee.role,
      assignedFacilityId: newAssignee.facilityId || task.facilityId,
      assignedFacilityName: newAssignee.facilityName || task.facilityName,
      assignedAt: now,
      status: 'ASSIGNED',
    });

    await auditRepo.log({
      action: 'REASSIGN_TASK',
      entityType: 'CARE_TASK',
      entityId: taskId,
      details: {
        previousAssignee: task.assignedToUserName,
        newAssignee: newAssignee.userName,
        reason,
      },
      userId: actor.id,
      userName: actor.name,
    });

    return updatedTask;
  },

  async close(
    taskId: string,
    closureData: {
      closureType: 'EVIDENCE_BASED' | 'MANUAL';
      evidenceType?: 'ATTENDANCE' | 'FIELD_VISIT' | 'CLINICAL_RECORD';
      evidenceRefId?: string;
      manualReason?: string;
    },
    actor: { id: string; name: string }
  ): Promise<CareTask> {
    await simulateNetworkDelay();
    const task = await this.getById(taskId);
    if (!task) throw new Error('Task not found');

    if (closureData.closureType === 'MANUAL') {
      if (!closureData.manualReason || closureData.manualReason.trim().length < 10) {
        throw new Error('Alasan penutupan manual wajib diisi minimal 10 karakter untuk audit trail.');
      }
    }

    const now = new Date().toISOString();
    const closures = rawStorage.getTaskClosures();
    const newClosure: TaskClosure = {
      id: `CLS-${Date.now().toString(36).toUpperCase()}`,
      taskId,
      citizenId: task.citizenId,
      closureType: closureData.closureType,
      evidenceType: closureData.evidenceType,
      evidenceRefId: closureData.evidenceRefId,
      manualReason: closureData.manualReason,
      closedByUserId: actor.id,
      closedByUserName: actor.name,
      closedAt: now,
    };
    closures.unshift(newClosure);
    rawStorage.setTaskClosures(closures);

    // Mark active assignments as COMPLETED
    const assignments = rawStorage.getTaskAssignments();
    assignments.forEach((a) => {
      if (a.taskId === taskId && a.status === 'ACTIVE') {
        a.status = 'COMPLETED';
      }
    });
    rawStorage.setTaskAssignments(assignments);

    const updatedTask = await this.update(taskId, {
      status: 'CLOSED',
    });

    await auditRepo.log({
      action: closureData.closureType === 'MANUAL' ? 'MANUAL_CLOSE_TASK' : 'CLOSE_TASK',
      entityType: 'CARE_TASK',
      entityId: taskId,
      details: {
        closureType: closureData.closureType,
        evidenceType: closureData.evidenceType,
        evidenceRefId: closureData.evidenceRefId,
        manualReason: closureData.manualReason,
      },
      userId: actor.id,
      userName: actor.name,
    });

    return updatedTask;
  },

  async cancel(taskId: string, reason: string, actor: { id: string; name: string }): Promise<CareTask> {
    await simulateNetworkDelay();
    const task = await this.getById(taskId);
    if (!task) throw new Error('Task not found');
    if (!reason || reason.trim().length < 5) {
      throw new Error('Alasan pembatalan tugas wajib diisi.');
    }

    const updatedTask = await this.update(taskId, {
      status: 'CANCELLED',
      cancelReason: reason,
    });

    await auditRepo.log({
      action: 'UPDATE',
      entityType: 'CARE_TASK',
      entityId: taskId,
      details: {
        previousStatus: task.status,
        newStatus: 'CANCELLED',
        cancelReason: reason,
      },
      userId: actor.id,
      userName: actor.name,
    });

    return updatedTask;
  },
};
