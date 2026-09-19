import React, { useState } from 'react';
import { Zap, AlertTriangle, Users, Calendar, Copy, Info } from 'lucide-react';

const AnnouncementQuickActions = ({ onTriggerAction }) => {
  const [notice, setNotice] = useState(null);

  const actions = [
    {
      id: 'emergency',
      label: 'Urgent Alert Broadcast',
      icon: AlertTriangle,
      color: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
      description: 'Send high-priority notification to active event participants & coordinators',
    },
    {
      id: 'volunteer_brief',
      label: 'Volunteer Briefing Blast',
      icon: Users,
      color: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20',
      description: 'Direct task assignments & schedule reminders to confirmed volunteers',
    },
    {
      id: 'event_countdown',
      label: '48-Hour Event Reminder',
      icon: Calendar,
      color: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
      description: 'Schedule automated reminders across email & push channels',
    },
  ];

  const handleAction = (act) => {
    setNotice(`Action "${act.label}" will be available once the backend communication services are connected.`);
    if (onTriggerAction) {
      onTriggerAction(act);
    }
    setTimeout(() => {
      setNotice(null);
    }, 5000);
  };

  return (
    <div className="bg-[#111827] border border-[#263247] rounded-xl p-5 shadow-sm">
      <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-[#263247]">
        <Zap className="w-4 h-4 text-amber-400" />
        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-300">
          Quick Communications
        </h4>
      </div>

      {notice && (
        <div className="mb-3 p-2.5 bg-amber-950/40 border border-amber-500/30 rounded-lg flex items-start space-x-2 text-xs text-amber-200">
          <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
          <span>{notice}</span>
        </div>
      )}

      <div className="space-y-2">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.id}
              onClick={() => handleAction(act)}
              className="w-full text-left p-2.5 rounded-lg bg-[#151D2E]/50 hover:bg-[#151D2E] border border-[#263247] hover:border-indigo-500/30 transition-all flex items-start space-x-3 group"
            >
              <div className={`p-1.5 rounded-lg border shrink-0 ${act.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-medium text-gray-200 group-hover:text-white block truncate">
                  {act.label}
                </span>
                <span className="text-[10px] text-gray-400 block line-clamp-1">
                  {act.description}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AnnouncementQuickActions;
