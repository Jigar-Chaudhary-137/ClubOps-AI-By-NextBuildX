import React from 'react';
import Badge from '../ui/Badge';

const statusConfig = {
  'To Do': {
    variant: 'neutral',
    label: 'To Do'
  },
  'In Progress': {
    variant: 'primary',
    label: 'In Progress'
  },
  'Completed': {
    variant: 'success',
    label: 'Completed'
  },
  'Blocked': {
    variant: 'danger',
    label: 'Blocked'
  }
};

export default function TaskStatusBadge({
  status = 'To Do',
  size = 'md',
  className = ''
}) {
  const config = statusConfig[status] || {
    variant: 'neutral',
    label: status || 'To Do'
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
