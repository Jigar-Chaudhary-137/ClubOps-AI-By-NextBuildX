import React from 'react';
import { ShieldAlert, Plus, Sparkles } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import EmptyState from '../ui/EmptyState';
import RiskCard from './RiskCard';
import RiskRow from './RiskRow';

export default function RiskList({
  risks = [],
  viewMode = 'grid', // 'grid' | 'table'
  onViewRisk,
  onCreateRisk,
  onAnalyzeRisks,
  className = ''
}) {
  if (!risks || risks.length === 0) {
    return (
      <Card className={`border-[#263247] bg-[#151D2E] ${className}`}>
        <CardContent className="p-8 sm:p-14">
          <EmptyState
            icon={<ShieldAlert className="w-8 h-8 text-[#818CF8]" />}
            title="No risks tracked yet"
            description="Start identifying operational risks so your club can prepare before they become problems."
            action={
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Button
                  variant="primary"
                  size="md"
                  onClick={onCreateRisk}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Create First Risk
                </Button>
                <Button
                  variant="ai"
                  size="md"
                  onClick={onAnalyzeRisks}
                  leftIcon={<Sparkles className="w-4 h-4" />}
                >
                  Analyze Risks
                </Button>
              </div>
            }
          />
        </CardContent>
      </Card>
    );
  }

  if (viewMode === 'grid') {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
        {risks.map((risk) => (
          <RiskCard
            key={risk.id}
            risk={risk}
            onView={onViewRisk}
          />
        ))}
      </div>
    );
  }

  return (
    <Card className={`border-[#263247] bg-[#151D2E] overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#263247] bg-[#111827]/70 text-xs font-semibold text-[#94A3B8]">
              <th className="py-3 px-4">Risk</th>
              <th className="py-3 px-4">Severity</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Event</th>
              <th className="py-3 px-4">Probability</th>
              <th className="py-3 px-4">Impact</th>
              <th className="py-3 px-4">Score</th>
              <th className="py-3 px-4">Owner</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Updated</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {risks.map((risk) => (
              <RiskRow
                key={risk.id}
                risk={risk}
                onView={onViewRisk}
              />
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
