import React, { useState } from 'react';
import { ShieldCheck, Plus, CheckSquare, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import EmptyState from '../ui/EmptyState';

export default function RiskMitigationPlan({
  plan = '',
  progress = '—',
  actions = [],
  className = ''
}) {
  const [notice, setNotice] = useState(null);

  const handleAddActionClick = () => {
    setNotice('Add specific mitigation actions to track resolution progress.');
    setTimeout(() => setNotice(null), 3000);
  };

  return (
    <Card className={`border-[#263247] bg-[#151D2E] ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm">Mitigation Plan</CardTitle>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#111827] text-[#94A3B8] border border-[#263247]">
              Progress: <strong className="text-white">{progress}</strong>
            </span>
          </div>
          <CardDescription>
            Countermeasures and action protocols to neutralize risk impact.
          </CardDescription>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={handleAddActionClick}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          Add Mitigation Action
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        {notice && (
          <div className="p-3 rounded-lg bg-[#6366F1]/10 border border-[#6366F1]/30 text-xs text-[#818CF8] flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        {/* Plan statement */}
        <div className="p-4 rounded-xl bg-[#111827] border border-[#263247] space-y-1">
          <h4 className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
            Strategy Overview
          </h4>
          <p className="text-xs text-white leading-relaxed">
            {plan || 'No mitigation plan documented yet.'}
          </p>
        </div>

        {/* Action items list or empty state */}
        <div>
          <h4 className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">
            Mitigation Actions
          </h4>

          {actions.length === 0 ? (
            <div className="py-6 border-2 border-dashed border-[#263247] rounded-xl bg-[#111827]/40 flex flex-col items-center justify-center text-center p-4">
              <EmptyState
                icon={<ShieldCheck className="w-7 h-7 text-[#22C55E]" />}
                title="No mitigation actions available yet."
                description="Break down the mitigation strategy into specific deliverables and assignees."
              />
            </div>
          ) : (
            <div className="space-y-2">
              {actions.map((act, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-[#111827] border border-[#263247] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-[#818CF8]" />
                    <span className="text-white font-medium">{act.title}</span>
                  </div>
                  <span className="text-[#94A3B8]">{act.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
