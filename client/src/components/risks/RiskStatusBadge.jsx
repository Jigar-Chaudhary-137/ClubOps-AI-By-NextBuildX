import React from 'react';
import { CircleDot, Eye, CheckCircle2, CheckSquare, Shield } from 'lucide-react';
import Badge from '../ui/Badge';

const statusConfig = {
  Open: {
    variant: 'primary',
    label: 'Open',
    icon: <CircleDot className="w-3 h-3 text-[#818CF8]" />
  },
  Monitoring: {
    variant: 'warning',
    label: 'Monitoring',
    icon: <Eye className="w-3 h-3 text-[#FBBF24]" />
  },
  Mitigated: {
    variant: 'success',
    label: 'Mitigated',
    icon: <CheckCircle2 className="w-3 h-3 text-[#4ADE80]" />
  },
  Accepted: {
    variant: 'neutral',
    label: 'Accepted',
    icon: <CheckSquare className="w-3 h-3 text-[#94A3B8]" />
  },
  Closed: {
    variant: 'neutral',
    label: 'Closed',
    icon: <Shield className="w-3 h-3 text-[#64748B]" />
  }
};

export default function RiskStatusBadge({
  status = 'Open',
  size = 'md',
  className = ''
}) {
  const config = statusConfig[status] || statusConfig.Open;

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
