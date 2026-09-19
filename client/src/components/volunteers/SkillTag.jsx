import React from 'react';
import { X } from 'lucide-react';

export default function SkillTag({
  skill,
  onRemove,
  compact = false,
  className = ''
}) {
  if (!skill) return null;

  return (
    <span
      className={`
        inline-flex items-center gap-1 font-medium rounded-md
        bg-[#1E293B]/90 text-[#94A3B8] border border-[#263247]
        hover:border-[#334155] transition-colors
        ${compact ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs'}
        ${className}
      `}
    >
      <span className="truncate max-w-[140px]">{skill}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(skill);
          }}
          className="p-0.5 hover:bg-[#334155] hover:text-white rounded text-[#64748B] transition-colors"
          aria-label={`Remove ${skill}`}
        >
          <X className={compact ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
        </button>
      )}
    </span>
  );
}
