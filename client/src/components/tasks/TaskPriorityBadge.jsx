import React from 'react';
import Badge from '../ui/Badge';

const priorityConfig = {
  Low: {
    variant: 'neutral',
    label: 'Low Priority'
  },
  Medium: {
    variant: 'primary',
    label: 'Medium Priority'
  },
  High: {
    variant: 'warning',
    label: 'High Priority'
  },
  Urgent: {
    variant: 'danger',
    label: 'Urgent'
  }
};

export default function TaskPriorityBadge({
  priority = 'Medium',
  size = 'md',
  className = ''
}) {
  const config = priorityConfig[priority] || {
    variant: 'neutral',
    label: priority || 'Medium'
  };

  return (
    <Badge
      variant={config.variant}
      size={size}
      className={className}
    >
      {config.label}
    </Badge>
  );
}
