import React from 'react';
import { History, CheckCircle, Clock, Send, AlertCircle } from 'lucide-react';

const AnnouncementActivity = ({ activities = [] }) => {
  if (activities.length === 0) {
    return (
      <div className="bg-[#111827] border border-[#263247] rounded-xl p-6 text-center">
        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 mx-auto mb-2">
          <History className="w-5 h-5" />
        </div>
        <h4 className="text-xs font-semibold text-gray-300">No activity logged yet</h4>
        <p className="text-[11px] text-gray-500 mt-1">
          Delivery timestamps and channel events will appear here once broadcast is initiated.
        </p>
      </div>
    );
  }

  const getIcon = (type) => {
    switch (type) {
      case 'published':
        return <Send className="w-3.5 h-3.5 text-emerald-400" />;
      case 'scheduled':
        return <Clock className="w-3.5 h-3.5 text-purple-400" />;
      case 'failed':
        return <AlertCircle className="w-3.5 h-3.5 text-rose-400" />;
      default:
        return <CheckCircle className="w-3.5 h-3.5 text-indigo-400" />;
    }
  };

  return (
    <div className="bg-[#111827] border border-[#263247] rounded-xl p-5 shadow-sm">
      <div className="flex items-center space-x-2 mb-4 pb-2 border-b border-[#263247]">
        <History className="w-4 h-4 text-indigo-400" />
        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-300">
          Delivery & Audit Activity
        </h4>
      </div>

      <div className="space-y-4">
        {activities.map((act, index) => (
          <div key={act.id || index} className="flex items-start space-x-3 text-xs">
            <div className="mt-0.5 p-1 rounded-full bg-[#151D2E] border border-[#263247]">
              {getIcon(act.type)}
            </div>
            <div className="flex-1">
              <p className="text-gray-200 font-medium">{act.action}</p>
              {act.detail && <p className="text-[11px] text-gray-400">{act.detail}</p>}
              <span className="text-[10px] text-gray-500 block mt-0.5">
                {new Date(act.timestamp || Date.now()).toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnnouncementActivity;
