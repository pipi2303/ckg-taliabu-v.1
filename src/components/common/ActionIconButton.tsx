import React from 'react';
import { Loader2 } from 'lucide-react';
import { Tooltip, TooltipPosition } from './Tooltip';

export type ActionButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'danger'
  | 'success'
  | 'ghost'
  | 'teal'
  | 'dark';

export type ActionButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface ActionIconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  tooltip?: React.ReactNode;
  tooltipPosition?: TooltipPosition;
  label?: React.ReactNode;
  variant?: ActionButtonVariant;
  size?: ActionButtonSize;
  isLoading?: boolean;
  badge?: React.ReactNode;
  badgeColor?: string;
}

export const ActionIconButton: React.FC<ActionIconButtonProps> = ({
  icon,
  tooltip,
  tooltipPosition = 'top',
  label,
  variant = 'outline',
  size = 'md',
  isLoading = false,
  badge,
  badgeColor = 'bg-rose-500 text-white',
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'relative inline-flex items-center justify-center font-semibold rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 cursor-pointer select-none';

  const sizeClasses: Record<ActionButtonSize, string> = {
    xs: label ? 'text-[11px] px-2 py-1 gap-1 h-7' : 'w-7 h-7 p-1 text-xs',
    sm: label ? 'text-xs px-2.5 py-1.5 gap-1.5 h-8' : 'w-8 h-8 p-1.5 text-xs',
    md: label ? 'text-xs font-bold px-3.5 py-2 gap-2 h-9' : 'w-9 h-9 p-2 text-sm',
    lg: label ? 'text-sm font-bold px-4 py-2.5 gap-2.5 h-11' : 'w-11 h-11 p-2.5 text-base',
  };

  const variantClasses: Record<ActionButtonVariant, string> = {
    primary:
      'bg-[#00201C] text-white hover:bg-[#00332D] active:bg-[#001714] focus:ring-[#00201C] border border-transparent shadow-2xs',
    secondary:
      'bg-[#E1F5FE] text-sky-900 hover:bg-[#CBEBFC] active:bg-[#B3E1F9] focus:ring-sky-500 border border-[#BDE0EE] shadow-2xs',
    outline:
      'bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-50 active:bg-slate-100 border border-slate-200 focus:ring-slate-400 shadow-2xs',
    teal:
      'bg-teal-600 text-white hover:bg-teal-700 active:bg-teal-800 focus:ring-teal-500 border border-transparent shadow-2xs',
    dark:
      'bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950 focus:ring-slate-600 border border-slate-800 shadow-2xs',
    danger:
      'bg-rose-50 text-rose-700 hover:bg-rose-100 active:bg-rose-200 focus:ring-rose-400 border border-rose-200 shadow-2xs',
    success:
      'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 active:bg-emerald-200 focus:ring-emerald-400 border border-emerald-200 shadow-2xs',
    ghost:
      'bg-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100 active:bg-slate-200 focus:ring-slate-400 border border-transparent',
  };

  const buttonElement = (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled || isLoading}
      aria-label={typeof tooltip === 'string' ? tooltip : typeof label === 'string' ? label : undefined}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        <>
          <span className="shrink-0 flex items-center justify-center">{icon}</span>
          {label && <span className="truncate">{label}</span>}
          {badge !== undefined && (
            <span
              className={`absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full text-[9px] font-black font-mono shadow-xs ${badgeColor}`}
            >
              {badge}
            </span>
          )}
        </>
      )}
    </button>
  );

  if (tooltip) {
    return (
      <Tooltip content={tooltip} position={tooltipPosition} disabled={disabled}>
        {buttonElement}
      </Tooltip>
    );
  }

  return buttonElement;
};
