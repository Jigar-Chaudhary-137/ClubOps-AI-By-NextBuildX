import React from 'react';
import { History, Activity } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import EmptyState from '../ui/EmptyState';

export default function DocumentActivity({
  activities = [],
  className = ''
}) {
  return (
    <Card className={`border-[#263247] bg-[#151D2E] ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm">Document Activity</CardTitle>
          <CardDescription>
            Audit log of ingestion, updates, and indexing events.
          </CardDescription>
        </div>
        <History className="w-4 h-4 text-[#94A3B8]" />
      </CardHeader>

      <CardContent>
        {activities.length === 0 ? (
          <div className="py-6 sm:py-8">
            <EmptyState
              icon={<Activity className="w-7 h-7 text-[#818CF8]" />}
              title="Document activity will appear once connected."
              description="Ingestion, metadata edits, and vector indexing operations will be logged here in the integration phase."
            />
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((act, idx) => (
              <div key={idx} className="flex items-start gap-3 text-xs">
                <div className="w-2 h-2 rounded-full bg-[#6366F1] mt-1.5 shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-white">{act.title}</p>
                  <p className="text-[#94A3B8]">{act.description}</p>
                  <p className="text-[#64748B] text-[11px] font-mono mt-0.5">{act.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
