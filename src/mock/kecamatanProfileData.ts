/**
 * Single shared source of truth for per-kecamatan population/coverage/burden mock figures
 * used across the Dinkes Command Center feature (AreaAnalysisPage and
 * commandCenterOverviewService previously each hardcoded their own, inconsistent, copy of
 * these numbers for the same 8 kecamatan — this file consolidates them).
 */

export interface DesaProfile {
  id: string;
  name: string;
  population: number;
  screened: number;
  gapCount: number;
  burdenCount: number;
  suppressed: boolean;
}

export interface KecamatanProfile {
  id: string;
  name: string;
  pkmName: string;
  population: number;
  screened: number;
  coverageRate: number;
  gapCount: number;
  burdenCount: number;
  isRemote: boolean;
  isMissing?: boolean;
  hasPendingOffline?: boolean;
  villages: DesaProfile[];
}

export const KECAMATAN_PROFILES: KecamatanProfile[] = [
  {
    id: 'kec-1',
    name: 'Taliabu Barat',
    pkmName: 'Puskesmas Bobong',
    population: 4200,
    screened: 310,
    coverageRate: 7.4,
    gapCount: 54,
    burdenCount: 142,
    isRemote: false,
    villages: [
      { id: 'desa-1', name: 'Desa Bobong', population: 2100, screened: 190, gapCount: 28, burdenCount: 88, suppressed: false },
      { id: 'desa-2', name: 'Desa Wayo', population: 1200, screened: 85, gapCount: 19, burdenCount: 38, suppressed: false },
      { id: 'desa-3', name: 'Desa Ratahaya', population: 450, screened: 3, gapCount: 2, burdenCount: 2, suppressed: true },
    ],
  },
  {
    id: 'kec-2',
    name: 'Lede',
    pkmName: 'Puskesmas Lede',
    population: 2800,
    screened: 145,
    coverageRate: 5.2,
    gapCount: 29,
    burdenCount: 68,
    isRemote: false,
    villages: [
      { id: 'desa-4', name: 'Desa Lede', population: 1400, screened: 95, gapCount: 18, burdenCount: 44, suppressed: false },
      { id: 'desa-5', name: 'Desa Todoli', population: 800, screened: 46, gapCount: 10, burdenCount: 21, suppressed: false },
      { id: 'desa-6', name: 'Desa Langganu', population: 320, screened: 4, gapCount: 1, burdenCount: 3, suppressed: true },
    ],
  },
  {
    id: 'kec-3',
    name: 'Taliabu Barat Laut',
    pkmName: 'Puskesmas Nggele',
    population: 1950,
    screened: 98,
    coverageRate: 5.0,
    gapCount: 22,
    burdenCount: 46,
    isRemote: true,
    villages: [
      { id: 'desa-7', name: 'Desa Nggele', population: 1200, screened: 72, gapCount: 16, burdenCount: 35, suppressed: false },
      { id: 'desa-8', name: 'Desa Onemay', population: 410, screened: 26, gapCount: 6, burdenCount: 11, suppressed: false },
    ],
  },
  {
    id: 'kec-4',
    name: 'Taliabu Selatan',
    pkmName: 'Puskesmas Pancado',
    population: 2100,
    screened: 85,
    coverageRate: 4.0,
    gapCount: 25,
    burdenCount: 41,
    isRemote: true,
    villages: [
      { id: 'desa-9', name: 'Desa Pancado', population: 1100, screened: 60, gapCount: 17, burdenCount: 29, suppressed: false },
      { id: 'desa-10', name: 'Desa Bahu', population: 480, screened: 25, gapCount: 8, burdenCount: 12, suppressed: false },
    ],
  },
  {
    id: 'kec-5',
    name: 'Taliabu Timur',
    pkmName: 'Puskesmas Samuya',
    population: 1400,
    screened: 64,
    coverageRate: 4.6,
    gapCount: 16,
    burdenCount: 31,
    isRemote: true,
    villages: [
      { id: 'desa-11', name: 'Desa Samuya', population: 850, screened: 48, gapCount: 12, burdenCount: 24, suppressed: false },
      { id: 'desa-12', name: 'Desa Tubang', population: 390, screened: 16, gapCount: 4, burdenCount: 7, suppressed: false },
    ],
  },
  {
    id: 'kec-6',
    name: 'Taliabu Timur Selatan',
    pkmName: 'Puskesmas Losseng',
    population: 1650,
    screened: 0,
    coverageRate: 0,
    gapCount: 0,
    burdenCount: 0,
    isRemote: true,
    isMissing: true,
    villages: [
      { id: 'desa-13', name: 'Desa Losseng', population: 900, screened: 0, gapCount: 0, burdenCount: 0, suppressed: false },
    ],
  },
  {
    id: 'kec-7',
    name: 'Taliabu Utara',
    pkmName: 'Puskesmas Gela',
    population: 2900,
    screened: 120,
    coverageRate: 4.1,
    gapCount: 27,
    burdenCount: 54,
    isRemote: true,
    hasPendingOffline: true,
    villages: [
      { id: 'desa-14', name: 'Desa Gela', population: 1500, screened: 82, gapCount: 18, burdenCount: 38, suppressed: false },
      { id: 'desa-15', name: 'Desa Tikong', population: 850, screened: 38, gapCount: 9, burdenCount: 16, suppressed: false },
    ],
  },
  {
    id: 'kec-8',
    name: 'Tabona',
    pkmName: 'Puskesmas Tabona',
    population: 1550,
    screened: 75,
    coverageRate: 4.8,
    gapCount: 18,
    burdenCount: 36,
    isRemote: true,
    villages: [
      { id: 'desa-16', name: 'Desa Tabona', population: 950, screened: 55, gapCount: 13, burdenCount: 27, suppressed: false },
      { id: 'desa-17', name: 'Desa Kataga', population: 420, screened: 20, gapCount: 5, burdenCount: 9, suppressed: false },
    ],
  },
];
