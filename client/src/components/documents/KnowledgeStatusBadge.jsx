import React from 'react';
import { Sparkles, Loader2, Database, ShieldOff } from 'lucide-react';
import Badge from '../ui/Badge';

const knowledgeConfig = {
  'Not Added': {
    variant: 'neutral',
    label: 'Not in Knowledge',
    icon: <Database className="w-3 h-3 text-[#94A3B8]" />
  },
  'Preparing': {
    variant: 'warning',
    label: 'Preparing for RAG',
    icon: <Loader2 className="w-3 h-3 text-[#FBBF24] animate-spin" />
  },
  'Ready': {
    variant: 'ai',
    label: 'AI-Ready',
    icon: <Sparkles className="w-3 h-3 text-[#A78BFA]" />
  },
  'Unavailable': {
    variant: 'neutral',
    label: 'Knowledge Unavailable',
    icon: <ShieldOff className="w-3 h-3 text-[#64748B]" />
  }
};

export default function KnowledgeStatusBadge({
  status = 'Not Added',
  size = 'md',
  className = ''
}) {
  const config = knowledgeConfig[status] || knowledgeConfig['Not Added'];

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
