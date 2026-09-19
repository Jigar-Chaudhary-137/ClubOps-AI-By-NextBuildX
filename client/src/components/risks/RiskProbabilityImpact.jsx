import React from 'react';

const levelColors = {
  High: 'text-[#F87171] border-[#EF4444]/30 bg-[#EF4444]/10',
  Medium: 'text-[#FBBF24] border-[#F59E0B]/30 bg-[#F59E0B]/10',
  Low: 'text-[#4ADE80] border-[#22C55E]/30 bg-[#22C55E]/10',
  '—': 'text-[#94A3B8] border-[#263247] bg-[#111827]'
};

export default function RiskProbabilityImpact({
  probability = '—',
  impact = '—',
  className = ''
}) {
  const probStyle = levelColors[probability] || levelColors['—'];
  const impactStyle = levelColors[impact] || levelColors['—'];

  return (
    <div className={`grid grid-cols-2 gap-2 text-center text-xs ${className}`}>
      <div className={`p-2 rounded-lg border ${probStyle}`}>
        <p className="text-[11px] text-[#94A3B8] font-medium">Probability</p>
        <p className="font-semibold mt-0.5">{probability}</p>
      </div>
      <div className={`p-2 rounded-lg border ${impactStyle}`}>
        <p className="text-[11px] text-[#94A3B8] font-medium">Impact</p>
        <p className="font-semibold mt-0.5">{impact}</p>
      </div>
    </div>
  );
}
