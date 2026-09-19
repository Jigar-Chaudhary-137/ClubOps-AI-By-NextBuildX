import React from 'react';
import { Loader2 } from 'lucide-react';

const variantClasses = {
  primary: 'bg-[#6366F1] text-white hover:bg-[#5558E6] focus-visible:ring-[#6366F1] shadow-sm',
  secondary: 'bg-[#151D2E] text-[#F8FAFC] hover:bg-[#1E293B] border border-[#263247] focus-visible:ring-[#6366F1]',
  outline: 'bg-transparent text-[#F8FAFC] border border-[#263247] hover:bg-[#151D2E] hover:border-[#374151] focus-visible:ring-[#6366F1]',
  ghost: 'bg-transparent text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#151D2E] focus-visible:ring-[#6366F1]',
  danger: 'bg-[#EF4444] text-white hover:bg-[#DC2626] focus-visible:ring-[#EF4444]',
  ai: 'bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white hover:opacity-95 shadow-sm focus-visible:ring-[#8B5CF6]'
};

const sizeClasses = {
  sm: 'px-2.5 py-1.5 text-xs font-medium rounded-md gap-1.5',
  md: 'px-3.5 py-2 text-sm font-medium rounded-lg gap-2',
  lg: 'px-5 py-2.5 text-base font-medium rounded-lg gap-2.5'
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  leftIcon = null,
  rightIcon = null,
  className = '',
  type = 'button',
  ...props
}) {
  const baseClass = 'inline-flex items-center justify-center font-medium transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1020]';
  const variantClass = variantClasses[variant] || variantClasses.primary;
  const sizeClass = sizeClasses[size] || sizeClasses.md;

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`${baseClass} ${variantClass} ${sizeClass} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
}
