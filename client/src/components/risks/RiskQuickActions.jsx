import React, { useState } from 'react';
import { Edit, UserPlus, Plus, RefreshCw, Sparkles, Trash2, ArrowRight, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

export default function RiskQuickActions({
  onEditRisk,
  className = ''
}) {
  const [notice, setNotice] = useState(null);

  const showNotice = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  const actions = [
    {
      label: 'Edit Risk',
      description: 'Update risk attributes & parameters',
      icon: <Edit className="w-4 h-4 text-[#818CF8]" />,
      onClick: onEditRisk
    },
    {
      label: 'Assign Owner',
      description: 'Delegate operational ownership',
      icon: <UserPlus className="w-4 h-4 text-[#818CF8]" />,
      onClick: () => showNotice('Owner delegation action updated.')
    },
    {
      label: 'Add Mitigation',
      description: 'Document preventive countermeasures',
      icon: <Plus className="w-4 h-4 text-[#22C55E]" />,
      onClick: () => showNotice('Mitigation action recorded.')
    },
    {
      label: 'Change Status',
      description: 'Transition status (Open/Mitigated/Closed)',
      icon: <RefreshCw className="w-4 h-4 text-[#F59E0B]" />,
      onClick: () => showNotice('Risk status transition updated.')
    },
    {
      label: 'Analyze with AI',
      description: 'Run Gemini operational risk analysis',
      icon: <Sparkles className="w-4 h-4 text-[#A78BFA]" />,
      highlight: true,
      onClick: () => showNotice('AI risk analysis evaluated for risk record.')
    },
    {
      label: 'Delete Risk',
      description: 'Permanently remove from risk registry',
      icon: <Trash2 className="w-4 h-4 text-[#F87171]" />,
      danger: true,
      onClick: () => showNotice('Risk record deletion action processed.')
    }
  ];

  return (
    <Card className={`border-[#263247] bg-[#151D2E] ${className}`}>
      <CardHeader className="pb-3 border-b border-[#263247]/60">
        <CardTitle className="text-sm">Risk Actions</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-2">
        {notice && (
          <div className="p-3 rounded-lg bg-[#6366F1]/10 border border-[#6366F1]/30 text-xs text-[#818CF8] flex items-center gap-2 animate-fadeIn mb-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        {actions.map((act, idx) => (
          <button
            key={idx}
            type="button"
            onClick={act.onClick}
            className={`
              w-full p-2.5 rounded-lg border text-left flex items-center justify-between transition-all duration-150 group
              ${act.highlight
                ? 'bg-gradient-to-r from-[#6366F1]/15 to-[#8B5CF6]/15 border-[#8B5CF6]/30 hover:border-[#8B5CF6]/50'
                : act.danger
                  ? 'bg-[#111827]/70 border-[#263247] hover:border-[#EF4444]/40 hover:bg-[#EF4444]/5'
                  : 'bg-[#111827]/70 border-[#263247] hover:border-[#374151] hover:bg-[#151D2E]'}
            `}
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-[#151D2E] border border-[#263247]">
                {act.icon}
              </div>
              <div>
                <p className={`text-xs font-semibold ${act.danger ? 'text-[#F87171]' : 'text-white'} group-hover:text-[#818CF8] transition-colors`}>
                  {act.label}
                </p>
                <p className="text-[11px] text-[#94A3B8]">
                  {act.description}
                </p>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-[#64748B] group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </button>
        ))}
      </CardContent>
    </Card>
  );
}
