import React from 'react';
import { BellRing, Send, Sparkles, MessageSquare, Mail, Share2, Plus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';

const channels = [
  { name: 'WhatsApp Community', icon: MessageSquare, desc: 'Concise reminders & emergency updates' },
  { name: 'Official Email Broadcast', icon: Mail, desc: 'Formal invites, schedules & agendas' },
  { name: 'Social / Discord Announcement', icon: Share2, desc: 'Public promotional copy & registration links' }
];

export default function AnnouncementsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Announcements & Communications
            </h1>
            <Badge variant="primary">Multi-Channel Hub</Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#94A3B8]">
            AI-assisted copy generation and dispatch for WhatsApp, email, and social channels
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ai"
            size="sm"
            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
            disabled
          >
            AI Copywriter
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            disabled
          >
            New Broadcast
          </Button>
        </div>
      </div>

      {/* Channel Cards Architecture */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {channels.map((chan, idx) => {
          const Icon = chan.icon;
          return (
            <Card key={idx} hoverEffect>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-lg bg-[#6366F1]/10 text-[#818CF8] flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-semibold text-[#F8FAFC]">
                    {chan.name}
                  </h4>
                </div>
                <p className="text-xs text-[#94A3B8] leading-relaxed">
                  {chan.desc}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Broadcast History */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Broadcast History</CardTitle>
            <CardDescription>Past notifications, engagement, and delivery logs</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={<BellRing className="w-7 h-7 text-[#818CF8]" />}
            title="No announcements sent yet"
            description="Draft and dispatch your first event announcement or use AI to format custom WhatsApp broadcasts with correct emoji highlights."
          />
        </CardContent>
      </Card>
    </div>
  );
}
