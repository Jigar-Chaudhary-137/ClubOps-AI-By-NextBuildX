import React from 'react';
import { Bell, Mail, MessageSquare, Smartphone, Send, Check, AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react';

const channels = [
  {
    id: 'in_app',
    name: 'In-App',
    key: 'in_app',
    description: 'Real-time in-app alerts and live SSE streaming',
    icon: <Bell className="w-4 h-4 text-[#818CF8]" />
  },
  {
    id: 'email',
    name: 'Email Broadcast',
    key: 'email',
    description: 'SendGrid transactional email delivery',
    icon: <Mail className="w-4 h-4 text-[#38BDF8]" />
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    key: 'whatsapp',
    description: 'Twilio WhatsApp messaging & sandbox',
    icon: <MessageSquare className="w-4 h-4 text-[#4ADE80]" />
  },
  {
    id: 'sms',
    name: 'SMS Alert',
    key: 'sms',
    description: 'Twilio carrier SMS dispatch',
    icon: <Smartphone className="w-4 h-4 text-[#FBBF24]" />
  },
  {
    id: 'push',
    name: 'Push Notification',
    key: 'push',
    description: 'Firebase Cloud Messaging (FCM)',
    icon: <Send className="w-4 h-4 text-[#A78BFA]" />
  }
];

export default function AnnouncementChannelSelector({
  selectedChannels = ['in_app'],
  channelConfigStatus = {},
  onChange,
  className = ''
}) {
  // Normalize selected channels array
  const normalizeKey = (c) => (c || '').toLowerCase().replace(/[-\s]+/g, '_').replace('broadcast', '').replace('alert', '').replace('notification', '').trim();

  const currentSelected = Array.isArray(selectedChannels)
    ? selectedChannels.map(normalizeKey)
    : (selectedChannels ? [normalizeKey(selectedChannels)] : ['in_app']);

  const handleToggleChannel = (chanKey) => {
    let next;
    if (currentSelected.includes(chanKey)) {
      next = currentSelected.filter((k) => k !== chanKey);
      if (next.length === 0) {
        next = ['in_app']; // Keep at least in-app selected
      }
    } else {
      next = [...currentSelected, chanKey];
    }
    onChange?.(next);
  };

  const renderStatusBadge = (chanKey) => {
    const rawStatus = channelConfigStatus[chanKey];
    const status = typeof rawStatus === 'string' ? rawStatus.toUpperCase() : (rawStatus?.status || (chanKey === 'in_app' ? 'CONNECTED' : 'NOT_CONFIGURED'));

    if (status === 'CONNECTED' || status === 'AVAILABLE') {
      return (
        <span className="inline-flex items-center gap-1 text-emerald-400 font-medium text-[10px]">
          <CheckCircle2 className="w-3 h-3" /> ✓ Connected
        </span>
      );
    }
    if (status === 'CONFIGURATION_ERROR' || status === 'ERROR') {
      return (
        <span className="inline-flex items-center gap-1 text-rose-400 font-medium text-[10px]">
          <AlertTriangle className="w-3 h-3" /> ⚠ Configuration Error
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-amber-400 font-medium text-[10px]">
        <AlertCircle className="w-3 h-3" /> ⚠ Not Configured
      </span>
    );
  };

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 ${className}`}>
      {channels.map((chan) => {
        const isSelected = currentSelected.includes(chan.key);

        return (
          <button
            key={chan.id}
            type="button"
            onClick={() => handleToggleChannel(chan.key)}
            className={`
              p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-3 relative
              ${isSelected
                ? 'bg-[#6366F1]/15 border-[#6366F1] shadow-sm'
                : 'bg-[#111827] border-[#263247] hover:border-[#374151] hover:bg-[#151D2E]'}
            `}
          >
            <div className="flex items-start gap-3 w-full">
              {/* Checkbox indicator */}
              <div
                className={`w-4 h-4 rounded border mt-0.5 flex items-center justify-center transition-colors shrink-0 ${
                  isSelected
                    ? 'bg-[#6366F1] border-[#6366F1] text-white'
                    : 'border-[#475569] bg-[#1E293B]'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
              </div>

              {/* Icon */}
              <div className={`p-1.5 rounded-lg shrink-0 ${isSelected ? 'bg-[#6366F1]/20' : 'bg-[#151D2E]'}`}>
                {chan.icon}
              </div>

              {/* Title & Description */}
              <div className="min-w-0 flex-1">
                <p className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-[#F8FAFC]'}`}>
                  {chan.name}
                </p>
                <p className="text-[11px] text-[#94A3B8] leading-tight mt-0.5">
                  {chan.description}
                </p>
              </div>
            </div>

            {/* Provider Configuration Status Pill */}
            <div className="flex items-center justify-between w-full pt-1 border-t border-[#263247]/50 text-[10px]">
              <span className="text-[#64748B]">Provider Health:</span>
              {renderStatusBadge(chan.key)}
            </div>
          </button>
        );
      })}
    </div>
  );
}
