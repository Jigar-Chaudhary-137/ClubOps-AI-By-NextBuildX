import React from 'react';
import {
  Sparkles,
  Loader2,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Radio,
} from 'lucide-react';

const statusConfig = {
  ready: {
    label: 'Ready',
    icon: CheckCircle2,
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    description: 'AI model connected and waiting for instructions.',
  },
  thinking: {
    label: 'Thinking',
    icon: Loader2,
    color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20 animate-spin',
    description: 'Retrieving context and formulating reasoning chain.',
  },
  waiting_confirmation: {
    label: 'Waiting for Confirmation',
    icon: ShieldAlert,
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    description: 'Action proposed, awaiting human authorization.',
  },
  executing: {
    label: 'Executing',
    icon: Loader2,
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/20 animate-spin',
    description: 'Running authorized application mutation tool.',
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle2,
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    description: 'Action successfully applied to club workspace.',
  },
  failed: {
    label: 'Failed',
    icon: AlertCircle,
    color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    description: 'Execution encountered an operational error.',
  },
  unavailable: {
    label: 'Unavailable',
    icon: Radio,
    color: 'text-gray-400 bg-gray-500/10 border-gray-500/20',
    description: 'AI execution will be available after the backend AI service is connected.',
  },
};

export default function AIExecutionStatus({
  status = 'unavailable',
  className = '',
}) {
  const current = statusConfig[status] || statusConfig.unavailable;
  const Icon = current.icon;

  return (
    <div className={`p-4 rounded-xl bg-[#111827] border border-[#263247] shadow-sm space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          AI Execution Engine
        </span>
        <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${current.color}`}>
          <Icon className="w-3.5 h-3.5" />
          <span>{current.label}</span>
        </span>
      </div>

      <p className="text-xs text-gray-400 leading-relaxed">
        {current.description}
      </p>
    </div>
  );
}
