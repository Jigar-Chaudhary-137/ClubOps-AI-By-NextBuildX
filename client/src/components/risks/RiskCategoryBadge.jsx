import React from 'react';
import { Tag } from 'lucide-react';
import Badge from '../ui/Badge';

export default function RiskCategoryBadge({
  category = 'General',
  size = 'sm',
  className = ''
}) {
  return (
    <Badge
      variant="neutral"
      size={size}
      icon={<Tag className="w-3 h-3 text-[#818CF8]" />}
      className={className}
    >
      {category}
    </Badge>
  );
}
