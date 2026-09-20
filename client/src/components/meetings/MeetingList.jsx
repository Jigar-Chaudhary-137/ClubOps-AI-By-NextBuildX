import React from 'react';
import { Video, Plus, Sparkles } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import EmptyState from '../ui/EmptyState';
import MeetingRow from './MeetingRow';
import MeetingCard from './MeetingCard';

export default function MeetingList({
  meetings = [],
  viewMode = 'table', // 'table' or 'grid'
  onViewMeeting,
  onOpenCreateModal,
  onProcessNotes,
  className = ''
}) {
  if (!meetings || meetings.length === 0) {
    return (
      <Card className={`border-[#263247] bg-[#151D2E] ${className}`}>
        <CardContent className="p-8 sm:p-14">
          <EmptyState
            icon={<Video className="w-8 h-8 text-[#818CF8]" />}
            title="No meetings yet"
            description="Create a meeting or add meeting notes to let ClubOps AI turn discussions into actionable work."
            action={
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Button
                  variant="primary"
                  size="md"
                  onClick={onOpenCreateModal}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Create Meeting
                </Button>
                <Button
                  variant="ai"
                  size="md"
                  onClick={onProcessNotes}
                  leftIcon={<Sparkles className="w-4 h-4" />}
                >
                  Process Meeting Notes
                </Button>
              </div>
            }
          />
        </CardContent>
      </Card>
    );
  }

  if (viewMode === 'grid') {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
        {meetings.map((meeting) => (
          <MeetingCard
            key={meeting._id || meeting.id}
            meeting={meeting}
            onView={onViewMeeting}
          />
        ))}
      </div>
    );
  }

  return (
    <Card className={`border-[#263247] bg-[#151D2E] overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#263247] bg-[#111827]/70 text-xs font-semibold text-[#94A3B8]">
              <th className="py-3 px-4">Meeting Title</th>
              <th className="py-3 px-4">Event</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Participants</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Actions</th>
              <th className="py-3 px-4">Risks</th>
              <th className="py-3 px-4">Updated</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {meetings.map((meeting) => (
              <MeetingRow
                key={meeting._id || meeting.id}
                meeting={meeting}
                onView={onViewMeeting}
              />
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
