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
              title="No AI countermeasures available yet."
              description="Run AI Risk Analysis on your events to generate targeted mitigations and contingency plans."
            />
          </div>
        ) : (
          <div className="space-y-3">
            {suggestions.map((sugg, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-[#111827] border border-[#263247] space-y-1.5 hover:border-[#374151] transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-white">{sugg.title}</span>
                  <Badge variant={sugg.severity === 'critical' || sugg.severity === 'high' ? 'danger' : 'primary'} size="sm">
                    {sugg.type || sugg.severity || 'Mitigation'}
                  </Badge>
                </div>
                <p className="text-xs text-[#94A3B8] leading-relaxed">{sugg.description || sugg.mitigationPlan || sugg.reasoning}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
