import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Users, Sparkles, X, Plus, AlertCircle, CheckCircle2 } from 'lucide-react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';
import Button from '../ui/Button';

const meetingTypeOptions = [
  { value: 'Planning', label: 'Planning' },
  { value: 'Review', label: 'Review' },
  { value: 'Team Meeting', label: 'Team Meeting' },
  { value: 'Committee', label: 'Committee' },
  { value: 'Emergency', label: 'Emergency' },
  { value: 'Other', label: 'Other' }
];

const eventOptions = [
  { value: '', label: 'Select event' },
  { value: 'none', label: 'None / Standalone' }
];

export default function CreateMeetingModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    title: '',
    event: '',
    type: 'Planning',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    agenda: '',
    notes: ''
  });

  const [participants, setParticipants] = useState([]);
  const [participantInput, setParticipantInput] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationSuccessNote, setValidationSuccessNote] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleAddParticipant = (e) => {
    e?.preventDefault();
    const trimmed = participantInput.trim();
    if (!trimmed) return;
    if (!participants.includes(trimmed)) {
      setParticipants((prev) => [...prev, trimmed]);
    }
    setParticipantInput('');
  };

  const handleRemoveParticipant = (indexToRemove) => {
    setParticipants((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleParticipantKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddParticipant();
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Meeting Title is required';
    }
    if (!formData.date) {
      newErrors.date = 'Meeting Date is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    // Simulate local validation
    setTimeout(() => {
      setIsSubmitting(false);
      setValidationSuccessNote(true);

      setTimeout(() => {
        setValidationSuccessNote(false);
        handleModalClose();
      }, 2400);
    }, 500);
  };

  const handleModalClose = () => {
    setFormData({
      title: '',
      event: '',
      type: 'Planning',
      date: '',
      startTime: '',
      endTime: '',
      location: '',
      agenda: '',
      notes: ''
    });
    setParticipants([]);
    setParticipantInput('');
    setErrors({});
    setIsSubmitting(false);
    setValidationSuccessNote(false);
    onClose?.();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      title="Create Meeting"
      description="Schedule a meeting to capture discussion notes, action items, and risks."
      size="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <span className="text-xs text-[#64748B]">
            * Required fields
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="md"
              onClick={handleModalClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleSubmit}
              isLoading={isSubmitting}
            >
              Create Meeting
            </Button>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Backend Integration Info Banner */}
        <div className="p-3 rounded-lg bg-[#111827] border border-[#263247] text-xs text-[#94A3B8] leading-relaxed flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-[#8B5CF6] shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-white">Integration Status:</span>{' '}
            Meeting creation will be connected to the backend in the next integration phase. Local validation is fully operational.
          </div>
        </div>

        {validationSuccessNote && (
          <div className="p-3 rounded-lg bg-[#22C55E]/10 border border-[#22C55E]/30 text-xs text-[#4ADE80] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Meeting creation will be connected to the backend in the next integration phase.</span>
          </div>
        )}

        {/* Meeting Title */}
        <Input
          label="Meeting Title *"
          placeholder="e.g. TechFest Planning Meeting"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          error={errors.title}
          disabled={isSubmitting}
        />

        {/* Event & Meeting Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Event"
            options={eventOptions}
            value={formData.event}
            onChange={(e) => handleChange('event', e.target.value)}
            disabled={isSubmitting}
          />
          <Select
            label="Meeting Type"
            options={meetingTypeOptions}
            value={formData.type}
            onChange={(e) => handleChange('type', e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        {/* Date, Start Time & End Time */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Date *"
            type="date"
            value={formData.date}
            onChange={(e) => handleChange('date', e.target.value)}
            error={errors.date}
            disabled={isSubmitting}
          />
          <Input
            label="Start Time"
            type="time"
            value={formData.startTime}
            onChange={(e) => handleChange('startTime', e.target.value)}
            disabled={isSubmitting}
          />
          <Input
            label="End Time"
            type="time"
            value={formData.endTime}
            onChange={(e) => handleChange('endTime', e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        {/* Location */}
        <Input
          label="Location"
          placeholder="e.g. Conference Room / Online"
          leftIcon={<MapPin className="w-4 h-4" />}
          value={formData.location}
          onChange={(e) => handleChange('location', e.target.value)}
          disabled={isSubmitting}
        />

        {/* Participants Input */}
        <div>
          <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
            Participants
          </label>
          <div className="flex gap-2 mb-2">
            <Input
              placeholder="Type participant name or email and press Enter..."
              value={participantInput}
              onChange={(e) => setParticipantInput(e.target.value)}
              onKeyDown={handleParticipantKeyDown}
              disabled={isSubmitting}
              className="flex-1"
            />
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={handleAddParticipant}
              disabled={!participantInput.trim() || isSubmitting}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Add
            </Button>
          </div>

          {participants.length > 0 && (
            <div className="flex flex-wrap gap-1.5 p-2.5 rounded-lg bg-[#111827] border border-[#263247]">
              {participants.map((p, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#151D2E] text-white text-xs border border-[#263247]"
                >
                  <Users className="w-3 h-3 text-[#818CF8]" />
                  <span>{p}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveParticipant(idx)}
                    className="text-[#94A3B8] hover:text-[#F87171] ml-0.5"
                    disabled={isSubmitting}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Agenda */}
        <Textarea
          label="Agenda"
          placeholder="What should this meeting cover?"
          rows={3}
          value={formData.agenda}
          onChange={(e) => handleChange('agenda', e.target.value)}
          disabled={isSubmitting}
        />

        {/* Notes */}
        <Textarea
          label="Notes"
          placeholder="Additional meeting notes..."
          rows={3}
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          disabled={isSubmitting}
        />
      </form>
    </Modal>
  );
}
