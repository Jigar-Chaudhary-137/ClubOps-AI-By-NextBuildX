import React, { useState } from 'react';
import { UserPlus, Sparkles, Plus, AlertCircle } from 'lucide-react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';
import Button from '../ui/Button';
import SkillTag from './SkillTag';
import { createVolunteer } from '../../services/api/volunteers';

const roleOptions = [
  { value: 'Volunteer', label: 'Volunteer' },
  { value: 'Coordinator', label: 'Coordinator' },
  { value: 'Organizer', label: 'Organizer' }
];

const availabilityOptions = [
  { value: 'Available', label: 'Available' },
  { value: 'Busy', label: 'Busy' },
  { value: 'Unavailable', label: 'Unavailable' }
];

const preferredEventTypeOptions = [
  { value: '', label: 'Select Preferred Event Type (Optional)' },
  { value: 'Workshop', label: 'Workshop' },
  { value: 'Hackathon', label: 'Hackathon' },
  { value: 'Seminar', label: 'Seminar' },
  { value: 'Competition', label: 'Competition' },
  { value: 'Cultural', label: 'Cultural' },
  { value: 'Technical', label: 'Technical' },
  { value: 'Other', label: 'Other' }
];

export default function AddVolunteerModal({ isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Volunteer',
    availability: 'Available',
    preferredEventType: '',
    notes: ''
  });

  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (!trimmed) return;
    if (!skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
    }
    setSkillInput('');
  };

  const handleKeyDownSkill = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = 'Please enter a valid email address';
      }
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
        ...formData,
        skills
      };
      let result;
      if (onSave) {
        result = await onSave(payload);
      } else {
        result = await createVolunteer(payload);
      }
      handleModalClose();
    } catch (err) {
      setApiError(err.response?.data?.message || err.message || 'Failed to create volunteer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'Volunteer',
      availability: 'Available',
      preferredEventType: '',
      notes: ''
    });
    setSkills([]);
    setSkillInput('');
    setErrors({});
    setIsSubmitting(false);
    setApiError(null);
    onClose?.();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      title="Add Club Volunteer"
      description="Register member capabilities, contact details, role, and availability"
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
              Add Volunteer
            </Button>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {apiError && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{apiError}</span>
          </div>
        )}

        {/* Full Name & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Full Name *"
            placeholder="e.g. Rahul Sharma"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            error={errors.name}
            disabled={isSubmitting}
          />

          <Input
            label="Email Address *"
            type="email"
            placeholder="volunteer@example.com"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            error={errors.email}
            disabled={isSubmitting}
          />
        </div>

        {/* Phone & Role */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Phone Number"
            type="tel"
            placeholder="+91 XXXXX XXXXX"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            disabled={isSubmitting}
          />

          <Select
            label="Role"
            options={roleOptions}
            value={formData.role}
            onChange={(e) => handleChange('role', e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        {/* Availability & Preferred Event Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Availability"
            options={availabilityOptions}
            value={formData.availability}
            onChange={(e) => handleChange('availability', e.target.value)}
            disabled={isSubmitting}
          />

          <Select
            label="Preferred Event Type"
            options={preferredEventTypeOptions}
            value={formData.preferredEventType}
            onChange={(e) => handleChange('preferredEventType', e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        {/* Skills Tag Input */}
        <div>
          <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
            Skills & Competencies
          </label>
          <div className="flex gap-2">
            <Input
              placeholder="Add a skill (e.g. Design, Logistics, Python)..."
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={handleKeyDownSkill}
              disabled={isSubmitting}
              className="flex-1"
            />
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={handleAddSkill}
              disabled={isSubmitting || !skillInput.trim()}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Add
            </Button>
          </div>

          {skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5 p-2 rounded-lg bg-[#111827] border border-[#263247]/60">
              {skills.map((skill) => (
                <SkillTag
                  key={skill}
                  skill={skill}
                  onRemove={handleRemoveSkill}
                />
              ))}
            </div>
          )}
        </div>

        {/* Additional Notes */}
        <Textarea
          label="Notes / Availability Details"
          placeholder="Additional information about this volunteer..."
          rows={3}
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          disabled={isSubmitting}
        />
      </form>
    </Modal>
  );
}
