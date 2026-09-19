import React from 'react';
import { Gauge } from 'lucide-react';

export default function RiskScoreIndicator({
  score = '—',
  maxScore = 25,
  size = 'md',
  className = ''
}) {
  const isNumeric = typeof score === 'number';

  const getScoreColor = (val) => {
    if (!isNumeric) return 'text-[#94A3B8]';
    if (val >= 15) return 'text-[#F87171]';
    if (val >= 8) return 'text-[#FBBF24]';
    return 'text-[#4ADE80]';
  };

  return (
    <div className={`flex items-center gap-2 p-2 rounded-lg bg-[#111827] border border-[#263247] ${className}`}>
      <div className="p-1.5 rounded-md bg-[#151D2E] text-[#818CF8]">
        <Gauge className="w-4 h-4" />
      </div>
      <div>
        <p className="text-[10px] text-[#94A3B8] uppercase font-semibold tracking-wider">
          Risk Score
        </p>
        <div className="flex items-baseline gap-1">
          <span className={`text-sm font-bold font-mono ${getScoreColor(score)}`}>
            {score}
          </span>
          {isNumeric && (
            <span className="text-[10px] text-[#64748B] font-mono">
              / {maxScore}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
