import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Sparkles,
  LayoutGrid,
  List,
  Megaphone,
  Calendar,
  Send,
  Radio,
  AlertCircle,
  Clock,
  Filter,
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import {
  AnnouncementList,
  CreateAnnouncementModal,
  AIAnnouncementAssistant,
  AIAnnouncementSuggestions,
  AnnouncementQuickActions,
  AnnouncementActivity,
} from '../../components/announcements';

// Pre-populated realistic initial announcements for local preview and demonstration
const initialAnnouncements = [
  {
    id: 'announcement-101',
    title: 'TechSprint Hackathon 2026 — Venue & Check-In Guide',
    message: 'Welcome hackers! Check-in starts at 9:00 AM at the Student Activity Center Main Hall. Bring your student ID, laptop, and charger. Join the Discord server for mentorship channels and live team formation announcements.',
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
  {
    id: 'announcement-102',
    title: 'Mandatory Volunteer Briefing — Logistics Walkthrough',
    message: 'All confirmed volunteers for TechSprint are required to attend our pre-event logistics walkthrough on Friday at 5:00 PM in Room 304. We will distribute volunteer t-shirts, badge scanners, and emergency contact sheets.',
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
  {
    id: 'announcement-103',
    title: 'Spring Core Committee Applications Now Open',
    message: 'Looking to build leadership skills and manage high-impact collegiate events? Applications are officially open for the Spring 2027 Core Committee across Logistics, Marketing, Technical, and Sponsorship tracks.',
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
];

const statusFilterOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'published', label: 'Published' },
  { value: 'failed', label: 'Failed' },
  { value: 'archived', label: 'Archived' },
];

const channelFilterOptions = [
  { value: 'all', label: 'All Channels' },
  { value: 'in_app', label: 'In-App Notification' },
  { value: 'email', label: 'Email Broadcast' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'sms', label: 'SMS Alert' },
  { value: 'push', label: 'Push Notification' },
];

const audienceFilterOptions = [
  { value: 'all', label: 'All Audiences' },
  { value: 'entire_club', label: 'Entire Club' },
  { value: 'event_participants', label: 'Event Participants' },
  { value: 'volunteers', label: 'Volunteers' },
  { value: 'organizers', label: 'Organizers' },
  { value: 'trainers', label: 'Trainers / Mentors' },
  { value: 'custom', label: 'Custom Audience' },
];

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'title', label: 'Title (A-Z)' },
];

export default function AnnouncementsPage() {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [notice, setNotice] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [channelFilter, setChannelFilter] = useState('all');
  const [audienceFilter, setAudienceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Stats calculation
  const stats = useMemo(() => {
    const total = announcements.length;
    const scheduled = announcements.filter((a) => a.status === 'scheduled').length;
    const published = announcements.filter((a) => a.status === 'published').length;
    
    // Distinct channels across all announcements
    const channelSet = new Set();
    announcements.forEach((a) => {
      if (Array.isArray(a.channels)) {
        a.channels.forEach((ch) => channelSet.add(ch));
      }
    });
    const activeChannels = channelSet.size;

    return { total, scheduled, published, activeChannels };
  }, [announcements]);

  // Filtered & Sorted Announcements
  const filteredAnnouncements = useMemo(() => {
    return announcements
      .filter((item) => {
        // Search
        const matchesSearch =
          searchQuery === '' ||
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.eventName && item.eventName.toLowerCase().includes(searchQuery.toLowerCase()));

        // Status
        const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

        // Channel
        const matchesChannel =
          channelFilter === 'all' ||
          (Array.isArray(item.channels) && item.channels.includes(channelFilter));

        // Audience
        const matchesAudience = audienceFilter === 'all' || item.audience === audienceFilter;

        return matchesSearch && matchesStatus && matchesChannel && matchesAudience;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        }
        if (sortBy === 'oldest') {
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        }
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        return 0;
      });
  }, [announcements, searchQuery, statusFilter, channelFilter, audienceFilter, sortBy]);

  const handleCreateSave = (newAnnouncement) => {
    const created = {
      ...newAnnouncement,
      id: `announcement-${Date.now()}`,
      authorName: 'Alex Chen (Current User)',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setAnnouncements((prev) => [created, ...prev]);
    setIsCreateModalOpen(false);
  };

  const handleAIActionNotice = () => {
    setNotice('AI announcement generation will be available once the Gemini service is connected.');
    setTimeout(() => setNotice(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#263247]/60">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Announcements & Communication
            </h1>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Multi-Channel
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#94A3B8]">
            Broadcast notifications, schedule reminders, and coordinate communication across club channels.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="ai"
            size="sm"
            onClick={handleAIActionNotice}
            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
          >
            AI Assistant
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create Announcement
          </Button>
        </div>
      </div>

      {/* Integration Notice if triggered */}
      {notice && (
        <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200 flex items-start gap-2.5 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-semibold text-white">Notice:</span> {notice}
          </div>
        </div>
      )}

      {/* Overview Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-[#263247] bg-[#151D2E]">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-[#94A3B8]">
              <span className="text-xs font-medium">Total Announcements</span>
              <Megaphone className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-xl font-bold text-white font-mono">{stats.total}</p>
            <p className="text-[11px] text-[#64748B]">Across all club channels</p>
          </CardContent>
        </Card>

        <Card className="border-[#263247] bg-[#151D2E]">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-[#94A3B8]">
              <span className="text-xs font-medium">Scheduled</span>
              <Calendar className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-xl font-bold text-white font-mono">{stats.scheduled}</p>
            <p className="text-[11px] text-[#64748B]">Pending dispatch timeline</p>
          </CardContent>
        </Card>

        <Card className="border-[#263247] bg-[#151D2E]">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-[#94A3B8]">
              <span className="text-xs font-medium">Published</span>
              <Send className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-xl font-bold text-white font-mono">{stats.published}</p>
            <p className="text-[11px] text-[#64748B]">Delivered to target recipients</p>
          </CardContent>
        </Card>

        <Card className="border-[#263247] bg-[#151D2E]">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-[#94A3B8]">
              <span className="text-xs font-medium">Active Channels</span>
              <Radio className="w-4 h-4 text-sky-400" />
            </div>
            <p className="text-xl font-bold text-white font-mono">{stats.activeChannels}</p>
            <p className="text-[11px] text-[#64748B]">In-App, Email, WhatsApp, Push</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Assistant & Suggestions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AIAnnouncementAssistant />
        <AIAnnouncementSuggestions />
      </div>

      {/* Filter and Search Toolbar */}
      <Card className="border-[#263247] bg-[#151D2E]">
        <CardContent className="p-3.5 sm:p-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <Input
                placeholder="Search announcements, content, or events..."
                leftIcon={<Search className="w-4 h-4 text-[#94A3B8]" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2.5">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={statusFilterOptions}
                className="w-36 text-xs"
              />

              <Select
                value={channelFilter}
                onChange={(e) => setChannelFilter(e.target.value)}
                options={channelFilterOptions}
                className="w-36 text-xs"
              />

              <Select
                value={audienceFilter}
                onChange={(e) => setAudienceFilter(e.target.value)}
                options={audienceFilterOptions}
                className="w-36 text-xs"
              />

              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                options={sortOptions}
                className="w-32 text-xs"
              />

              {/* Grid / List Switcher */}
              <div className="flex items-center bg-[#111827] border border-[#263247] rounded-lg p-0.5 ml-auto sm:ml-0">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title="Grid view"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-md transition-colors ${
                    viewMode === 'table'
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title="Table view"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content & Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main List */}
        <div className="lg:col-span-3">
          <AnnouncementList
            announcements={filteredAnnouncements}
            viewMode={viewMode}
            onCreateClick={() => setIsCreateModalOpen(true)}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <AnnouncementQuickActions />
          <AnnouncementActivity
            activities={[
              {
                id: 'act-1',
                action: 'Announcement Scheduled',
                detail: 'TechSprint Hackathon Venue Guide set for Sep 22 at 9:00 AM',
                type: 'scheduled',
                timestamp: '2026-09-18T10:30:00Z',
              },
              {
                id: 'act-2',
                action: 'WhatsApp Broadcast Dispatched',
                detail: 'Sent to 28 confirmed event volunteers',
                type: 'published',
                timestamp: '2026-09-17T16:00:00Z',
              },
            ]}
          />
        </div>
      </div>

      {/* Create Announcement Modal */}
      <CreateAnnouncementModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateSave}
        events={[
          { id: 'techsprint-2026', name: 'TechSprint Hackathon 2026' },
          { id: 'dev-summit', name: 'Annual DevSummit' },
          { id: 'ai-workshop', name: 'Intro to GenAI Bootcamp' },
        ]}
      />
    </div>
  );
}
