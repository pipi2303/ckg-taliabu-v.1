import { ContactAttempt } from '../types';
import { rawStorage, simulateNetworkDelay } from './storage';
import { auditRepo } from './auditRepo';

export const contactAttemptRepo = {
  async getAll(): Promise<ContactAttempt[]> {
    await simulateNetworkDelay();
    return rawStorage.getContactAttempts();
  },

  async getByTaskId(taskId: string): Promise<ContactAttempt[]> {
    await simulateNetworkDelay();
    const attempts = rawStorage.getContactAttempts();
    return attempts
      .filter((a) => a.taskId === taskId)
      .sort((a, b) => new Date(b.attemptedAt).getTime() - new Date(a.attemptedAt).getTime());
  },

  async getByCitizenId(citizenId: string): Promise<ContactAttempt[]> {
    await simulateNetworkDelay();
    const attempts = rawStorage.getContactAttempts();
    return attempts
      .filter((a) => a.citizenId === citizenId)
      .sort((a, b) => new Date(b.attemptedAt).getTime() - new Date(a.attemptedAt).getTime());
  },

  async create(
    attempt: Omit<ContactAttempt, 'id' | 'attemptedAt'>,
    actor?: { id: string; name: string }
  ): Promise<ContactAttempt> {
    await simulateNetworkDelay();
    const attempts = rawStorage.getContactAttempts();
    const id = `ATT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
    const now = new Date().toISOString();

    const newAttempt: ContactAttempt = {
      ...attempt,
      id,
      attemptedAt: now,
      attemptedByUserId: actor?.id || attempt.attemptedByUserId,
      attemptedByUserName: actor?.name || attempt.attemptedByUserName,
    };

    attempts.unshift(newAttempt);
    rawStorage.setContactAttempts(attempts);

    // Update related CareTask contact counters if present
    if (attempt.taskId) {
      const tasks = rawStorage.getCareTasks();
      const taskIndex = tasks.findIndex((t) => t.id === attempt.taskId);
      if (taskIndex !== -1) {
        // Only count towards ladder if not delivery failed
        const successfulIncrement = attempt.deliveryFailed ? 0 : 1;
        tasks[taskIndex].contactAttemptsCount = (tasks[taskIndex].contactAttemptsCount || 0) + successfulIncrement;
        tasks[taskIndex].lastContactAttemptAt = now;
        tasks[taskIndex].lastContactOutcome = attempt.outcome;
        tasks[taskIndex].updatedAt = now;
        rawStorage.setCareTasks(tasks);
      }
    }

    if (actor) {
      await auditRepo.log({
        action: 'RECORD_CONTACT',
        entityType: 'CONTACT_ATTEMPT',
        entityId: id,
        details: {
          taskId: attempt.taskId,
          citizenId: attempt.citizenId,
          channel: attempt.channel,
          outcome: attempt.outcome,
          declineReason: attempt.declineReason,
        },
        userId: actor.id,
        userName: actor.name,
      });
    }

    return newAttempt;
  },
};
