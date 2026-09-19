import React from 'react';
import { History, Sparkles, MessageSquare, Database, Terminal, CheckCircle2, Play } from 'lucide-react';

export default function AIActivityTimeline({
  activities = [],
  className = '',
}) {
  if (!activities || activities.length === 0) {
    return (
      <div className={`p-6 rounded-2xl bg-[#111827] border border-[#263247] shadow-sm text-center ${className}`}>
        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 mx-auto mb-2">
          <History className="w-5 h-5" />
        </div>
        <h4 className="text-xs font-semibold text-gray-300">No AI activity yet</h4>
        <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
          Questions, semantic retrievals, insight discoveries, and executed tool mutations will be logged in this audit trail.
        </p>
      </div>
    );
  }

  const getEventIcon = (type) => {
    switch (type) {
      case 'question_asked':
        return <MessageSquare className="w-3.5 h-3.5 text-sky-400" />;
      case 'knowledge_retrieved':
        return <Database className="w-3.5 h-3.5 text-purple-400" />;
      case 'insight_generated':
        return <Sparkles className="w-3.5 h-3.5 text-indigo-400" />;
      case 'action_suggested':
        return <Terminal className="w-3.5 h-3.5 text-amber-400" />;
      case 'action_confirmed':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      case 'action_executed':
        return <Play className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <History className="w-3.5 h-3.5 text-gray-400" />;
    }
  };

  return (
    <div className={`p-5 rounded-2xl bg-[#111827] border border-[#263247] shadow-sm space-y-3 ${className}`}>
      <div className="flex items-center justify-between pb-2 border-b border-[#263247]">
        <div className="flex items-center space-x-2">
          <History className="w-4 h-4 text-gray-400" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-300">
            AI Operations Log
          </h4>
        </div>
        <span className="text-[10px] text-gray-500 font-mono">Audit Trail</span>
      </div>

      <div className="space-y-3">
        {activities.map((act, index) => (
          <div key={act.id || index} className="flex items-start space-x-2.5 text-xs">
            <div className="mt-0.5 p-1 rounded-full bg-[#151D2E] border border-[#263247]">
              {getEventIcon(act.type)}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-gray-200 font-medium block truncate">{act.title}</span>
              {act.detail && <span className="text-[11px] text-gray-400 block">{act.detail}</span>}
              <span className="text-[10px] text-gray-500 font-mono block mt-0.5">
                {act.timestamp ? new Date(act.timestamp).toLocaleTimeString() : 'Just now'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
