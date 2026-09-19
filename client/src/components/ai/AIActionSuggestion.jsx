import React from 'react';
import { ArrowRight, Check, X, Terminal } from 'lucide-react';
import AIBadge from './AIBadge';
import Button from '../ui/Button';

export default function AIActionSuggestion({
  actionName,
  description,
  payloadSummary,
  onExecute,
  onDismiss,
  isExecuting = false,
  className = ''
}) {
  return (
    <div
      className={`
        rounded-xl bg-[#151D2E] border border-[#8B5CF6]/30 p-4 sm:p-5
        shadow-[0_4px_20px_rgba(139,92,246,0.08)] transition-all
        hover:border-[#8B5CF6]/50
        ${className}
      `}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#8B5CF6]/15 text-[#A78BFA] flex items-center justify-center">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h5 className="text-sm font-semibold text-[#F8FAFC]">
              {actionName || 'Suggested Application Action'}
            </h5>
          </div>
        </div>
        <AIBadge size="sm">Action Proposal</AIBadge>
      </div>

      {description && (
        <p className="text-xs sm:text-sm text-[#94A3B8] mb-3 leading-relaxed">
          {description}
        </p>
      )}

      {payloadSummary && (
        <div className="bg-[#111827] border border-[#263247] rounded-lg p-3 mb-4 text-xs font-mono text-[#C4B5FD] flex items-center gap-2 overflow-x-auto">
          <span className="text-[#818CF8] shrink-0 font-sans font-semibold">Params:</span>
          <span className="truncate">{payloadSummary}</span>
        </div>
      )}

      <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#263247]/60">
        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            disabled={isExecuting}
            leftIcon={<X className="w-3.5 h-3.5" />}
          >
            Dismiss
          </Button>
        )}
        {onExecute && (
          <Button
            variant="ai"
            size="sm"
            onClick={onExecute}
            isLoading={isExecuting}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Execute Action
          </Button>
        )}
      </div>
    </div>
  );
}
