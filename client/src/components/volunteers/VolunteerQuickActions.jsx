import React from 'react';
import { UserPlus, UserCheck, Sparkles, Activity, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';

export default function VolunteerQuickActions({
  onAddVolunteer,
  onAssignToEvent,
  onAIAssignment,
  onViewWorkload,
  className = ''
}) {
  const actions = [
    {
      title: 'Add Volunteer',
      description: 'Register a new member profile and skillsets',
      icon: UserPlus,
      color: 'text-[#818CF8]',
      badgeColor: 'bg-[#6366F1]/10 border-[#6366F1]/30 text-[#818CF8]',
      action: onAddVolunteer
    },
    {
      title: 'Assign to Event',
      description: 'Allocate responsibilities and roles for events',
      icon: UserCheck,
      color: 'text-[#4ADE80]',
      badgeColor: 'bg-[#22C55E]/10 border-[#22C55E]/30 text-[#4ADE80]',
      action: onAssignToEvent
    },
    {
      title: 'AI Assignment',
      description: 'Match volunteers to event requirements automatically',
      icon: Sparkles,
      color: 'text-[#A78BFA]',
      badgeColor: 'bg-[#8B5CF6]/10 border-[#8B5CF6]/30 text-[#A78BFA]',
      action: onAIAssignment,
      isAi: true
    },
    {
      title: 'View Workload',
      description: 'Analyze task distribution and member bandwidth',
      icon: Activity,
      color: 'text-[#38BDF8]',
      badgeColor: 'bg-[#0EA5E9]/10 border-[#0EA5E9]/30 text-[#38BDF8]',
      action: onViewWorkload
    }
  ];

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
          Volunteer Operations Shortcuts
        </h3>
        <span className="text-[11px] text-[#64748B]">Quick Actions</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <Card
              key={act.title}
              hoverEffect
              onClick={act.action}
              className={`
                cursor-pointer border-[#263247] hover:border-[#374151] bg-[#151D2E]
                transition-all duration-200 group
                ${act.isAi ? 'hover:border-[#8B5CF6]/50' : ''}
              `}
            >
              <CardContent className="p-4 flex flex-col justify-between h-full space-y-3">
                <div className="flex items-start justify-between">
                  <div className={`w-9 h-9 rounded-lg border flex items-center justify-center ${act.badgeColor}`}>
                    <Icon className={`w-4 h-4 ${act.color}`} />
                  </div>
                  {act.isAi && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#8B5CF6]/20 text-[#A78BFA] border border-[#8B5CF6]/30">
                      AI
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-white group-hover:text-[#818CF8] transition-colors flex items-center justify-between">
                    <span>{act.title}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#64748B] group-hover:text-white transition-colors transform group-hover:translate-x-0.5 duration-150" />
                  </h4>
                  <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
                    {act.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
