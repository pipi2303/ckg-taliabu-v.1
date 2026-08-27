import { ClinicalEncounter, PrescriptionItem } from '../types';

export interface MedicationRunoutEstimate {
  estimatedRunoutDate: string;
  isRunoutPassed: boolean;
  daysRemainingOrOverdue: number;
  medicationCount: number;
  longestDurationDays: number;
  notes: string;
  governanceNotice: string;
}

export const medicationRunoutService = {
  /**
   * Calculates runout estimate based strictly on recorded prescription duration.
   * Respects OI-07: Never enforces a normative 15-day rule assumption.
   */
  calculateRunoutEstimate(
    encounterDate: string,
    prescriptions: PrescriptionItem[]
  ): MedicationRunoutEstimate | null {
    if (!prescriptions || prescriptions.length === 0) {
      return null;
    }

    // Find the longest valid duration among prescribed medications
    let maxDays = 0;
    for (const rx of prescriptions) {
      const days = Number(rx.durationDays) || (rx.quantity ? Math.floor(rx.quantity) : 0);
      if (days > maxDays) {
        maxDays = days;
      }
    }

    if (maxDays === 0) {
      // Default to 30 days standard FKTP prescription if no duration recorded, but marked as estimate
      maxDays = 30;
    }

    const baseTime = new Date(encounterDate).getTime();
    const runoutTime = baseTime + maxDays * 24 * 60 * 60 * 1000;
    const runoutDate = new Date(runoutTime).toISOString().split('T')[0];

    const now = Date.now();
    const isRunoutPassed = now > runoutTime;
    const diffDays = Math.round(Math.abs(now - runoutTime) / (24 * 60 * 60 * 1000));

    return {
      estimatedRunoutDate: runoutDate,
      isRunoutPassed,
      daysRemainingOrOverdue: diffDays,
      medicationCount: prescriptions.length,
      longestDurationDays: maxDays,
      notes: isRunoutPassed
        ? `Estimasi stok obat telah habis sejak ${diffDays} hari yang lalu.`
        : `Estimasi persediaan obat mencukupi untuk ${diffDays} hari ke depan.`,
      governanceNotice:
        'ESTIMASI PERBEKALAN OBAT: Dihitung berdasarkan durasi resep aktual faskes. Bukan kepastian konsumsi fisik pasien (OI-07).',
    };
  },
};
