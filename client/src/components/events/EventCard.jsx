import React from 'react';
import { Calendar, MapPin, Users, CheckSquare, AlertTriangle, ArrowRight, Tag } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import EventStatusBadge from './EventStatusBadge';

export default function EventCard({
  event,
  onView,
  onEdit,
  className = ''
}) {
  if (!event) return null;

  const {
    id,
    title = 'Untitled Event',
    type = 'General',
    status = 'Planning',
    startDate,
    endDate,
    location,
    progress = 0,
    taskCount = 0,
    volunteerCount = 0,
    riskCount = 0
  } = event;

  return (
    <Card
      hoverEffect
      className={`border-[#263247] hover:border-[#374151] bg-[#151D2E] transition-all duration-200 flex flex-col justify-between ${className}`}
    >
      <CardContent className="p-5 space-y-4">
        {/* Header: Type & Status */}
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#111827] text-[#94A3B8] text-xs border border-[#263247] font-medium">
            <Tag className="w-3 h-3 text-[#818CF8]" />
            <span>{type}</span>
          </span>
          <EventStatusBadge status={status} size="sm" />
        </div>

        {/* Title & Metadata */}
        <div>
          <h3 className="text-base font-bold text-white tracking-tight line-clamp-1 hover:text-[#818CF8] transition-colors">
            {title}
          </h3>

          <div className="mt-2 space-y-1.5 text-xs text-[#94A3B8]">
            {(startDate || endDate) && (
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
                <span className="truncate">{startDate}{endDate ? ` — ${endDate}` : ''}</span>
              </div>
            )}
            {location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
                <span className="truncate">{location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#94A3B8]">Progress</span>
            <span className="font-mono text-white font-semibold">{progress}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-[#111827] border border-[#263247] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6]"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        </div>

        {/* Counters Summary */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#263247]/60 text-center">
          <div className="p-1.5 rounded-lg bg-[#111827]/60 border border-[#263247]">
            <div className="flex items-center justify-center gap-1 text-[11px] text-[#94A3B8]">
              <CheckSquare className="w-3 h-3 text-[#22C55E]" />
              <span>Tasks</span>
            </div>
            <p className="text-xs font-semibold text-white font-mono mt-0.5">{taskCount}</p>
          </div>

          <div className="p-1.5 rounded-lg bg-[#111827]/60 border border-[#263247]">
            <div className="flex items-center justify-center gap-1 text-[11px] text-[#94A3B8]">
              <Users className="w-3 h-3 text-[#818CF8]" />
              <span>Roster</span>
            </div>
            <p className="text-xs font-semibold text-white font-mono mt-0.5">{volunteerCount}</p>
          </div>

          <div className="p-1.5 rounded-lg bg-[#111827]/60 border border-[#263247]">
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
            onClick={() => onView ? onView(id) : null}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            View Event
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
