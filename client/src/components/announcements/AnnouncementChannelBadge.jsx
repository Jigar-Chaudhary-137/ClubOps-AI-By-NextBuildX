import React from 'react';
import { Bell, Mail, MessageSquare, Smartphone, Send } from 'lucide-react';
import Badge from '../ui/Badge';

const channelConfig = {
  'In-App': {
    label: 'In-App',
    icon: <Bell className="w-3 h-3 text-[#818CF8]" />
  },
  Email: {
    label: 'Email',
    icon: <Mail className="w-3 h-3 text-[#38BDF8]" />
  },
  WhatsApp: {
    label: 'WhatsApp',
    icon: <MessageSquare className="w-3 h-3 text-[#4ADE80]" />
  },
  SMS: {
    label: 'SMS',
    icon: <Smartphone className="w-3 h-3 text-[#FBBF24]" />
  },
  'Push Notification': {
    label: 'Push',
    icon: <Send className="w-3 h-3 text-[#A78BFA]" />
  }
};

export default function AnnouncementChannelBadge({
  channel = 'In-App',
  size = 'sm',
  className = ''
}) {
  const config = channelConfig[channel] || channelConfig['In-App'];

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
