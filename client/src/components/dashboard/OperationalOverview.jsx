import React from 'react';
import { Link } from 'react-router-dom';
import { CheckSquare, Users, Clock, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';

const operationalCards = [
  {
    title: 'Tasks Operations',
    explanation: 'Work breakdown, task owners & execution status',
    statusText: 'No pending tasks',
    statusBadge: 'Ready for event',
    icon: CheckSquare,
    iconColor: 'text-[#818CF8]',
    iconBg: 'bg-[#6366F1]/10',
    link: '/tasks'
  },
  {
    title: 'Volunteer Roster',
    explanation: 'Member role assignments & team availability',
    statusText: 'Roster not allocated',
    statusBadge: 'Roster open',
    icon: Users,
    iconColor: 'text-[#A78BFA]',
    iconBg: 'bg-[#8B5CF6]/10',
    link: '/volunteers'
  },
  {
    title: 'Deadlines & Schedule',
    explanation: 'Critical path milestones, rehearsals & target dates',
    statusText: 'No active countdowns',
    statusBadge: 'Timeline idle',
    icon: Clock,
    iconColor: 'text-[#4ADE80]',
    iconBg: 'bg-[#22C55E]/10',
    link: '/events'
  },
  {
    title: 'Operational Risks',
    explanation: 'Early warning indicators & dependency bottlenecks',
    statusText: 'Nominal — all clear',
    statusBadge: '0 flagged risks',
    icon: AlertTriangle,
    iconColor: 'text-[#FBBF24]',
    iconBg: 'bg-[#F59E0B]/10',
    link: '/risks'
  }
];

export default function OperationalOverview() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-white tracking-tight">
            Operational Overview
          </h3>
          <p className="text-xs text-[#94A3B8]">
            Core workflow pillars ready for active event tracking
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

                  {/* Empty / setup state indicators */}
                  <div className="pt-3 border-t border-[#263247]/60 flex items-center justify-between text-xs">
                    <span className="text-[#64748B] text-[11px] truncate">
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
