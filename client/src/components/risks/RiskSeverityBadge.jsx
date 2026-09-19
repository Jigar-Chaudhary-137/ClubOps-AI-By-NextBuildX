import React from 'react';
import { AlertOctagon, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import Badge from '../ui/Badge';

const severityConfig = {
  Critical: {
    variant: 'danger',
    label: 'Critical',
    icon: <AlertOctagon className="w-3 h-3 text-[#F87171]" />
  },
  High: {
    variant: 'danger',
    label: 'High',
    icon: <AlertTriangle className="w-3 h-3 text-[#F87171]" />
  },
  Medium: {
    variant: 'warning',
    label: 'Medium',
    icon: <AlertCircle className="w-3 h-3 text-[#FBBF24]" />
  },
  Low: {
    variant: 'success',
    label: 'Low',
    icon: <Info className="w-3 h-3 text-[#4ADE80]" />
  }
};

export default function RiskSeverityBadge({
  severity = 'Medium',
  size = 'md',
  className = ''
}) {
  const config = severityConfig[severity] || severityConfig.Medium;

  return (
    <Badge
      variant={config.variant}
      size={size}
      icon={config.icon}
      className={className}
    >
      {config.label}
    </Badge>
  );
}
