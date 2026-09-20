import React from 'react';
import { Users } from 'lucide-react';
import Badge from '../ui/Badge';

export default function AnnouncementAudienceBadge({
  audience = 'Entire Club',
  size = 'sm',
  className = ''
}) {
  if (Array.isArray(audience)) {
    if (audience.length === 0) return null;
    return (
      <div className={`inline-flex items-center gap-1.5 flex-wrap ${className}`}>
        {audience.map((aud, idx) => (
          <Badge
            key={idx}
            variant="neutral"
            size={size}
            icon={<Users className="w-3 h-3 text-[#818CF8]" />}
          >
            {aud}
          </Badge>
        ))}
      </div>
    );
  }

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

