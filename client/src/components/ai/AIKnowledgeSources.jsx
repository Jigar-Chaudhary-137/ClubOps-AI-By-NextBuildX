import React from 'react';
import {
  FileText,
  Users2,
  Calendar,
  CheckSquare,
  AlertTriangle,
  Megaphone,
  Users,
  Database,
  Radio,
} from 'lucide-react';

const knowledgeSources = [
  {
    name: 'Documents & Knowledge Base',
    icon: FileText,
    status: 'Ready for integration',
    detail: 'Documents uploaded: Staged | Documents available to AI: Indexing pending',
  },
  {
    name: 'Meetings & Transcripts',
    icon: Users2,
    status: 'Ready for integration',
    detail: 'Notes, action items, and attendee transcripts',
  },
  {
    name: 'Events & Schedules',
    icon: Calendar,
    status: 'Ready for integration',
    detail: 'Event milestones, venues, and registrations',
  },
  {
    name: 'Tasks & Deliverables',
    icon: CheckSquare,
    status: 'Ready for integration',
    detail: 'Work breakdown structures and assignee tracking',
  },
  {
    name: 'Risks & Mitigations',
    icon: AlertTriangle,
    status: 'Ready for integration',
    detail: 'Identified hazards, probability, and mitigations',
  },
  {
    name: 'Announcements & Comms',
    icon: Megaphone,
    status: 'Ready for integration',
    detail: 'Multi-channel broadcast history and templates',
  },
  {
    name: 'Volunteers & Rosters',
    icon: Users,
    status: 'Ready for integration',
    detail: 'Staff assignments, skills, and department leads',
  },
];

export default function AIKnowledgeSources({ className = '' }) {
  return (
    <div className={`p-5 rounded-2xl bg-[#111827] border border-[#263247] shadow-sm space-y-4 ${className}`}>
      <div className="flex items-center justify-between pb-2 border-b border-[#263247]">
        <div className="flex items-center space-x-2">
          <Database className="w-4 h-4 text-indigo-400" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-300">
            Connected Knowledge Sources
          </h4>
        </div>
        <span className="text-[10px] text-gray-500 font-mono">RAG Index</span>
      </div>

      <p className="text-xs text-gray-400 leading-relaxed">
        ClubOps AI will ground future answers in approved club records once vector indexing is active.
      </p>

      <div className="space-y-2 pt-1">
        {knowledgeSources.map((src, index) => {
          const Icon = src.icon;
          return (
            <div
              key={index}
              className="p-2.5 rounded-xl bg-[#151D2E]/50 border border-[#263247] flex items-start justify-between gap-2"
            >
              <div className="flex items-start space-x-2.5 min-w-0">
                <div className="p-1.5 rounded-lg bg-[#0B1020] border border-[#263247] text-indigo-400 shrink-0 mt-0.5">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-medium text-gray-200 block truncate">
                    {src.name}
                  </span>
                  <span className="text-[10px] text-gray-400 block leading-tight mt-0.5">
                    {src.detail}
                  </span>
                </div>
              </div>
              <span className="shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 whitespace-nowrap">
                {src.status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
