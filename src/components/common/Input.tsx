import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, error, required, leftIcon, rightIcon, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold text-black flex items-center gap-1">
            <span>{label}</span>
            {required && <span className="text-[#C84A4A]">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 pointer-events-none text-[#60716D] flex items-center">
              {leftIcon}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            className={`w-full text-sm bg-white rounded-lg border transition-colors py-2 text-black placeholder-[#AAB8B4] focus:outline-none focus:ring-2 focus:ring-[#00201C] disabled:bg-[#F0F4F3] disabled:text-[#AAB8B4] disabled:cursor-not-allowed ${
              leftIcon ? 'pl-9' : 'pl-3'
            } ${rightIcon ? 'pr-9' : 'pr-3'} ${
              error ? 'border-[#C84A4A] focus:border-[#C84A4A]' : 'border-[#D8E5E2] hover:border-[#B4C9C5] focus:border-[#00201C]'
            } ${className}`}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 text-[#60716D] flex items-center">
              {rightIcon}
            </div>
          )}
        </div>

        {error ? (
          <p className="text-xs text-[#C84A4A] font-medium leading-tight">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-[#60716D] leading-tight">{helperText}</p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = 'Input';
