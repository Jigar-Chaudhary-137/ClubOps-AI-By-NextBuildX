import React from 'react';
import {
  Activity,
  AlertTriangle,
  Clock,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Zap,
} from 'lucide-react';

export default function AIOperationsSummary({ className = '' }) {
  const sections = [
    {
      title: 'Operational Attention',
      icon: AlertTriangle,
      value: '—',
      color: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
      note: 'Critical items flagged by AI analysis',
    },
    {
      title: 'Upcoming Priorities',
      icon: Clock,
      value: '—',
      color: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20',
      note: 'Key deadlines across events and teams',
    },
    {
      title: 'Potential Risks',
      icon: Activity,
      value: '—',
      color: 'text-rose-400 bg-rose-400/10 border-rose-400/20',
      note: 'Predicted bottlenecks and logistical blockers',
    },
    {
      title: 'Recent Changes',
      icon: RefreshCw,
      value: '—',
      color: 'text-sky-400 bg-sky-400/10 border-sky-400/20',
      note: 'Cross-module workspace modifications',
    },
    {
      title: 'Recommended Actions',
      icon: Zap,
      value: '—',
      color: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
      note: 'AI proposals ready for organizer review',
    },
  ];

  return (
    <div className={`p-5 rounded-2xl bg-[#111827] border border-[#263247] shadow-sm space-y-4 ${className}`}>
      <div className="flex items-center justify-between pb-2 border-b border-[#263247]">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-300">
            AI Operations Summary
          </h4>
        </div>
        <span className="text-[10px] text-gray-500 font-mono">Real-Time Sync</span>
      </div>

      <p className="text-xs text-gray-400 leading-relaxed">
        AI operational summaries will appear here once connected to club data.
      </p>

      <div className="space-y-2.5 pt-1">
        {sections.map((sec, idx) => {
          const Icon = sec.icon;
          return (
            <div
              key={idx}
              className="p-2.5 rounded-xl bg-[#151D2E]/60 border border-[#263247] flex items-center justify-between"
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className={`p-1.5 rounded-lg border shrink-0 ${sec.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="truncate">
                  <span className="text-xs font-medium text-gray-200 block truncate">
                    {sec.title}
                  </span>
                  <span className="text-[10px] text-gray-500 block truncate">
                    {sec.note}
                  </span>
                </div>
              </div>
              <span className="text-sm font-bold text-gray-400 font-mono px-2 py-0.5 rounded bg-[#111827] border border-[#263247]">
                {sec.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
