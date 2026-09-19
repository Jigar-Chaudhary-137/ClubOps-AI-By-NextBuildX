import React from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import EmptyState from '../ui/EmptyState';

const severityColors = {
  High: 'bg-[#EF4444]/15 text-[#F87171] border-[#EF4444]/30',
  Medium: 'bg-[#F59E0B]/15 text-[#FBBF24] border-[#F59E0B]/30',
  Low: 'bg-[#1E293B] text-[#94A3B8] border-[#334155]'
};

export default function MeetingRiskInsights({
  risks = [],
  className = ''
}) {
  return (
    <Card className={`border-[#263247] bg-[#151D2E] ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle>Potential Risks</CardTitle>
            {risks.length > 0 && (
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[#F59E0B]/20 text-[#FBBF24] border border-[#F59E0B]/30">
                {risks.length}
              </span>
            )}
          </div>
          <CardDescription>
            Risks identified from meeting discussions.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        {risks.length === 0 ? (
          <div className="py-6 sm:py-8">
            <EmptyState
              icon={<AlertTriangle className="w-7 h-7 text-[#F59E0B]" />}
              title="No risks identified yet."
              description="Analyze the meeting to identify potential operational risks."
            />
          </div>
        ) : (
          <div className="space-y-3">
            {risks.map((risk, idx) => (
              <div
                key={risk.id || idx}
                className="p-4 rounded-xl bg-[#111827] border border-[#263247] space-y-2 hover:border-[#374151] transition-all"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-[#F59E0B] shrink-0" />
                    <h4 className="text-sm font-semibold text-white">
                      {risk.title}
                    </h4>
                  </div>
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${severityColors[risk.severity] || severityColors.Medium}`}>
                    {risk.severity || 'Medium'} Severity
                  </span>
                </div>

                {risk.explanation && (
                  <p className="text-xs text-[#94A3B8] leading-relaxed pl-6">
                    {risk.explanation}
                  </p>
                )}

                {risk.mitigation && (
                  <div className="mt-2 pl-6 pt-2 border-t border-[#263247]/60">
                    <p className="text-xs text-white">
                      <span className="text-[#818CF8] font-medium">Suggested Mitigation:</span> {risk.mitigation}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
