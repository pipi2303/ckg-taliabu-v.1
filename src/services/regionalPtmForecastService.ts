import { RegionalPtmForecast } from '../types';
import { INITIAL_REGIONAL_PTM_FORECAST } from '../mock/initialRegionalPtmForecastData';

function projectedIncrease(forecast: RegionalPtmForecast): number {
  const first = forecast.months[0];
  const last = forecast.months[forecast.months.length - 1];
  const firstTotal = first.hipertensiProjected + first.diabetesProjected;
  const lastTotal = last.hipertensiProjected + last.diabetesProjected;
  return lastTotal - firstTotal;
}

export const regionalPtmForecastService = {
  getAllForecasts(): RegionalPtmForecast[] {
    return INITIAL_REGIONAL_PTM_FORECAST;
  },

  getPriorityRegions(limit: number = 5): RegionalPtmForecast[] {
    return [...INITIAL_REGIONAL_PTM_FORECAST]
      .sort((a, b) => projectedIncrease(b) - projectedIncrease(a))
      .slice(0, limit);
  },

  getProjectedIncrease: projectedIncrease,
};
