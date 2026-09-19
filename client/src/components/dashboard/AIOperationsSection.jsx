import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Calendar, Video, ShieldAlert, BookOpen, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import { AIBadge, AIIcon } from '../ai';

const aiCapabilities = [
  {
    title: 'AI Event Planner',
    description: 'Generate an event plan based on your goals, timeline and requirements.',
    icon: Calendar,
    route: '/events',
    actionLabel: 'Open Planner',
    tag: 'Planning'
  },
  {
    title: 'Meeting Intelligence',
    description: 'Turn meeting notes into action items, owners and deadlines.',
    icon: Video,
    route: '/meetings',
    actionLabel: 'Process Notes',
    tag: 'Extraction'
  },
  {
    title: 'Risk Intelligence',
    description: 'Identify potential operational risks and understand why they matter.',
    icon: ShieldAlert,
    route: '/risks',
    actionLabel: 'Scan Risks',
    tag: 'Early Warning'
  },
  {
    title: 'Club Knowledge',
    description: 'Ask questions using your club\'s documents and event knowledge.',
    icon: BookOpen,
    route: '/documents',
    actionLabel: 'Query Knowledge',
    tag: 'RAG Retrieval'
  }
];

export default function AIOperationsSection() {
  return (
    <div className="space-y-4 rounded-2xl bg-gradient-to-b from-[#171A2E]/80 via-[#151D2E]/60 to-[#111827]/40 border border-[#8B5CF6]/30 p-5 sm:p-6 shadow-xl relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#8B5CF6]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <AIIcon size="sm" />
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              AI Operations
            </h3>
            <AIBadge size="sm">Core Differentiator</AIBadge>
          </div>
          <p className="text-xs sm:text-sm text-[#94A3B8]">
            Let ClubOps understand your event and help you operate it.
          </p>
        </div>

        <Link to="/ai">
          <Button
            variant="ai"
            size="sm"
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Launch AI Operations Agent
          </Button>
        </Link>
      </div>

      {/* 2x2 AI Capability Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10 pt-1">
        {aiCapabilities.map((cap, idx) => {
          const Icon = cap.icon;
          return (
            <div
              key={idx}
              className="rounded-xl bg-[#111827]/90 border border-[#263247] hover:border-[#8B5CF6]/50 transition-all duration-200 p-4 sm:p-5 flex flex-col justify-between group shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6366F1]/20 to-[#8B5CF6]/20 border border-[#8B5CF6]/30 text-[#A78BFA] flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-[#8B5CF6]/15 text-[#C4B5FD] border border-[#8B5CF6]/30">
                    {cap.tag}
                  </span>
                </div>

                <h4 className="text-sm font-semibold text-white group-hover:text-[#A78BFA] transition-colors">
                  {cap.title}
                </h4>
                <p className="text-xs text-[#94A3B8] mt-1.5 leading-relaxed">
                  {cap.description}
                </p>
              </div>

              <div className="pt-4 mt-2 border-t border-[#263247]/60 flex items-center justify-between">
                <span className="text-[11px] text-[#64748B]">
                  Deeply integrated module
                </span>
                <Link to={cap.route}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-[#C4B5FD] hover:text-white"
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    {cap.actionLabel}
                  </Button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
