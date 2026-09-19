import React, { forwardRef } from 'react';

const Textarea = forwardRef(function Textarea(
  {
    label,
    error,
    helperText,
    id,
    disabled = false,
    rows = 4,
    className = '',
    ...props
  },
  ref
) {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-xs font-medium text-[#94A3B8] mb-1.5"
        >
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        ref={ref}
        rows={rows}
        disabled={disabled}
        className={`
          w-full bg-[#111827] text-[#F8FAFC] placeholder-[#475569] text-sm rounded-lg
          border transition-colors duration-150 outline-none p-3 resize-y
          ${error ? 'border-[#EF4444] focus:border-[#EF4444] focus:ring-1 focus:ring-[#EF4444]' : 'border-[#263247] focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]'}
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
        {...props}
      />
      {error ? (
        <p className="mt-1 text-xs text-[#EF4444]">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-[#94A3B8]">{helperText}</p>
      ) : null}
    </div>
  );
});

export default Textarea;
