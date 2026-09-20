import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckSquare,
  Square,
  FileText,
  Calendar,
  User,
  Clock,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Plus
} from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';
import Input from '../ui/Input';
import { Card } from '../ui/Card';
import { getMeetings } from '../../services/api/meetings';
import { getEvents } from '../../services/api/events';
import { createTask } from '../../services/api/tasks';
import { aiService } from '../../services/api/ai';
import { normalizeApiError } from '../../services/api/client';

export default function AITaskExtractionModal({
  isOpen,
  onClose,
  onTasksCreated
}) {
  const [sourceType, setSourceType] = useState('text'); // 'text' | 'meeting'
  const [rawText, setRawText] = useState('');
  const [selectedMeetingId, setSelectedMeetingId] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('');

  const [meetings, setMeetings] = useState([]);
  const [events, setEvents] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [selectedIndices, setSelectedIndices] = useState(new Set());

  const [isCreatingTasks, setIsCreatingTasks] = useState(false);
  const [creationSuccess, setCreationSuccess] = useState(null);

  // Load meetings and events on open
  useEffect(() => {
    if (isOpen) {
      let isMounted = true;
      const loadSources = async () => {
        setLoadingData(true);
        try {
          const [meetingsRes, eventsRes] = await Promise.all([
            getMeetings().catch(() => ({ data: [] })),
            getEvents().catch(() => ({ data: [] }))
          ]);

          if (isMounted) {
            const mList = Array.isArray(meetingsRes?.data)
              ? meetingsRes.data
              : (meetingsRes?.data?.meetings || meetingsRes?.meetings || []);
            setMeetings(mList);

            const eList = Array.isArray(eventsRes?.data)
              ? eventsRes.data
              : (eventsRes?.data?.events || eventsRes?.events || []);
            setEvents(eList);
          }
        } finally {
          if (isMounted) setLoadingData(false);
        }
      };
      loadSources();
    }
  }, [isOpen]);

  const handleToggleCandidate = (index) => {
    setSelectedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIndices.size === candidates.length) {
      setSelectedIndices(new Set());
    } else {
      setSelectedIndices(new Set(candidates.map((_, i) => i)));
    }
  };

  const handleExtract = async () => {
    setExtractionError(null);
    setCreationSuccess(null);

    let textToAnalyze = rawText.trim();
    let eventId = selectedEventId || null;

    if (sourceType === 'meeting') {
      if (!selectedMeetingId) {
        setExtractionError('Please select a meeting to extract tasks from.');
        return;
      }
      const meeting = meetings.find((m) => (m._id || m.id) === selectedMeetingId);
      if (meeting) {
        textToAnalyze = [meeting.title, meeting.notes, meeting.transcript, meeting.description]
          .filter(Boolean)
          .join('\n\n');
        if (!eventId && meeting.event) {
          eventId = typeof meeting.event === 'object' ? (meeting.event._id || meeting.event.id) : meeting.event;
        }
      }
    }

    if (!textToAnalyze) {
      setExtractionError('Please provide meeting notes, discussion transcripts, or text.');
      return;
    }

    setIsExtracting(true);
    try {
      const res = await aiService.extractActions({
        text: textToAnalyze,
        eventId
      });

      const items = res?.data?.actionItems || res?.actionItems || res?.data?.extractedItems || [];
      if (items.length === 0) {
        setExtractionError('No actionable task deliverables were detected in the provided text. Try providing more detailed discussion notes.');
        setCandidates([]);
        setSelectedIndices(new Set());
      } else {
        setCandidates(items);
        setSelectedIndices(new Set(items.map((_, i) => i)));
      }
    } catch (err) {
      console.error('AI Extraction Error:', err);
      setExtractionError(normalizeApiError(err, 'Failed to extract tasks. Please verify AI service configuration.'));
    } finally {
      setIsExtracting(false);
    }
  };

  const handleCreateSelectedTasks = async () => {
    if (selectedIndices.size === 0) return;

    setIsCreatingTasks(true);
    setExtractionError(null);

    const tasksToCreate = Array.from(selectedIndices).map((idx) => candidates[idx]);
    let successCount = 0;
    let failedCount = 0;

    for (const item of tasksToCreate) {
      try {
        const payload = {
          title: item.title,
          description: item.description || `Extracted via AI from ${sourceType === 'meeting' ? 'meeting notes' : 'discussion text'}`,
          priority: item.priority ? String(item.priority).toLowerCase() : 'medium',
          event: selectedEventId || null,
          dueDate: item.deadline ? new Date(item.deadline).toISOString() : null,
          status: 'todo',
          aiGenerated: true
        };

        await createTask(payload);
        successCount++;
      } catch (err) {
        console.warn('Failed to create task:', item.title, err.message);
        failedCount++;
      }
    }

    setIsCreatingTasks(false);

    if (successCount > 0) {
      setCreationSuccess(`Successfully created ${successCount} task${successCount > 1 ? 's' : ''} in your workspace.`);
      if (onTasksCreated) {
        await onTasksCreated();
      }
      setTimeout(() => {
        handleModalClose();
      }, 1200);
    } else {
      setExtractionError(`Failed to save extracted tasks to database.`);
    }
  };

  const handleModalClose = () => {
    setRawText('');
    setSelectedMeetingId('');
    setSelectedEventId('');
    setCandidates([]);
    setSelectedIndices(new Set());
    setExtractionError(null);
    setCreationSuccess(null);
    setIsExtracting(false);
    setIsCreatingTasks(false);
    onClose?.();
  };

  const meetingOptions = [
    { value: '', label: 'Select a meeting...' },
    ...meetings.map((m) => ({
      value: m._id || m.id,
      label: `${m.title} (${m.scheduledAt ? new Date(m.scheduledAt).toLocaleDateString() : 'Recent'})`
    }))
  ];

  const eventOptions = [
    { value: '', label: 'None / General Club Task' },
    ...events.map((e) => ({
      value: e._id || e.id,
      label: e.title || e.name || 'Untitled Event'
    }))
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      title="Ask AI to Extract Tasks"
      description="Extract operational action items and deliverables directly into active tasks."
      size="xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <span className="text-xs text-[#64748B]">
            {candidates.length > 0
              ? `${selectedIndices.size} of ${candidates.length} tasks selected`
              : 'AI Work Breakdown Extraction'}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="md"
              onClick={handleModalClose}
              disabled={isExtracting || isCreatingTasks}
            >
              Cancel
            </Button>

            {candidates.length > 0 ? (
              <Button
                variant="primary"
                size="md"
                onClick={handleCreateSelectedTasks}
                isLoading={isCreatingTasks}
                disabled={selectedIndices.size === 0 || isExtracting}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Create Selected Tasks ({selectedIndices.size})
              </Button>
            ) : (
              <Button
                variant="ai"
                size="md"
                onClick={handleExtract}
                isLoading={isExtracting}
                leftIcon={<Sparkles className="w-4 h-4" />}
              >
                Analyze & Extract
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Source Switcher */}
        <div className="flex items-center p-1 rounded-xl bg-[#111827] border border-[#263247]">
          <button
            type="button"
            onClick={() => { setSourceType('text'); setCandidates([]); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              sourceType === 'text'
                ? 'bg-[#1E293B] text-white shadow-sm'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            <span>Paste Notes / Transcript</span>
          </button>

          <button
            type="button"
            onClick={() => { setSourceType('meeting'); setCandidates([]); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              sourceType === 'meeting'
                ? 'bg-[#1E293B] text-white shadow-sm'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>Select Existing Meeting ({meetings.length})</span>
          </button>
        </div>

        {/* Source Inputs */}
        {sourceType === 'meeting' ? (
          <div className="space-y-3 p-4 rounded-xl bg-[#111827] border border-[#263247]">
            <Select
              label="Choose Meeting Source *"
              options={meetingOptions}
              value={selectedMeetingId}
              onChange={(e) => setSelectedMeetingId(e.target.value)}
              disabled={isExtracting || loadingData}
            />
            {selectedMeetingId && (
              <p className="text-[11px] text-gray-400">
                AI will inspect the selected meeting notes, agenda, and transcripts to extract action items.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <Textarea
              label="Meeting Notes, Discussion Summary, or Transcript *"
              placeholder="Paste raw discussion notes, meeting minutes, or action item list..."
              rows={5}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              disabled={isExtracting}
            />
          </div>
        )}

        {/* Associated Event */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Associate With Event (Optional)"
            options={eventOptions}
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            disabled={isExtracting || loadingData}
          />
        </div>

        {/* Error / Success feedback */}
        {extractionError && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed font-medium">{extractionError}</div>
          </div>
        )}

        {creationSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{creationSuccess}</span>
          </div>
        )}

        {/* Extracting Indicator */}
        {isExtracting && (
          <div className="py-8 text-center text-xs text-gray-400 flex flex-col items-center justify-center gap-2 bg-[#111827] rounded-xl border border-[#263247]">
            <RefreshCw className="w-5 h-5 animate-spin text-indigo-400" />
            <span className="font-medium text-white">AI is extracting action items...</span>
            <span className="text-[11px] text-gray-500">Detecting deliverable scope, owners, priorities, and deadlines.</span>
          </div>
        )}

        {/* Extracted Candidates Review Grid */}
        {candidates.length > 0 && !isExtracting && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between pb-1 border-b border-[#263247]">
              <h4 className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Extracted Task Candidates ({candidates.length})</span>
              </h4>
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-xs font-medium text-indigo-400 hover:text-indigo-300"
              >
                {selectedIndices.size === candidates.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {candidates.map((item, idx) => {
                const isChecked = selectedIndices.has(idx);
                const priority = (item.priority || 'medium').toLowerCase();

                const priorityColor =
                  priority === 'urgent'
                    ? 'text-rose-400 bg-rose-500/15 border-rose-500/30'
                    : priority === 'high'
                    ? 'text-amber-400 bg-amber-500/15 border-amber-500/30'
                    : priority === 'low'
                    ? 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30'
                    : 'text-indigo-400 bg-indigo-500/15 border-indigo-500/30';

                return (
                  <div
                    key={idx}
                    onClick={() => handleToggleCandidate(idx)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                      isChecked
                        ? 'bg-[#1E293B]/70 border-indigo-500/50'
                        : 'bg-[#111827] border-[#263247] opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div className="mt-0.5 text-indigo-400 shrink-0">
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 fill-indigo-500/20" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-500" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white leading-snug">
                        {item.title}
                      </p>
                      {item.description && (
                        <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-2">
                          {item.description}
                        </p>
                      )}

                      <div className="flex items-center gap-2 mt-2 flex-wrap text-[10px]">
                        <span className={`px-2 py-0.5 rounded-md border font-medium uppercase tracking-wider ${priorityColor}`}>
                          {item.priority || 'Medium'}
                        </span>

                        {item.assignedTo && (
                          <span className="inline-flex items-center gap-1 text-gray-300 bg-[#151D2E] px-2 py-0.5 rounded-md border border-[#263247]">
                            <User className="w-2.5 h-2.5 text-indigo-400" />
                            {typeof item.assignedTo === 'object' ? item.assignedTo.name : item.assignedTo}
                          </span>
                        )}

                        {item.deadline && (
                          <span className="inline-flex items-center gap-1 text-gray-400 bg-[#151D2E] px-2 py-0.5 rounded-md border border-[#263247]">
                            <Clock className="w-2.5 h-2.5 text-amber-400" />
                            {item.deadline}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
