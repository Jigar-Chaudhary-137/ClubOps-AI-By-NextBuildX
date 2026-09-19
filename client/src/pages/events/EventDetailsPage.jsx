import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Tag,
  Edit,
  MoreVertical,
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
import { AIBadge, AIInsightCard } from '../../components/ai';
import {
  EventStatusBadge,
  EventProgress,
  EventQuickActions,
  CreateEventModal
} from '../../components/events';

export default function EventDetailsPage() {
  const { eventId } = useParams();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Since backend is not connected yet, event data is unavailable
  const event = null;

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
          <Badge variant="primary" dot>Awaiting Integration</Badge>
        </div>
      </div>

      {/* Backend Integration Info Banner */}
      <div className="p-3.5 rounded-xl bg-[#151D2E] border border-[#263247] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#94A3B8]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#6366F1]/10 text-[#818CF8] flex items-center justify-center shrink-0">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-white">Event Command Center Preview:</span>{' '}
            Real-time event record #{eventId} will be dynamically loaded from PostgreSQL in the upcoming backend integration phase.
          </div>
        </div>
        <Link to="/ai">
          <Button variant="ai" size="sm" leftIcon={<Sparkles className="w-3.5 h-3.5" />}>
            AI Event Assistant
          </Button>
        </Link>
      </div>

      {/* Event Header */}
      <Card className="border-[#263247] bg-[#151D2E] shadow-xl">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <EventStatusBadge status="Planning" />
                <span className="text-xs text-[#64748B]">•</span>
                <span className="inline-flex items-center gap-1 text-xs text-[#94A3B8]">
                  <Tag className="w-3.5 h-3.5 text-[#818CF8]" />
                  <span>Technical / Workshop</span>
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Event Operational Command Center
              </h1>

              <p className="text-xs sm:text-sm text-[#94A3B8] max-w-2xl leading-relaxed">
                Centralized hub for managing task execution, volunteer allocations, meeting minutes, risk radar, and event knowledge.
              </p>

              {/* Event Metadata Row */}
              <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-[#94A3B8]">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#818CF8]" />
                  <span>Schedule: Target date to be announced</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#F59E0B]" />
                  <span>Location: Campus Auditorium / Hall A</span>
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
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Share2 className="w-3.5 h-3.5" />}
                disabled
              >
                Share
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Operational Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#94A3B8]">Tasks Breakdown</span>
              <CheckSquare className="w-4 h-4 text-[#4ADE80]" />
            </div>
            <div className="text-xl font-bold font-mono text-white">—</div>
            <p className="text-[11px] text-[#64748B] mt-1">Available on connection</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#94A3B8]">Volunteer Roster</span>
              <Users className="w-4 h-4 text-[#818CF8]" />
            </div>
            <div className="text-xl font-bold font-mono text-white">—</div>
            <p className="text-[11px] text-[#64748B] mt-1">Available on connection</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#94A3B8]">Critical Deadlines</span>
              <Clock className="w-4 h-4 text-[#F59E0B]" />
            </div>
            <div className="text-xl font-bold font-mono text-white">—</div>
            <p className="text-[11px] text-[#64748B] mt-1">Available on connection</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#94A3B8]">Active Risks</span>
              <AlertTriangle className="w-4 h-4 text-[#F87171]" />
            </div>
            <div className="text-xl font-bold font-mono text-white">—</div>
            <p className="text-[11px] text-[#64748B] mt-1">Available on connection</p>
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
              <Badge variant="neutral" size="sm">Module</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Available after event data is connected. Tasks extracted from meeting notes will be scoped to this event.
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
              <Badge variant="neutral" size="sm">Module</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Available after event data is connected. Manage sub-teams, committee leads, and volunteer shifts.
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
              <Badge variant="neutral" size="sm">Module</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Available after event data is connected. Log organizing calls and extract action items automatically.
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
              <Badge variant="neutral" size="sm">Module</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Available after event data is connected. Upload venue permission slips, budgets, and sponsorship packets.
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
              <Badge variant="neutral" size="sm">Module</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Available after event data is connected. Active risk radar will track potential bottlenecks and delays.
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
              <Badge variant="neutral" size="sm">Module</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Available after event data is connected. Broadcast schedule changes or reminders via WhatsApp and email.
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
