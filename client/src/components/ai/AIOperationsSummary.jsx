import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  Clock,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Zap,
} from 'lucide-react';
import { getTasks } from '../../services/api/tasks';
import { getRisks } from '../../services/api/risks';
import { getMeetings } from '../../services/api/meetings';
import { getAnnouncements } from '../../services/api/announcements';

export default function AIOperationsSummary({ className = '' }) {
  const [metrics, setMetrics] = useState({
    pendingTasks: 0,
    criticalRisks: 0,
    recentMeetings: 0,
    announcements: 0,
    loading: true,
  });

  useEffect(() => {
    async function loadSummary() {
      try {
        const [tasksRes, risksRes, meetingsRes, annRes] = await Promise.allSettled([
          getTasks({ limit: 100 }),
          getRisks({ limit: 100 }),
          getMeetings({ limit: 50 }),
          getAnnouncements({ limit: 50 }),
        ]);

        const tasks = tasksRes.status === 'fulfilled' ? (tasksRes.value?.data || tasksRes.value?.tasks || []) : [];
        const risks = risksRes.status === 'fulfilled' ? (risksRes.value?.data || risksRes.value?.risks || []) : [];
        const meetings = meetingsRes.status === 'fulfilled' ? (meetingsRes.value?.data || meetingsRes.value?.meetings || []) : [];
        const announcements = annRes.status === 'fulfilled' ? (annRes.value?.data || annRes.value?.announcements || []) : [];

        const pendingCount = tasks.filter((t) => t.status !== 'completed').length;
        const criticalCount = risks.filter((r) => r.severity === 'high' || r.severity === 'critical').length;

        setMetrics({
          pendingTasks: pendingCount,
          criticalRisks: criticalCount,
          recentMeetings: meetings.length,
          announcements: announcements.length,
          loading: false,
        });
      } catch (err) {
        console.error('Failed to load AI operations summary:', err);
        setMetrics((p) => ({ ...p, loading: false }));
      }
    }
    loadSummary();
  }, []);

  const sections = [
    {
      title: 'Operational Attention',
      icon: AlertTriangle,
      value: metrics.loading ? '...' : `${metrics.criticalRisks} Critical`,
      color: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
      note: 'High severity operational risks',
    },
    {
      title: 'Upcoming Priorities',
      icon: Clock,
      value: metrics.loading ? '...' : `${metrics.pendingTasks} Pending`,
      color: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20',
      note: 'Tasks requiring completion',
    },
    {
      title: 'Potential Risks',
      icon: Activity,
      value: metrics.loading ? '...' : `${metrics.criticalRisks} Active`,
      color: 'text-rose-400 bg-rose-400/10 border-rose-400/20',
      note: 'Identified hazard monitoring',
    },
    {
      title: 'Recent Meetings',
      icon: RefreshCw,
      value: metrics.loading ? '...' : `${metrics.recentMeetings} Logged`,
      color: 'text-sky-400 bg-sky-400/10 border-sky-400/20',
      note: 'Minutes & action items',
    },
    {
      title: 'Announcements',
      icon: Zap,
      value: metrics.loading ? '...' : `${metrics.announcements} Sent`,
      color: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
      note: 'Multi-channel communications',
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
        <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live Sync
        </span>
      </div>

      <p className="text-xs text-gray-400 leading-relaxed">
        Real-time operational summary computed from active workspace records.
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
              <span className="text-xs font-bold text-gray-200 font-mono px-2 py-0.5 rounded bg-[#111827] border border-[#263247]">
                {sec.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
