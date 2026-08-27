import { aiRepository } from '../repositories/aiRepository';
import { AIRouteOptimization, RoleId } from '../types';
import { auditRepo } from '../repositories/auditRepo';

export const aiRouteOptimizerService = {
  async getOptimizedRoutes(): Promise<AIRouteOptimization[]> {
    return aiRepository.getRouteOptimizations();
  },

  async requestRouteOptimization(kaderName: string, desa: string, actor: { id: string; name: string; role: string }): Promise<AIRouteOptimization> {
    const list = await this.getOptimizedRoutes();
    const route = list[0];

    await auditRepo.log({
      actorUserId: actor.id,
      actorName: actor.name,
      actorRole: (actor.role || 'KADER') as RoleId,
      action: 'UPDATE',
      entityType: 'POPULATION_INTERVENTION',
      entityId: route.id,
      targetLabel: `AI Route Optimization: ${kaderName}`,
      description: `Optimasi rute maritim & prioritas kunjungan lapangan dihitung untuk ${desa}`,
      details: {
        waypointsCount: route.optimizedWaypoints.length,
        seaCondition: route.seaWaveCondition,
        estimatedHours: route.totalEstimatedHours,
      },
    });

    return route;
  },
};
