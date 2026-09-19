import React from 'react';
import { Calendar, User, Tag, Sparkles, ArrowRight, ShieldAlert, CheckSquare } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import RiskSeverityBadge from './RiskSeverityBadge';
import RiskStatusBadge from './RiskStatusBadge';
import RiskCategoryBadge from './RiskCategoryBadge';
import RiskProbabilityImpact from './RiskProbabilityImpact';
import RiskScoreIndicator from './RiskScoreIndicator';

export default function RiskCard({
  risk,
  onView,
  className = ''
}) {
  if (!risk) return null;

  const {
    id,
    title = 'Untitled Risk',
    description = '',
    severity = 'Medium',
    status = 'Open',
    category = 'General',
    event = '—',
    owner = '—',
    probability = '—',
    impact = '—',
    riskScore = '—',
    mitigationProgress = '—',
    updatedAt = '—',
    aiIdentified = false
  } = risk;

  return (
    <Card
      hoverEffect
      className={`border-[#263247] hover:border-[#374151] bg-[#151D2E] transition-all duration-200 flex flex-col justify-between ${className}`}
    >
      <CardContent className="p-5 space-y-4">
        {/* Header: Severity, Status & AI Indicator */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <RiskSeverityBadge severity={severity} size="sm" />
            <RiskStatusBadge status={status} size="sm" />
          </div>
          {aiIdentified && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-gradient-to-r from-[#6366F1]/20 to-[#8B5CF6]/20 text-[#A78BFA] border border-[#8B5CF6]/30">
              <Sparkles className="w-2.5 h-2.5" />
              <span>AI Flagged</span>
            </span>
          )}
        </div>

        {/* Title, Category & Description */}
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <RiskCategoryBadge category={category} size="sm" />
          </div>

          <h3
            onClick={() => onView?.(id)}
            className="text-base font-bold text-white tracking-tight line-clamp-1 hover:text-[#818CF8] cursor-pointer transition-colors"
            title={title}
          >
            {title}
          </h3>

          {description && (
            <p className="text-xs text-[#94A3B8] line-clamp-2 mt-1 leading-relaxed">
              {description}
            </p>
          )}

          {/* Event & Owner */}
          <div className="mt-3 space-y-1.5 text-xs text-[#94A3B8]">
            <div className="flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
              <span className="truncate">Event: <strong className="text-white font-medium">{event}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
              <span className="truncate">Owner: <strong className="text-white font-medium">{owner}</strong></span>
            </div>
          </div>
        </div>

        {/* Probability & Impact */}
        <RiskProbabilityImpact probability={probability} impact={impact} />

        {/* Risk Score & Mitigation Progress Summary */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#263247]/60">
          <RiskScoreIndicator score={riskScore} />

          <div className="p-2 rounded-lg bg-[#111827] border border-[#263247] flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-[#151D2E] text-[#22C55E]">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-[#94A3B8] uppercase font-semibold tracking-wider">
                Mitigation
              </p>
              <p className="text-xs font-semibold text-white font-mono">
                {mitigationProgress}
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Button
            variant="secondary"
            size="sm"
            className="w-full justify-between"
            onClick={() => onView?.(id)}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            View Risk
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
