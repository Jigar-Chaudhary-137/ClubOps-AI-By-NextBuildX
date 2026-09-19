import React from 'react';
import { Clock, Send, Calendar, AlertCircle } from 'lucide-react';
import Input from '../ui/Input';

export default function AnnouncementSchedule({
  scheduleType = 'now', // 'now' | 'later'
  scheduledDate = '',
  scheduledTime = '',
  timezone = 'Local Time (UTC+05:30)',
  onTypeChange,
  onDateChange,
  onTimeChange,
  className = ''
}) {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Type Toggle */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onTypeChange?.('now')}
          className={`
            p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all
            ${scheduleType === 'now'
              ? 'bg-[#6366F1]/15 border-[#6366F1] text-white'
              : 'bg-[#111827] border-[#263247] text-[#94A3B8] hover:text-white'}
          `}
        >
          <div className="p-2 rounded-lg bg-[#151D2E] text-[#818CF8]">
            <Send className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-semibold">Publish Now</p>
            <p className="text-[11px] text-[#94A3B8]">Dispatch immediately on submit</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onTypeChange?.('later')}
          className={`
            p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all
            ${scheduleType === 'later'
              ? 'bg-[#6366F1]/15 border-[#6366F1] text-white'
              : 'bg-[#111827] border-[#263247] text-[#94A3B8] hover:text-white'}
          `}
        >
          <div className="p-2 rounded-lg bg-[#151D2E] text-[#FBBF24]">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-semibold">Schedule for Later</p>
            <p className="text-[11px] text-[#94A3B8]">Set date and target delivery window</p>
          </div>
        </button>
      </div>

      {/* When 'later' is selected */}
      {scheduleType === 'later' && (
        <div className="p-4 rounded-xl bg-[#111827] border border-[#263247] space-y-3 animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Publication Date"
              type="date"
              value={scheduledDate}
              onChange={(e) => onDateChange?.(e.target.value)}
            />
            <Input
              label="Publication Time"
              type="time"
              value={scheduledTime}
              onChange={(e) => onTimeChange?.(e.target.value)}
            />
          </div>

          <p className="text-[11px] text-[#64748B] font-mono">
            Timezone: {timezone}
          </p>

          <div className="p-3 rounded-lg bg-[#6366F1]/10 border border-[#6366F1]/30 text-xs text-[#818CF8] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Scheduling will become active after the communication backend is connected.</span>
          </div>
        </div>
      )}
    </div>
  );
}
