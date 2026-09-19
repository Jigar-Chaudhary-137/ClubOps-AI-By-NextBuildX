import React from 'react';
import { ShieldCheck, ShieldAlert, Shield } from 'lucide-react';
import Badge from '../ui/Badge';

const confidenceConfig = {
  High: {
    variant: 'success',
    label: 'High Confidence',
    icon: <ShieldCheck className="w-3 h-3 text-[#4ADE80]" />
  },
  Medium: {
    variant: 'warning',
    label: 'Medium Confidence',
    icon: <ShieldAlert className="w-3 h-3 text-[#FBBF24]" />
  },
  Low: {
    variant: 'neutral',
    label: 'Low Confidence',
    icon: <Shield className="w-3 h-3 text-[#94A3B8]" />
  }
};

export default function AIConfidenceBadge({
  confidence = 'Medium',
  size = 'sm',
  className = ''
}) {
  const config = confidenceConfig[confidence] || confidenceConfig.Medium;

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
