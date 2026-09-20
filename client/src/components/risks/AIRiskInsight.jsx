import React, { useState } from 'react';
import { Sparkles, AlertCircle, ShieldAlert, Cpu } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

export default function AIRiskInsight({
  className = ''
}) {
  const [notice, setNotice] = useState(null);

  const handleAnalyzeClick = () => {
    setNotice('AI risk analysis actively evaluating risk registry metrics.');
    setTimeout(() => setNotice(null), 5000);
  };

  return (
    <Card className={`border-[#263247] bg-[#151D2E] shadow-lg relative overflow-hidden ${className}`}>
      {/* Subtle top glow */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#EF4444]" />

      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CardTitle>AI Risk Intelligence</CardTitle>
            <Badge variant="ai" size="sm">Operational Guardrail</Badge>
          </div>
          <CardDescription>
            Continuous detection of timeline compression, resource bottlenecks, and budget variance.
          </CardDescription>
        </div>

        <Button
          variant="ai"
          size="sm"
          onClick={handleAnalyzeClick}
          leftIcon={<Sparkles className="w-3.5 h-3.5" />}
        >
          Analyze with AI
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        {notice && (
          <div className="p-3.5 rounded-lg bg-[#6366F1]/10 border border-[#6366F1]/30 text-xs text-[#818CF8] flex items-start gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-semibold text-white">AI Analysis:</span> {notice}
            </div>
          </div>
        )}

        <div className="p-4 rounded-xl bg-[#111827] border border-[#263247] space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-white">
            <Cpu className="w-4 h-4 text-[#818CF8]" />
            <span>Automated AI Risk Intelligence</span>
          </div>

          <p className="text-xs text-[#94A3B8]">
            ClubOps AI actively evaluates:
          </p>

          <ul className="space-y-1.5 text-xs text-[#94A3B8] pl-2">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]" />
              <span>Potential operational risks and deadline collisions</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]" />
              <span>Severity indicators and impact forecasting</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]" />
              <span>Affected event areas, venues, and logistics</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]" />
              <span>Recommended proactive mitigation actions</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]" />
              <span>Related tasks, volunteer assignments, or dependencies</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
