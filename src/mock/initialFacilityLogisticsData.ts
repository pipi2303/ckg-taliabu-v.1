import { FacilityLogisticsSnapshot } from '../types';

/**
 * One logistics snapshot per active facility (7 Puskesmas + RSUD Bobong).
 * Complements PopulationForecastPage's aggregate county-wide medicine demand
 * forecast (aiForecastService.getCountyForecast()) with per-facility on-hand
 * stock, lab capacity, and staffing — figures kept consistent with the
 * maritime/pesisir-access-barrier narrative already used across
 * AreaAnalysisPage.tsx and PopulationForecastPage's recommendedStockActions.
 */
export const INITIAL_FACILITY_LOGISTICS: FacilityLogisticsSnapshot[] = [
  {
    id: 'log-faskes-1',
    facilityId: 'faskes-1',
    facilityName: 'Puskesmas Bobong',
    labCapacityMonthly: 600,
    labTestsThisMonth: 512,
    staffRecommended: 14,
    staffActive: 13,
    medicineStock: [
      { drugName: 'Amlodipine 10mg', unit: 'tablet', currentStock: 4200, reorderThreshold: 1500, daysOfSupply: 42, status: 'AMAN' },
      { drugName: 'Metformin 500mg', unit: 'tablet', currentStock: 3100, reorderThreshold: 1500, daysOfSupply: 28, status: 'AMAN' },
      { drugName: 'Captopril 25mg', unit: 'tablet', currentStock: 1200, reorderThreshold: 1000, daysOfSupply: 14, status: 'MENIPIS' },
    ],
    updatedAt: '2026-08-25T08:00:00Z',
  },
  {
    id: 'log-faskes-2',
    facilityId: 'faskes-2',
    facilityName: 'Puskesmas Lede',
    labCapacityMonthly: 350,
    labTestsThisMonth: 340,
    staffRecommended: 9,
    staffActive: 7,
    medicineStock: [
      { drugName: 'Amlodipine 10mg', unit: 'tablet', currentStock: 900, reorderThreshold: 1000, daysOfSupply: 9, status: 'KRITIS' },
      { drugName: 'Metformin 500mg', unit: 'tablet', currentStock: 1400, reorderThreshold: 1000, daysOfSupply: 16, status: 'MENIPIS' },
      { drugName: 'Captopril 25mg', unit: 'tablet', currentStock: 800, reorderThreshold: 600, daysOfSupply: 20, status: 'AMAN' },
    ],
    updatedAt: '2026-08-25T08:00:00Z',
  },
  {
    id: 'log-faskes-3',
    facilityId: 'faskes-3',
    facilityName: 'Puskesmas Nggele',
    labCapacityMonthly: 220,
    labTestsThisMonth: 205,
    staffRecommended: 7,
    staffActive: 5,
    medicineStock: [
      { drugName: 'Amlodipine 10mg', unit: 'tablet', currentStock: 600, reorderThreshold: 800, daysOfSupply: 7, status: 'KRITIS' },
      { drugName: 'Metformin 500mg', unit: 'tablet', currentStock: 700, reorderThreshold: 800, daysOfSupply: 9, status: 'KRITIS' },
      { drugName: 'Captopril 25mg', unit: 'tablet', currentStock: 500, reorderThreshold: 400, daysOfSupply: 18, status: 'AMAN' },
    ],
    updatedAt: '2026-08-25T08:00:00Z',
  },
  {
    id: 'log-faskes-4',
    facilityId: 'faskes-4',
    facilityName: 'Puskesmas Pancado',
    labCapacityMonthly: 180,
    labTestsThisMonth: 96,
    staffRecommended: 6,
    staffActive: 4,
    medicineStock: [
      { drugName: 'Amlodipine 10mg', unit: 'tablet', currentStock: 450, reorderThreshold: 700, daysOfSupply: 6, status: 'KRITIS' },
      { drugName: 'Metformin 500mg', unit: 'tablet', currentStock: 900, reorderThreshold: 700, daysOfSupply: 17, status: 'AMAN' },
      { drugName: 'Captopril 25mg', unit: 'tablet', currentStock: 300, reorderThreshold: 350, daysOfSupply: 11, status: 'MENIPIS' },
    ],
    updatedAt: '2026-08-25T08:00:00Z',
  },
  {
    id: 'log-faskes-5',
    facilityId: 'faskes-5',
    facilityName: 'Puskesmas Samuya',
    labCapacityMonthly: 160,
    labTestsThisMonth: 88,
    staffRecommended: 6,
    staffActive: 5,
    medicineStock: [
      { drugName: 'Amlodipine 10mg', unit: 'tablet', currentStock: 1100, reorderThreshold: 700, daysOfSupply: 24, status: 'AMAN' },
      { drugName: 'Metformin 500mg', unit: 'tablet', currentStock: 650, reorderThreshold: 700, daysOfSupply: 12, status: 'MENIPIS' },
      { drugName: 'Captopril 25mg', unit: 'tablet', currentStock: 380, reorderThreshold: 350, daysOfSupply: 15, status: 'AMAN' },
    ],
    updatedAt: '2026-08-25T08:00:00Z',
  },
  {
    id: 'log-faskes-6',
    facilityId: 'faskes-6',
    facilityName: 'Puskesmas Losseng',
    labCapacityMonthly: 120,
    labTestsThisMonth: 12,
    staffRecommended: 5,
    staffActive: 3,
    medicineStock: [
      { drugName: 'Amlodipine 10mg', unit: 'tablet', currentStock: 300, reorderThreshold: 500, daysOfSupply: 8, status: 'KRITIS' },
      { drugName: 'Metformin 500mg', unit: 'tablet', currentStock: 250, reorderThreshold: 500, daysOfSupply: 6, status: 'KRITIS' },
      { drugName: 'Captopril 25mg', unit: 'tablet', currentStock: 200, reorderThreshold: 250, daysOfSupply: 13, status: 'MENIPIS' },
    ],
    updatedAt: '2026-08-25T08:00:00Z',
  },
  {
    id: 'log-faskes-7',
    facilityId: 'faskes-7',
    facilityName: 'Puskesmas Gela',
    labCapacityMonthly: 200,
    labTestsThisMonth: 168,
    staffRecommended: 7,
    staffActive: 6,
    medicineStock: [
      { drugName: 'Amlodipine 10mg', unit: 'tablet', currentStock: 1500, reorderThreshold: 750, daysOfSupply: 30, status: 'AMAN' },
      { drugName: 'Metformin 500mg', unit: 'tablet', currentStock: 1300, reorderThreshold: 750, daysOfSupply: 26, status: 'AMAN' },
      { drugName: 'Captopril 25mg', unit: 'tablet', currentStock: 420, reorderThreshold: 400, daysOfSupply: 16, status: 'AMAN' },
    ],
    updatedAt: '2026-08-25T08:00:00Z',
  },
  {
    id: 'log-faskes-8',
    facilityId: 'faskes-8',
    facilityName: 'RSUD Bobong (Rujukan Kabupaten)',
    labCapacityMonthly: 1800,
    labTestsThisMonth: 1420,
    staffRecommended: 42,
    staffActive: 38,
    medicineStock: [
      { drugName: 'Amlodipine 10mg', unit: 'tablet', currentStock: 9000, reorderThreshold: 3000, daysOfSupply: 55, status: 'AMAN' },
      { drugName: 'Metformin 500mg', unit: 'tablet', currentStock: 7600, reorderThreshold: 3000, daysOfSupply: 48, status: 'AMAN' },
      { drugName: 'Captopril 25mg', unit: 'tablet', currentStock: 4100, reorderThreshold: 2000, daysOfSupply: 40, status: 'AMAN' },
    ],
    updatedAt: '2026-08-25T08:00:00Z',
  },
];
