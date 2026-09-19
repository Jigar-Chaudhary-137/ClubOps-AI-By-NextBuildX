import React from 'react';

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className = ''
}) {
  return (
    <div
      className={`
        flex flex-col items-center justify-center text-center p-8 sm:p-12
        border border-dashed border-[#263247] rounded-xl bg-[#151D2E]/40
        ${className}
      `}
    >
      {icon && (
        <div className="w-12 h-12 rounded-xl bg-[#1E293B] border border-[#263247] flex items-center justify-center text-[#94A3B8] mb-4">
          {icon}
        </div>
      )}
      {title && (
        <h4 className="text-base font-semibold text-[#F8FAFC] mb-1.5">
          {title}
        </h4>
      )}
      {description && (
        <p className="text-xs sm:text-sm text-[#94A3B8] max-w-sm mb-5 leading-relaxed">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
