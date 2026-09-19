import React from 'react';
import { Loader2 } from 'lucide-react';

const sizeMap = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8'
};

const colorMap = {
  primary: 'text-[#6366F1]',
  white: 'text-white',
  ai: 'text-[#8B5CF6]',
  muted: 'text-[#94A3B8]'
};

export default function Spinner({
  size = 'md',
  variant = 'primary',
  className = ''
}) {
  return (
    <Loader2
      className={`
        animate-spin shrink-0
        ${sizeMap[size] || sizeMap.md}
        ${colorMap[variant] || colorMap.primary}
        ${className}
      `}
    />
  );
}
