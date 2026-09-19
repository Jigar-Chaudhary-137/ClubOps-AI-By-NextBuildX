import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { createRisk } from '../../services/api/risks';

const categoryOptions = [
  { value: 'Logistics', label: 'Logistics & Venue' },
  { value: 'Budget', label: 'Budget & Finance' },
  { value: 'Technical', label: 'Technical & Equipment' },
  { value: 'Volunteers', label: 'Volunteers & Staffing' },
  { value: 'Permissions', label: 'Permissions & Approvals' },
  { value: 'Marketing', label: 'Marketing & Turnout' },
  { value: 'Safety', label: 'Safety & Compliance' },
  { value: 'Other', label: 'Other' }
];

const severityOptions = [
  { value: 'Low', label: 'Low — Minor inconvenience' },
  { value: 'Medium', label: 'Medium — Moderate impact' },
  { value: 'High', label: 'High — Significant bottleneck' },
  { value: 'Critical', label: 'Critical — Event showstopper' }
];

const statusOptions = [
  { value: 'Identified', label: 'Identified' },
  { value: 'Mitigating', label: 'Mitigating' },
  { value: 'Monitoring', label: 'Monitoring' },
  { value: 'Resolved', label: 'Resolved' }
];

export default function CreateRiskModal({ isOpen, onClose, onSave, events = [] }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Logistics',
    severity: 'Medium',
    status: 'Identified',
    event: '',
    owner: '',
    mitigationPlan: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);

  const eventOptions = [
    { value: '', label: 'Select event (optional)' },
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
      newErrors.title = 'Risk title is required';
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
        category: formData.category ? formData.category.toLowerCase() : 'operational',
        severity: formData.severity ? formData.severity.toLowerCase() : 'medium',
        status: formData.status ? formData.status.toLowerCase() : 'identified',
        event: formData.event || null,
        mitigationPlan: formData.mitigationPlan.trim()
      };

      if (onSave) {
        await onSave(payload);
      } else {
        await createRisk(payload);
      }
      handleModalClose();
    } catch (err) {
      console.error('Failed to create risk:', err);
      setApiError(err.response?.data?.message || err.message || 'Failed to create risk');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setFormData({
      title: '',
      description: '',
      category: 'Logistics',
      severity: 'Medium',
      status: 'Identified',
      event: '',
      owner: '',
      mitigationPlan: ''
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
      title="Log Operational Risk"
      description="Identify hazards, evaluate impact severity, and document mitigation strategy"
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
              Create Risk
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

        {/* Title */}
        <Input
          label="Risk Title *"
          placeholder="e.g. Venue audio system failure during keynote"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          error={errors.title}
          disabled={isSubmitting}
        />

        {/* Description */}
        <Textarea
          label="Description & Context"
          placeholder="Describe why this risk might occur and potential operational impact..."
          rows={3}
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          disabled={isSubmitting}
        />

        {/* Category & Severity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Risk Category"
            options={categoryOptions}
            value={formData.category}
            onChange={(e) => handleChange('category', e.target.value)}
            disabled={isSubmitting}
          />
          <Select
            label="Severity Level"
            options={severityOptions}
            value={formData.severity}
            onChange={(e) => handleChange('severity', e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        {/* Associated Event & Initial Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Associated Event"
            options={eventOptions}
            value={formData.event}
            onChange={(e) => handleChange('event', e.target.value)}
            disabled={isSubmitting}
          />
          <Select
            label="Initial Status"
            options={statusOptions}
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        {/* Mitigation Plan */}
        <Textarea
          label="Mitigation Plan"
          placeholder="Steps taken or contingency strategy if risk materializes..."
          rows={3}
          value={formData.mitigationPlan}
          onChange={(e) => handleChange('mitigationPlan', e.target.value)}
          disabled={isSubmitting}
        />
      </form>
    </Modal>
  );
}
