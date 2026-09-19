import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Plus, Search, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { Card, CardContent } from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import Toast from '../../components/ui/Toast';
import { AIBadge } from '../../components/ai';
import { CreateEventModal, EventCard } from '../../components/events';
import { getEvents, createEvent } from '../../services/api/events';

const statusFilterOptions = [
  { value: 'all', label: 'All Events' },
  { value: 'Planning', label: 'Planning' },
  { value: 'Upcoming', label: 'Upcoming' },
  { value: 'Ongoing', label: 'Ongoing' },
  { value: 'Completed', label: 'Completed' }
];

const sortOptions = [
  { value: 'updated', label: 'Recently Updated' },
  { value: 'date', label: 'Event Date' },
  { value: 'name', label: 'Name' }
];

export default function EventsPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('updated');
  const [toast, setToast] = useState(null);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getEvents();
      const eventList = Array.isArray(res?.data)
        ? res.data
        : res?.data?.events || [];
      setEvents(eventList);
    } catch (err) {
      console.error('Failed to fetch events:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load events');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Auto-dismiss toast after 5 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleCreateEvent = async (payload) => {
    const result = await createEvent(payload);
    await fetchEvents();
    setToast({
      type: 'success',
      title: 'Event Created Successfully',
      message: `Event "${payload.title}" has been registered in the workspace.`
    });
    return result;
  };

  const filteredEvents = useMemo(() => {
    return events
      .filter((event) => {
        const matchesSearch =
          !searchQuery.trim() ||
          event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.location?.toLowerCase().includes(searchQuery.toLowerCase());

        const normStatus = (event.status || '').toLowerCase();
        const filterNorm = statusFilter.toLowerCase();
        const matchesStatus =
          statusFilter === 'all' ||
          normStatus === filterNorm ||
          (filterNorm === 'planning' && normStatus === 'planning') ||
          (filterNorm === 'upcoming' && normStatus === 'ready') ||
          (filterNorm === 'ongoing' && normStatus === 'active') ||
          (filterNorm === 'completed' && normStatus === 'completed');

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'date') {
          return new Date(a.startDate || 0) - new Date(b.startDate || 0);
        }
        if (sortBy === 'name') {
          return (a.title || '').localeCompare(b.title || '');
        }
        return new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0);
      });
  }, [events, searchQuery, statusFilter, sortBy]);

  return (
    <div className="space-y-6">
      {/* Toast Notification Container */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <Toast
            type={toast.type}
            title={toast.title}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#263247]/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Events
            </h1>
            <AIBadge size="sm">Lifecycle Hub</AIBadge>
          </div>
          <p className="text-xs sm:text-sm text-[#94A3B8]">
            Plan, organize, and track your club events from one place.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/ai">
            <Button
              variant="ai"
              size="sm"
              leftIcon={<Sparkles className="w-3.5 h-3.5" />}
            >
              AI Event Planner
            </Button>
          </Link>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create Event
          </Button>
        </div>
      </div>

      {/* Events Toolbar */}
      <Card className="border-[#263247] bg-[#151D2E]">
        <CardContent className="p-3.5 sm:p-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="flex-1 max-w-md">
              <Input
                placeholder="Search events..."
                leftIcon={<Search className="w-4 h-4" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter & Sort Controls */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
              <div className="w-full sm:w-40">
                <Select
                  options={statusFilterOptions}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                />
              </div>

              <div className="w-full sm:w-44">
                <Select
                  options={sortOptions}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                />
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={fetchEvents}
                disabled={isLoading}
                title="Refresh events list"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 text-sm text-[#F87171] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="secondary" size="sm" onClick={fetchEvents}>
            Retry
          </Button>
        </div>
      )}

      {/* Loading state */}
      {isLoading && events.length === 0 ? (
        <div className="flex items-center justify-center p-16">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="w-8 h-8 text-[#818CF8] animate-spin" />
            <p className="text-sm text-[#94A3B8]">Loading events from workspace...</p>
          </div>
        </div>
      ) : filteredEvents.length === 0 ? (
        <Card className="border-[#263247] bg-[#151D2E]">
          <CardContent className="p-8 sm:p-14">
            <EmptyState
              icon={<Calendar className="w-8 h-8 text-[#818CF8]" />}
              title={events.length === 0 ? "No events yet" : "No matching events found"}
              description={
                events.length === 0
                  ? "Create your first event to start managing tasks, volunteers, meetings, deadlines, and risks in one place."
                  : "Try adjusting your search query or status filter to find events."
              }
              action={
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => setIsCreateModalOpen(true)}
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    Create Event
                  </Button>
                  <Link to="/ai">
                    <Button
                      variant="ai"
                      size="md"
                      leftIcon={<Sparkles className="w-4 h-4" />}
                    >
                      Ask AI to Plan an Event
                    </Button>
                  </Link>
                </div>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvents.map((evt) => (
            <EventCard
              key={evt._id || evt.id}
              event={{
                id: evt._id || evt.id,
                title: evt.title,
                type: evt.category || evt.type || 'General',
                status: evt.status || 'planning',
                startDate: evt.startDate ? new Date(evt.startDate).toLocaleDateString() : '',
                endDate: evt.endDate ? new Date(evt.endDate).toLocaleDateString() : '',
                location: evt.location || evt.venue?.name || '',
                progress: evt.progress || 0,
                taskCount: evt.taskCount || 0,
                volunteerCount: evt.volunteerCount || 0,
                riskCount: evt.riskCount || 0
              }}
              onView={(id) => navigate(`/events/${id}`)}
            />
          ))}
        </div>
      )}

      {/* Reusable Create Event Modal */}
      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateEvent}
      />
    </div>
  );
}
