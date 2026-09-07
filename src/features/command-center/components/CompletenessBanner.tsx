import React from 'react';
import { CountyCompletenessSummary } from '../../../services/populationQualificationService';

interface CompletenessBannerProps {
  completeness?: CountyCompletenessSummary;
  onRefresh?: () => void;
}

export const CompletenessBanner: React.FC<CompletenessBannerProps> = () => {
  // Sembunyikan section Status Kelengkapan Data Dinas Kesehatan di semua menu dan peran
  return null;
};
