import React, { useState } from 'react';
import { Terminal, ArrowRight, Eye, Play, Info, AlertTriangle } from 'lucide-react';
import AIBadge from './AIBadge';
import Button from '../ui/Button';

export default function AIActionCard({
  action = {
    title: 'Create follow-up task for the event logistics team',
    actionType: 'Create Task',
    targetModule: 'Tasks',
    details: '—',
  },
  onReview,
  className = '',
}) {
  const [notice, setNotice] = useState(null);

  const handleExecute = () => {
    setNotice('AI actions will be enabled after the AI tools and backend services are connected.');
    setTimeout(() => {
      setNotice(null);
    }, 6000);
  };

  return (
    <div
      className={`rounded-2xl bg-[#111827] border border-[#8B5CF6]/30 p-5 shadow-lg relative overflow-hidden transition-all hover:border-[#8B5CF6]/50 ${className}`}
    >
      {notice && (
        <div className="mb-4 p-3 bg-purple-950/50 border border-purple-500/30 rounded-xl flex items-start space-x-2 text-xs text-purple-200 animate-fadeIn">
          <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
          <span>{notice}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-purple-400">
              AI Suggested Action
            </h4>
            <span className="text-xs font-medium text-white">{action.title}</span>
          </div>
        </div>
        <AIBadge size="sm">Action Proposal</AIBadge>
      </div>

      {/* Action parameters breakdown */}
      <div className="p-3 rounded-xl bg-[#151D2E] border border-[#263247] space-y-2 mb-4 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Action Type</span>
          <span className="font-semibold text-white">{action.actionType || 'Create Task'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Target Module</span>
          <span className="text-indigo-400 font-medium">{action.targetModule || 'Tasks'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Parameters / Payload</span>
          <span className="font-mono text-gray-400">{action.details || '—'}</span>
        </div>
      </div>

      {/* Human-in-the-loop controls */}
      <div className="flex items-center justify-between pt-2 border-t border-[#263247]/60 text-xs">
        <span className="text-[11px] text-gray-500">Human confirmation required</span>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onReview && onReview(action)}
            leftIcon={<Eye className="w-3.5 h-3.5" />}
          >
            Review
          </Button>

          <Button
            variant="ai"
            size="sm"
            onClick={handleExecute}
            leftIcon={<Play className="w-3.5 h-3.5" />}
          >
            Execute
          </Button>
        </div>
      </div>
    </div>
  );
}
