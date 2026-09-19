import React from 'react';
import { Bell, Mail, MessageSquare, Smartphone, Send } from 'lucide-react';

const channels = [
  {
    id: 'In-App',
    name: 'In-App',
    description: 'Show announcements inside ClubOps AI.',
    icon: <Bell className="w-4 h-4 text-[#818CF8]" />
  },
  {
    id: 'Email',
    name: 'Email',
    description: 'Send through the club email service.',
    icon: <Mail className="w-4 h-4 text-[#38BDF8]" />
  },
  {
    id: 'WhatsApp',
    name: 'WhatsApp',
    description: 'Deliver through a connected WhatsApp communication service.',
    icon: <MessageSquare className="w-4 h-4 text-[#4ADE80]" />
  },
  {
    id: 'SMS',
    name: 'SMS',
    description: 'Send through a connected SMS provider.',
    icon: <Smartphone className="w-4 h-4 text-[#FBBF24]" />
  },
  {
    id: 'Push Notification',
    name: 'Push Notification',
    description: 'Notify members through supported push notifications.',
    icon: <Send className="w-4 h-4 text-[#A78BFA]" />
  }
];

export default function AnnouncementChannelSelector({
  selectedChannel = 'In-App',
  onChange,
  className = ''
}) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 ${className}`}>
      {channels.map((chan) => {
        const isSelected = selectedChannel === chan.id;
        return (
          <button
            key={chan.id}
            type="button"
            onClick={() => onChange?.(chan.id)}
            className={`
              p-3 rounded-xl border text-left transition-all flex items-start gap-3
              ${isSelected
                ? 'bg-[#6366F1]/15 border-[#6366F1] shadow-sm'
                : 'bg-[#111827] border-[#263247] hover:border-[#374151] hover:bg-[#151D2E]'}
            `}
          >
            <div className={`p-2 rounded-lg shrink-0 ${isSelected ? 'bg-[#6366F1]/20' : 'bg-[#151D2E]'}`}>
              {chan.icon}
            </div>
            <div className="min-w-0">
              <p className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-[#F8FAFC]'}`}>
                {chan.name}
              </p>
              <p className="text-[11px] text-[#94A3B8] leading-tight mt-0.5">
                {chan.description}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
