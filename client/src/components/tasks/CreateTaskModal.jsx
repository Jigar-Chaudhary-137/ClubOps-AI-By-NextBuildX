import React, { useState } from 'react';
import { Sparkles, Calendar, Clock, User, Tag, AlertCircle } from 'lucide-react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';
import Button from '../ui/Button';

const statusOptions = [
  { value: 'To Do', label: 'To Do' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Blocked', label: 'Blocked' }
];

const priorityOptions = [
  { value: 'Low', label: 'Low Priority' },
  { value: 'Medium', label: 'Medium Priority' },
  { value: 'High', label: 'High Priority' },
  { value: 'Urgent', label: 'Urgent' }
];

const eventOptions = [
  { value: '', label: 'Select event (Optional)' }
];

const assigneeOptions = [
  { value: 'Unassigned', label: 'Unassigned' }
];

export default function CreateTaskModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event: '',
    assignee: 'Unassigned',
    status: 'To Do',
    priority: 'Medium',
    dueDate: '',
    dueTime: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationSuccessNote, setValidationSuccessNote] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setValidationSuccessNote(true);

      setTimeout(() => {
        setValidationSuccessNote(false);
        handleModalClose();
      }, 1800);
    }, 500);
  };

  const handleModalClose = () => {
    setFormData({
      title: '',
      description: '',
      event: '',
      assignee: 'Unassigned',
      status: 'To Do',
      priority: 'Medium',
      dueDate: '',
      dueTime: '',
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
      title="Create Operational Task"
      description="Define task deliverables, priority, assignees, and target deadline"
      size="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <span className="text-xs text-[#64748B]">
            * Required field
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
            Task creation will be connected to the backend in the next integration phase. Local validation is fully operational.
          </div>
        </div>

        {validationSuccessNote && (
          <div className="p-3 rounded-lg bg-[#22C55E]/10 border border-[#22C55E]/30 text-xs text-[#4ADE80] flex items-center gap-2">
            <span>Task form validated successfully. Awaiting database integration in next phase.</span>
          </div>
        )}

        {/* Task Title */}
        <Input
          label="Task Title *"
          placeholder="e.g. Finalize event registration form"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          error={errors.title}
          disabled={isSubmitting}
        />

        {/* Description */}
        <Textarea
          label="Description"
          placeholder="Describe what needs to be completed..."
          rows={3}
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          disabled={isSubmitting}
        />

        {/* Event & Assignee */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Linked Event"
            options={eventOptions}
            value={formData.event}
            onChange={(e) => handleChange('event', e.target.value)}
            disabled={isSubmitting}
          />
          <Select
            label="Assignee"
            options={assigneeOptions}
            value={formData.assignee}
            onChange={(e) => handleChange('assignee', e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        {/* Status & Priority */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Initial Status"
            options={statusOptions}
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value)}
            disabled={isSubmitting}
          />
          <Select
            label="Priority Level"
            options={priorityOptions}
            value={formData.priority}
            onChange={(e) => handleChange('priority', e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        {/* Due Date & Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Due Date"
            type="date"
            value={formData.dueDate}
            onChange={(e) => handleChange('dueDate', e.target.value)}
            disabled={isSubmitting}
          />
          <Input
            label="Due Time"
            type="time"
            value={formData.dueTime}
            onChange={(e) => handleChange('dueTime', e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        {/* Additional Notes */}
        <Textarea
          label="Task Notes / Dependencies"
          placeholder="Additional task notes or dependencies..."
          rows={2}
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          disabled={isSubmitting}
        />
      </form>
    </Modal>
  );
}
