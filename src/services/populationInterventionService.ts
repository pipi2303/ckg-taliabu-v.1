import { PopulationIntervention, User } from '../types';
import { populationInterventionRepo } from '../repositories/populationInterventionRepo';
import { auditRepo } from '../repositories/auditRepo';

export const populationInterventionService = {
  async getAllInterventions(): Promise<PopulationIntervention[]> {
    return populationInterventionRepo.getAll();
  },

  async createIntervention(
    data: {
      title: string;
      description: string;
      targetRegionId: string;
      targetRegionName: string;
      ownerUserId: string;
      ownerUserName: string;
      startDate: string;
      dueDate: string;
      sourceMetricCode: string;
      sourceMetricLabel: string;
      successMetricCode: string;
      successMetricLabel: string;
      baselineValueSummary: string;
      currentValueSummary?: string;
    },
    user: User
  ): Promise<PopulationIntervention> {
    const item = await populationInterventionRepo.create({
      ...data,
      status: 'ACTIVE',
      createdByUserId: user.id,
    });

    await auditRepo.log({
      actorUserId: user.id,
      actorName: user.name,
      actorRole: user.roleId,
      action: 'RECORD_INTERVENTION',
      entityType: 'POPULATION_INTERVENTION',
      entityId: item.id,
      targetLabel: `Intervensi Populasi: ${item.title}`,
      description: `Wilayah: ${item.targetRegionName} | Metrik Sasaran: ${item.successMetricLabel}`,
      details: {
        targetRegionName: item.targetRegionName,
        successMetricLabel: item.successMetricLabel,
        baselineValueSummary: item.baselineValueSummary,
      },
    });

    return item;
  },

  async addProgressNote(id: string, noteText: string, user: User): Promise<PopulationIntervention> {
    const updated = await populationInterventionRepo.addProgressNote(id, noteText, `${user.name} (${user.roleName})`);

    await auditRepo.log({
      actorUserId: user.id,
      actorName: user.name,
      actorRole: user.roleId,
      action: 'UPDATE_INTERVENTION',
      entityType: 'POPULATION_INTERVENTION',
      entityId: id,
      targetLabel: `Catatan Intervensi: ${updated.title}`,
      description: `Catatan kemajuan ditambahkan oleh ${user.name}`,
      details: { noteText },
    });

    return updated;
  },

  async completeIntervention(id: string, finalSummary: string, user: User): Promise<PopulationIntervention> {
    const updated = await populationInterventionRepo.update(id, {
      status: 'COMPLETED',
      completedAt: new Date().toISOString(),
      currentValueSummary: finalSummary,
    });

    await auditRepo.log({
      actorUserId: user.id,
      actorName: user.name,
      actorRole: user.roleId,
      action: 'UPDATE_INTERVENTION',
      entityType: 'POPULATION_INTERVENTION',
      entityId: id,
      targetLabel: `Penyelesaian Intervensi: ${updated.title}`,
      description: `Status diubah menjadi COMPLETED dengan hasil akhir: ${finalSummary}`,
      details: { finalSummary, completedAt: new Date().toISOString() },
    });

    return updated;
  },
};
