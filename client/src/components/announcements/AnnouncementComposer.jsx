import React, { useState } from 'react';
import { Send, Clock, Sparkles, CheckCircle2, AlertCircle, FileText, Users, Radio, Calendar } from 'lucide-react';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';
import Button from '../ui/Button';
import AnnouncementAudienceSelector from './AnnouncementAudienceSelector';
import AnnouncementChannelSelector from './AnnouncementChannelSelector';
import AnnouncementSchedule from './AnnouncementSchedule';
import AnnouncementPreview from './AnnouncementPreview';

const eventOptions = [
  { value: '', label: 'Select event (optional)' },
  { value: 'none', label: 'No Specific Event' }
];

export default function AnnouncementComposer({
  initialData = {},
  onSubmit,
  onCancel,
  className = ''
}) {
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    message: initialData.message || '',
    audience: initialData.audience || 'Entire Club',
    channel: initialData.channel || 'In-App',
    event: initialData.event || '',
    scheduleType: initialData.scheduleType || 'now',
    scheduledDate: initialData.scheduledDate || '',
    scheduledTime: initialData.scheduledTime || ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState(null);

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Announcement title is required.';
    }
    if (!formData.message.trim()) {
      newErrors.message = 'Message content is required.';
    }
    if (!formData.audience) {
      newErrors.audience = 'Target audience is required.';
    }
    if (!formData.channel) {
      newErrors.channel = 'Delivery channel is required.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (actionType) => {
    if (!validate()) return;
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setNotice('Announcement creation will be connected when the backend API is available.');
      setTimeout(() => {
        setNotice(null);
        onSubmit?.(formData, actionType);
      }, 2500);
    }, 400);
  };

  const scheduleDisplay = formData.scheduleType === 'later' && formData.scheduledDate
    ? `${formData.scheduledDate} ${formData.scheduledTime}`.trim()
    : 'Immediate';

  return (
    <div className={`space-y-6 ${className}`}>
      {notice && (
        <div className="p-3.5 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/30 text-xs text-[#4ADE80] flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* 1. Content Section */}
      <div className="p-5 rounded-xl bg-[#151D2E] border border-[#263247] space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-[#263247]/60">
          <FileText className="w-4 h-4 text-[#818CF8]" />
          <h3 className="text-sm font-semibold text-white">1. Content</h3>
        </div>

        <Input
          label="Announcement Title *"
          placeholder="e.g. Volunteer briefing for tomorrow's event"
          value={formData.title}
          onChange={(e) => {
            setFormData((p) => ({ ...p, title: e.target.value }));
            if (errors.title) setErrors((p) => ({ ...p, title: null }));
          }}
          error={errors.title}
          disabled={isSubmitting}
        />

        <Textarea
          label="Message *"
          placeholder="Write your announcement..."
          rows={5}
          value={formData.message}
          onChange={(e) => {
            setFormData((p) => ({ ...p, message: e.target.value }));
            if (errors.message) setErrors((p) => ({ ...p, message: null }));
          }}
          error={errors.message}
          disabled={isSubmitting}
        />

        <Select
          label="Linked Event (Optional)"
          options={eventOptions}
          value={formData.event}
          onChange={(e) => setFormData((p) => ({ ...p, event: e.target.value }))}
          disabled={isSubmitting}
        />
      </div>

      {/* 2. Target Audience Section */}
      <div className="p-5 rounded-xl bg-[#151D2E] border border-[#263247] space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-[#263247]/60">
          <Users className="w-4 h-4 text-[#818CF8]" />
          <h3 className="text-sm font-semibold text-white">2. Target Audience</h3>
        </div>

        <AnnouncementAudienceSelector
          selectedAudience={formData.audience}
          onChange={(aud) => setFormData((p) => ({ ...p, audience: aud }))}
        />
        {errors.audience && <p className="text-xs text-[#EF4444]">{errors.audience}</p>}
      </div>

      {/* 3. Delivery Channel Section */}
      <div className="p-5 rounded-xl bg-[#151D2E] border border-[#263247] space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-[#263247]/60">
          <Radio className="w-4 h-4 text-[#818CF8]" />
          <h3 className="text-sm font-semibold text-white">3. Delivery Channel</h3>
        </div>

        <AnnouncementChannelSelector
          selectedChannel={formData.channel}
          onChange={(chan) => setFormData((p) => ({ ...p, channel: chan }))}
        />
        {errors.channel && <p className="text-xs text-[#EF4444]">{errors.channel}</p>}
      </div>

      {/* 4. Scheduling Section */}
      <div className="p-5 rounded-xl bg-[#151D2E] border border-[#263247] space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-[#263247]/60">
          <Clock className="w-4 h-4 text-[#818CF8]" />
          <h3 className="text-sm font-semibold text-white">4. Scheduling</h3>
        </div>

        <AnnouncementSchedule
          scheduleType={formData.scheduleType}
          scheduledDate={formData.scheduledDate}
          scheduledTime={formData.scheduledTime}
          onTypeChange={(t) => setFormData((p) => ({ ...p, scheduleType: t }))}
          onDateChange={(d) => setFormData((p) => ({ ...p, scheduledDate: d }))}
          onTimeChange={(tm) => setFormData((p) => ({ ...p, scheduledTime: tm }))}
        />
      </div>

      {/* 5. Live Preview Section */}
      <AnnouncementPreview
        title={formData.title}
        message={formData.message}
        audience={formData.audience}
        channel={formData.channel}
        scheduled={scheduleDisplay}
      />

      {/* Actions Footer */}
      <div className="flex items-center justify-between gap-3 pt-2">
        {onCancel && (
          <Button
            variant="secondary"
            size="md"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}

        <div className="flex items-center gap-2.5 ml-auto">
          <Button
            variant="outline"
            size="md"
            onClick={() => handleSubmit('draft')}
            disabled={isSubmitting}
          >
            Save Draft
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => handleSubmit('publish')}
            isLoading={isSubmitting}
            leftIcon={<Send className="w-4 h-4" />}
          >
            {formData.scheduleType === 'later' ? 'Schedule Announcement' : 'Publish Announcement'}
          </Button>
        </div>
      </div>
    </div>
  );
}
