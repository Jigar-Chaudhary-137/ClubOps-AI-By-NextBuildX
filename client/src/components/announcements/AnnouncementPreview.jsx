import React from 'react';
import { Eye, Bell, Mail, MessageSquare, Smartphone, Send, Calendar, Users, Radio } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import AnnouncementChannelBadge from './AnnouncementChannelBadge';
import AnnouncementAudienceBadge from './AnnouncementAudienceBadge';

export default function AnnouncementPreview({
  title = '',
  message = '',
  audience = 'Entire Club',
  channel = 'in_app',
  scheduled = '—',
  className = ''
}) {
  const hasContent = Boolean(title.trim() || message.trim());
  const audienceLabel = Array.isArray(audience) ? audience.join(', ') : (audience || 'Entire Club');
  const channelLabel = Array.isArray(channel) ? channel.join(', ') : (channel || 'In-App');

  return (
    <Card className={`border-[#263247] bg-[#151D2E] ${className}`}>
      <CardHeader className="pb-3 border-b border-[#263247]/60 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-[#818CF8]" />
          <CardTitle className="text-sm">Announcement Preview</CardTitle>
        </div>
        <span className="text-[11px] font-mono text-[#94A3B8]">
          Live View
        </span>
      </CardHeader>

      <CardContent className="p-5 space-y-4">
        {!hasContent ? (
          <div className="py-12 border-2 border-dashed border-[#263247] rounded-xl bg-[#111827]/40 flex flex-col items-center justify-center text-center p-6">
            <Radio className="w-7 h-7 text-[#64748B] mb-2" />
            <p className="text-sm font-semibold text-white">
              Your announcement preview will appear here.
            </p>
            <p className="text-xs text-[#94A3B8] mt-1">
              Start typing a title and message to preview formatting across delivery channels.
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-[#111827] border border-[#263247] space-y-3 shadow-md">
            {/* Header info */}
            <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-[#263247]/60">
              <div className="flex items-center gap-2 flex-wrap">
                <AnnouncementChannelBadge channel={channel} size="sm" />
                <AnnouncementAudienceBadge audience={audience} size="sm" />
              </div>
              <span className="text-[11px] font-mono text-[#64748B]">
                {scheduled !== '—' ? `Scheduled: ${scheduled}` : 'Draft'}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-base font-bold text-white tracking-tight">
              {title || 'Untitled Announcement'}
            </h3>

            {/* Message Body */}
            <div className="text-xs text-[#F8FAFC] leading-relaxed whitespace-pre-wrap font-sans bg-[#151D2E]/60 p-3.5 rounded-lg border border-[#263247]">
              {message || 'No message content provided.'}
            </div>

            {/* Metadata Footer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px] text-[#94A3B8]">
              <div>
                <span className="text-[#64748B]">Target Audiences:</span> <strong className="text-white ml-1">{audienceLabel}</strong>
              </div>
              <div>
                <span className="text-[#64748B]">Channels:</span> <strong className="text-white ml-1">{channelLabel}</strong>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

