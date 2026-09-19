import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckSquare, Users, Clock, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { getTasks } from '../../services/api/tasks';
import { getVolunteers } from '../../services/api/volunteers';
import { getEvents } from '../../services/api/events';
import { getRisks } from '../../services/api/risks';

export default function OperationalOverview() {
  const [counts, setCounts] = useState({
    tasks: 0,
    volunteers: 0,
    events: 0,
    risks: 0,
    loading: true,
  });

  useEffect(() => {
    async function loadCounts() {
      try {
        const [tasksRes, volRes, evtRes, riskRes] = await Promise.allSettled([
          getTasks({ limit: 100 }),
          getVolunteers({ limit: 100 }),
          getEvents({ limit: 100 }),
          getRisks({ limit: 100 }),
        ]);

        const tasks = tasksRes.status === 'fulfilled' ? (tasksRes.value?.data || tasksRes.value?.tasks || []) : [];
        const vols = volRes.status === 'fulfilled' ? (volRes.value?.data || volRes.value?.volunteers || []) : [];
        const evts = evtRes.status === 'fulfilled' ? (evtRes.value?.data || evtRes.value?.events || []) : [];
        const risks = riskRes.status === 'fulfilled' ? (riskRes.value?.data || riskRes.value?.risks || []) : [];

        setCounts({
          tasks: tasks.filter((t) => t.status !== 'completed').length,
          volunteers: vols.length,
          events: evts.length,
          risks: risks.length,
          loading: false,
        });
      } catch (err) {
        console.error('Failed to load operational overview counts:', err);
        setCounts((p) => ({ ...p, loading: false }));
      }
    }
    loadCounts();
  }, []);

  const operationalCards = [
    {
      title: 'Tasks Operations',
      explanation: 'Work breakdown, task owners & execution status',
      statusText: counts.loading ? 'Loading tasks...' : `${counts.tasks} pending tasks`,
      statusBadge: counts.tasks > 0 ? 'Active Workflow' : 'All Clear',
      icon: CheckSquare,
      iconColor: 'text-[#818CF8]',
      iconBg: 'bg-[#6366F1]/10',
      link: '/tasks'
    },
    {
      title: 'Volunteer Roster',
      explanation: 'Member role assignments & team availability',
      statusText: counts.loading ? 'Loading roster...' : `${counts.volunteers} registered volunteers`,
      statusBadge: counts.volunteers > 0 ? 'Team Ready' : 'Roster Open',
      icon: Users,
      iconColor: 'text-[#A78BFA]',
      iconBg: 'bg-[#8B5CF6]/10',
      link: '/volunteers'
    },
    {
      title: 'Deadlines & Schedule',
      explanation: 'Critical path milestones, rehearsals & target dates',
      statusText: counts.loading ? 'Loading schedule...' : `${counts.events} total events`,
      statusBadge: counts.events > 0 ? 'Events Tracked' : 'Timeline Idle',
      icon: Clock,
      iconColor: 'text-[#4ADE80]',
      iconBg: 'bg-[#22C55E]/10',
      link: '/events'
    },
    {
      title: 'Operational Risks',
      explanation: 'Early warning indicators & dependency bottlenecks',
      statusText: counts.loading ? 'Loading risks...' : `${counts.risks} identified risks`,
      statusBadge: counts.risks > 0 ? 'Radar Active' : 'Nominal',
      icon: AlertTriangle,
      iconColor: 'text-[#FBBF24]',
      iconBg: 'bg-[#F59E0B]/10',
      link: '/risks'
    }
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-white tracking-tight">
            Operational Overview
          </h3>
          <p className="text-xs text-[#94A3B8]">
            Core workflow pillars connected to backend database
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {operationalCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link key={idx} to={card.link} className="block group">
              <Card
                hoverEffect
                className="h-full border-[#263247] group-hover:border-[#374151] transition-all bg-[#151D2E]"
              >
                <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-9 h-9 rounded-lg ${card.iconBg} ${card.iconColor} flex items-center justify-center shrink-0`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-[#64748B] group-hover:text-white transition-colors" />
                    </div>

                    <h4 className="text-sm font-semibold text-white group-hover:text-[#818CF8] transition-colors">
                      {card.title}
                    </h4>
                    <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
                      {card.explanation}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#263247]/60 flex items-center justify-between text-xs">
                    <span className="text-gray-300 font-medium text-[11px] truncate">
                      {card.statusText}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#111827] text-[#94A3B8] text-[10px] font-medium border border-[#263247] shrink-0">
                      {card.statusBadge}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
