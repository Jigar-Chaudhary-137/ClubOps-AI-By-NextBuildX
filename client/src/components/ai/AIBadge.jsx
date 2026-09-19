import React from 'react';
import { Sparkles } from 'lucide-react';

export default function AIBadge({
  children = 'AI Assisted',
  size = 'md',
  className = ''
}) {
  const sizeClasses = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-medium rounded-full
        bg-gradient-to-r from-[#6366F1]/20 via-[#8B5CF6]/20 to-[#EC4899]/20
        text-[#C4B5FD] border border-[#8B5CF6]/30 shadow-sm
        ${sizeClasses} ${className}
      `}
    >
      <Sparkles className="w-3 h-3 text-[#A78BFA] shrink-0 animate-pulse" />
      <span>{children}</span>
    </span>
  );
}
