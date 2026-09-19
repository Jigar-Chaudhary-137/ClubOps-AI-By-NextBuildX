import React from 'react';
import { Sparkles, Calendar, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import EmptyState from '../ui/EmptyState';
import { AIBadge, AIIcon } from '../ai';

const futureInsightCategories = [
  'Deadlines Approaching',
  'Overdue Tasks',
  'Volunteer Workload',
  'Meeting Action Items',
  'Potential Risks',
  'Event Velocity'
];

export default function ActivityInsightsGrid() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 5. AI Insights Section */}
      <Card className="flex flex-col justify-between border-[#263247]">
        <CardHeader>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <CardTitle>AI Operational Insights</CardTitle>
              <AIBadge size="sm">Signal Stream</AIBadge>
            </div>
            <CardDescription>
              Proactive flags and observations generated across event operations
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col justify-between space-y-4">
          <EmptyState
            icon={<Sparkles className="w-7 h-7 text-[#A78BFA]" />}
            title="No insights generated yet"
            description="AI-generated operational insights will appear here once your event has activity. The model flags dependencies, unassigned tasks, and potential slips in real time."
          />

          {/* Supported future insight categories */}
          <div className="pt-3 border-t border-[#263247]/60">
            <span className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider block mb-2">
              Supported Detection Categories:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {futureInsightCategories.map((cat, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-[#111827] text-[#94A3B8] text-[11px] border border-[#263247]"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 6. Upcoming / Timeline Area */}
      <Card className="flex flex-col justify-between border-[#263247]">
        <CardHeader>
          <div>
            <CardTitle>Upcoming Operational Timeline</CardTitle>
            <CardDescription>
              Scheduled meetings, deadlines, milestones, and announcements
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col justify-between space-y-4">
          <EmptyState
            icon={<Clock className="w-7 h-7 text-[#818CF8]" />}
            title="No upcoming activity yet"
            description="Your event timeline will appear here once you create an event. Upcoming meetings, critical task deadlines, and broadcast schedules will be organized chronologically."
          />

          {/* Timeline architectural slots preview */}
          <div className="pt-3 border-t border-[#263247]/60">
            <span className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider block mb-2">
              Timeline Channels:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="p-2 rounded-lg bg-[#111827] border border-[#263247] text-[11px] text-[#94A3B8]">
                Meetings
              </div>
              <div className="p-2 rounded-lg bg-[#111827] border border-[#263247] text-[11px] text-[#94A3B8]">
                Deadlines
              </div>
              <div className="p-2 rounded-lg bg-[#111827] border border-[#263247] text-[11px] text-[#94A3B8]">
                Milestones
              </div>
              <div className="p-2 rounded-lg bg-[#111827] border border-[#263247] text-[11px] text-[#94A3B8]">
                Broadcasts
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
