import React, { useState } from 'react';
import { Sparkles, Calendar, MapPin, Users, FileText, Clock, AlertCircle } from 'lucide-react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';
import Button from '../ui/Button';

const eventTypeOptions = [
  { value: 'Workshop', label: 'Workshop' },
  { value: 'Hackathon', label: 'Hackathon' },
  { value: 'Seminar', label: 'Seminar' },
  { value: 'Competition', label: 'Competition' },
  { value: 'Cultural', label: 'Cultural' },
  { value: 'Technical', label: 'Technical' },
  { value: 'Meeting', label: 'Meeting' },
  { value: 'Other', label: 'Other' }
];

const eventStatusOptions = [
  { value: 'Planning', label: 'Planning' },
  { value: 'Upcoming', label: 'Upcoming' },
  { value: 'Ongoing', label: 'Ongoing' },
  { value: 'Completed', label: 'Completed' }
];

export default function CreateEventModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Technical',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    location: '',
    status: 'Planning',
    expectedVolunteers: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationSuccessNote, setValidationSuccessNote] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for that field if exists
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Event name is required';
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }
    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
    }

    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      newErrors.endDate = 'End date cannot be earlier than start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    // Simulate frontend validation completion
    setTimeout(() => {
      setIsSubmitting(false);
      setValidationSuccessNote(true);

      setTimeout(() => {
        setValidationSuccessNote(false);
        handleModalClose();
      }, 2000);
    }, 600);
  };

  const handleModalClose = () => {
    setFormData({
      title: '',
      description: '',
      type: 'Technical',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      location: '',
      status: 'Planning',
      expectedVolunteers: '',
      notes: ''
    });
    setErrors({});
    setIsSubmitting(false);
    setValidationSuccessNote(false);
    onClose?.();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      title="Create New Event"
      description="Define event milestones, schedule, and resource requirements"
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
              Validate & Continue
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
            Event creation will be connected to the backend in the next integration phase. Local validation is fully operational.
          </div>
        </div>

        {validationSuccessNote && (
          <div className="p-3 rounded-lg bg-[#22C55E]/10 border border-[#22C55E]/30 text-xs text-[#4ADE80] flex items-center gap-2">
            <span>Form validated successfully. Awaiting database integration in next phase.</span>
          </div>
        )}

        {/* Event Name */}
        <Input
          label="Event Name *"
          placeholder="e.g. TechFest 2026"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          error={errors.title}
          disabled={isSubmitting}
        />

        {/* Description */}
        <Textarea
          label="Description"
          placeholder="Describe the event and its goals..."
          rows={3}
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          disabled={isSubmitting}
        />

        {/* Type & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Event Type"
            options={eventTypeOptions}
            value={formData.type}
            onChange={(e) => handleChange('type', e.target.value)}
            disabled={isSubmitting}
          />
          <Select
            label="Event Status"
            options={eventStatusOptions}
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        {/* Start Date & Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Start Date *"
            type="date"
            value={formData.startDate}
            onChange={(e) => handleChange('startDate', e.target.value)}
            error={errors.startDate}
            disabled={isSubmitting}
          />
          <Input
            label="Start Time *"
            type="time"
            value={formData.startTime}
            onChange={(e) => handleChange('startTime', e.target.value)}
            error={errors.startTime}
            disabled={isSubmitting}
          />
        </div>

        {/* End Date & Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="End Date *"
            type="date"
            value={formData.endDate}
            onChange={(e) => handleChange('endDate', e.target.value)}
            error={errors.endDate}
            disabled={isSubmitting}
          />
          <Input
            label="End Time *"
            type="time"
            value={formData.endTime}
            onChange={(e) => handleChange('endTime', e.target.value)}
            error={errors.endTime}
            disabled={isSubmitting}
          />
        </div>

        {/* Location & Expected Volunteers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Location / Venue"
            placeholder="e.g. Seminar Hall / Auditorium / Online"
            leftIcon={<MapPin className="w-4 h-4" />}
            value={formData.location}
            onChange={(e) => handleChange('location', e.target.value)}
            disabled={isSubmitting}
          />
          <Input
            label="Expected Volunteers"
            type="number"
            min="0"
            placeholder="e.g. 15"
            leftIcon={<Users className="w-4 h-4" />}
            value={formData.expectedVolunteers}
            onChange={(e) => handleChange('expectedVolunteers', e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        {/* Additional Planning Notes */}
        <Textarea
          label="Planning Notes"
          placeholder="Additional planning notes or internal reminders..."
          rows={2}
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          disabled={isSubmitting}
        />
      </form>
    </Modal>
  );
}
