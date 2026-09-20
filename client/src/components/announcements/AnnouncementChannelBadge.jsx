import React from 'react';
import { Bell, Mail, MessageSquare, Smartphone, Send } from 'lucide-react';
import Badge from '../ui/Badge';

const channelConfig = {
  in_app: {
    label: 'In-App',
    icon: <Bell className="w-3 h-3 text-[#818CF8]" />
  },
  email: {
    label: 'Email',
    icon: <Mail className="w-3 h-3 text-[#38BDF8]" />
  },
  whatsapp: {
    label: 'WhatsApp',
    icon: <MessageSquare className="w-3 h-3 text-[#4ADE80]" />
  },
  sms: {
    label: 'SMS',
    icon: <Smartphone className="w-3 h-3 text-[#FBBF24]" />
  },
  push: {
    label: 'Push',
    icon: <Send className="w-3 h-3 text-[#A78BFA]" />
  }
};

const normalizeKey = (c) =>
  (c || '').toLowerCase().replace(/[-\s]+/g, '_').replace('broadcast', '').replace('alert', '').replace('notification', '').trim();

export default function AnnouncementChannelBadge({
  channel = 'in_app',
  size = 'sm',
  className = ''
}) {
  if (Array.isArray(channel)) {
    if (channel.length === 0) return null;
    return (
      <div className={`inline-flex items-center gap-1.5 flex-wrap ${className}`}>
        {channel.map((ch, idx) => {
          const key = normalizeKey(ch);
          const config = channelConfig[key] || channelConfig.in_app;
          return (
            <Badge
              key={idx}
              variant="neutral"
              size={size}
              icon={config.icon}
            >
              {config.label}
            </Badge>
          );
        })}
      </div>
    );
  }

  const key = normalizeKey(channel);
  const config = channelConfig[key] || channelConfig.in_app;

  return (
    <Badge
      variant="neutral"
      size={size}
      icon={config.icon}
      className={className}
    >
      {config.label}
    </Badge>
  );
}

