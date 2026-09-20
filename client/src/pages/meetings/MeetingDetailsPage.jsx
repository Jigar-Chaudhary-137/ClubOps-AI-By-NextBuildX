import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Tag,
  Users,
  Edit,
  MoreVertical,
  AlertCircle,
  FileText,
  Sparkles
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import {
  MeetingProcessingBadge,
  MeetingNotesPanel,
  MeetingIntelligencePanel,
  MeetingSummary,
  MeetingActionItems,
  MeetingDecisions,
  MeetingRiskInsights,
  MeetingQuickActions,
  CreateMeetingModal
} from '../../components/meetings';

export default function MeetingDetailsPage() {
  const { meetingId } = useParams();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Backend integration placeholder state
  const meeting = null; // No backend meeting record yet

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Top Navigation & Breadcrumb */}
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/meetings"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#94A3B8] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Meetings</span>
        </Link>

        <div className="flex items-center gap-2">
          <Badge variant="neutral">ID: {meetingId}</Badge>
        </div>
      </div>

      {/* Header Card */}
      <Card className="border-[#263247] bg-[#151D2E] shadow-xl">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <MeetingProcessingBadge status="Not Processed" size="sm" />
                <span className="text-xs text-[#64748B]">•</span>
                <span className="inline-flex items-center gap-1 text-xs text-[#94A3B8]">
                  <Tag className="w-3.5 h-3.5 text-[#818CF8]" />
                  <span>Meeting Type: —</span>
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                —
              </h1>

              <p className="text-xs text-[#94A3B8]">
                Meeting information will appear once connected.
              </p>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-2.5">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsEditModalOpen(true)}
                leftIcon={<Edit className="w-3.5 h-3.5" />}
              >
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                aria-label="More actions"
              >
                <MoreVertical className="w-4 h-4 text-[#94A3B8]" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Meeting Overview Section */}
      <Card className="border-[#263247] bg-[#151D2E]">
        <CardHeader className="pb-3 border-b border-[#263247]/60">
          <CardTitle className="text-sm">Meeting Overview</CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3 rounded-lg bg-[#111827] border border-[#263247]">
              <div className="flex items-center gap-2 text-xs text-[#94A3B8] mb-1">
                <Calendar className="w-3.5 h-3.5 text-[#818CF8]" />
                <span>Date & Time</span>
              </div>
              <p className="text-sm font-semibold text-white font-mono">—</p>
            </div>

            <div className="p-3 rounded-lg bg-[#111827] border border-[#263247]">
              <div className="flex items-center gap-2 text-xs text-[#94A3B8] mb-1">
                <Tag className="w-3.5 h-3.5 text-[#818CF8]" />
                <span>Associated Event</span>
              </div>
              <p className="text-sm font-semibold text-white">—</p>
            </div>

            <div className="p-3 rounded-lg bg-[#111827] border border-[#263247]">
              <div className="flex items-center gap-2 text-xs text-[#94A3B8] mb-1">
                <MapPin className="w-3.5 h-3.5 text-[#818CF8]" />
                <span>Location</span>
              </div>
              <p className="text-sm font-semibold text-white">—</p>
            </div>

            <div className="p-3 rounded-lg bg-[#111827] border border-[#263247]">
              <div className="flex items-center gap-2 text-xs text-[#94A3B8] mb-1">
                <Users className="w-3.5 h-3.5 text-[#818CF8]" />
                <span>Participants</span>
              </div>
              <p className="text-sm font-semibold text-white">—</p>
            </div>
          </div>

          {/* Agenda & Empty Note */}
          <div className="p-4 rounded-xl bg-[#111827] border border-[#263247] space-y-1.5">
            <h4 className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
              Agenda
            </h4>
            <p className="text-xs text-[#94A3B8] italic">
              Meeting information will appear once connected.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Main Workspace Grid: Notes & AI Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Notes & Transcript (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <MeetingNotesPanel />
          <MeetingSummary />
          <MeetingDecisions />
        </div>

        {/* Right Column: AI Intelligence & Action Items (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <MeetingIntelligencePanel />
          <MeetingActionItems />
          <MeetingRiskInsights />
          <MeetingQuickActions
            onNewMeeting={() => setIsEditModalOpen(true)}
            onAddNotes={() => {
              window.scrollTo({ top: 350, behavior: 'smooth' });
            }}
            onUploadTranscript={() => {
              window.scrollTo({ top: 350, behavior: 'smooth' });
            }}
            onAnalyzeMeeting={() => {
              window.scrollTo({ top: 450, behavior: 'smooth' });
            }}
            onCreateTasks={() => {
              window.scrollTo({ top: 600, behavior: 'smooth' });
            }}
          />
        </div>
      </div>

      {/* Edit Meeting Modal */}
      <CreateMeetingModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </div>
  );
}
