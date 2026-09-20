import React from 'react';
import Badge from '../ui/Badge';

const statusConfig = {
  Planning: { variant: 'neutral', label: 'Planning' },
  Upcoming: { variant: 'primary', label: 'Upcoming' },
  Ongoing: { variant: 'warning', label: 'Ongoing' },
  Completed: { variant: 'success', label: 'Completed' },
  planning: { variant: 'neutral', label: 'Planning' },
  ready: { variant: 'primary', label: 'Upcoming' },
  active: { variant: 'warning', label: 'Active' },
  completed: { variant: 'success', label: 'Completed' },
  draft: { variant: 'neutral', label: 'Draft' },
  cancelled: { variant: 'danger', label: 'Cancelled' }
};

export default function EventStatusBadge({
  status = 'Planning',
  size = 'md',
  className = ''
}) {
  const config = statusConfig[status] || {
    variant: 'neutral',
    label: status || 'Planning'
  };

  return (
    <Badge
      variant={config.variant}
      size={size}
      dot
      className={className}
    >
      {config.label}
    </Badge>
  );
}
