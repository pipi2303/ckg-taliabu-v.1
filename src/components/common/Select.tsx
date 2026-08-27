import React, { forwardRef } from 'react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  options: SelectOption[];
  placeholderOption?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, helperText, error, required, options, placeholderOption, className = '', id, ...props }, ref) => {
    const selectId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-xs font-semibold text-black flex items-center gap-1">
            <span>{label}</span>
            {required && <span className="text-[#C84A4A]">*</span>}
          </label>
        )}

        <select
          id={selectId}
          ref={ref}
          className={`w-full text-sm bg-white rounded-lg border transition-colors py-2 px-3 text-black focus:outline-none focus:ring-2 focus:ring-[#00201C] disabled:bg-[#F0F4F3] disabled:text-[#AAB8B4] disabled:cursor-not-allowed ${
            error ? 'border-[#C84A4A] focus:border-[#C84A4A]' : 'border-[#D8E5E2] hover:border-[#B4C9C5] focus:border-[#00201C]'
          } ${className}`}
          {...props}
        >
          {placeholderOption && (
            <option value="" disabled>
              {placeholderOption}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>

        {error ? (
          <p className="text-xs text-[#C84A4A] font-medium leading-tight">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-[#60716D] leading-tight">{helperText}</p>
        ) : null}
      </div>
    );
  },
);

Select.displayName = 'Select';
