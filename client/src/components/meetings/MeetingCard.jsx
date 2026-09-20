import React from 'react';
import { Calendar, Users, Tag, CheckSquare, AlertTriangle, ArrowRight, Sparkles } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import MeetingProcessingBadge from './MeetingProcessingBadge';

export default function MeetingCard({
  meeting,
  onView,
  className = ''
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

  // Safely calculate participant count
  const participants = meeting.participants;
  const participantCount = Array.isArray(participants)
    ? participants.length
    : (meeting.participantCount || (typeof participants === 'object' && participants !== null ? 1 : 0));

  const processingStatus = meeting.processingStatus || (
    meeting.aiProcessed || meeting.actionItemsExtracted ? 'Processed' : 'Not Processed'
  );

  const actionItemCount = Array.isArray(meeting.extractedItems)
    ? meeting.extractedItems.length
    : (meeting.actionItemCount || 0);

  const riskCount = meeting.riskCount || 0;
  const hasIntelligence = Boolean(meeting.hasIntelligence || meeting.aiProcessed || meeting.actionItemsExtracted);

  return (
    <Card
      hoverEffect
      className={`border-[#263247] hover:border-[#374151] bg-[#151D2E] transition-all duration-200 flex flex-col justify-between ${className}`}
    >
      <CardContent className="p-5 space-y-4">
        {/* Header: Type, Intelligence Indicator & Status */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#111827] text-[#94A3B8] text-xs border border-[#263247] font-medium">
              <Tag className="w-3 h-3 text-[#818CF8]" />
              <span>{type}</span>
            </span>
            {(hasIntelligence || processingStatus === 'Processed') && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gradient-to-r from-[#6366F1]/20 to-[#8B5CF6]/20 text-[#A78BFA] text-[11px] border border-[#8B5CF6]/30 font-medium">
                <Sparkles className="w-2.5 h-2.5 text-[#A78BFA]" />
                <span>AI Analyzed</span>
              </span>
            )}
          </div>
          <MeetingProcessingBadge status={processingStatus} size="sm" />
        </div>

        {/* Title & Metadata */}
        <div>
          <h3
            onClick={() => onView?.(id)}
            className="text-base font-bold text-white tracking-tight line-clamp-1 hover:text-[#818CF8] cursor-pointer transition-colors"
          >
            {title}
          </h3>

          <div className="mt-2.5 space-y-1.5 text-xs text-[#94A3B8]">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
              <span className="truncate">{dateDisplay}</span>
            </div>
            <div className="flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
              <span className="truncate">Event: {eventDisplay}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
              <span className="truncate">{participantCount} Participant{participantCount === 1 ? '' : 's'}</span>
            </div>
          </div>
        </div>

        {/* Stats Summary: Action items & Risks */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#263247]/60 text-center">
          <div className="p-2 rounded-lg bg-[#111827]/60 border border-[#263247]">
            <div className="flex items-center justify-center gap-1 text-[11px] text-[#94A3B8]">
              <CheckSquare className="w-3 h-3 text-[#818CF8]" />
              <span>Actions</span>
            </div>
            <p className="text-xs font-semibold text-white font-mono mt-0.5">{actionItemCount}</p>
          </div>

          <div className="p-2 rounded-lg bg-[#111827]/60 border border-[#263247]">
            <div className="flex items-center justify-center gap-1 text-[11px] text-[#94A3B8]">
              <AlertTriangle className="w-3 h-3 text-[#F59E0B]" />
              <span>Risks</span>
            </div>
            <p className="text-xs font-semibold text-white font-mono mt-0.5">{riskCount}</p>
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
            View Meeting
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

