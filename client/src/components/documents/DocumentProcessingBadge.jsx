import React from 'react';
import { Clock, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import Badge from '../ui/Badge';

const statusConfig = {
  'Not Processed': {
    variant: 'neutral',
    label: 'Not Processed',
    icon: <Clock className="w-3 h-3 text-[#94A3B8]" />
  },
  'Processing': {
    variant: 'primary',
    label: 'Processing',
    icon: <Loader2 className="w-3 h-3 text-[#818CF8] animate-spin" />
  },
  'Ready': {
    variant: 'success',
    label: 'Ready',
    icon: <CheckCircle2 className="w-3 h-3 text-[#4ADE80]" />
  },
  'Failed': {
    variant: 'danger',
    label: 'Failed',
    icon: <AlertCircle className="w-3 h-3 text-[#F87171]" />
  }
};

export default function DocumentProcessingBadge({
  status = 'Not Processed',
  size = 'md',
  className = ''
}) {
  const config = statusConfig[status] || statusConfig['Not Processed'];

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
