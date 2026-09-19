import React, { useState } from 'react';
import { Sparkles, Loader2, CheckCircle2, AlertCircle, RefreshCw, Cpu } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

export default function MeetingIntelligencePanel({
  processingStatus = 'Ready', // 'Ready' | 'Processing' | 'Completed' | 'Failed'
  onAnalyze,
  className = ''
}) {
  const [status, setStatus] = useState(processingStatus);
  const [integrationNotice, setIntegrationNotice] = useState(null);

  const statusStateConfig = {
    Ready: {
      badgeVariant: 'neutral',
      label: 'Ready to analyze',
      icon: <Cpu className="w-3 h-3 text-[#94A3B8]" />
    },
    Processing: {
      badgeVariant: 'ai',
      label: 'Analyzing meeting...',
      icon: <Loader2 className="w-3 h-3 text-[#A78BFA] animate-spin" />
    },
    Completed: {
      badgeVariant: 'success',
      label: 'Analysis complete',
      icon: <CheckCircle2 className="w-3 h-3 text-[#4ADE80]" />
    },
    Failed: {
      badgeVariant: 'danger',
      label: "Analysis couldn't be completed",
      icon: <AlertCircle className="w-3 h-3 text-[#F87171]" />
    }
  };

  const handleAnalyzeClick = () => {
    // Transparent UI notification without fake AI execution
    setIntegrationNotice('AI meeting analysis will be available after the backend AI integration is connected.');
    setTimeout(() => {
      setIntegrationNotice(null);
    }, 4500);
    onAnalyze?.();
  };

  const currentConfig = statusStateConfig[status] || statusStateConfig.Ready;

  return (
    <Card className={`border-[#263247] bg-[#151D2E] shadow-lg relative overflow-hidden ${className}`}>
      {/* Decorative gradient glow at top */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#22C55E]" />

      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CardTitle>Meeting Intelligence</CardTitle>
            <Badge
              variant={currentConfig.badgeVariant}
              size="sm"
              icon={currentConfig.icon}
            >
              {currentConfig.label}
            </Badge>
          </div>
          <CardDescription>
            ClubOps AI can analyze meeting notes and identify decisions, action items, owners, deadlines, and risks.
          </CardDescription>
        </div>

        <Button
          variant="ai"
          size="md"
          leftIcon={<Sparkles className="w-4 h-4" />}
          onClick={handleAnalyzeClick}
          disabled={status === 'Processing'}
        >
          Analyze Meeting
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Notice Banner */}
        {integrationNotice && (
          <div className="p-3.5 rounded-lg bg-[#6366F1]/10 border border-[#6366F1]/30 text-xs text-[#818CF8] flex items-start gap-2.5 animate-fadeIn">
            <Sparkles className="w-4 h-4 text-[#8B5CF6] shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-semibold text-white">Notice:</span>{' '}
              {integrationNotice}
            </div>
          </div>
        )}

        {/* Processing Pipeline Explanation */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3 rounded-lg bg-[#111827] border border-[#263247] space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#6366F1]/20 text-[#818CF8] flex items-center justify-center text-[11px] font-bold">1</span>
              <span className="text-xs font-semibold text-white">Extract Actions</span>
            </div>
            <p className="text-[11px] text-[#94A3B8]">Identifies clear deliverables with assignees and timelines</p>
          </div>

          <div className="p-3 rounded-lg bg-[#111827] border border-[#263247] space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#8B5CF6]/20 text-[#A78BFA] flex items-center justify-center text-[11px] font-bold">2</span>
              <span className="text-xs font-semibold text-white">Pinpoint Decisions</span>
            </div>
            <p className="text-[11px] text-[#94A3B8]">Captures agreements, approvals, and consensus points</p>
          </div>

          <div className="p-3 rounded-lg bg-[#111827] border border-[#263247] space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#F59E0B]/20 text-[#FBBF24] flex items-center justify-center text-[11px] font-bold">3</span>
              <span className="text-xs font-semibold text-white">Highlight Risks</span>
            </div>
            <p className="text-[11px] text-[#94A3B8]">Flags budget, venue, logistical, or timeline bottlenecks</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
