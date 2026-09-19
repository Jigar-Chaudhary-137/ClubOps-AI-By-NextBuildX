import React from 'react';
import { Database, Gauge, Layers, Lightbulb, Sparkles, ArrowRight } from 'lucide-react';
import AIIcon from './AIIcon';
import AIBadge from './AIBadge';

export default function AIInsightCard({
  title,
  subtitle,
  description,
  children,
  badgeText = 'Insight',
  source,
  confidence,
  relatedModule,
  recommendedAction,
  action,
  className = '',
  isEmpty = false,
}) {
  // Empty state when no insights are available or explicitly empty
  if (isEmpty || (!title && !children && !description)) {
    return (
      <div
        className={`
          relative overflow-hidden rounded-xl bg-[#111827]
          border border-[#263247] p-6 text-center shadow-sm
          ${className}
        `}
      >
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mx-auto mb-2">
          <Lightbulb className="w-5 h-5" />
        </div>
        <h4 className="text-sm font-semibold text-white">No AI insights available yet</h4>
        <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto leading-relaxed">
          Operational observations, risks, and recommendations will be highlighted here once the AI reasoning pipeline is connected.
        </p>
      </div>
    );
  }

  const content = description || children;

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
        {content}
      </div>

      {/* Metadata tags (source, confidence, related module) */}
      {(source || confidence || relatedModule) && (
        <div className="flex flex-wrap items-center gap-2 pt-2 pb-3 border-t border-[#263247]/60 text-[10px]">
          {relatedModule && (
            <span className="flex items-center space-x-1 px-2 py-0.5 rounded bg-[#111827] border border-[#263247] text-gray-300">
              <Layers className="w-3 h-3 text-indigo-400" />
              <span>Module: {relatedModule}</span>
            </span>
          )}
          {source && (
            <span className="flex items-center space-x-1 px-2 py-0.5 rounded bg-[#111827] border border-[#263247] text-gray-300">
              <Database className="w-3 h-3 text-purple-400" />
              <span>Source: {source}</span>
            </span>
          )}
          {confidence && (
            <span className="flex items-center space-x-1 px-2 py-0.5 rounded bg-[#111827] border border-[#263247] text-gray-300">
              <Gauge className="w-3 h-3 text-emerald-400" />
              <span>Confidence: {confidence}</span>
            </span>
          )}
        </div>
      )}

      {/* Action area */}
      {(action || recommendedAction) && (
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#263247]/60">
          {recommendedAction}
          {action}
        </div>
      )}
    </div>
  );
}
