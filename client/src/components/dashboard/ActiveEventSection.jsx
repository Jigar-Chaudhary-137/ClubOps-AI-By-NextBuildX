import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Plus, Clock, Target, CheckCircle2, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

export default function ActiveEventSection({ activeEvent = null }) {
  // If an active event exists in future stages, render its live metrics
  if (activeEvent) {
    return (
      <Card className="border-[#6366F1]/40 bg-gradient-to-r from-[#151D2E] via-[#131B2C] to-[#151D2E] shadow-xl relative overflow-hidden">
        <div className="p-6">
          {/* Active Event Live View (reserved for future API integration) */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">{activeEvent.title}</h3>
            <Badge variant="primary">{activeEvent.status}</Badge>
          </div>
        </div>
      </Card>
    );
  }

  // Intentional empty / setup state when no event is selected
  return (
    <Card className="border-[#263247] hover:border-[#374151] transition-all bg-gradient-to-br from-[#151D2E] via-[#111827] to-[#151D2E] shadow-lg relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#6366F1]/5 rounded-full blur-3xl pointer-events-none" />

      <CardContent className="p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left info */}
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge variant="neutral" dot>Active Event Workspace</Badge>
              <span className="text-xs text-[#64748B]">•</span>
              <span className="text-xs text-[#94A3B8] font-medium">Ready for Initialization</span>
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                No active event selected
              </h2>
              <p className="text-xs sm:text-sm text-[#94A3B8] mt-1 leading-relaxed">
                Create an event to start managing your club operations, breaking down milestones, assigning volunteers, and enabling proactive AI risk monitoring.
              </p>
            </div>

            {/* Visual preview of operational slots */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-2.5 rounded-lg bg-[#111827]/80 border border-[#263247]">
                <div className="flex items-center gap-1.5 text-[11px] text-[#94A3B8]">
                  <Target className="w-3.5 h-3.5 text-[#818CF8]" />
                  <span>Target Date</span>
                </div>
                <p className="text-xs font-semibold text-white mt-1">—</p>
              </div>

              <div className="p-2.5 rounded-lg bg-[#111827]/80 border border-[#263247]">
                <div className="flex items-center gap-1.5 text-[11px] text-[#94A3B8]">
                  <Clock className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span>Phase</span>
                </div>
                <p className="text-xs font-semibold text-white mt-1">Setup</p>
              </div>

              <div className="p-2.5 rounded-lg bg-[#111827]/80 border border-[#263247]">
                <div className="flex items-center gap-1.5 text-[11px] text-[#94A3B8]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" />
                  <span>Progress</span>
                </div>
                <p className="text-xs font-semibold text-white mt-1">0%</p>
              </div>

              <div className="p-2.5 rounded-lg bg-[#111827]/80 border border-[#263247]">
                <div className="flex items-center gap-1.5 text-[11px] text-[#94A3B8]">
                  <Calendar className="w-3.5 h-3.5 text-[#A78BFA]" />
                  <span>Status</span>
                </div>
                <p className="text-xs font-semibold text-white mt-1">Pending</p>
              </div>
            </div>
          </div>

          {/* Right CTA */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end justify-center gap-2.5 shrink-0">
            <Link to="/events" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="md"
                className="w-full"
                leftIcon={<Plus className="w-4 h-4" />}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Create Event
              </Button>
            </Link>
            <span className="text-[11px] text-[#64748B] text-center lg:text-right">
              Or use the AI Event Planner
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
