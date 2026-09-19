import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Video, Sparkles, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { AIBadge } from '../ai';

export default function TaskQuickActions({ onOpenCreateModal, className = '' }) {
  return (
    <Card className={`border-[#263247] ${className}`}>
      <CardHeader>
        <div>
          <CardTitle>Task Operations Shortcuts</CardTitle>
          <CardDescription>
            Accelerate work breakdown and AI-assisted extraction
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Create Task Action */}
          <button
            type="button"
            onClick={onOpenCreateModal}
            className="text-left p-3.5 rounded-xl border border-[#263247] bg-[#111827] hover:border-[#374151] hover:bg-[#151D2E] transition-all duration-150 flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#6366F1]/10 text-[#818CF8] flex items-center justify-center shrink-0">
                  <Plus className="w-4 h-4" />
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#64748B] group-hover:text-white transition-colors" />
              </div>
              <h5 className="text-xs font-semibold text-white group-hover:text-[#818CF8] transition-colors">
                Create New Task
              </h5>
              <p className="text-[11px] text-[#94A3B8] mt-1 leading-relaxed">
                Manually configure deliverable with assignee and deadline
              </p>
            </div>
            <span className="text-[10px] text-[#64748B] pt-2 mt-2 border-t border-[#263247]/50">
              Open Form Modal
            </span>
          </button>

          {/* Extract from Meeting */}
          <Link
            to="/meetings"
            className="p-3.5 rounded-xl border border-[#263247] bg-[#111827] hover:border-[#374151] hover:bg-[#151D2E] transition-all duration-150 flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#0284C7]/10 text-[#38BDF8] flex items-center justify-center shrink-0">
                  <Video className="w-4 h-4" />
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#64748B] group-hover:text-white transition-colors" />
              </div>
              <h5 className="text-xs font-semibold text-white group-hover:text-[#38BDF8] transition-colors">
                Add from Meeting
              </h5>
              <p className="text-[11px] text-[#94A3B8] mt-1 leading-relaxed">
                Extract tasks, owners, and dates from discussion notes
              </p>
            </div>
            <span className="text-[10px] text-[#64748B] pt-2 mt-2 border-t border-[#263247]/50">
              Meeting Ingestion
            </span>
          </Link>

          {/* Ask AI Agent */}
          <Link
            to="/ai"
            className="p-3.5 rounded-xl border border-[#8B5CF6]/30 bg-[#151D2E] hover:border-[#8B5CF6]/60 transition-all duration-150 flex flex-col justify-between group shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6366F1]/20 to-[#8B5CF6]/20 text-[#C4B5FD] flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <AIBadge size="sm">AI Agent</AIBadge>
              </div>
              <h5 className="text-xs font-semibold text-white group-hover:text-[#A78BFA] transition-colors">
                Ask AI Operations Agent
              </h5>
              <p className="text-[11px] text-[#94A3B8] mt-1 leading-relaxed">
                Prompt agent to auto-generate tasks or break down goals
              </p>
            </div>
            <span className="text-[10px] text-[#64748B] pt-2 mt-2 border-t border-[#263247]/50">
              Interactive Execution
            </span>
          </Link>

          {/* View Task Risks */}
          <Link
            to="/risks"
            className="p-3.5 rounded-xl border border-[#263247] bg-[#111827] hover:border-[#374151] hover:bg-[#151D2E] transition-all duration-150 flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/10 text-[#FBBF24] flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#64748B] group-hover:text-white transition-colors" />
              </div>
              <h5 className="text-xs font-semibold text-white group-hover:text-[#FBBF24] transition-colors">
                View Task Risks
              </h5>
              <p className="text-[11px] text-[#94A3B8] mt-1 leading-relaxed">
                Review overdue tasks, dependency blocks, and bottlenecks
              </p>
            </div>
            <span className="text-[10px] text-[#64748B] pt-2 mt-2 border-t border-[#263247]/50">
              Risk Radar
            </span>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
