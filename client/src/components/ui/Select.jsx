import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(function Select(
  {
    label,
    error,
    helperText,
    id,
    options = [],
    disabled = false,
    placeholder = 'Select an option',
    className = '',
    children,
    ...props
  },
  ref
) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-medium text-[#94A3B8] mb-1.5"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        <select
          id={selectId}
          ref={ref}
          disabled={disabled}
          className={`
            w-full bg-[#111827] text-[#F8FAFC] text-sm rounded-lg
            border transition-colors duration-150 outline-none appearance-none
            py-2 pl-3.5 pr-10
            ${error ? 'border-[#EF4444] focus:border-[#EF4444] focus:ring-1 focus:ring-[#EF4444]' : 'border-[#263247] focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]'}
            disabled:opacity-50 disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        >
          {placeholder && (
            <option value="" disabled className="bg-[#111827] text-[#475569]">
              {placeholder}
            </option>
          )}
          {options.length > 0
            ? options.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  className="bg-[#111827] text-[#F8FAFC]"
                >
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        <div className="absolute right-3 text-[#94A3B8] pointer-events-none flex items-center justify-center">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
      {error ? (
        <p className="mt-1 text-xs text-[#EF4444]">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-[#94A3B8]">{helperText}</p>
      ) : null}
    </div>
  );
});

export default Select;
