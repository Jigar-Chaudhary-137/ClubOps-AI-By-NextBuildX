import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, Sparkles, X } from 'lucide-react';

const icons = {
  info: <Info className="w-5 h-5 text-[#818CF8]" />,
  success: <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />,
  warning: <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />,
  error: <AlertCircle className="w-5 h-5 text-[#EF4444]" />,
  ai: <Sparkles className="w-5 h-5 text-[#8B5CF6]" />
};

const borderMap = {
  info: 'border-[#6366F1]/40',
  success: 'border-[#22C55E]/40',
  warning: 'border-[#F59E0B]/40',
  error: 'border-[#EF4444]/40',
  ai: 'border-[#8B5CF6]/50'
};

export default function Toast({
  type = 'info',
  title,
  message,
  onClose,
  className = ''
}) {
  return (
    <div
      role="status"
      className={`
        flex items-start gap-3 p-4 rounded-xl bg-[#151D2E] border shadow-2xl
        max-w-md w-full animate-in slide-in-from-top-2 duration-200
        ${borderMap[type] || borderMap.info}
        ${className}
      `}
    >
      <div className="shrink-0 mt-0.5">
        {icons[type] || icons.info}
      </div>
      <div className="flex-1 min-w-0">
        {title && (
          <h5 className="text-sm font-semibold text-[#F8FAFC]">
            {title}
          </h5>
        )}
        {message && (
          <p className="text-xs text-[#94A3B8] mt-0.5 leading-relaxed">
            {message}
          </p>
        )}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-[#94A3B8] hover:text-[#F8FAFC] p-1 rounded-md transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
