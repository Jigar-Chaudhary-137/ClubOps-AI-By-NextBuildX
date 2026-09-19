import React from 'react';
import { Target, CheckCircle2, Clock, Calendar } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';

export default function EventProgress({
  progress = null,
  completedTasks = null,
  pendingTasks = null,
  upcomingDeadlines = null,
  className = ''
}) {
  const hasData = progress !== null && progress !== undefined;

  return (
    <Card className={`border-[#263247] bg-[#151D2E] ${className}`}>
      <CardContent className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-white tracking-tight">
              Event Operational Progress
            </h4>
            <p className="text-xs text-[#94A3B8]">
              Consolidated execution status across milestones and tasks
            </p>
          </div>
          <span className="text-sm font-bold font-mono text-[#818CF8]">
            {hasData ? `${progress}%` : '—'}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 rounded-full bg-[#111827] border border-[#263247] overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] transition-all duration-300"
            style={{ width: hasData ? `${Math.min(100, Math.max(0, progress))}%` : '0%' }}
          />
        </div>

        {/* Breakdown Metric Slots */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3 rounded-lg bg-[#111827]/80 border border-[#263247]">
            <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" />
              <span>Completed Tasks</span>
            </div>
            <p className="text-sm font-semibold font-mono text-white mt-1">
              {completedTasks !== null ? completedTasks : '—'}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-[#111827]/80 border border-[#263247]">
            <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
              <Clock className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>Pending Tasks</span>
            </div>
            <p className="text-sm font-semibold font-mono text-white mt-1">
              {pendingTasks !== null ? pendingTasks : '—'}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-[#111827]/80 border border-[#263247]">
            <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
              <Calendar className="w-3.5 h-3.5 text-[#818CF8]" />
              <span>Upcoming Deadlines</span>
            </div>
            <p className="text-sm font-semibold font-mono text-white mt-1">
              {upcomingDeadlines !== null ? upcomingDeadlines : '—'}
            </p>
          </div>
        </div>

        {!hasData && (
          <p className="text-[11px] text-[#64748B] text-center pt-1 border-t border-[#263247]/50">
            Progress will appear once event operations are connected.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
