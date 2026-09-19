import React from 'react';
import { Link } from 'react-router-dom';
import {
  CheckSquare,
  UserPlus,
  Video,
  Upload,
  BellRing,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { AIBadge } from '../ai';

const quickActions = [
  {
    title: 'Add Task',
    description: 'Create milestone deliverables & assign owners',
    icon: CheckSquare,
    link: '/tasks',
    color: 'text-[#4ADE80]',
    bg: 'bg-[#22C55E]/10'
  },
  {
    title: 'Add Volunteer',
    description: 'Assign club members to operational roles',
    icon: UserPlus,
    link: '/volunteers',
    color: 'text-[#818CF8]',
    bg: 'bg-[#6366F1]/10'
  },
  {
    title: 'Add Meeting',
    description: 'Schedule kickoff or review session',
    icon: Video,
    link: '/meetings',
    color: 'text-[#38BDF8]',
    bg: 'bg-[#0284C7]/10'
  },
  {
    title: 'Upload Document',
    description: 'Attach venue forms, guides or sponsor decks',
    icon: Upload,
    link: '/documents',
    color: 'text-[#FBBF24]',
    bg: 'bg-[#F59E0B]/10'
  },
  {
    title: 'Create Announcement',
    description: 'Dispatch updates to WhatsApp or email',
    icon: BellRing,
    link: '/announcements',
    color: 'text-[#F472B6]',
    bg: 'bg-[#EC4899]/10'
  },
  {
    title: 'Ask AI Agent',
    description: 'Propose automated actions or analyze risks',
    icon: Sparkles,
    link: '/ai',
    isAi: true,
    color: 'text-[#C4B5FD]',
    bg: 'bg-gradient-to-br from-[#6366F1]/20 to-[#8B5CF6]/20'
  }
];

export default function EventQuickActions({ className = '' }) {
  return (
    <Card className={`border-[#263247] ${className}`}>
      <CardHeader>
        <div>
          <CardTitle>Event Quick Actions</CardTitle>
          <CardDescription>
            Initiate actions and workflows linked to this event
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <Link key={idx} to={action.link} className="block group">
                <div
                  className={`
                    h-full p-3.5 rounded-xl border transition-all duration-150 flex flex-col justify-between
                    ${
                      action.isAi
                        ? 'bg-[#151D2E] border-[#8B5CF6]/30 hover:border-[#8B5CF6]/60 shadow-sm'
                        : 'bg-[#111827] border-[#263247] hover:border-[#374151]'
                    }
                  `}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-8 h-8 rounded-lg ${action.bg} ${action.color} flex items-center justify-center shrink-0`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      {action.isAi ? (
                        <AIBadge size="sm">AI</AIBadge>
                      ) : (
                        <ArrowUpRight className="w-3.5 h-3.5 text-[#64748B] group-hover:text-white transition-colors" />
                      )}
                    </div>
                    <h5 className="text-xs font-semibold text-white group-hover:text-[#818CF8] transition-colors truncate">
                      {action.title}
                    </h5>
                    <p className="text-[11px] text-[#94A3B8] mt-1 line-clamp-2 leading-relaxed">
                      {action.description}
                    </p>
                  </div>

                  <div className="pt-2 mt-2 border-t border-[#263247]/50 text-[10px] text-[#64748B] group-hover:text-[#94A3B8]">
                    Open module
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
