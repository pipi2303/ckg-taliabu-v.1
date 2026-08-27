import { PriorityWeightVersion, User } from '../types';
import { rawStorage, simulateNetworkDelay } from './storage';
import { auditService } from '../services/auditService';

export const priorityWeightRepo = {
  async getActive(): Promise<PriorityWeightVersion> {
    await simulateNetworkDelay();
    const all = rawStorage.getPriorityWeightVersions();
    const active = all.find((v) => v.status === 'ACTIVE');
    return active || all[0];
  },

  async getAll(): Promise<PriorityWeightVersion[]> {
    await simulateNetworkDelay();
    return rawStorage.getPriorityWeightVersions();
  },

  async createNewVersion(
    weights: PriorityWeightVersion['weights'],
    notes: string,
    actor: User
  ): Promise<PriorityWeightVersion> {
    await simulateNetworkDelay();
    const existing = rawStorage.getPriorityWeightVersions();

    // Deactivate previous active version
    const updatedExisting = existing.map((v) => {
      if (v.status === 'ACTIVE') {
        return { ...v, status: 'INACTIVE' as const };
      }
      return v;
    });

    const newVersionNumber = `v${existing.length + 1}.0-TALIABU-${new Date().getFullYear()}`;
    const newVersion: PriorityWeightVersion = {
      id: `PW-V${existing.length + 1}-${Date.now()}`,
      version: newVersionNumber,
      weights,
      activeFrom: new Date().toISOString(),
      createdBy: `${actor.name} (${actor.roleName})`,
      status: 'ACTIVE',
      notes,
    };

    rawStorage.setPriorityWeightVersions([newVersion, ...updatedExisting]);

    // Audit priority weight version change
    await auditService.log(actor, 'CHANGE_WEIGHTS', 'PRIORITY_WEIGHT_VERSION', {
      targetId: newVersion.id,
      targetLabel: newVersion.version,
      purposeCode: 'PRIORITY_ALGORITHM_GOVERNANCE',
      notes,
      details: {
        weights,
        previousVersionsCount: existing.length,
      },
    });

    return newVersion;
  },
};
