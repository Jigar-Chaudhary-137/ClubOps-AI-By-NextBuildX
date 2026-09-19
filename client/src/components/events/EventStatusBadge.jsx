import React from 'react';
import Badge from '../ui/Badge';

const statusConfig = {
  Planning: {
    variant: 'neutral',
    label: 'Planning'
  },
  Upcoming: {
    variant: 'primary',
    label: 'Upcoming'
  },
  Ongoing: {
    variant: 'warning',
    label: 'Ongoing'
  },
  Completed: {
    variant: 'success',
    label: 'Completed'
  }
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
