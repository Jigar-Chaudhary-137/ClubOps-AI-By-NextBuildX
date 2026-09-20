import React from 'react';
import Badge from '../ui/Badge';

const availabilityMap = {
  available: {
    variant: 'success',
    label: 'Available'
  },
  assigned: {
    variant: 'primary',
    label: 'Assigned'
  },
  busy: {
    variant: 'warning',
    label: 'Busy'
  },
  unavailable: {
    variant: 'danger',
    label: 'Unavailable'
  },
  // Fallbacks for uppercase/capitalized inputs
  Available: {
    variant: 'success',
    label: 'Available'
  },
  Assigned: {
    variant: 'primary',
    label: 'Assigned'
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
  availability = 'available',
  size = 'md',
  className = ''
}) {
  const normKey = (availability || 'available').toString().trim().toLowerCase();
  const config = availabilityMap[normKey] || availabilityMap[availability] || {
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

