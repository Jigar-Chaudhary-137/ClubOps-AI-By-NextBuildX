import React from 'react';
import { Sparkles } from 'lucide-react';

const sizeMap = {
  sm: 'w-7 h-7 p-1.5',
  md: 'w-9 h-9 p-2',
  lg: 'w-11 h-11 p-2.5'
};

export default function AIIcon({
  size = 'md',
  className = '',
  icon: CustomIcon
}) {
  const IconComponent = CustomIcon || Sparkles;

  return (
    <div
      className={`
        inline-flex items-center justify-center rounded-xl shrink-0
        bg-gradient-to-br from-[#6366F1]/20 via-[#8B5CF6]/30 to-[#EC4899]/10
        border border-[#8B5CF6]/30 text-[#A78BFA] shadow-[0_0_15px_rgba(139,92,246,0.15)]
        ${sizeMap[size] || sizeMap.md}
        ${className}
      `}
    >
      <IconComponent className="w-full h-full" />
    </div>
  );
}
