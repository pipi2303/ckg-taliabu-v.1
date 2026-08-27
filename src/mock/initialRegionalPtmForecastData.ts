import { RegionalPtmForecast } from '../types';
import { KECAMATAN_PROFILES } from './kecamatanProfileData';

const MONTH_LABELS = ['Sep 2026', 'Okt 2026', 'Nov 2026', 'Des 2026'];

// Deterministic per-kecamatan trajectory: remote/pesisir-terluar kecamatan (isRemote)
// trend upward (access barriers compound PTM burden over time, consistent with the
// narrative already established in AreaAnalysisPage.tsx and PopulationForecastPage's
// maritimeRiskFactor); accessible kecamatan trend flat-to-down as follow-up capacity holds.
function buildMonths(baseBurden: number, isRemote: boolean) {
  const hipertensiBase = Math.round(baseBurden * 0.55);
  const diabetesBase = Math.round(baseBurden * 0.4);
  const monthlyDelta = isRemote ? 0.06 : -0.02;

  return MONTH_LABELS.map((month, idx) => {
    const factor = 1 + monthlyDelta * (idx + 1);
    return {
      month,
      hipertensiProjected: Math.max(0, Math.round(hipertensiBase * factor)),
      diabetesProjected: Math.max(0, Math.round(diabetesBase * factor)),
      trend: (monthlyDelta > 0.03 ? 'NAIK' : monthlyDelta < -0.03 ? 'TURUN' : 'STABIL') as 'NAIK' | 'STABIL' | 'TURUN',
    };
  });
}

const RISK_DRIVERS_REMOTE = [
  'Akses maritim terbatas — kunjungan kontrol ulang tertunda saat gelombang tinggi',
  'Kepatuhan obat menurun akibat jarak tempuh ke Puskesmas induk',
  'Kepadatan kader lapangan rendah dibanding beban temuan PTM',
];

const RISK_DRIVERS_ACCESSIBLE = [
  'Beban temuan PTM stabil dengan kontinuitas kontrol yang terjaga',
  'Kapasitas rujukan & stok obat mencukupi permintaan saat ini',
];

export const INITIAL_REGIONAL_PTM_FORECAST: RegionalPtmForecast[] = KECAMATAN_PROFILES.map((kec) => ({
  id: `ptm-fc-${kec.id}`,
  kecamatanId: kec.id,
  kecamatanName: kec.name,
  months: buildMonths(kec.burdenCount, kec.isRemote),
  topRiskDrivers: kec.isRemote ? RISK_DRIVERS_REMOTE : RISK_DRIVERS_ACCESSIBLE,
}));
