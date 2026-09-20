import React, { useState, useEffect, useMemo } from 'react';
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
  RefreshCw,
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
import {
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
  publishAnnouncement,
} from '../../services/api/announcements';
import { getEvents } from '../../services/api/events';

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
  { value: 'all_members', label: 'Entire Club' },
  { value: 'organizers', label: 'Organizers' },
  { value: 'volunteers', label: 'Volunteers' },
  { value: 'members', label: 'Members' },
];

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'title', label: 'Title (A-Z)' },
];

export default function AnnouncementsPage() {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [eventsList, setEventsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [aiDraftPrompt, setAiDraftPrompt] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [notice, setNotice] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [channelFilter, setChannelFilter] = useState('all');
  const [audienceFilter, setAudienceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const fetchAnnouncementsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [annRes, eventsRes] = await Promise.allSettled([
        getAnnouncements({ limit: 100 }),
        getEvents({ limit: 50 })
      ]);

      if (annRes.status === 'fulfilled') {
        const data = annRes.value?.data || annRes.value?.announcements || [];
        setAnnouncements(Array.isArray(data) ? data : []);
      }
      if (eventsRes.status === 'fulfilled') {
        const evts = eventsRes.value?.data || eventsRes.value?.events || [];
        setEventsList(Array.isArray(evts) ? evts.map(e => ({ id: e._id || e.id, name: e.title })) : []);
      }
    } catch (err) {
      console.error('Failed to load announcements:', err);
      setError(err.message || 'Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncementsData();
  }, []);

  // Stats calculation
  const stats = useMemo(() => {
    const total = announcements.length;
    const scheduled = announcements.filter((a) => a.status === 'scheduled').length;
    const published = announcements.filter((a) => a.status === 'published' || !a.status).length;
    
    const channelSet = new Set();
    announcements.forEach((a) => {
      if (Array.isArray(a.channels)) {
        a.channels.forEach((ch) => channelSet.add(ch));
      } else {
        channelSet.add('in_app');
      }
    });
    const activeChannels = channelSet.size || 1;

    return { total, scheduled, published, activeChannels };
  }, [announcements]);

  // Filtered & Sorted Announcements
  const filteredAnnouncements = useMemo(() => {
    return announcements
      .filter((item) => {
        const titleText = item.title || '';
        const msgText = item.message || item.content || '';
        const evtText = item.eventName || (item.event && item.event.title) || '';

        const matchesSearch =
          searchQuery === '' ||
          titleText.toLowerCase().includes(searchQuery.toLowerCase()) ||
          msgText.toLowerCase().includes(searchQuery.toLowerCase()) ||
          evtText.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'all' || (item.status || 'published') === statusFilter;

        const itemChannels = Array.isArray(item.channels) && item.channels.length > 0
          ? item.channels
          : [item.channel || 'in_app'];

        const itemAudiences = Array.isArray(item.targetAudiences) && item.targetAudiences.length > 0
          ? item.targetAudiences.map(a => a.toLowerCase().replace(/[\s_-]+/g, ''))
          : [(item.targetAudience || item.audience || 'all').toLowerCase().replace(/[\s_-]+/g, '')];

        const normChanFilter = channelFilter.toLowerCase().replace(/[\s_-]+/g, '');
        const normAudFilter = audienceFilter.toLowerCase().replace(/[\s_-]+/g, '');

        const matchesChannel =
          channelFilter === 'all' ||
          itemChannels.some(ch => ch.toLowerCase().replace(/[\s_-]+/g, '').includes(normChanFilter));

        const matchesAudience =
          audienceFilter === 'all' ||
          itemAudiences.some(aud => aud.includes(normAudFilter) || (normAudFilter === 'allmembers' && (aud.includes('entire') || aud.includes('all'))));

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
          return (a.title || '').localeCompare(b.title || '');
        }
        return 0;
      });
  }, [announcements, searchQuery, statusFilter, channelFilter, audienceFilter, sortBy]);

  const handleCreateSave = async (payload) => {
    try {
      await createAnnouncement(payload);
      setIsCreateModalOpen(false);
      setNotice('Announcement created successfully!');
      setTimeout(() => setNotice(null), 4000);
      fetchAnnouncementsData();
    } catch (err) {
      console.error('Failed to create announcement:', err);
      setNotice(err.response?.data?.message || err.message || 'Failed to create announcement');
    }
  };

  const handleApplyAiPrompt = (promptText) => {
    setAiDraftPrompt(promptText);
    setIsCreateModalOpen(true);
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
            variant="secondary"
            size="sm"
            onClick={fetchAnnouncementsData}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>

          <Button
            variant="ai"
            size="sm"
            onClick={() => handleApplyAiPrompt('Draft an operational update for active club members')}
            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
          >
            AI Assistant
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setAiDraftPrompt(null);
              setIsCreateModalOpen(true);
            }}
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
            <p className="text-xl font-bold text-white font-mono">{loading ? '...' : stats.total}</p>
            <p className="text-[11px] text-[#64748B]">Across all club channels</p>
          </CardContent>
        </Card>

        <Card className="border-[#263247] bg-[#151D2E]">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-[#94A3B8]">
              <span className="text-xs font-medium">Scheduled</span>
              <Calendar className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-xl font-bold text-white font-mono">{loading ? '...' : stats.scheduled}</p>
            <p className="text-[11px] text-[#64748B]">Pending dispatch timeline</p>
          </CardContent>
        </Card>

        <Card className="border-[#263247] bg-[#151D2E]">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-[#94A3B8]">
              <span className="text-xs font-medium">Published</span>
              <Send className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-xl font-bold text-white font-mono">{loading ? '...' : stats.published}</p>
            <p className="text-[11px] text-[#64748B]">Delivered to target recipients</p>
          </CardContent>
        </Card>

        <Card className="border-[#263247] bg-[#151D2E]">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-[#94A3B8]">
              <span className="text-xs font-medium">Active Channels</span>
              <Radio className="w-4 h-4 text-sky-400" />
            </div>
            <p className="text-xl font-bold text-white font-mono">{loading ? '...' : stats.activeChannels}</p>
            <p className="text-[11px] text-[#64748B]">In-App, Email, WhatsApp, Push</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Assistant & Suggestions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AIAnnouncementAssistant onApplyPrompt={handleApplyAiPrompt} />
        <AIAnnouncementSuggestions onApplySuggestion={handleApplyAiPrompt} />
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
          {loading ? (
            <div className="p-12 text-center text-gray-400 bg-[#151D2E] border border-[#263247] rounded-xl flex items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-indigo-400" />
              <span>Loading announcements from backend...</span>
            </div>
          ) : (
            <AnnouncementList
              announcements={filteredAnnouncements}
              viewMode={viewMode}
              onCreateClick={() => setIsCreateModalOpen(true)}
            />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <AnnouncementQuickActions onCreateClick={() => setIsCreateModalOpen(true)} />
          <AnnouncementActivity />
        </div>
      </div>

      {/* Create Announcement Modal */}
      <CreateAnnouncementModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setAiDraftPrompt(null);
        }}
        onSave={handleCreateSave}
        initialPrompt={aiDraftPrompt}
        events={eventsList}
      />
    </div>
  );
}
