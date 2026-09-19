import React from 'react';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import EmptyState from '../ui/EmptyState';

export default function MeetingDecisions({
  decisions = [],
  className = ''
}) {
  return (
    <Card className={`border-[#263247] bg-[#151D2E] ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle>Key Decisions</CardTitle>
            {decisions.length > 0 && (
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[#22C55E]/20 text-[#4ADE80] border border-[#22C55E]/30">
                {decisions.length}
              </span>
            )}
          </div>
          <CardDescription>
            Definitive choices and consensus reached during the meeting.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        {decisions.length === 0 ? (
          <div className="py-6 sm:py-8">
            <EmptyState
              icon={<CheckCircle2 className="w-7 h-7 text-[#4ADE80]" />}
              title="No decisions extracted yet."
              description="AI-identified decisions will appear here after meeting analysis."
            />
          </div>
        ) : (
          <div className="space-y-3">
            {decisions.map((decision, idx) => (
              <div
                key={decision.id || idx}
                className="p-3.5 rounded-lg bg-[#111827] border border-[#263247] flex items-start gap-3"
              >
                <div className="w-6 h-6 rounded-full bg-[#22C55E]/15 text-[#4ADE80] flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-white">
                    {decision.title || decision}
                  </h4>
                  {decision.context && (
                    <p className="text-xs text-[#94A3B8] leading-relaxed">
                      {decision.context}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
