import React from 'react';
import { Users } from 'lucide-react';
import Badge from '../ui/Badge';

export default function AnnouncementAudienceBadge({
  audience = 'Entire Club',
  size = 'sm',
  className = ''
}) {
  return (
    <Badge
      variant="neutral"
      size={size}
      icon={<Users className="w-3 h-3 text-[#818CF8]" />}
      className={className}
    >
      {audience}
    </Badge>
  );
}
