import React from 'react';
import { History, Activity } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import EmptyState from '../ui/EmptyState';

export default function RiskTimeline({
  timeline = [],
  className = ''
}) {
  return (
    <Card className={`border-[#263247] bg-[#151D2E] ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-[#263247]/60">
        <div>
          <CardTitle className="text-sm">Risk Activity Timeline</CardTitle>
          <CardDescription>
            Lifecycle events, severity adjustments, and mitigation logs.
          </CardDescription>
        </div>
        <History className="w-4 h-4 text-[#94A3B8]" />
      </CardHeader>

      <CardContent className="p-4">
        {timeline.length === 0 ? (
          <div className="py-6">
            <EmptyState
              icon={<Activity className="w-7 h-7 text-[#818CF8]" />}
              title="No activity yet"
              description="Status transitions, severity changes, and owner updates will be recorded here."
            />
          </div>
        ) : (
          <div className="space-y-3">
            {timeline.map((event, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs">
                <div className="w-2 h-2 rounded-full bg-[#6366F1] mt-1.5 shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-white">{event.title}</p>
                  <p className="text-[#94A3B8]">{event.description}</p>
                  <p className="text-[11px] text-[#64748B] font-mono mt-0.5">{event.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
