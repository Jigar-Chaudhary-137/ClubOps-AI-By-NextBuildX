import React from 'react';
import { ArrowRight, Calendar, Users, Tag, AlertTriangle, CheckSquare, Sparkles } from 'lucide-react';
import MeetingProcessingBadge from './MeetingProcessingBadge';

export default function MeetingRow({
  meeting,
  onView
}) {
  if (!meeting) return null;

  const {
    id,
    title = 'Untitled Meeting',
    type = 'Planning',
    event = '—',
    date = '—',
    participants = [],
    processingStatus = 'Not Processed',
    actionItemCount = 0,
    riskCount = 0,
    updatedAt = '—'
  } = meeting;

  const participantDisplay = Array.isArray(participants)
    ? participants.length > 0
      ? `${participants.length} participant${participants.length > 1 ? 's' : ''}`
      : 'None'
    : participants || '—';

  return (
    <tr className="border-b border-[#263247]/60 hover:bg-[#151D2E]/80 transition-colors">
      {/* Meeting Title & Type */}
      <td className="py-3 px-4 min-w-[200px]">
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => onView?.(id)}
            className="text-sm font-semibold text-white text-left hover:text-[#818CF8] transition-colors line-clamp-1"
          >
            {title}
          </button>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] px-2 py-0.2 rounded bg-[#111827] text-[#94A3B8] border border-[#263247] font-medium">
              {type}
            </span>
          </div>
        </div>
      </td>

      {/* Event */}
      <td className="py-3 px-4 text-xs text-[#94A3B8] whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-[#64748B]" />
          <span>{event}</span>
        </div>
      </td>

      {/* Date */}
      <td className="py-3 px-4 text-xs text-[#94A3B8] whitespace-nowrap">
        <div className="flex items-center gap-1.5 font-mono">
          <Calendar className="w-3.5 h-3.5 text-[#64748B]" />
          <span>{date}</span>
        </div>
      </td>

      {/* Participants */}
      <td className="py-3 px-4 text-xs text-[#94A3B8] whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-[#64748B]" />
          <span>{participantDisplay}</span>
        </div>
      </td>

      {/* Processing Status */}
      <td className="py-3 px-4 whitespace-nowrap">
        <MeetingProcessingBadge status={processingStatus} size="sm" />
      </td>

      {/* Action Item Count */}
      <td className="py-3 px-4 text-xs text-[#94A3B8] whitespace-nowrap font-mono">
        <div className="flex items-center gap-1">
          <CheckSquare className="w-3.5 h-3.5 text-[#818CF8]" />
          <span>{actionItemCount}</span>
        </div>
      </td>

      {/* Risk Count */}
      <td className="py-3 px-4 text-xs text-[#94A3B8] whitespace-nowrap font-mono">
        <div className="flex items-center gap-1">
          <AlertTriangle className="w-3.5 h-3.5 text-[#F59E0B]" />
          <span>{riskCount}</span>
        </div>
      </td>

      {/* Last Updated */}
      <td className="py-3 px-4 text-xs text-[#64748B] whitespace-nowrap font-mono">
        {updatedAt}
      </td>

      {/* View Action */}
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
