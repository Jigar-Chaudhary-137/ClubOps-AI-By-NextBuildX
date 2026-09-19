import React, { useState } from 'react';
import { ShieldAlert, Sparkles, CheckCircle2, Calendar, User, Tag, AlertTriangle } from 'lucide-react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';
import Button from '../ui/Button';

const categoryOptions = [
  { value: 'Logistics', label: 'Logistics' },
  { value: 'People', label: 'People' },
  { value: 'Technical', label: 'Technical' },
  { value: 'Financial', label: 'Financial' },
  { value: 'Compliance', label: 'Compliance' },
  { value: 'Communication', label: 'Communication' },
  { value: 'Venue', label: 'Venue' },
  { value: 'Security', label: 'Security' },
  { value: 'Other', label: 'Other' }
];

const eventOptions = [
  { value: '', label: 'Select event' },
  { value: 'none', label: 'General / No Event' }
];

const severityOptions = [
  { value: 'Critical', label: 'Critical' },
  { value: 'High', label: 'High' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Low', label: 'Low' }
];

const levelOptions = [
  { value: 'Low', label: 'Low' },
  { value: 'Medium', label: 'Medium' },
  { value: 'High', label: 'High' }
];

const statusOptions = [
  { value: 'Open', label: 'Open' },
  { value: 'Monitoring', label: 'Monitoring' },
  { value: 'Mitigated', label: 'Mitigated' },
  { value: 'Accepted', label: 'Accepted' },
  { value: 'Closed', label: 'Closed' }
];

export default function CreateRiskModal({
  isOpen,
  onClose
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Logistics',
    event: '',
    severity: 'Medium',
    probability: 'Medium',
    impact: 'Medium',
    status: 'Open',
    owner: '',
    mitigationPlan: '',
    targetResolutionDate: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackNotice, setFeedbackNotice] = useState(false);

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
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    if (!formData.severity) {
      newErrors.severity = 'Severity is required';
    }
    if (!formData.probability) {
      newErrors.probability = 'Probability is required';
    }
    if (!formData.impact) {
      newErrors.impact = 'Impact is required';
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
      setFeedbackNotice(true);

      setTimeout(() => {
        setFeedbackNotice(false);
        handleModalClose();
      }, 2500);
    }, 500);
  };

  const handleModalClose = () => {
    setFormData({
      title: '',
      description: '',
      category: 'Logistics',
      event: '',
      severity: 'Medium',
      probability: 'Medium',
      impact: 'Medium',
      status: 'Open',
      owner: '',
      mitigationPlan: '',
      targetResolutionDate: ''
    });
    setErrors({});
    setIsSubmitting(false);
    setFeedbackNotice(false);
    onClose?.();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      title="Create Risk"
      description="Identify and assess an operational risk to safeguard club activities."
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
              Create Risk
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
            Risk creation will be connected when the backend API is available. Local validation is operational.
          </div>
        </div>

        {feedbackNotice && (
          <div className="p-3 rounded-lg bg-[#22C55E]/10 border border-[#22C55E]/30 text-xs text-[#4ADE80] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Risk creation will be connected when the backend API is available.</span>
          </div>
        )}

        {/* Risk Title */}
        <Input
          label="Risk Title *"
          placeholder="e.g. Venue equipment may not arrive on time"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          error={errors.title}
          disabled={isSubmitting}
        />

        {/* Category & Event */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Category *"
            options={categoryOptions}
            value={formData.category}
            onChange={(e) => handleChange('category', e.target.value)}
            error={errors.category}
            disabled={isSubmitting}
          />
          <Select
            label="Event"
            options={eventOptions}
            value={formData.event}
            onChange={(e) => handleChange('event', e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        {/* Severity, Probability & Impact */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Severity *"
            options={severityOptions}
            value={formData.severity}
            onChange={(e) => handleChange('severity', e.target.value)}
            error={errors.severity}
            disabled={isSubmitting}
          />
          <Select
            label="Probability *"
            options={levelOptions}
            value={formData.probability}
            onChange={(e) => handleChange('probability', e.target.value)}
            error={errors.probability}
            disabled={isSubmitting}
          />
          <Select
            label="Impact *"
            options={levelOptions}
            value={formData.impact}
            onChange={(e) => handleChange('impact', e.target.value)}
            error={errors.impact}
            disabled={isSubmitting}
          />
        </div>

        {/* Description */}
        <Textarea
          label="Description"
          placeholder="Describe the operational risk in detail..."
          rows={3}
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          disabled={isSubmitting}
        />

        {/* Owner & Target Resolution Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Risk Owner"
            placeholder="Assign owner name or role..."
            leftIcon={<User className="w-4 h-4 text-[#818CF8]" />}
            value={formData.owner}
            onChange={(e) => handleChange('owner', e.target.value)}
            disabled={isSubmitting}
          />
          <Input
            label="Target Resolution Date"
            type="date"
            value={formData.targetResolutionDate}
            onChange={(e) => handleChange('targetResolutionDate', e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        {/* Mitigation Plan */}
        <Textarea
          label="Mitigation Plan"
          placeholder="Describe the actions planned to reduce or control this risk..."
          rows={3}
          value={formData.mitigationPlan}
          onChange={(e) => handleChange('mitigationPlan', e.target.value)}
          disabled={isSubmitting}
        />
      </form>
    </Modal>
  );
}
