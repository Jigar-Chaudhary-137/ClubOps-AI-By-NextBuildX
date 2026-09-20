import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Tag,
  Users,
  Edit,
  Trash2,
  AlertCircle,
  FileText,
  Sparkles,
  RefreshCw
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
import {
  getMeetingById,
  updateMeeting,
  deleteMeeting,
  saveMeetingNotes,
  processMeeting,
  createTaskFromActionItem
} from '../../services/api/meetings';
import { normalizeApiError } from '../../services/api/client';

export default function MeetingDetailsPage() {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const fetchMeeting = useCallback(async () => {
    if (!meetingId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getMeetingById(meetingId);
      const data = res?.data?.meeting || res?.data || res?.meeting || res;
      setMeeting(data);
    } catch (err) {
      console.error('Failed to load meeting details:', err);
      setError(normalizeApiError(err, 'Failed to load meeting details'));
    } finally {
      setLoading(false);
    }
  }, [meetingId]);

  useEffect(() => {
    fetchMeeting();
  }, [fetchMeeting]);

  const handleSaveNotes = async (notesText) => {
    try {
      await saveMeetingNotes(meetingId, { notes: notesText });
      await fetchMeeting();
    } catch (err) {
      console.error('Failed to save notes:', err);
    }
  };

  const handleAnalyzeMeeting = async () => {
    setAnalyzing(true);
    try {
      await processMeeting(meetingId, meeting?.notes || meeting?.transcript || '');
      await fetchMeeting();
    } catch (err) {
      console.error('Failed to analyze meeting:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCreateTaskFromAction = async (actionId) => {
    try {
      await createTaskFromActionItem(meetingId, actionId);
      await fetchMeeting();
    } catch (err) {
      console.error('Failed to convert action item to task:', err);
    }
  };

  const handleDeleteMeeting = async () => {
    if (!window.confirm('Are you sure you want to delete this meeting?')) return;
    try {
      await deleteMeeting(meetingId);
      navigate('/meetings');
    } catch (err) {
      console.error('Failed to delete meeting:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
          <p className="text-xs text-[#94A3B8]">Loading meeting data from MongoDB...</p>
        </div>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="max-w-4xl mx-auto py-10 space-y-4">
        <Link to="/meetings" className="inline-flex items-center gap-1.5 text-xs font-medium text-[#94A3B8] hover:text-white">
          <ArrowLeft className="w-4 h-4" /> Back to Meetings
        </Link>
        <Card className="border-rose-500/30 bg-rose-500/10">
          <CardContent className="p-6 text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
            <h3 className="text-base font-semibold text-white">Meeting Not Found</h3>
            <p className="text-xs text-rose-200">{error || 'The requested meeting could not be retrieved.'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const eventTitle = typeof meeting.event === 'object' && meeting.event !== null
    ? (meeting.event.title || meeting.event.name || 'Standalone Meeting')
    : (meeting.event || 'Standalone Meeting');

  const participantsList = Array.isArray(meeting.participants)
    ? meeting.participants
    : [];

  const participantsCount = participantsList.length;

  const formattedDate = meeting.scheduledAt
    ? new Date(meeting.scheduledAt).toLocaleDateString()
    : (meeting.date || '—');

  const formattedTime = meeting.scheduledAt
    ? new Date(meeting.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : (meeting.startTime || '—');

  const processingStatus = meeting.aiProcessed || meeting.actionItemsExtracted
    ? 'Processed'
    : (meeting.processingStatus || 'Not Processed');

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
          <Badge variant="neutral">ID: #{meeting._id ? meeting._id.substring(0, 8) : meetingId}</Badge>
          <Badge variant="primary" dot>MongoDB Connected</Badge>
        </div>
      </div>

      {/* Header Card */}
      <Card className="border-[#263247] bg-[#151D2E] shadow-xl">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <MeetingProcessingBadge status={processingStatus} size="sm" />
                <span className="text-xs text-[#64748B]">•</span>
                <span className="inline-flex items-center gap-1 text-xs text-[#94A3B8]">
                  <Tag className="w-3.5 h-3.5 text-[#818CF8]" />
                  <span>Meeting Type: {meeting.type || 'Planning'}</span>
                </span>
                {(meeting.aiProcessed || meeting.actionItemsExtracted) && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gradient-to-r from-[#6366F1]/20 to-[#8B5CF6]/20 text-[#A78BFA] text-[11px] border border-[#8B5CF6]/30 font-medium">
                    <Sparkles className="w-2.5 h-2.5 text-[#A78BFA]" />
                    <span>AI Analyzed</span>
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {meeting.title || 'Untitled Meeting'}
              </h1>

              <p className="text-xs sm:text-sm text-[#94A3B8] max-w-2xl leading-relaxed">
                {meeting.description || (meeting.agenda?.length ? meeting.agenda.join(' • ') : 'Capture decisions, action items, and important context from this club meeting.')}
              </p>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-2.5 flex-wrap">
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
                className="text-rose-400 hover:text-rose-300 hover:border-rose-500/40"
                onClick={handleDeleteMeeting}
                leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              >
                Delete
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
              <p className="text-sm font-semibold text-white font-mono">{formattedDate} {formattedTime !== '—' ? `@ ${formattedTime}` : ''}</p>
            </div>

            <div className="p-3 rounded-lg bg-[#111827] border border-[#263247]">
              <div className="flex items-center gap-2 text-xs text-[#94A3B8] mb-1">
                <Tag className="w-3.5 h-3.5 text-[#818CF8]" />
                <span>Associated Event</span>
              </div>
              <p className="text-sm font-semibold text-white truncate">{eventTitle}</p>
            </div>

            <div className="p-3 rounded-lg bg-[#111827] border border-[#263247]">
              <div className="flex items-center gap-2 text-xs text-[#94A3B8] mb-1">
                <MapPin className="w-3.5 h-3.5 text-[#818CF8]" />
                <span>Location</span>
              </div>
              <p className="text-sm font-semibold text-white truncate">{meeting.location || 'Online'}</p>
            </div>

            <div className="p-3 rounded-lg bg-[#111827] border border-[#263247]">
              <div className="flex items-center gap-2 text-xs text-[#94A3B8] mb-1">
                <Users className="w-3.5 h-3.5 text-[#818CF8]" />
                <span>Participants</span>
              </div>
              <p className="text-sm font-semibold text-white">{participantsCount} Participant{participantsCount === 1 ? '' : 's'}</p>
            </div>
          </div>

          {/* Agenda & Notes */}
          {Array.isArray(meeting.agenda) && meeting.agenda.length > 0 && (
            <div className="p-4 rounded-xl bg-[#111827] border border-[#263247] space-y-2">
              <h4 className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
                Meeting Agenda
              </h4>
              <ul className="space-y-1 text-xs text-white">
                {meeting.agenda.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    <span>{typeof item === 'object' ? item.title || item.name : item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Workspace Grid: Notes & AI Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Notes & Transcript (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <MeetingNotesPanel
            initialNotes={meeting.notes || ''}
            onSaveNotes={handleSaveNotes}
          />
          <MeetingSummary
            summary={meeting.summary || meeting.aiSummary || null}
            keyDecisions={meeting.decisions || []}
            discussionPoints={meeting.discussionPoints || []}
          />
          <MeetingDecisions decisions={meeting.decisions || []} />
        </div>

        {/* Right Column: AI Intelligence & Action Items (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <MeetingIntelligencePanel
            processingStatus={analyzing ? 'Processing' : (meeting.aiProcessed ? 'Completed' : 'Ready')}
            onAnalyze={handleAnalyzeMeeting}
          />
          <MeetingActionItems
            actionItems={meeting.extractedItems || []}
            onCreateTask={handleCreateTaskFromAction}
          />
          <MeetingRiskInsights risks={meeting.risks || []} />
          <MeetingQuickActions
            onNewMeeting={() => setIsEditModalOpen(true)}
            onAddNotes={() => {
              window.scrollTo({ top: 350, behavior: 'smooth' });
            }}
            onUploadTranscript={() => {
              window.scrollTo({ top: 350, behavior: 'smooth' });
            }}
            onAnalyzeMeeting={handleAnalyzeMeeting}
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
        onSave={async (payload) => {
          await updateMeeting(meetingId, payload);
          await fetchMeeting();
        }}
      />
    </div>
  );
}

