import React, { useState } from 'react';
import { Calendar, MapPin, Users, FileText, Clock, AlertCircle } from 'lucide-react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { createEvent } from '../../services/api/events';

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

export default function CreateEventModal({ isOpen, onClose, onSave }) {
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
  const [apiError, setApiError] = useState(null);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setApiError(null);

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.type || 'Technical',
        status: formData.status ? formData.status.toLowerCase() : 'planning',
        startDate: formData.startDate ? new Date(`${formData.startDate}T${formData.startTime || '09:00'}`).toISOString() : null,
        endDate: formData.endDate ? new Date(`${formData.endDate}T${formData.endTime || '18:00'}`).toISOString() : null,
        location: formData.location.trim(),
        venue: formData.location.trim(),
      };

      if (onSave) {
        await onSave(payload);
      } else {
        await createEvent(payload);
      }
      handleModalClose();
    } catch (err) {
      console.error('Failed to create event:', err);
      setApiError(err.response?.data?.message || err.message || 'Failed to create event');
    } finally {
      setIsSubmitting(false);
    }
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
    setApiError(null);
    setIsSubmitting(false);
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
              Create Event
            </Button>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {apiError && (
          <div className="p-3 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 text-xs text-[#F87171] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{apiError}</span>
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
            type="date"
            label="Start Date *"
            value={formData.startDate}
            onChange={(e) => handleChange('startDate', e.target.value)}
            error={errors.startDate}
            disabled={isSubmitting}
          />
          <Input
            type="time"
            label="Start Time *"
            value={formData.startTime}
            onChange={(e) => handleChange('startTime', e.target.value)}
            error={errors.startTime}
            disabled={isSubmitting}
          />
        </div>

        {/* End Date & Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            type="date"
            label="End Date *"
            value={formData.endDate}
            onChange={(e) => handleChange('endDate', e.target.value)}
            error={errors.endDate}
            disabled={isSubmitting}
          />
          <Input
            type="time"
            label="End Time *"
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
            placeholder="e.g. Auditorium / Main Hall"
            value={formData.location}
            onChange={(e) => handleChange('location', e.target.value)}
            disabled={isSubmitting}
          />
          <Input
            type="number"
            label="Target Volunteer Count"
            placeholder="e.g. 15"
            value={formData.expectedVolunteers}
            onChange={(e) => handleChange('expectedVolunteers', e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        {/* Additional Planning Notes */}
        <Textarea
          label="Internal Planning Notes"
          placeholder="Key sponsors, equipment requirements, special logistics..."
          rows={2}
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          disabled={isSubmitting}
        />
      </form>
    </Modal>
  );
}
