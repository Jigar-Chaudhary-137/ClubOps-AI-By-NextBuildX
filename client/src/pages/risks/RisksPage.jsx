import React from 'react';
import { AlertTriangle, ShieldAlert, Sparkles, Filter, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { AIInsightCard } from '../../components/ai';

export default function RisksPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Risk Intelligence & Mitigation
            </h1>
            <Badge variant="warning">Early Warning System</Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#94A3B8]">
            Automated detection and explanation of operational bottlenecks, delays, and budget slips
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ai"
            size="sm"
            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
            disabled
          >
            Scan Event Risks
          </Button>
        </div>
      </div>

      {/* Severity Triage Pills */}
      <div className="flex items-center gap-2 border-b border-[#263247] pb-3 overflow-x-auto">
        <button
          type="button"
          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#6366F1]/15 text-[#818CF8] border border-[#6366F1]/30 whitespace-nowrap"
        >
          All Signals (0)
        </button>
        <button
          type="button"
          className="px-3 py-1.5 text-xs font-medium rounded-lg text-[#94A3B8] hover:text-white transition-colors whitespace-nowrap"
        >
          Critical / High (0)
        </button>
        <button
          type="button"
          className="px-3 py-1.5 text-xs font-medium rounded-lg text-[#94A3B8] hover:text-white transition-colors whitespace-nowrap"
        >
          Moderate (0)
        </button>
        <button
          type="button"
          className="px-3 py-1.5 text-xs font-medium rounded-lg text-[#94A3B8] hover:text-white transition-colors whitespace-nowrap"
        >
          Resolved (0)
        </button>
      </div>

      {/* Intelligence Explanation Preview */}
      <AIInsightCard
        title="Risk Detection Reasoning Engine"
        subtitle="Automatic Analysis Preview"
        badgeText="Intelligence Model"
      >
        The risk intelligence engine evaluates 4 primary dimensions: Milestone Deadlines vs Current Progress, Unassigned High-Priority Action Items, Resource / Volunteer Over-allocation, and Missing External Clearances.
      </AIInsightCard>

      {/* Risk Queue View */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Identified Risk Registry</CardTitle>
            <CardDescription>Live risk entries with severity levels and mitigation proposals</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={<ShieldAlert className="w-7 h-7 text-[#22C55E]" />}
            title="Zero operational risks detected"
            description="When tasks approach deadlines or volunteer bottlenecks occur, ClubOps AI will flag them here with specific mitigation suggestions."
          />
        </CardContent>
      </Card>
    </div>
  );
}
