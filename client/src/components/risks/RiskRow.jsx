import React from 'react';
import { ArrowRight, Tag, User, AlertTriangle } from 'lucide-react';
import RiskSeverityBadge from './RiskSeverityBadge';
import RiskStatusBadge from './RiskStatusBadge';
import RiskCategoryBadge from './RiskCategoryBadge';

export default function RiskRow({
  risk,
  onView
}) {
  if (!risk) return null;

  const {
    id,
    title = 'Untitled Risk',
    severity = 'Medium',
    category = 'General',
    event = '—',
    probability = '—',
    impact = '—',
    riskScore = '—',
    owner = '—',
    status = 'Open',
    updatedAt = '—'
  } = risk;

  return (
    <tr className="border-b border-[#263247]/60 hover:bg-[#151D2E]/80 transition-colors">
      {/* Risk Title */}
      <td className="py-3 px-4 min-w-[220px]">
        <button
          type="button"
          onClick={() => onView?.(id)}
          className="text-sm font-semibold text-white text-left hover:text-[#818CF8] transition-colors line-clamp-1"
        >
          {title}
        </button>
      </td>

      {/* Severity */}
      <td className="py-3 px-4 whitespace-nowrap">
        <RiskSeverityBadge severity={severity} size="sm" />
      </td>

      {/* Category */}
      <td className="py-3 px-4 whitespace-nowrap">
        <RiskCategoryBadge category={category} size="sm" />
      </td>

      {/* Event */}
      <td className="py-3 px-4 text-xs text-[#94A3B8] whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-[#64748B]" />
          <span>{event}</span>
        </div>
      </td>

      {/* Probability */}
      <td className="py-3 px-4 text-xs text-[#94A3B8] whitespace-nowrap font-mono">
        {probability}
      </td>

      {/* Impact */}
      <td className="py-3 px-4 text-xs text-[#94A3B8] whitespace-nowrap font-mono">
        {impact}
      </td>

      {/* Score */}
      <td className="py-3 px-4 text-xs text-white whitespace-nowrap font-mono font-semibold">
        {riskScore}
      </td>

      {/* Owner */}
      <td className="py-3 px-4 text-xs text-[#94A3B8] whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-[#64748B]" />
          <span>{owner}</span>
        </div>
      </td>

      {/* Status */}
      <td className="py-3 px-4 whitespace-nowrap">
        <RiskStatusBadge status={status} size="sm" />
      </td>

      {/* Updated */}
      <td className="py-3 px-4 text-xs text-[#64748B] whitespace-nowrap font-mono">
        {updatedAt}
      </td>

      {/* Action */}
      <td className="py-3 px-4 text-right whitespace-nowrap">
        <button
          type="button"
          onClick={() => onView?.(id)}
          className="text-xs font-medium text-[#818CF8] hover:text-white inline-flex items-center gap-1 transition-colors"
        >
          <span>View</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </td>
    </tr>
  );
}
