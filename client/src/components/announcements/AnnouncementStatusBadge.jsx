import React from 'react';
import { FileEdit, Clock, CheckCircle2, AlertCircle, Archive } from 'lucide-react';
import Badge from '../ui/Badge';

const statusConfig = {
  Draft: {
    variant: 'neutral',
    label: 'Draft',
    icon: <FileEdit className="w-3 h-3 text-[#94A3B8]" />
  },
  Scheduled: {
    variant: 'primary',
    label: 'Scheduled',
    icon: <Clock className="w-3 h-3 text-[#818CF8]" />
  },
  Published: {
    variant: 'success',
    label: 'Published',
    icon: <CheckCircle2 className="w-3 h-3 text-[#4ADE80]" />
  },
  Failed: {
    variant: 'danger',
    label: 'Failed',
    icon: <AlertCircle className="w-3 h-3 text-[#F87171]" />
  },
  Archived: {
    variant: 'neutral',
    label: 'Archived',
    icon: <Archive className="w-3 h-3 text-[#64748B]" />
  }
};

export default function AnnouncementStatusBadge({
  status = 'Draft',
  size = 'md',
  className = ''
}) {
  const config = statusConfig[status] || statusConfig.Draft;

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
