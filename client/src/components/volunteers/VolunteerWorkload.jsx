import React from 'react';
import { Activity, CheckSquare, Calendar, AlertCircle } from 'lucide-react';

export default function VolunteerWorkload({
  workload = null,
  compact = false,
  className = ''
}) {
  // If no workload data exists, display transparent, professional empty state
  if (!workload || workload.percentage === undefined || workload.percentage === null) {
    if (compact) {
      return (
        <span className="text-xs text-[#64748B] italic">
          No workload data
        </span>
      );
    }

    return (
      <div
        className={`
          p-3.5 rounded-lg bg-[#111827] border border-[#263247]
          text-xs text-[#94A3B8] flex items-center gap-2.5
          ${className}
        `}
      >
        <Activity className="w-4 h-4 text-[#64748B] shrink-0" />
        <span className="leading-relaxed">
          Workload data will appear once assignments are connected.
        </span>
      </div>
    );
  }

  const {
    assignedTasks = 0,
    activeEvents = 0,
    pendingResponsibilities = 0,
    percentage = 0
  } = workload;

  // Workload bar color determination
  const getWorkloadColor = (pct) => {
    if (pct > 80) return 'from-[#EF4444] to-[#F87171]';
    if (pct > 50) return 'from-[#F59E0B] to-[#FBBF24]';
    return 'from-[#6366F1] to-[#8B5CF6]';
  };

  if (compact) {
    return (
      <div className={`space-y-1 ${className}`}>
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#94A3B8]">Workload</span>
          <span className="font-mono text-white font-medium">{percentage}%</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-[#111827] border border-[#263247] overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${getWorkloadColor(percentage)}`}
            style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 p-4 rounded-xl bg-[#111827] border border-[#263247] ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#818CF8]" />
          <span className="text-xs font-semibold text-[#F8FAFC] uppercase tracking-wider">
            Current Workload
          </span>
        </div>
        <span className="font-mono text-sm font-bold text-white">{percentage}%</span>
      </div>

      <div className="w-full h-2 rounded-full bg-[#151D2E] border border-[#263247] overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${getWorkloadColor(percentage)}`}
          style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
        />
      </div>

      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#263247]/60 text-center">
        <div className="p-2 rounded-lg bg-[#151D2E] border border-[#263247]/60">
          <div className="flex items-center justify-center gap-1 text-[11px] text-[#94A3B8]">
            <CheckSquare className="w-3 h-3 text-[#22C55E]" />
            <span>Tasks</span>
          </div>
          <p className="text-xs font-semibold text-white font-mono mt-0.5">{assignedTasks}</p>
        </div>

        <div className="p-2 rounded-lg bg-[#151D2E] border border-[#263247]/60">
          <div className="flex items-center justify-center gap-1 text-[11px] text-[#94A3B8]">
            <Calendar className="w-3 h-3 text-[#818CF8]" />
            <span>Events</span>
          </div>
          <p className="text-xs font-semibold text-white font-mono mt-0.5">{activeEvents}</p>
        </div>

        <div className="p-2 rounded-lg bg-[#151D2E] border border-[#263247]/60">
          <div className="flex items-center justify-center gap-1 text-[11px] text-[#94A3B8]">
            <AlertCircle className="w-3 h-3 text-[#F59E0B]" />
            <span>Pending</span>
          </div>
          <p className="text-xs font-semibold text-white font-mono mt-0.5">{pendingResponsibilities}</p>
        </div>
      </div>
    </div>
  );
}
