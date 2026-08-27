import { aiRepository } from '../repositories/aiRepository';
import { AIPopulationForecast, AIDropoutPrediction, RoleId } from '../types';
import { auditRepo } from '../repositories/auditRepo';

export const aiForecastService = {
  async getCountyForecast(): Promise<AIPopulationForecast> {
    const list = await aiRepository.getPopulationForecasts();
    return list[0];
  },

  async getDropoutRiskPredictions(minRiskFilter: number = 0): Promise<AIDropoutPrediction[]> {
    const predictions = await aiRepository.getDropoutPredictions();
    return predictions.filter((p) => p.riskScorePercent >= minRiskFilter);
  },

  async runSimulatedForecastRefresh(facilityScope: string, actor: { id: string; name: string; role: string }): Promise<AIPopulationForecast> {
    const forecast = await this.getCountyForecast();
    
    await auditRepo.log({
      actorUserId: actor.id,
      actorName: actor.name,
      actorRole: (actor.role || 'ADMIN_DINKES') as RoleId,
      action: 'EXPORT',
      entityType: 'POPULATION_REPORT',
      entityId: forecast.id,
      targetLabel: 'AI Population Burden Forecast Refresh',
      description: `Proyeksi beban populasi 6-bulan disegarkan untuk ${facilityScope}.`,
      details: {
        model: forecast.modelMetadata.modelName,
        confidence: forecast.modelMetadata.confidenceScore,
        maritimeFactorsIncluded: true,
      },
    });

    return forecast;
  },
};
