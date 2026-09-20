import React, { useState, useEffect, useCallback } from 'react';
import { Send, Clock, Sparkles, CheckCircle2, AlertCircle, FileText, Users, Radio, Calendar, RefreshCw, ShieldAlert, Check, ShieldCheck, Zap } from 'lucide-react';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';
import Button from '../ui/Button';
import AnnouncementAudienceSelector from './AnnouncementAudienceSelector';
import AnnouncementChannelSelector from './AnnouncementChannelSelector';
import AnnouncementSchedule from './AnnouncementSchedule';
import AnnouncementPreview from './AnnouncementPreview';
import { previewAnnouncementRecipients } from '../../services/api/announcements';

export default function AnnouncementComposer({
  initialData = {},
  initialPrompt = '',
  events = [],
  onSubmit,
  onCancel,
  className = ''
}) {
  const [formData, setFormData] = useState({
    title: initialData.title || (initialPrompt ? 'AI Generated Announcement' : ''),
    message: initialData.message || initialData.content || initialPrompt || '',
    audiences: Array.isArray(initialData.targetAudiences) && initialData.targetAudiences.length > 0
      ? initialData.targetAudiences
      : (initialData.audience ? [initialData.audience] : ['Entire Club']),
    channels: Array.isArray(initialData.channels) && initialData.channels.length > 0
      ? initialData.channels
      : ['in_app'],
    event: initialData.event || '',
    customUserIds: Array.isArray(initialData.customRecipients)
      ? initialData.customRecipients.map(r => typeof r === 'object' ? r._id : r)
      : [],
    scheduleType: initialData.scheduleType || 'now',
    scheduledDate: initialData.scheduledDate || '',
    scheduledTime: initialData.scheduledTime || ''
  });

  const [previewData, setPreviewData] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState(null);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialPrompt && !formData.message) {
      setFormData((prev) => ({
        ...prev,
        title: initialData.title || 'Operational Update',
        message: initialPrompt,
      }));
    }
  }, [initialPrompt]);

  // Fetch live recipient preview from backend
  const fetchRecipientPreview = useCallback(async () => {
    setLoadingPreview(true);
    setPreviewError(null);
    try {
      const res = await previewAnnouncementRecipients({
        targetAudiences: formData.audiences,
        eventId: formData.event || null,
        customUserIds: formData.customUserIds,
        channels: formData.channels
      });
      if (res?.data) {
        setPreviewData(res.data);
      }
    } catch (err) {
      console.error('Failed to preview recipients:', err);
      setPreviewError(err.response?.data?.message || err.message || 'Failed to calculate recipients');
    } finally {
      setLoadingPreview(false);
    }
  }, [formData.audiences, formData.event, formData.customUserIds, formData.channels]);

  // Auto-fetch preview whenever audience, event, or custom members change
  useEffect(() => {
    fetchRecipientPreview();
  }, [fetchRecipientPreview]);

  const eventOptions = [
    { value: '', label: 'Select event (optional)' },
    ...(events.map((e) => ({ value: e.id || e._id, label: e.name || e.title }))),
  ];

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Announcement title is required.';
    }
    if (!formData.message.trim()) {
      newErrors.message = 'Message content is required.';
    }
    if (!formData.audiences || formData.audiences.length === 0) {
      newErrors.audiences = 'Please select at least one target audience.';
    }
    if (
      (formData.audiences.includes('Event Participants') || formData.audiences.includes('Volunteers')) &&
      !formData.event
    ) {
      newErrors.event = 'Please select a linked event for Event Participants / Volunteers audience.';
    }
    if (
      formData.audiences.includes('Custom Audience') &&
      (!formData.customUserIds || formData.customUserIds.length === 0)
    ) {
      newErrors.custom = 'Please select at least one club member for Custom Audience.';
    }
    if (!formData.channels || formData.channels.length === 0) {
      newErrors.channels = 'Please select at least one delivery channel.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (actionType) => {
    if (!validate()) return;
    setIsSubmitting(true);

    const payload = {
      title: formData.title.trim(),
      content: formData.message.trim(),
      targetAudiences: formData.audiences,
      targetAudience: formData.audiences[0] || 'all',
      customRecipients: formData.customUserIds,
      channels: formData.channels,
      event: formData.event || null,
      status: actionType === 'draft' ? 'draft' : formData.scheduleType === 'later' ? 'scheduled' : 'published',
      scheduledFor: formData.scheduleType === 'later' && formData.scheduledDate
        ? new Date(`${formData.scheduledDate}T${formData.scheduledTime || '09:00'}:00`).toISOString()
        : null
    };

    try {
      if (onSubmit) {
        await onSubmit(payload);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const scheduleDisplay = formData.scheduleType === 'later' && formData.scheduledDate
    ? `${formData.scheduledDate} ${formData.scheduledTime}`.trim()
    : 'Immediate';

  const channelConfigStatus = previewData?.channelConfigStatus || {
    in_app: 'AVAILABLE',
    email: 'NOT_CONFIGURED',
    whatsapp: 'NOT_CONFIGURED',
    sms: 'NOT_CONFIGURED',
    push: 'NOT_CONFIGURED'
  };

  const isDryRun = (previewData?.deliveryMode || 'dry_run') === 'dry_run';

  return (
    <div className={`space-y-6 ${className}`}>
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
          label="Linked Event (Optional / Required for Event/Volunteer audiences)"
          options={eventOptions}
          value={formData.event}
          onChange={(e) => {
            setFormData((p) => ({ ...p, event: e.target.value }));
            if (errors.event) setErrors((p) => ({ ...p, event: null }));
          }}
          error={errors.event}
          disabled={isSubmitting}
        />
      </div>

      {/* 2. Target Audience Section (Multi-Select) */}
      <div className="p-5 rounded-xl bg-[#151D2E] border border-[#263247] space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#263247]/60">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#818CF8]" />
            <h3 className="text-sm font-semibold text-white">2. Target Audience (Multi-Select)</h3>
          </div>
          <span className="text-xs font-mono text-indigo-400">
            {formData.audiences.length} Selected
          </span>
        </div>

        {errors.audiences && (
          <div className="text-xs text-rose-400 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> {errors.audiences}
          </div>
        )}

        <AnnouncementAudienceSelector
          selectedAudiences={formData.audiences}
          onChange={(auds) => {
            setFormData((p) => ({ ...p, audiences: auds }));
            if (errors.audiences) setErrors((p) => ({ ...p, audiences: null }));
          }}
          events={events}
          selectedEvent={formData.event}
          onEventChange={(evtId) => {
            setFormData((p) => ({ ...p, event: evtId }));
            if (errors.event) setErrors((p) => ({ ...p, event: null }));
          }}
          customUserIds={formData.customUserIds}
          onCustomUsersChange={(users) => {
            setFormData((p) => ({ ...p, customUserIds: users }));
            if (errors.custom) setErrors((p) => ({ ...p, custom: null }));
          }}
        />

        {errors.custom && (
          <div className="text-xs text-rose-400 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> {errors.custom}
          </div>
        )}
      </div>

      {/* 3. Delivery Channels Section (Multi-Select with Honest Provider Status) */}
      <div className="p-5 rounded-xl bg-[#151D2E] border border-[#263247] space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#263247]/60">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#818CF8]" />
            <h3 className="text-sm font-semibold text-white">3. Delivery Channels</h3>
          </div>
          <span className="text-xs font-mono text-indigo-400">
            {formData.channels.length} Selected
          </span>
        </div>

        {errors.channels && (
          <div className="text-xs text-rose-400 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> {errors.channels}
          </div>
        )}

        <AnnouncementChannelSelector
          selectedChannels={formData.channels}
          channelConfigStatus={channelConfigStatus}
          onChange={(chans) => {
            setFormData((p) => ({ ...p, channels: chans }));
            if (errors.channels) setErrors((p) => ({ ...p, channels: null }));
          }}
        />

        {/* Safe Delivery Mode Banner */}
        <div className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${
          isDryRun 
            ? 'bg-indigo-950/30 border-indigo-500/30 text-indigo-200' 
            : 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
        }`}>
          <div className="flex items-center gap-2">
            {isDryRun ? <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" /> : <Zap className="w-4 h-4 text-emerald-400 shrink-0" />}
            <div>
              <span className="font-semibold">{isDryRun ? 'DRY RUN MODE' : 'LIVE DELIVERY MODE'}:</span>{' '}
              {isDryRun 
                ? 'External channels will be verified and simulated without consuming provider quotas.'
                : 'Messages will be dispatched directly to live external services.'}
            </div>
          </div>
          <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold tracking-wider ${
            isDryRun ? 'bg-indigo-500/20 text-indigo-300' : 'bg-emerald-500/20 text-emerald-300'
          }`}>
            {isDryRun ? 'Simulated' : 'Live'}
          </span>
        </div>
      </div>

      {/* 4. Real Recipient Summary & Channel Breakdown Matrix */}
      <div className="p-5 rounded-xl bg-[#151D2E] border border-[#263247] space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#263247]/60">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">4. Recipient Breakdown & Channel Availability</h3>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={fetchRecipientPreview}
            disabled={loadingPreview}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loadingPreview ? 'animate-spin' : ''}`} />}
          >
            Preview Recipients
          </Button>
        </div>

        {loadingPreview ? (
          <div className="py-6 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
            <span>Resolving target audience and deduplicating unique recipients...</span>
          </div>
        ) : previewError ? (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
            {previewError}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary Counters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-[#111827] border border-[#263247]">
                <span className="text-[11px] text-gray-400">Selected Audiences</span>
                <p className="text-lg font-bold text-white font-mono">{formData.audiences.length}</p>
                <p className="text-[10px] text-gray-500 truncate">{formData.audiences.join(', ')}</p>
              </div>

              <div className="p-3 rounded-xl bg-[#111827] border border-[#263247]">
                <span className="text-[11px] text-gray-400">Unique Recipients</span>
                <p className="text-lg font-bold text-emerald-400 font-mono">
                  {previewData?.uniqueRecipients ?? 0}
                </p>
                <p className="text-[10px] text-gray-500">Deduplicated club members</p>
              </div>

              <div className="p-3 rounded-xl bg-[#111827] border border-[#263247]">
                <span className="text-[11px] text-gray-400">Email Reach</span>
                <p className="text-lg font-bold text-sky-400 font-mono">
                  {previewData?.channelAvailability?.email?.available ?? 0}
                </p>
                <p className="text-[10px] text-gray-500">
                  {previewData?.missingContactSummary?.noEmailCount ?? 0} missing email
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#111827] border border-[#263247]">
                <span className="text-[11px] text-gray-400">Phone / SMS Reach</span>
                <p className="text-lg font-bold text-amber-400 font-mono">
                  {previewData?.channelAvailability?.sms?.available ?? 0}
                </p>
                <p className="text-[10px] text-gray-500">
                  {previewData?.missingContactSummary?.noPhoneCount ?? 0} missing phone
                </p>
              </div>
            </div>

            {/* Channel Availability Table */}
            <div className="overflow-x-auto rounded-xl border border-[#263247]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#111827] text-gray-400 border-b border-[#263247]">
                  <tr>
                    <th className="px-3 py-2 font-medium">Channel</th>
                    <th className="px-3 py-2 font-medium">Recipients Reachable</th>
                    <th className="px-3 py-2 font-medium">Missing Info</th>
                    <th className="px-3 py-2 font-medium">Provider Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#263247]/50 bg-[#151D2E]/60">
                  {/* In-App */}
                  <tr>
                    <td className="px-3 py-2 font-medium text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-400" /> In-App
                    </td>
                    <td className="px-3 py-2 font-mono text-emerald-300">
                      {previewData?.channelAvailability?.in_app?.available ?? 0} / {previewData?.uniqueRecipients ?? 0}
                    </td>
                    <td className="px-3 py-2 text-gray-400 font-mono">0 missing</td>
                    <td className="px-3 py-2">
                      <span className="text-emerald-400 font-medium">✓ Connected</span>
                    </td>
                  </tr>

                  {/* Email */}
                  <tr>
                    <td className="px-3 py-2 font-medium text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-sky-400" /> Email Broadcast
                    </td>
                    <td className="px-3 py-2 font-mono text-white">
                      {previewData?.channelAvailability?.email?.available ?? 0} / {previewData?.uniqueRecipients ?? 0}
                    </td>
                    <td className="px-3 py-2 text-amber-400 font-mono">
                      {previewData?.missingContactSummary?.noEmailCount ?? 0} no email
                    </td>
                    <td className="px-3 py-2">
                      {previewData?.channelAvailability?.email?.status === 'CONNECTED' || channelConfigStatus.email === 'AVAILABLE' ? (
                        <span className="text-emerald-400 font-medium">✓ Connected</span>
                      ) : (
                        <span className="text-amber-400 font-medium">⚠ Not Configured</span>
                      )}
                    </td>
                  </tr>

                  {/* WhatsApp */}
                  <tr>
                    <td className="px-3 py-2 font-medium text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" /> WhatsApp
                    </td>
                    <td className="px-3 py-2 font-mono text-white">
                      {previewData?.channelAvailability?.whatsapp?.available ?? 0} / {previewData?.uniqueRecipients ?? 0}
                    </td>
                    <td className="px-3 py-2 text-amber-400 font-mono">
                      {previewData?.missingContactSummary?.noPhoneCount ?? 0} no phone
                    </td>
                    <td className="px-3 py-2">
                      {previewData?.channelAvailability?.whatsapp?.status === 'CONNECTED' || channelConfigStatus.whatsapp === 'AVAILABLE' ? (
                        <span className="text-emerald-400 font-medium">✓ Connected</span>
                      ) : (
                        <span className="text-amber-400 font-medium">⚠ Not Configured</span>
                      )}
                    </td>
                  </tr>

                  {/* SMS */}
                  <tr>
                    <td className="px-3 py-2 font-medium text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400" /> SMS Alert
                    </td>
                    <td className="px-3 py-2 font-mono text-white">
                      {previewData?.channelAvailability?.sms?.available ?? 0} / {previewData?.uniqueRecipients ?? 0}
                    </td>
                    <td className="px-3 py-2 text-amber-400 font-mono">
                      {previewData?.missingContactSummary?.noPhoneCount ?? 0} no phone
                    </td>
                    <td className="px-3 py-2">
                      {previewData?.channelAvailability?.sms?.status === 'CONNECTED' || channelConfigStatus.sms === 'AVAILABLE' ? (
                        <span className="text-emerald-400 font-medium">✓ Connected</span>
                      ) : (
                        <span className="text-amber-400 font-medium">⚠ Not Configured</span>
                      )}
                    </td>
                  </tr>

                  {/* Push */}
                  <tr>
                    <td className="px-3 py-2 font-medium text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-400" /> Push Notification
                    </td>
                    <td className="px-3 py-2 font-mono text-white">
                      {previewData?.channelAvailability?.push?.available ?? 0} / {previewData?.uniqueRecipients ?? 0}
                    </td>
                    <td className="px-3 py-2 text-gray-400 font-mono">
                      {previewData?.missingContactSummary?.noPushCount ?? 0} no device token
                    </td>
                    <td className="px-3 py-2">
                      {previewData?.channelAvailability?.push?.status === 'CONNECTED' || channelConfigStatus.push === 'AVAILABLE' ? (
                        <span className="text-emerald-400 font-medium">✓ Connected</span>
                      ) : (
                        <span className="text-amber-400 font-medium">⚠ Not Configured</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 5. Scheduling Section */}
      <div className="p-5 rounded-xl bg-[#151D2E] border border-[#263247] space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-[#263247]/60">
          <Clock className="w-4 h-4 text-[#818CF8]" />
          <h3 className="text-sm font-semibold text-white">5. Scheduling</h3>
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

      {/* 6. Live Announcement View */}
      <AnnouncementPreview
        title={formData.title}
        message={formData.message}
        audience={formData.audiences}
        channel={formData.channels}
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
            {formData.scheduleType === 'later' ? 'Schedule Announcement' : (isDryRun ? 'Publish Announcement (Dry Run)' : 'Publish & Broadcast Live')}
          </Button>
        </div>
      </div>
    </div>
  );
}
