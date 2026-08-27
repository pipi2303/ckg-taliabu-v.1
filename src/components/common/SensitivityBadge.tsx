import React from 'react';
import { SensitivityLevel } from '../../types';
import { SENSITIVITY_DESCRIPTIONS } from '../../services/permissionService';

interface SensitivityBadgeProps {
  level: SensitivityLevel;
  showDescription?: boolean;
}

export const SensitivityBadge: React.FC<SensitivityBadgeProps> = ({ level, showDescription = false }) => {
  const meta = SENSITIVITY_DESCRIPTIONS[level];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold border ${meta.color} cursor-help`}
      title={meta.description}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      <span>{meta.label}</span>
      {showDescription && <span className="text-[11px] font-normal opacity-80">({meta.description})</span>}
    </span>
  );
};
