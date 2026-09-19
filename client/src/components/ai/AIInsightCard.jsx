import React from 'react';
import AIIcon from './AIIcon';
import AIBadge from './AIBadge';

export default function AIInsightCard({
  title,
  subtitle,
  children,
  badgeText = 'Insight',
  action,
  className = ''
}) {
  return (
    <div
      className={`
        relative overflow-hidden rounded-xl bg-gradient-to-b from-[#171A2E] to-[#151D2E]
        border border-[#8B5CF6]/30 p-5 shadow-lg
        before:absolute before:top-0 before:left-0 before:w-1 before:h-full before:bg-gradient-to-b before:from-[#6366F1] before:to-[#8B5CF6]
        ${className}
      `}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <AIIcon size="sm" />
          <div>
            {title && (
              <h4 className="text-sm font-semibold text-[#F8FAFC]">
                {title}
              </h4>
            )}
            {subtitle && (
              <p className="text-xs text-[#94A3B8]">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {badgeText && <AIBadge size="sm">{badgeText}</AIBadge>}
      </div>

      <div className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed mb-4 pl-1">
        {children}
      </div>

      {action && (
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#263247]/60">
          {action}
        </div>
      )}
    </div>
  );
}
