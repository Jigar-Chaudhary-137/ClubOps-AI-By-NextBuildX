import React, { forwardRef } from 'react';

const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    id,
    disabled = false,
    className = '',
    ...props
  },
  ref
) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-medium text-[#94A3B8] mb-1.5"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3 text-[#94A3B8] pointer-events-none flex items-center justify-center">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          ref={ref}
          disabled={disabled}
          className={`
            w-full bg-[#111827] text-[#F8FAFC] placeholder-[#475569] text-sm rounded-lg
            border transition-colors duration-150 outline-none
            ${leftIcon ? 'pl-9' : 'pl-3.5'}
            ${rightIcon ? 'pr-9' : 'pr-3.5'}
            py-2
            ${error ? 'border-[#EF4444] focus:border-[#EF4444] focus:ring-1 focus:ring-[#EF4444]' : 'border-[#263247] focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]'}
            disabled:opacity-50 disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 text-[#94A3B8] flex items-center justify-center">
            {rightIcon}
          </div>
        )}
      </div>
      {error ? (
        <p className="mt-1 text-xs text-[#EF4444]">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-[#94A3B8]">{helperText}</p>
      ) : null}
    </div>
  );
});

export default Input;
