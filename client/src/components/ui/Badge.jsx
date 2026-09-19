import React from 'react';

const badgeVariants = {
  neutral: 'bg-[#1E293B] text-[#94A3B8] border-[#334155]',
  primary: 'bg-[#6366F1]/15 text-[#818CF8] border-[#6366F1]/30',
  ai: 'bg-gradient-to-r from-[#6366F1]/20 to-[#8B5CF6]/20 text-[#A78BFA] border-[#8B5CF6]/40',
  success: 'bg-[#22C55E]/15 text-[#4ADE80] border-[#22C55E]/30',
  warning: 'bg-[#F59E0B]/15 text-[#FBBF24] border-[#F59E0B]/30',
  danger: 'bg-[#EF4444]/15 text-[#F87171] border-[#EF4444]/30'
};

const dotColors = {
  neutral: 'bg-[#94A3B8]',
  primary: 'bg-[#6366F1]',
  ai: 'bg-[#8B5CF6]',
  success: 'bg-[#22C55E]',
  warning: 'bg-[#F59E0B]',
  danger: 'bg-[#EF4444]'
};

export default function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  icon = null,
  className = '',
  ...props
}) {
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';
  const variantClass = badgeVariants[variant] || badgeVariants.neutral;

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-medium rounded-full border
        ${sizeClass} ${variantClass} ${className}
      `}
      {...props}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[variant] || dotColors.neutral}`}
        />
      )}
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
