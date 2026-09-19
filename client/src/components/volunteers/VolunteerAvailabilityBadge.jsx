import React from 'react';
import Badge from '../ui/Badge';

const availabilityMap = {
  Available: {
    variant: 'success',
    label: 'Available'
  },
  Busy: {
    variant: 'warning',
    label: 'Busy'
  },
  Unavailable: {
    variant: 'danger',
    label: 'Unavailable'
  }
};

export default function VolunteerAvailabilityBadge({
  availability = 'Available',
  size = 'md',
  className = ''
}) {
  const config = availabilityMap[availability] || {
    variant: 'neutral',
    label: availability || 'Unknown'
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
