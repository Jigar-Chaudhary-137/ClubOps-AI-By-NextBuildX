import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Sparkles, LayoutGrid, List, SlidersHorizontal, RefreshCw, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import {
  MeetingList,
  CreateMeetingModal
} from '../../components/meetings';
import { getMeetings, createMeeting } from '../../services/api/meetings';
import { getEvents } from '../../services/api/events';
import { normalizeApiError } from '../../services/api/client';

const meetingTypeFilterOptions = [
  { value: 'all', label: 'All Types' },
  { value: 'Planning', label: 'Planning' },
  { value: 'Review', label: 'Review' },
  { value: 'Team Meeting', label: 'Team Meeting' },
  { value: 'Committee', label: 'Committee' },
  { value: 'Emergency', label: 'Emergency' },
  { value: 'Other', label: 'Other' }
];

const processingStatusOptions = [
  { value: 'all', label: 'All' },
  { value: 'Not Processed', label: 'Not Processed' },
  { value: 'Processing', label: 'Processing' },
  { value: 'Processed', label: 'Processed' }
];

const sortOptions = [
  { value: 'updated', label: 'Recently Updated' },
  { value: 'date', label: 'Meeting Date' },
  { value: 'name', label: 'Name' }
];

export default function MeetingsPage() {
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'

  // Data state
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [events, setEvents] = useState([]);

  // Toolbar filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [eventFilter, setEventFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('updated');

  // Fetch events for filter dropdown
  useEffect(() => {
    let isMounted = true;
    const loadEvents = async () => {
      try {
        const res = await getEvents();
        if (isMounted && res?.data) {
          const list = Array.isArray(res.data) ? res.data : (res.data.events || []);
          setEvents(list);
        }
      } catch (e) {
        console.warn('Failed to load events for filter:', e.message);
      }
    };
    loadEvents();
    return () => { isMounted = false; };
  }, []);

  const eventFilterOptions = [
    { value: 'all', label: 'All Events' },
    ...events.map(e => ({ value: e._id || e.id, label: e.title || e.name || 'Untitled Event' }))
  ];

  // Fetch real meetings from backend
  const fetchMeetings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (eventFilter !== 'all') params.event = eventFilter;

      const res = await getMeetings(params);
      const rawList = Array.isArray(res?.data)
        ? res.data
        : (res?.data?.meetings || res?.meetings || (Array.isArray(res) ? res : []));

      const meetingList = rawList.map((m) => {
        const id = m._id || m.id;
        const eventTitle = typeof m.event === 'object' && m.event !== null
          ? (m.event.title || m.event.name || '—')
          : (m.event || '—');
        const formattedDate = m.scheduledAt
          ? new Date(m.scheduledAt).toLocaleDateString()
          : (m.date || '—');
        const processingStatus = m.aiProcessed || m.actionItemsExtracted
          ? 'Processed'
          : (m.processingStatus || 'Not Processed');
        const actionItemCount = Array.isArray(m.extractedItems)
          ? m.extractedItems.length
          : (m.actionItemCount || 0);

        return {
          ...m,
          id,
          event: eventTitle,
          date: formattedDate,
          processingStatus,
          actionItemCount,
          riskCount: m.riskCount || 0
        };
      });

      // Client-side filtering for type & status if applicable
      let filtered = meetingList;
      if (typeFilter !== 'all') {
        filtered = filtered.filter(m => (m.type || 'Planning').toLowerCase() === typeFilter.toLowerCase());
      }
      if (statusFilter === 'Processed') {
        filtered = filtered.filter(m => m.aiProcessed || m.actionItemsExtracted || m.processingStatus === 'Processed');
      } else if (statusFilter === 'Not Processed') {
        filtered = filtered.filter(m => !m.aiProcessed && !m.actionItemsExtracted && m.processingStatus !== 'Processed');
      }

      // Sort
      if (sortBy === 'date') {
        filtered.sort((a, b) => new Date(b.scheduledAt || b.createdAt || 0) - new Date(a.scheduledAt || a.createdAt || 0));
      } else if (sortBy === 'name') {
        filtered.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
      } else {
        filtered.sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));
      }

      setMeetings(filtered);
    } catch (err) {
      console.error('Failed to fetch meetings:', err);
      setError(normalizeApiError(err, 'Failed to load meetings. Please check your session.'));
    } finally {
      setLoading(false);
    }
  }, [searchQuery, eventFilter, typeFilter, statusFilter, sortBy]);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  const handleCreateMeetingSave = async (payload) => {
    const res = await createMeeting(payload);
    await fetchMeetings();
    return res;
  };

  const handleOpenIntelligence = () => {
    navigate('/meetings/intelligence');
  };

  const handleViewMeeting = (id) => {
    navigate(`/meetings/${id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#263247]/60">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-1">
            Meetings
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8]">
            Capture decisions, action items, and important context from every club meeting.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="ai"
            size="sm"
            onClick={handleOpenIntelligence}
            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
          >
            Meeting Intelligence
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            New Meeting
          </Button>
        </div>
      </div>

      {/* Meeting Toolbar */}
      <Card className="border-[#263247] bg-[#151D2E]">
        <CardContent className="p-3.5 sm:p-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <Input
                placeholder="Search meetings..."
                leftIcon={<Search className="w-4 h-4" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filters & Sort Controls */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="w-full sm:w-36">
                <Select
                  options={eventFilterOptions}
                  value={eventFilter}
                  onChange={(e) => setEventFilter(e.target.value)}
                />
              </div>

              <div className="w-full sm:w-36">
                <Select
                  options={meetingTypeFilterOptions}
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                />
              </div>

              <div className="w-full sm:w-36">
                <Select
                  options={processingStatusOptions}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                />
              </div>

              <div className="w-full sm:w-40">
                <Select
                  options={sortOptions}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                />
              </div>

              {/* View Toggle */}
              <div className="hidden sm:flex items-center p-1 rounded-lg bg-[#111827] border border-[#263247]">
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  aria-label="Table view"
                  className={`p-1.5 rounded-md transition-colors ${viewMode === 'table' ? 'bg-[#151D2E] text-white shadow-sm' : 'text-[#94A3B8] hover:text-white'}`}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                  className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-[#151D2E] text-white shadow-sm' : 'text-[#94A3B8] hover:text-white'}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="secondary" size="sm" onClick={fetchMeetings}>
            Retry
          </Button>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="py-16 text-center text-xs text-[#94A3B8] flex items-center justify-center gap-2 bg-[#151D2E] rounded-xl border border-[#263247]">
          <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
          <span>Loading meetings...</span>
        </div>
      ) : (
        /* Meeting List or Empty State */
        <MeetingList
          meetings={meetings}
          viewMode={viewMode}
          onViewMeeting={handleViewMeeting}
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
          onProcessNotes={handleOpenIntelligence}
        />
      )}

      {/* Create Meeting Modal */}
      <CreateMeetingModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateMeetingSave}
      />
    </div>
  );
}
