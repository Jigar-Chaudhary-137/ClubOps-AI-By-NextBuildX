import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Send,
  Clock,
  User,
  Tag,
  AlertCircle,
  Copy,
  Archive,
  Edit3,
  CheckCircle2,
  Users,
  Radio,
  ExternalLink,
  Mail,
  MessageSquare,
  Bell,
  Smartphone,
  Info,
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import {
  AnnouncementStatusBadge,
  AnnouncementChannelBadge,
  AnnouncementAudienceBadge,
  AnnouncementPreview,
  AnnouncementActivity,
} from '../../components/announcements';

// Default mock registry for deep-linked announcements
const mockAnnouncements = {
  'announcement-101': {
    id: 'announcement-101',
    title: 'TechSprint Hackathon 2026 — Venue & Check-In Guide',
    message: 'Welcome hackers! Check-in starts at 9:00 AM at the Student Activity Center Main Hall. Bring your student ID, laptop, and charger. Join the Discord server for mentorship channels and live team formation announcements. Food and refreshments will be provided throughout the weekend.',
    status: 'scheduled',
    channels: ['email', 'in_app'],
    audience: 'event_participants',
    eventId: 'techsprint-2026',
    eventName: 'TechSprint Hackathon 2026',
    scheduledFor: '2026-09-22T09:00:00Z',
    publishedAt: null,
    authorName: 'Alex Chen (Lead Organizer)',
    createdAt: '2026-09-18T10:30:00Z',
    updatedAt: '2026-09-19T08:15:00Z',
  },
  'announcement-102': {
    id: 'announcement-102',
    title: 'Mandatory Volunteer Briefing — Logistics Walkthrough',
    message: 'All confirmed volunteers for TechSprint are required to attend our pre-event logistics walkthrough on Friday at 5:00 PM in Room 304. We will distribute volunteer t-shirts, badge scanners, and emergency contact sheets. Please be punctual!',
    status: 'published',
    channels: ['whatsapp', 'in_app'],
    audience: 'volunteers',
    eventId: 'techsprint-2026',
    eventName: 'TechSprint Hackathon 2026',
    scheduledFor: null,
    publishedAt: '2026-09-17T16:00:00Z',
    authorName: 'Sarah Jenkins (Volunteer Lead)',
    createdAt: '2026-09-17T14:20:00Z',
    updatedAt: '2026-09-17T16:00:00Z',
  },
  'announcement-103': {
    id: 'announcement-103',
    title: 'Spring Core Committee Applications Now Open',
    message: 'Looking to build leadership skills and manage high-impact collegiate events? Applications are officially open for the Spring 2027 Core Committee across Logistics, Marketing, Technical, and Sponsorship tracks. Apply online before October 5.',
    status: 'draft',
    channels: ['in_app', 'push'],
    audience: 'entire_club',
    eventId: null,
    eventName: null,
    scheduledFor: null,
    publishedAt: null,
    authorName: 'Marcus Vance (President)',
    createdAt: '2026-09-19T06:45:00Z',
    updatedAt: '2026-09-19T06:45:00Z',
  },
};

export default function AnnouncementDetailsPage() {
  const { announcementId } = useParams();
  const navigate = useNavigate();
  const [notice, setNotice] = useState(null);

  // Retrieve announcement or create fallback matching requested id
  const announcement = mockAnnouncements[announcementId] || {
    id: announcementId,
    title: `Announcement: ${announcementId}`,
    message: 'Detailed communication message for club members and event participants.',
    status: 'draft',
    channels: ['in_app', 'email'],
    audience: 'entire_club',
    eventId: null,
    eventName: null,
    scheduledFor: null,
    publishedAt: null,
    authorName: 'Club Administrator',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const handleAction = (actionName) => {
    setNotice(`"${actionName}" will be available once backend notification services are connected.`);
    setTimeout(() => setNotice(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#263247]/60">
        <div className="flex items-center space-x-3">
          <Link
            to="/announcements"
            className="p-2 rounded-xl bg-[#151D2E] hover:bg-[#263247] text-gray-400 hover:text-white border border-[#263247] transition-all"
            title="Back to Announcements"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-xs font-mono text-gray-400">{announcement.id}</span>
              <AnnouncementStatusBadge status={announcement.status} />
              <AnnouncementAudienceBadge audience={announcement.audience} />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white line-clamp-1">
              {announcement.title}
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {announcement.status !== 'published' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleAction('Publish Now')}
              leftIcon={<Send className="w-3.5 h-3.5" />}
            >
              Publish Now
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction('Edit Announcement')}
            leftIcon={<Edit3 className="w-3.5 h-3.5" />}
          >
            Edit
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction('Duplicate')}
            leftIcon={<Copy className="w-3.5 h-3.5" />}
          >
            Duplicate
          </Button>
        </div>
      </div>

      {/* Notice Banner */}
      {notice && (
        <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200 flex items-start gap-2.5 animate-fadeIn">
          <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-semibold text-white">Notice:</span> {notice}
          </div>
        </div>
      )}

      {/* Two Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left / Main Section (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Message Content Card */}
          <div className="bg-[#111827] border border-[#263247] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#263247]">
              <h3 className="text-sm font-semibold text-white">Announcement Message</h3>
              <div className="flex items-center space-x-1">
                {announcement.channels.map((ch) => (
                  <AnnouncementChannelBadge key={ch} channel={ch} size="sm" />
                ))}
              </div>
            </div>

            <div className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">
              {announcement.message}
            </div>

            {announcement.eventName && (
              <div className="mt-6 pt-4 border-t border-[#263247] flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs text-gray-400">
                  <Tag className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Linked Event:</span>
                  <span className="text-white font-medium">{announcement.eventName}</span>
                </div>
                <Link
                  to="/events"
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
                >
                  <span>View Event</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>

          {/* Multi-Channel Live Preview */}
          <div className="bg-[#111827] border border-[#263247] rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-white mb-4">
              Multi-Channel Live Preview
            </h3>
            <AnnouncementPreview
              title={announcement.title}
              message={announcement.message}
              channels={announcement.channels}
              audience={announcement.audience}
              eventName={announcement.eventName}
              scheduledFor={announcement.scheduledFor}
            />
          </div>

          {/* Target Audience Breakdown Card */}
          <div className="bg-[#111827] border border-[#263247] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center space-x-2 mb-3">
              <Users className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-semibold text-white">Audience & Reach Breakdown</h3>
            </div>
            <div className="p-4 rounded-xl bg-[#151D2E] border border-[#263247] flex items-start space-x-3">
              <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div className="text-xs text-gray-300 space-y-1">
                <p className="font-medium text-white">
                  Target: {announcement.audience === 'event_participants' ? 'Registered Event Participants' : announcement.audience === 'volunteers' ? 'Confirmed Volunteers' : 'Entire Club Roster'}
                </p>
                <p className="text-gray-400 text-[11px]">
                  Real-time recipient counts and engagement telemetry will be synchronized when member authentication and backend databases are connected.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right / Sidebar Section (1 col) */}
        <div className="space-y-6">
          {/* Metadata Card */}
          <div className="bg-[#111827] border border-[#263247] rounded-xl p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-300 pb-2 border-b border-[#263247]">
              Dispatch Details
            </h4>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Current Status</span>
                <AnnouncementStatusBadge status={announcement.status} />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-400">Author</span>
                <span className="text-gray-200 font-medium">{announcement.authorName}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-400">Scheduled For</span>
                <span className="text-purple-300 font-mono">
                  {announcement.scheduledFor
                    ? new Date(announcement.scheduledFor).toLocaleString()
                    : 'Not scheduled'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-400">Published At</span>
                <span className="text-emerald-300 font-mono">
                  {announcement.publishedAt
                    ? new Date(announcement.publishedAt).toLocaleString()
                    : 'Not published'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-400">Created</span>
                <span className="text-gray-400">
                  {new Date(announcement.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Delivery Statistics Placeholder Card */}
          <div className="bg-[#111827] border border-[#263247] rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#263247]">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                Delivery Analytics
              </h4>
              <span className="text-[10px] text-indigo-400 font-medium">Telemetry</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2.5 rounded-lg bg-[#151D2E] border border-[#263247]">
                <span className="text-xs text-gray-400 block">Sent</span>
                <span className="text-sm font-bold text-white font-mono">—</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#151D2E] border border-[#263247]">
                <span className="text-xs text-gray-400 block">Delivered</span>
                <span className="text-sm font-bold text-white font-mono">—</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#151D2E] border border-[#263247]">
                <span className="text-xs text-gray-400 block">Open Rate</span>
                <span className="text-sm font-bold text-white font-mono">—</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#151D2E] border border-[#263247]">
                <span className="text-xs text-gray-400 block">CTR</span>
                <span className="text-sm font-bold text-white font-mono">—</span>
              </div>
            </div>

            <p className="text-[10px] text-gray-500 text-center leading-relaxed">
              Real-time delivery statistics will update once dispatch gateways (SendGrid, WhatsApp Cloud, Twilio) are connected.
            </p>
          </div>

          {/* Audit & Timeline Activity */}
          <AnnouncementActivity
            activities={[
              {
                id: 'act-1',
                action: 'Announcement Drafted',
                detail: `Created by ${announcement.authorName}`,
                type: 'draft',
                timestamp: announcement.createdAt,
              },
              ...(announcement.scheduledFor
                ? [
                    {
                      id: 'act-2',
                      action: 'Broadcast Scheduled',
                      detail: `Targeted for ${new Date(announcement.scheduledFor).toLocaleString()}`,
                      type: 'scheduled',
                      timestamp: announcement.updatedAt,
                    },
                  ]
                : []),
              ...(announcement.publishedAt
                ? [
                    {
                      id: 'act-3',
                      action: 'Broadcast Published',
                      detail: 'Dispatched to audience channels',
                      type: 'published',
                      timestamp: announcement.publishedAt,
                    },
                  ]
                : []),
            ]}
          />
        </div>
      </div>
    </div>
  );
}
