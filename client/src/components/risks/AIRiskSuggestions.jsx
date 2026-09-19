import React from 'react';
import { Sparkles, Lightbulb, ArrowRight, ShieldCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import EmptyState from '../ui/EmptyState';
import Badge from '../ui/Badge';

export default function AIRiskSuggestions({
  suggestions = [],
  className = ''
}) {
  return (
    <Card className={`border-[#263247] bg-[#151D2E] ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-[#263247]/60">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm">AI Risk Suggestions & Countermeasures</CardTitle>
            <Badge variant="ai" size="sm">Gemini Ready</Badge>
          </div>
          <CardDescription>
            Automated recommendations for early-stage operational challenges.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {suggestions.length === 0 ? (
          <div className="py-6 border-2 border-dashed border-[#263247] rounded-xl bg-[#111827]/40 flex flex-col items-center justify-center text-center p-4">
            <EmptyState
              icon={<Sparkles className="w-7 h-7 text-[#8B5CF6]" />}
              title="AI suggestions will appear here after the Gemini risk analysis service is connected."
              description="Future AI recommendations will suggest contingency options, backup vendors, and buffer days."
            />
          </div>
        ) : (
          <div className="space-y-3">
            {suggestions.map((sugg, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-[#111827] border border-[#263247] space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">{sugg.title}</span>
                  <Badge variant="primary" size="sm">{sugg.type}</Badge>
                </div>
                <p className="text-xs text-[#94A3B8]">{sugg.description}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
