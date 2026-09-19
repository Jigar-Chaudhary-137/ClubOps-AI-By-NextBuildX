import React from 'react';
import {
  Wrench,
  Search,
  Users2,
  AlertTriangle,
  CheckSquare,
  Users,
  Megaphone,
  Calendar,
} from 'lucide-react';

const toolCapabilities = [
  {
    name: 'Knowledge Search',
    desc: 'Semantic vector retrieval across uploaded documentation',
    icon: Search,
    status: 'Ready for Integration',
  },
  {
    name: 'Meeting Analysis',
    desc: 'Extract action items, owners, and decisions from notes',
    icon: Users2,
    status: 'Ready for Integration',
  },
  {
    name: 'Risk Analysis',
    desc: 'Evaluate operational vulnerabilities and generate mitigations',
    icon: AlertTriangle,
    status: 'Ready for Integration',
  },
  {
    name: 'Task Management',
    desc: 'Autonomous creation and update of work breakdown tasks',
    icon: CheckSquare,
    status: 'Ready for Integration',
  },
  {
    name: 'Volunteer Management',
    desc: 'Skill-matched volunteer allocation and shift tracking',
    icon: Users,
    status: 'Ready for Integration',
  },
  {
    name: 'Announcement Creation',
    desc: 'Multi-channel copywriting and scheduled dispatch',
    icon: Megaphone,
    status: 'Ready for Integration',
  },
  {
    name: 'Event Planning',
    desc: 'Timeline synthesis and dependency mapping',
    icon: Calendar,
    status: 'Ready for Integration',
  },
];

export default function AIToolStatus({ className = '' }) {
  return (
    <div className={`p-5 rounded-2xl bg-[#111827] border border-[#263247] shadow-sm space-y-3 ${className}`}>
      <div className="flex items-center justify-between pb-2 border-b border-[#263247]">
        <div className="flex items-center space-x-2">
          <Wrench className="w-4 h-4 text-purple-400" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-300">
            AI Tool Capabilities
          </h4>
        </div>
        <span className="text-[10px] text-gray-500 font-mono">Tool Call Ready</span>
      </div>

      <p className="text-xs text-gray-400 leading-relaxed">
        Application mutation tools will be executed via human-in-the-loop confirmation.
      </p>

      <div className="space-y-2 pt-1">
        {toolCapabilities.map((tool, index) => {
          const Icon = tool.icon;
          return (
            <div
              key={index}
              className="p-2.5 rounded-xl bg-[#151D2E]/50 border border-[#263247] flex items-center justify-between gap-2"
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="p-1.5 rounded-lg bg-[#0B1020] border border-[#263247] text-purple-400 shrink-0">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-medium text-gray-200 block truncate">
                    {tool.name}
                  </span>
                  <span className="text-[10px] text-gray-400 block truncate">
                    {tool.desc}
                  </span>
                </div>
              </div>
              <span className="shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 whitespace-nowrap">
                {tool.status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
