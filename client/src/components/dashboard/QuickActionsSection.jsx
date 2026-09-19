import React from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarPlus,
  CheckSquare,
  UserPlus,
  Video,
  Upload,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent } from '../ui/Card';

const quickActions = [
  {
    title: 'Create Event',
    description: 'Set goals, milestones & target date',
    icon: CalendarPlus,
    link: '/events',
    accentColor: 'text-[#818CF8]',
    bgColor: 'bg-[#6366F1]/10'
  },
  {
    title: 'Add Task',
    description: 'Create deliverables & assign leads',
    icon: CheckSquare,
    link: '/tasks',
    accentColor: 'text-[#4ADE80]',
    bgColor: 'bg-[#22C55E]/10'
  },
  {
    title: 'Add Volunteer',
    description: 'Register club members & roles',
    icon: UserPlus,
    link: '/volunteers',
    accentColor: 'text-[#A78BFA]',
    bgColor: 'bg-[#8B5CF6]/10'
  },
  {
    title: 'Ingest Meeting Notes',
    description: 'Paste transcript & auto-extract items',
    icon: Video,
    link: '/meetings',
    accentColor: 'text-[#38BDF8]',
    bgColor: 'bg-[#0284C7]/10'
  },
  {
    title: 'Upload Club Document',
    description: 'Index guidelines for RAG retrieval',
    icon: Upload,
    link: '/documents',
    accentColor: 'text-[#FBBF24]',
    bgColor: 'bg-[#F59E0B]/10'
  },
  {
    title: 'Ask AI Agent',
    description: 'Execute actions or query status',
    icon: Sparkles,
    link: '/ai',
    accentColor: 'text-[#C4B5FD]',
    bgColor: 'bg-gradient-to-br from-[#6366F1]/20 to-[#8B5CF6]/20'
  }
];

export default function QuickActionsSection() {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-base font-semibold text-white tracking-tight">
          Quick Operational Actions
        </h3>
        <p className="text-xs text-[#94A3B8]">
          Direct shortcuts to initiate workflows across club modules
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {quickActions.map((action, idx) => {
          const Icon = action.icon;
          return (
            <Link key={idx} to={action.link} className="block group">
              <Card
                hoverEffect
                className="h-full border-[#263247] group-hover:border-[#374151] transition-all bg-[#151D2E] p-3.5 flex flex-col justify-between"
              >
                <div>
                  <div className={`w-8 h-8 rounded-lg ${action.bgColor} ${action.accentColor} flex items-center justify-center mb-2.5 shrink-0 group-hover:scale-105 transition-transform`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-semibold text-white group-hover:text-[#818CF8] transition-colors line-clamp-1">
                    {action.title}
                  </h4>
                  <p className="text-[11px] text-[#94A3B8] mt-0.5 line-clamp-2 leading-relaxed">
                    {action.description}
                  </p>
                </div>

                <div className="pt-2 mt-2 border-t border-[#263247]/50 flex items-center justify-between text-[10px] text-[#64748B] group-hover:text-[#94A3B8]">
                  <span>Open module</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
