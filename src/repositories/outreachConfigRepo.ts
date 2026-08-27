import { MessageTemplate, OutreachLadderVersion } from '../types';
import { rawStorage, simulateNetworkDelay } from './storage';
import { auditRepo } from './auditRepo';

export const outreachConfigRepo = {
  async getLadderVersions(): Promise<OutreachLadderVersion[]> {
    await simulateNetworkDelay();
    return rawStorage.getOutreachLadders();
  },

  async getActiveLadder(): Promise<OutreachLadderVersion> {
    await simulateNetworkDelay();
    const ladders = rawStorage.getOutreachLadders();
    const active = ladders.find((l) => l.status === 'ACTIVE');
    if (!active) {
      // Fallback
      return ladders[0];
    }
    return active;
  },

  async createNewLadderVersion(
    versionData: Omit<OutreachLadderVersion, 'id'>,
    actor: { id: string; name: string }
  ): Promise<OutreachLadderVersion> {
    await simulateNetworkDelay();
    const ladders = rawStorage.getOutreachLadders();

    // Mark previous active as INACTIVE
    ladders.forEach((l) => {
      if (l.status === 'ACTIVE') {
        l.status = 'INACTIVE';
      }
    });

    const id = `LADDER-VER-${String(ladders.length + 1).padStart(2, '0')}`;
    const newVersion: OutreachLadderVersion = {
      ...versionData,
      id,
      status: 'ACTIVE',
    };

    ladders.unshift(newVersion);
    rawStorage.setOutreachLadders(ladders);

    await auditRepo.log({
      action: 'UPDATE_OUTREACH_CONFIG',
      entityType: 'OUTREACH_LADDER_VERSION',
      entityId: id,
      details: {
        version: newVersion.version,
        stepCount: newVersion.steps.length,
        changeReason: newVersion.changeReason,
      },
      userId: actor.id,
      userName: actor.name,
    });

    return newVersion;
  },

  async getMessageTemplates(): Promise<MessageTemplate[]> {
    await simulateNetworkDelay();
    return rawStorage.getMessageTemplates();
  },
};
