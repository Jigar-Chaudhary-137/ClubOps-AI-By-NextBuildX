import React, { useState } from 'react';
import { Sparkles, AlertCircle } from 'lucide-react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { createTask } from '../../services/api/tasks';

const taskStatusOptions = [
  { value: 'To Do', label: 'To Do' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'In Review', label: 'In Review' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Blocked', label: 'Blocked' }
];

const taskPriorityOptions = [
  { value: 'Low', label: 'Low' },
  { value: 'Medium', label: 'Medium' },
  { value: 'High', label: 'High' },
  { value: 'Urgent', label: 'Urgent' }
];

export default function CreateTaskModal({ isOpen, onClose, onSave, events = [] }) {
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
  const [apiError, setApiError] = useState(null);

  const eventOptions = [
    { value: '', label: 'Select associated event (optional)' },
    ...(events.map((e) => ({ value: e.id || e._id, label: e.name || e.title }))),
  ];

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

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setApiError(null);

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        event: formData.event || null,
        priority: formData.priority ? formData.priority.toLowerCase() : 'medium',
        status: formData.status ? formData.status.toLowerCase().replace(' ', '_') : 'pending',
        dueDate: formData.dueDate ? new Date(`${formData.dueDate}T${formData.dueTime || '18:00'}`).toISOString() : null,
      };

      if (onSave) {
        await onSave(payload);
      } else {
        await createTask(payload);
      }
      handleModalClose();
    } catch (err) {
      console.error('Failed to create task:', err);
      setApiError(err.response?.data?.message || err.message || 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
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
    setApiError(null);
    setIsSubmitting(false);
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
              Create Task
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

        {/* Event Association */}
        <Select
          label="Associated Event"
          options={eventOptions}
          value={formData.event}
          onChange={(e) => handleChange('event', e.target.value)}
          disabled={isSubmitting}
        />

        {/* Priority & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Priority Level"
            options={taskPriorityOptions}
            value={formData.priority}
            onChange={(e) => handleChange('priority', e.target.value)}
            disabled={isSubmitting}
          />
          <Select
            label="Initial Status"
            options={taskStatusOptions}
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        {/* Due Date & Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            type="date"
            label="Due Date"
            value={formData.dueDate}
            onChange={(e) => handleChange('dueDate', e.target.value)}
            disabled={isSubmitting}
          />
          <Input
            type="time"
            label="Due Time"
            value={formData.dueTime}
            onChange={(e) => handleChange('dueTime', e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        {/* Notes */}
        <Textarea
          label="Execution Notes"
          placeholder="Sub-tasks, required credentials, venue keys..."
          rows={2}
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          disabled={isSubmitting}
        />
      </form>
    </Modal>
  );
}
