import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Flame,
  HelpCircle,
  ShieldAlert,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { ClinicalRiskCategory } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface ClinicalRiskBadgeProps {
  category?: ClinicalRiskCategory;
  stage?: 'SCREENING' | 'CONFIRMED';
  isCritical?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showStage?: boolean;
  className?: string;
}

export const ClinicalRiskBadge: React.FC<ClinicalRiskBadgeProps> = ({
  category = 'UNDETERMINED',
  stage,
  isCritical,
  size = 'sm',
  showStage = false,
  className = '',
}) => {
  const { currentUser } = useAuth();

  // Data Ceiling Hard Lock: Kader is restricted from receiving S3 clinical risk colors directly
  if (currentUser?.roleId === 'KADER') {
    return (
      <span
        className={`inline-flex items-center gap-1 font-semibold rounded-md border border-slate-300 bg-slate-100 text-slate-700 select-none ${
          size === 'xs' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
        } ${className}`}
        title="Klasifikasi risiko klinis terproteksi (S3 Ceiling) — Tersedia untuk Nakes / PJ CKG"
      >
        <Lock className="w-3 h-3 text-slate-500 shrink-0" />
        <span className="whitespace-nowrap">Klinis (Terproteksi)</span>
      </span>
    );
  }

  // Clinical Semantic Config
  const configs: Record<
    ClinicalRiskCategory,
    {
      label: string;
      subLabel: string;
      bgColor: string;
      borderColor: string;
      textColor: string;
      icon: React.ReactNode;
    }
  > = {
    GREEN: {
      label: 'HIJAU',
      subLabel: 'Normal / Sehat',
      bgColor: 'bg-[#1F8A4C]/10',
      borderColor: 'border-[#1F8A4C]/40',
      textColor: 'text-black',
      icon: <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-[#1F8A4C]" />,
    },
    YELLOW: {
      label: 'KUNING',
      subLabel: 'Faktor Risiko',
      bgColor: 'bg-[#C79000]/10',
      borderColor: 'border-[#C79000]/40',
      textColor: 'text-black',
      icon: <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-[#C79000]" />,
    },
    ORANGE: {
      label: 'ORANYE',
      subLabel: 'Pre-Penyakit',
      bgColor: 'bg-[#DD6B12]/10',
      borderColor: 'border-[#DD6B12]/40',
      textColor: 'text-black',
      icon: <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-[#DD6B12]" />,
    },
    RED: {
      label: 'MERAH',
      subLabel: 'Penyakit (FPKTP)',
      bgColor: 'bg-[#C22A2A]/10',
      borderColor: 'border-[#C22A2A]/40',
      textColor: 'text-black',
      icon: <AlertOctagon className="w-3.5 h-3.5 shrink-0 text-[#C22A2A]" />,
    },
    DARK_RED: {
      label: 'MERAH TUA',
      subLabel: 'Tinggi / FKRTL',
      bgColor: 'bg-[#78161B]/15',
      borderColor: 'border-[#78161B]/50',
      textColor: 'text-black',
      icon: isCritical ? (
        <Flame className="w-3.5 h-3.5 shrink-0 text-[#78161B] animate-pulse" />
      ) : (
        <AlertOctagon className="w-3.5 h-3.5 shrink-0 text-[#78161B]" />
      ),
    },
    UNDETERMINED: {
      label: 'BELUM DITENTUKAN',
      subLabel: 'Data Tidak Lengkap',
      bgColor: 'bg-[#71828E]/10',
      borderColor: 'border-[#71828E]/40',
      textColor: 'text-black',
      icon: <HelpCircle className="w-3.5 h-3.5 shrink-0 text-[#71828E]" />,
    },
  };

  const current = configs[category] || configs.UNDETERMINED;

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-[10px] gap-1',
    sm: 'px-2.5 py-1 text-xs gap-1.5',
    md: 'px-3 py-1.5 text-xs gap-2',
    lg: 'px-4 py-2 text-sm gap-2.5',
  }[size];

  return (
    <span
      className={`inline-flex items-center font-bold rounded-lg border ${current.bgColor} ${current.borderColor} ${current.textColor} select-none ${sizeClasses} ${className}`}
    >
      {current.icon}
      <span className="whitespace-nowrap">{current.label}</span>
      {size !== 'xs' && (
        <span className="font-normal opacity-90 text-[11px] whitespace-nowrap">
          — {current.subLabel}
        </span>
      )}
      {showStage && stage === 'SCREENING' && (
        <span className="ml-1 px-1.5 py-0.2 bg-amber-200 text-amber-950 font-semibold rounded text-[9px] whitespace-nowrap">
          Menunggu Konfirmasi
        </span>
      )}
      {isCritical && (
        <span className="ml-1 px-1.5 py-0.2 bg-[#78161B] text-white font-bold rounded text-[9px] uppercase tracking-wider animate-pulse whitespace-nowrap">
          Kritis
        </span>
      )}
    </span>
  );
};
