import React from 'react';
import { ArrowRight, Calendar, Users, Tag, AlertTriangle, CheckSquare } from 'lucide-react';
import MeetingProcessingBadge from './MeetingProcessingBadge';

export default function MeetingRow({
  meeting,
  onView
}) {
  if (!meeting) return null;

  const id = meeting._id || meeting.id;
  const title = meeting.title || 'Untitled Meeting';
  const type = meeting.type || 'Planning';
  
  // Safely extract event name
  const eventDisplay = typeof meeting.event === 'object' && meeting.event !== null
    ? (meeting.event.title || meeting.event.name || '—')
    : (meeting.event || '—');

  // Safely extract date
  const dateDisplay = meeting.date && meeting.date !== '—'
    ? meeting.date
    : meeting.scheduledAt
      ? new Date(meeting.scheduledAt).toLocaleDateString()
      : '—';

  // Safely extract participants
  const participants = meeting.participants;
  const participantDisplay = Array.isArray(participants)
    ? participants.length > 0
      ? `${participants.length} participant${participants.length > 1 ? 's' : ''}`
      : 'None'
    : typeof participants === 'object' && participants !== null
      ? (participants.name || participants.email || '1 participant')
      : (participants || '—');

  // Safely determine processing status
  const processingStatus = meeting.processingStatus || (
    meeting.aiProcessed || meeting.actionItemsExtracted ? 'Processed' : 'Not Processed'
  );

  const actionItemCount = Array.isArray(meeting.extractedItems)
    ? meeting.extractedItems.length
    : (meeting.actionItemCount || 0);

  const riskCount = meeting.riskCount || 0;

  const updatedAtDisplay = meeting.updatedAt
    ? (typeof meeting.updatedAt === 'string' && meeting.updatedAt.includes('T')
        ? new Date(meeting.updatedAt).toLocaleDateString()
        : meeting.updatedAt)
    : '—';

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
            <span className="text-[11px] px-2 py-0.5 rounded bg-[#111827] text-[#94A3B8] border border-[#263247] font-medium">
              {type}
            </span>
          </div>
        </div>
      </td>

      {/* Event */}
      <td className="py-3 px-4 text-xs text-[#94A3B8] whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-[#64748B]" />
          <span>{eventDisplay}</span>
        </div>
      </td>

      {/* Date */}
      <td className="py-3 px-4 text-xs text-[#94A3B8] whitespace-nowrap">
        <div className="flex items-center gap-1.5 font-mono">
          <Calendar className="w-3.5 h-3.5 text-[#64748B]" />
          <span>{dateDisplay}</span>
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
        {updatedAtDisplay}
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

