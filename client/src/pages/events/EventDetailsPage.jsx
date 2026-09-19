import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Tag,
  Edit,
  Share2,
  AlertCircle,
  Sparkles,
  CheckSquare,
  Users,
  Clock,
  AlertTriangle,
  Video,
  FileText,
  BellRing
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import { AIBadge } from '../../components/ai';
import {
  EventStatusBadge,
  EventProgress,
  EventQuickActions,
  CreateEventModal
} from '../../components/events';
import { getEventById, getEventOverview } from '../../services/api/events';

export default function EventDetailsPage() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!eventId) return;
      setLoading(true);
      setError(null);
      try {
        const [eventRes, overviewRes] = await Promise.allSettled([
          getEventById(eventId),
          getEventOverview(eventId)
        ]);

        if (eventRes.status === 'fulfilled' && eventRes.value?.data) {
          setEvent(eventRes.value.data);
        }
        if (overviewRes.status === 'fulfilled' && overviewRes.value?.data) {
          setOverview(overviewRes.value.data);
        }
      } catch (err) {
        console.error('Error loading event overview:', err);
        setError(err.message || 'Failed to load event details');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [eventId]);

  const metrics = overview?.metrics || {};

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Top Navigation & Breadcrumb */}
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/events"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#94A3B8] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Events</span>
        </Link>

        <div className="flex items-center gap-2">
          <Badge variant="neutral">ID: {eventId}</Badge>
          <Badge variant="primary" dot>Real API Connected</Badge>
        </div>
      </div>

      {/* Event Header */}
      <Card className="border-[#263247] bg-[#151D2E] shadow-xl">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <EventStatusBadge status={event?.status || overview?.event?.status || 'Planning'} />
                <span className="text-xs text-[#64748B]">•</span>
                <span className="inline-flex items-center gap-1 text-xs text-[#94A3B8]">
                  <Tag className="w-3.5 h-3.5 text-[#818CF8]" />
                  <span>{event?.category || 'General Event'}</span>
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {event?.title || overview?.event?.title || 'Event Operational Command Center'}
              </h1>

              <p className="text-xs sm:text-sm text-[#94A3B8] max-w-2xl leading-relaxed">
                {event?.description || 'Centralized hub for managing task execution, volunteer allocations, meeting minutes, risk radar, and event knowledge.'}
              </p>

              {/* Event Metadata Row */}
              <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-[#94A3B8]">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#818CF8]" />
                  <span>
                    Schedule: {event?.startDate ? new Date(event.startDate).toLocaleDateString() : 'TBD'}
                    {event?.endDate ? ` - ${new Date(event.endDate).toLocaleDateString()}` : ''}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#F59E0B]" />
                  <span>Location: {event?.venue || event?.location || 'Campus Main Venue'}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2.5 shrink-0">
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Edit className="w-3.5 h-3.5" />}
                onClick={() => setIsEditModalOpen(true)}
              >
                Edit Details
              </Button>
              <Link to="/ai">
                <Button variant="ai" size="sm" leftIcon={<Sparkles className="w-3.5 h-3.5" />}>
                  AI Assistant
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Operational Statistics from GET /api/events/:id/overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#94A3B8]">Tasks Breakdown</span>
              <CheckSquare className="w-4 h-4 text-[#4ADE80]" />
            </div>
            <div className="text-xl font-bold font-mono text-white">
              {metrics.completedTasks ?? 0} / {metrics.totalTasks ?? 0}
            </div>
            <p className="text-[11px] text-[#64748B] mt-1">{metrics.completionRate ?? 0}% completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#94A3B8]">Volunteer Roster</span>
              <Users className="w-4 h-4 text-[#818CF8]" />
            </div>
            <div className="text-xl font-bold font-mono text-white">
              {metrics.totalVolunteers ?? 0}
            </div>
            <p className="text-[11px] text-[#64748B] mt-1">Active team members</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#94A3B8]">Total Meetings</span>
              <Clock className="w-4 h-4 text-[#F59E0B]" />
            </div>
            <div className="text-xl font-bold font-mono text-white">
              {metrics.totalMeetings ?? 0}
            </div>
            <p className="text-[11px] text-[#64748B] mt-1">Logged sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#94A3B8]">Active Risks</span>
              <AlertTriangle className="w-4 h-4 text-[#F87171]" />
            </div>
            <div className="text-xl font-bold font-mono text-white">
              {metrics.totalRisks ?? 0}
            </div>
            <p className="text-[11px] text-[#64748B] mt-1">{metrics.criticalRisks ?? 0} critical risks</p>
          </CardContent>
        </Card>
      </div>

      {/* Event Progress Component */}
      <EventProgress />

      {/* Quick Actions Component */}
      <EventQuickActions />

      {/* Event Operations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="border-[#263247]">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-[#4ADE80]" />
                <CardTitle className="text-sm">Tasks & Deliverables</CardTitle>
              </div>
              <Badge variant="neutral" size="sm">{metrics.pendingTasks ?? 0} Pending</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Manage and track deliverables for this event. Extract tasks automatically from meeting transcripts.
            </p>
            <div className="pt-3 mt-2 border-t border-[#263247]/50">
              <Link to="/tasks" className="text-xs text-[#818CF8] hover:underline font-medium">
                View Tasks Board &rarr;
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#263247]">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#818CF8]" />
                <CardTitle className="text-sm">Assigned Volunteers</CardTitle>
              </div>
              <Badge variant="neutral" size="sm">{metrics.totalVolunteers ?? 0} Volunteers</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Manage sub-teams, committee leads, and volunteer shifts for event execution.
            </p>
            <div className="pt-3 mt-2 border-t border-[#263247]/50">
              <Link to="/volunteers" className="text-xs text-[#818CF8] hover:underline font-medium">
                Manage Volunteers &rarr;
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#263247]">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-[#38BDF8]" />
                <CardTitle className="text-sm">Meeting Minutes & Transcripts</CardTitle>
              </div>
              <Badge variant="neutral" size="sm">{metrics.totalMeetings ?? 0} Meetings</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Log organizing calls and extract action items automatically into active tasks.
            </p>
            <div className="pt-3 mt-2 border-t border-[#263247]/50">
              <Link to="/meetings" className="text-xs text-[#818CF8] hover:underline font-medium">
                Open Meeting Intelligence &rarr;
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#263247]">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#FBBF24]" />
                <CardTitle className="text-sm">Event Documents & Guidelines</CardTitle>
              </div>
              <Badge variant="neutral" size="sm">Knowledge Base</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Upload venue permission slips, budgets, and sponsorship packets for RAG retrieval.
            </p>
            <div className="pt-3 mt-2 border-t border-[#263247]/50">
              <Link to="/documents" className="text-xs text-[#818CF8] hover:underline font-medium">
                View Event Documents &rarr;
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#263247]">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#F87171]" />
                <CardTitle className="text-sm">Operational Risks & Alerts</CardTitle>
              </div>
              <Badge variant="neutral" size="sm">{metrics.totalRisks ?? 0} Risks</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Active risk radar tracking potential bottlenecks, budget slips, and logistical delays.
            </p>
            <div className="pt-3 mt-2 border-t border-[#263247]/50">
              <Link to="/risks" className="text-xs text-[#818CF8] hover:underline font-medium">
                View Risk Radar &rarr;
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#263247]">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <BellRing className="w-4 h-4 text-[#F472B6]" />
                <CardTitle className="text-sm">Broadcasts & Announcements</CardTitle>
              </div>
              <Badge variant="neutral" size="sm">Communications</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Broadcast schedule changes or operational reminders via WhatsApp and email channels.
            </p>
            <div className="pt-3 mt-2 border-t border-[#263247]/50">
              <Link to="/announcements" className="text-xs text-[#818CF8] hover:underline font-medium">
                Send Announcement &rarr;
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Event Modal Reuse */}
      <CreateEventModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </div>
  );
}
