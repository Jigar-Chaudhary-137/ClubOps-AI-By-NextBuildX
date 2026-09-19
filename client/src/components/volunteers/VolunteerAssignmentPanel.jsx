import React, { useState } from 'react';
import { Calendar, ShieldCheck, FileText, CheckCircle2, Sparkles, UserCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';

const eventOptions = [
  { value: '', label: 'Select event' }
];

const responsibilityOptions = [
  { value: 'General Volunteer', label: 'General Volunteer' },
  { value: 'Event Coordinator', label: 'Event Coordinator' },
  { value: 'Registration', label: 'Registration' },
  { value: 'Technical Support', label: 'Technical Support' },
  { value: 'Logistics', label: 'Logistics' },
  { value: 'Communications', label: 'Communications' },
  { value: 'Other', label: 'Other' }
];

export default function VolunteerAssignmentPanel({
  volunteerId = null,
  volunteerName = null,
  onAssignmentComplete,
  className = ''
}) {
  const [selectedEvent, setSelectedEvent] = useState('');
  const [responsibility, setResponsibility] = useState('General Volunteer');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState(false);

  const handleAssign = (e) => {
    e?.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setNotice(true);
      setTimeout(() => {
        setNotice(false);
        onAssignmentComplete?.();
      }, 2500);
    }, 450);
  };

  return (
    <Card className={`border-[#263247] bg-[#151D2E] ${className}`}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#6366F1]/10 text-[#818CF8] flex items-center justify-center shrink-0">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <CardTitle>Event Assignment</CardTitle>
            <CardDescription>
              {volunteerName
                ? `Assign ${volunteerName} to an active club event`
                : 'Assign volunteer to event operations and allocate functional responsibilities'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {notice && (
          <div className="p-3 rounded-lg bg-[#6366F1]/10 border border-[#6366F1]/30 text-xs text-[#818CF8] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#818CF8]" />
            <span>
              Volunteer assignment will be connected to the backend in the next integration phase.
            </span>
          </div>
        )}

        <form onSubmit={handleAssign} className="space-y-4">
          {/* Event Selector */}
          <div>
            <Select
              label="Event"
              options={eventOptions}
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              disabled={isSubmitting}
            />
            <p className="mt-1 text-[11px] text-[#64748B]">
              Active events will populate automatically when events data is connected.
            </p>
          </div>

          {/* Responsibility Selector */}
          <Select
            label="Responsibility"
            options={responsibilityOptions}
            value={responsibility}
            onChange={(e) => setResponsibility(e.target.value)}
            disabled={isSubmitting}
          />

          {/* Notes Textarea */}
          <Textarea
            label="Notes"
            placeholder="Describe the volunteer's responsibility..."
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={isSubmitting}
          />

          {/* Submit Action */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full sm:w-auto"
              isLoading={isSubmitting}
            >
              Assign Volunteer
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
