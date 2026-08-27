import { FacilityLogisticsSnapshot } from '../types';
import { INITIAL_FACILITY_LOGISTICS } from '../mock/initialFacilityLogisticsData';

export interface FacilityLogisticsSummary {
  facilitiesAtCriticalStock: number;
  avgLabUtilization: number;
  totalStaffGap: number;
}

export const facilityLogisticsService = {
  getAllSnapshots(): FacilityLogisticsSnapshot[] {
    return INITIAL_FACILITY_LOGISTICS;
  },

  getSnapshotByFacility(facilityId: string): FacilityLogisticsSnapshot | undefined {
    return INITIAL_FACILITY_LOGISTICS.find((s) => s.facilityId === facilityId);
  },

  getSummary(): FacilityLogisticsSummary {
    const snapshots = INITIAL_FACILITY_LOGISTICS;

    const facilitiesAtCriticalStock = snapshots.filter((s) =>
      s.medicineStock.some((m) => m.status === 'KRITIS')
    ).length;

    const avgLabUtilization =
      snapshots.reduce((sum, s) => sum + s.labTestsThisMonth / s.labCapacityMonthly, 0) / snapshots.length;

    const totalStaffGap = snapshots.reduce(
      (sum, s) => sum + Math.max(0, s.staffRecommended - s.staffActive),
      0
    );

    return {
      facilitiesAtCriticalStock,
      avgLabUtilization: Math.round(avgLabUtilization * 100),
      totalStaffGap,
    };
  },
};
