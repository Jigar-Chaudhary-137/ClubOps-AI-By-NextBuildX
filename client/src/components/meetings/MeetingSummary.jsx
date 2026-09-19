import React from 'react';
import { Sparkles, FileText, CheckCircle, MessageSquare } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import EmptyState from '../ui/EmptyState';

export default function MeetingSummary({
  summary = null,
  keyDecisions = [],
  discussionPoints = [],
  className = ''
}) {
  const hasContent = Boolean(summary || (keyDecisions && keyDecisions.length > 0) || (discussionPoints && discussionPoints.length > 0));

  return (
    <Card className={`border-[#263247] bg-[#151D2E] ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle>AI Meeting Summary</CardTitle>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-gradient-to-r from-[#6366F1]/20 to-[#8B5CF6]/20 text-[#A78BFA] border border-[#8B5CF6]/30">
              <Sparkles className="w-2.5 h-2.5" />
              <span>Intelligence</span>
            </span>
          </div>
          <CardDescription>
            High-level synopsis and synthesized highlights extracted from the meeting.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        {!hasContent ? (
          <div className="py-6 sm:py-8">
            <EmptyState
              icon={<Sparkles className="w-7 h-7 text-[#8B5CF6]" />}
              title="AI-generated meeting summary will appear here after analysis."
              description="Upload notes or a transcript and click 'Analyze Meeting' to generate an executive overview."
            />
          </div>
        ) : (
          <div className="space-y-5 text-sm">
            {/* Overview text */}
            {summary && (
              <div className="p-4 rounded-xl bg-[#111827] border border-[#263247] text-[#F8FAFC] leading-relaxed">
                <p>{summary}</p>
              </div>
            )}

            {/* Key decisions in summary */}
            {keyDecisions && keyDecisions.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-[#4ADE80]" />
                  <span>Key Decisions</span>
                </h4>
                <ul className="space-y-2">
                  {keyDecisions.map((dec, idx) => (
                    <li key={idx} className="p-3 rounded-lg bg-[#111827]/70 border border-[#263247] text-white text-xs leading-relaxed">
                      {dec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Discussion points */}
            {discussionPoints && discussionPoints.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-[#818CF8]" />
                  <span>Important Discussion Points</span>
                </h4>
                <ul className="space-y-2">
                  {discussionPoints.map((point, idx) => (
                    <li key={idx} className="p-3 rounded-lg bg-[#111827]/70 border border-[#263247] text-[#94A3B8] text-xs leading-relaxed">
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
