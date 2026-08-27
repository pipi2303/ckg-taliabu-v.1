import React from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shrink-0 cursor-pointer select-none';

  const sizeClasses: Record<ButtonSize, string> = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 h-8',
    md: 'text-sm px-4 py-2 gap-2 h-10',
    lg: 'text-base px-5 py-2.5 gap-2.5 h-11',
  };

  const variantClasses: Record<ButtonVariant, string> = {
    // Primary: Dark Green #00201C
    primary:
      'bg-[#00201C] text-white hover:bg-[#00332D] active:bg-[#001714] focus:ring-[#00201C] border border-transparent shadow-xs',
    // Secondary: Light Blue Gray container #E1F5FE
    secondary:
      'bg-[#E1F5FE] text-black hover:bg-[#CBEBFC] active:bg-[#B3E1F9] focus:ring-[#397B94] border border-[#BDE0EE]',
    outline:
      'bg-white text-black hover:bg-[#F8FBFA] active:bg-[#EDF5F3] border border-[#D8E5E2] focus:ring-[#00201C]',
    danger:
      'bg-[#C84A4A] text-white hover:bg-[#B33939] active:bg-[#9B2A2A] focus:ring-[#C84A4A] border border-transparent shadow-xs',
    success:
      'bg-[#2E7D5B] text-white hover:bg-[#25684B] active:bg-[#1C513A] focus:ring-[#2E7D5B] border border-transparent shadow-xs',
    ghost:
      'bg-transparent text-[#60716D] hover:text-black hover:bg-[#F0F5F4] focus:ring-[#00201C] border border-transparent',
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
